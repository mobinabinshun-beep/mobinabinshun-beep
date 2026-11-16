#define WINVER 0x0501
#define _WIN32_WINNT 0x0501
#include <windows.h>
#include <stdio.h>
#include <wchar.h>
#include <stdlib.h>
#include "nu_vm.h"

#define ID_HOME 1001
#define ID_LIBRARY 1002
#define ID_MODULES 1003
#define ID_SETTINGS 1004
#define ID_BACK 1005
#define ID_INFO 1006
#define ID_EXIT 1007
#define ID_RUN_MODULE 1008
#define ID_SETTING_BASE 1100
#define NU_SETTING_COUNT 10

static HBITMAP g_bitmap = NULL;
static BITMAP g_bitmap_info;
static HWND g_nav[4];
static HWND g_back = NULL, g_info = NULL, g_exit = NULL, g_run = NULL;
static HWND g_setting_combo[NU_SETTING_COUNT];
static HWND g_setting_label[NU_SETTING_COUNT];
static WCHAR g_os[128] = L"Windows version unavailable";
static WCHAR g_profile[32] = L"SAFE";
static WCHAR g_address[64] = L"nu://home";
static WCHAR g_status[160] = L"Ready";
static DWORD g_cpu_count = 1;
static ULONGLONG g_total_ram_gb = 0, g_free_ram_gb = 0;
static BOOL g_image_loaded = FALSE;
static int g_view = 0; /* 0 home, 1 library, 2 modules, 3 settings, 4 runtime */
static NU_VM_PROGRAM g_program;
static BOOL g_program_loaded = FALSE;
static WCHAR g_exe_dir[MAX_PATH];

static const WCHAR *g_setting_names[NU_SETTING_COUNT] = {
    L"1. Execution profile", L"2. RAM ceiling", L"3. CPU workers",
    L"4. Graphics budget", L"5. Target FPS", L"6. Render scale",
    L"7. Asset quality", L"8. Cache quota", L"9. Max sessions",
    L"10. Local diagnostics"
};
static const WCHAR *g_setting_values[NU_SETTING_COUNT][5] = {
    {L"Automatic",L"Safe",L"Standard",NULL,NULL},
    {L"Automatic",L"128 MB",L"256 MB",L"512 MB",L"1024 MB"},
    {L"Automatic",L"1",L"2",L"4",NULL},
    {L"Automatic",L"Low",L"Medium",L"High",NULL},
    {L"Automatic",L"20 FPS",L"30 FPS",L"45 FPS",NULL},
    {L"Automatic",L"50%",L"75%",L"100%",NULL},
    {L"Automatic",L"Low",L"Medium",L"High",NULL},
    {L"Automatic",L"64 MB",L"128 MB",L"256 MB",L"512 MB"},
    {L"1",L"2",L"3",NULL,NULL},
    {L"Off",L"Local only",NULL,NULL,NULL}
};

static void path_for_file(WCHAR *out, size_t capacity, const WCHAR *name) {
    wcsncpy(out, g_exe_dir, capacity - 1);
    out[capacity - 1] = 0;
    if (wcslen(out) + wcslen(name) + 1 < capacity) wcscat(out, name);
}

static void detect_system(void) {
    SYSTEM_INFO si;
    MEMORYSTATUSEX mem;
    OSVERSIONINFOEXW os;
    ZeroMemory(&si, sizeof(si));
    GetSystemInfo(&si);
    g_cpu_count = si.dwNumberOfProcessors ? si.dwNumberOfProcessors : 1;
    ZeroMemory(&mem, sizeof(mem));
    mem.dwLength = sizeof(mem);
    if (GlobalMemoryStatusEx(&mem)) {
        g_total_ram_gb = mem.ullTotalPhys / (1024ULL * 1024ULL * 1024ULL);
        g_free_ram_gb = mem.ullAvailPhys / (1024ULL * 1024ULL * 1024ULL);
    }
    ZeroMemory(&os, sizeof(os));
    os.dwOSVersionInfoSize = sizeof(os);
    if (GetVersionExW((OSVERSIONINFOW *)&os)) {
        wsprintfW(g_os, L"Windows %lu.%lu build %lu %s",
            (unsigned long)os.dwMajorVersion, (unsigned long)os.dwMinorVersion,
            (unsigned long)os.dwBuildNumber,
            os.szCSDVersion[0] ? os.szCSDVersion : L"");
    }
    /* Missing/ambiguous signals always select SAFE. Manual preferences cannot exceed this ceiling. */
    if (g_total_ram_gb >= 4 && g_free_ram_gb >= 1 && g_cpu_count >= 2)
        wcscpy(g_profile, L"STANDARD");
    else
        wcscpy(g_profile, L"SAFE");
}

static void load_background(void) {
    WCHAR path[MAX_PATH];
    WCHAR *slash;
    DWORD n = GetModuleFileNameW(NULL, path, MAX_PATH);
    if (!n || n >= MAX_PATH) return;
    slash = wcsrchr(path, L'\\');
    if (!slash) return;
    *(slash + 1) = 0;
    wcsncpy(g_exe_dir, path, MAX_PATH - 1);
    g_exe_dir[MAX_PATH - 1] = 0;
    path_for_file(path, MAX_PATH, L"background.bmp");
    g_bitmap = (HBITMAP)LoadImageW(NULL, path, IMAGE_BITMAP, 0, 0,
        LR_LOADFROMFILE | LR_CREATEDIBSECTION);
    if (g_bitmap && GetObjectW(g_bitmap, sizeof(g_bitmap_info), &g_bitmap_info))
        g_image_loaded = TRUE;
    else if (g_bitmap) { DeleteObject(g_bitmap); g_bitmap = NULL; }
}

static void save_settings(void) {
    WCHAR path[MAX_PATH], key[24], value[64];
    int i, selected;
    path_for_file(path, MAX_PATH, L"settings.ini");
    for (i = 0; i < NU_SETTING_COUNT; i++) {
        selected = (int)SendMessageW(g_setting_combo[i], CB_GETCURSEL, 0, 0);
        if (selected < 0) selected = 0;
        wsprintfW(key, L"setting%02d", i + 1);
        if (g_setting_values[i][selected])
            WritePrivateProfileStringW(L"Preferences", key,
                g_setting_values[i][selected], path);
    }
    wcscpy(g_status, L"Preferences saved locally; automatic safety ceiling remains active.");
}

static void load_settings(void) {
    WCHAR path[MAX_PATH], key[24], value[64];
    int i, j;
    path_for_file(path, MAX_PATH, L"settings.ini");
    for (i = 0; i < NU_SETTING_COUNT; i++) {
        wsprintfW(key, L"setting%02d", i + 1);
        GetPrivateProfileStringW(L"Preferences", key,
            g_setting_values[i][0], value, 64, path);
        for (j = 0; j < 5 && g_setting_values[i][j]; j++) {
            if (wcscmp(value, g_setting_values[i][j]) == 0) {
                SendMessageW(g_setting_combo[i], CB_SETCURSEL, j, 0);
                break;
            }
        }
    }
}

static void layout_controls(HWND hwnd) {
    RECT rc;
    int width, i, x, y;
    GetClientRect(hwnd, &rc);
    width = rc.right - rc.left;
    for (i = 0; i < 4; i++)
        MoveWindow(g_nav[i], 18 + i * 124, 16, 112, 30, TRUE);
    MoveWindow(g_back, 18, rc.bottom - 52, 90, 28, TRUE);
    MoveWindow(g_info, 118, rc.bottom - 52, 150, 28, TRUE);
    MoveWindow(g_exit, width - 108, rc.bottom - 52, 90, 28, TRUE);
    MoveWindow(g_run, 30, rc.bottom - 105, 190, 32, TRUE);
    for (i = 0; i < NU_SETTING_COUNT; i++) {
        x = 34; y = 102 + i * 37;
        MoveWindow(g_setting_label[i], x, y, 260, 25, TRUE);
        MoveWindow(g_setting_combo[i], x + 270, y - 3, 190, 240, TRUE);
    }
}

static void show_view(HWND hwnd, int view) {
    int i;
    g_view = view;
    if (view == 0) wcscpy(g_address, L"nu://home");
    else if (view == 1) wcscpy(g_address, L"nu://library");
    else if (view == 2) wcscpy(g_address, L"nu://modules");
    else if (view == 3) wcscpy(g_address, L"nu://settings");
    else wcscpy(g_address, L"nu://runtime");
    for (i = 0; i < NU_SETTING_COUNT; i++) {
        ShowWindow(g_setting_label[i], view == 3 ? SW_SHOW : SW_HIDE);
        ShowWindow(g_setting_combo[i], view == 3 ? SW_SHOW : SW_HIDE);
    }
    ShowWindow(g_run, view == 2 ? SW_SHOW : SW_HIDE);
    InvalidateRect(hwnd, NULL, TRUE);
}

static void run_sample_module(HWND hwnd) {
    char path[MAX_PATH];
    WCHAR wide_path[MAX_PATH];
    int n;
    path_for_file(wide_path, MAX_PATH, L"modules\\hello.nup");
    n = WideCharToMultiByte(CP_ACP, 0, wide_path, -1, path, MAX_PATH, NULL, NULL);
    if (!n || !nu_vm_load(path, 1, 1, &g_program)) {
        g_program_loaded = FALSE;
        wsprintfW(g_status, L"Module rejected: %S", nu_vm_error());
    } else {
        g_program_loaded = TRUE;
        wcscpy(g_status, L"Generation 1 module interpreted by N.U VM.");
    }
    show_view(hwnd, 4);
}

static void paint_background(HWND hwnd, HDC dc) {
    RECT rc;
    HBRUSH brush;
    HFONT font, old_font;
    WCHAR line[256];
    int i, y;
    GetClientRect(hwnd, &rc);
    brush = CreateSolidBrush(RGB(7, 13, 22));
    FillRect(dc, &rc, brush);
    DeleteObject(brush);
    if (g_image_loaded && g_bitmap) {
        HDC memory_dc = CreateCompatibleDC(dc);
        if (memory_dc) {
            HGDIOBJ old = SelectObject(memory_dc, g_bitmap);
            int cw = rc.right, ch = rc.bottom - 76;
            double sx = (double)cw / (double)g_bitmap_info.bmWidth;
            double sy = (double)ch / (double)g_bitmap_info.bmHeight;
            double scale = sx < sy ? sx : sy;
            int dw = (int)(g_bitmap_info.bmWidth * scale);
            int dh = (int)(g_bitmap_info.bmHeight * scale);
            int dx = (cw - dw) / 2, dy = 60 + (ch - dh) / 2;
            SetStretchBltMode(dc, HALFTONE);
            StretchBlt(dc, dx, dy, dw, dh, memory_dc, 0, 0,
                g_bitmap_info.bmWidth, g_bitmap_info.bmHeight, SRCCOPY);
            SelectObject(memory_dc, old);
            DeleteDC(memory_dc);
        }
    }
    SetBkMode(dc, TRANSPARENT);
    font = CreateFontW(24, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE,
        DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
        DEFAULT_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Arial");
    old_font = (HFONT)SelectObject(dc, font);
    SetTextColor(dc, RGB(255, 255, 255));
    TextOutW(dc, 24, 62, L"N.U  |  NIROO UNIVERSE", 22);
    SelectObject(dc, old_font); DeleteObject(font);

    font = CreateFontW(16, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
        DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
        DEFAULT_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Arial");
    old_font = (HFONT)SelectObject(dc, font);
    SetTextColor(dc, RGB(245, 248, 250));
    if (g_view == 0) {
        TextOutW(dc, 28, 132, L"Welcome to your N.U execution space.", 37);
        TextOutW(dc, 28, 164, L"Games and modules open inside this native window.", 49);
        TextOutW(dc, 28, 196, L"No system browser is launched by this shell.", 44);
        wsprintfW(line, L"Automatic profile: %s  |  CPU: %lu  |  RAM: %I64u GB",
            g_profile, (unsigned long)g_cpu_count, g_total_ram_gb);
        TextOutW(dc, 28, 236, line, (int)wcslen(line));
    } else if (g_view == 1) {
        TextOutW(dc, 28, 132, L"Installed library", 16);
        TextOutW(dc, 28, 166, L"Generation 1 sample module: N.U Module Runtime Test", 51);
        TextOutW(dc, 28, 198, L"Select Modules to open the bundled module in the native VM.", 58);
    } else if (g_view == 2) {
        TextOutW(dc, 28, 132, L"Available modules", 17);
        TextOutW(dc, 28, 166, L"hello.nup  |  Generation 1  |  Host API 1", 43);
        TextOutW(dc, 28, 198, L"Only the declared NUVM/1 instruction set is accepted.", 53);
    } else if (g_view == 3) {
        TextOutW(dc, 28, 78, L"Ten manual preferences. AUTO is recommended.", 44);
        TextOutW(dc, 28, 478, L"Manual values are preferences and cannot exceed the automatic safe ceiling.", 71);
    } else if (g_view == 4) {
        TextOutW(dc, 28, 132, g_program_loaded ? L"Module running in N.U Runtime Host" : L"Module could not be loaded", 34);
        if (g_program_loaded) {
            MultiByteToWideChar(CP_ACP, 0, g_program.title, -1, line, 256);
            TextOutW(dc, 28, 170, line, (int)wcslen(line));
            y = 212;
            for (i = 0; i < g_program.text_count; i++) {
                MultiByteToWideChar(CP_ACP, 0, g_program.text[i], -1, line, 256);
                TextOutW(dc, 36, y, line, (int)wcslen(line));
                y += 30;
            }
        } else {
            MultiByteToWideChar(CP_ACP, 0, nu_vm_error(), -1, line, 256);
            TextOutW(dc, 28, 174, line, (int)wcslen(line));
        }
    }
    SetTextColor(dc, RGB(230, 240, 245));
    TextOutW(dc, 28, rc.bottom - 82, g_status, (int)wcslen(g_status));
    TextOutW(dc, 28, rc.bottom - 22, g_address, (int)wcslen(g_address));
    SelectObject(dc, old_font); DeleteObject(font);
}

static void show_system_info(HWND hwnd) {
    WCHAR message[640];
    wsprintfW(message,
        L"%s\r\nArchitecture: x86\r\nCPU count: %lu\r\nPhysical RAM: %I64u GB\r\nAvailable RAM: %I64u GB\r\nAutomatic profile: %s\r\nImage: %s\r\nRuntime: NUVM/1 declarative interpreter\r\n\r\nXP SP3 x86 has not yet been verified on a real XP machine.",
        g_os, (unsigned long)g_cpu_count, g_total_ram_gb, g_free_ram_gb,
        g_profile, g_image_loaded ? L"loaded" : L"fallback");
    MessageBoxW(hwnd, message, L"N.U System Information", MB_OK | MB_ICONINFORMATION);
}

static LRESULT CALLBACK window_proc(HWND hwnd, UINT message, WPARAM wparam, LPARAM lparam) {
    int i;
    switch (message) {
    case WM_CREATE: {
        const WCHAR *nav_names[4] = {L"HOME",L"LIBRARY",L"MODULES",L"SETTINGS"};
        const WCHAR *keys[NU_SETTING_COUNT] = {
            L"setting01",L"setting02",L"setting03",L"setting04",L"setting05",
            L"setting06",L"setting07",L"setting08",L"setting09",L"setting10"
        };
        for (i = 0; i < 4; i++)
            g_nav[i] = CreateWindowW(L"BUTTON", nav_names[i], WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON,
                0,0,112,30,hwnd,(HMENU)(ID_HOME+i),GetModuleHandleW(NULL),NULL);
        g_back = CreateWindowW(L"BUTTON",L"BACK / STOP",WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON,
            0,0,90,28,hwnd,(HMENU)ID_BACK,GetModuleHandleW(NULL),NULL);
        g_info = CreateWindowW(L"BUTTON",L"SYSTEM INFO",WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON,
            0,0,150,28,hwnd,(HMENU)ID_INFO,GetModuleHandleW(NULL),NULL);
        g_exit = CreateWindowW(L"BUTTON",L"EXIT",WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON,
            0,0,90,28,hwnd,(HMENU)ID_EXIT,GetModuleHandleW(NULL),NULL);
        g_run = CreateWindowW(L"BUTTON",L"RUN N.U MODULE",WS_CHILD|BS_VISIBLE|BS_PUSHBUTTON,
            0,0,190,32,hwnd,(HMENU)ID_RUN_MODULE,GetModuleHandleW(NULL),NULL);
        for (i = 0; i < NU_SETTING_COUNT; i++) {
            int j;
            g_setting_label[i] = CreateWindowW(L"STATIC",g_setting_names[i],
                WS_CHILD|SS_LEFT,0,0,260,25,hwnd,NULL,GetModuleHandleW(NULL),NULL);
            g_setting_combo[i] = CreateWindowW(L"COMBOBOX",L"",
                WS_CHILD|WS_VSCROLL|CBS_DROPDOWNLIST,0,0,190,240,
                hwnd,(HMENU)(ID_SETTING_BASE+i),GetModuleHandleW(NULL),NULL);
            for (j = 0; j < 5 && g_setting_values[i][j]; j++)
                SendMessageW(g_setting_combo[i],CB_ADDSTRING,0,(LPARAM)g_setting_values[i][j]);
            SendMessageW(g_setting_combo[i],CB_SETCURSEL,0,0);
        }
        load_settings();
        layout_controls(hwnd);
        show_view(hwnd,0);
        return 0;
    }
    case WM_SIZE:
        layout_controls(hwnd);
        InvalidateRect(hwnd,NULL,TRUE);
        return 0;
    case WM_ERASEBKGND: return 1;
    case WM_PAINT: {
        PAINTSTRUCT ps; HDC dc=BeginPaint(hwnd,&ps);
        paint_background(hwnd,dc); EndPaint(hwnd,&ps); return 0;
    }
    case WM_COMMAND:
        switch (LOWORD(wparam)) {
        case ID_HOME: show_view(hwnd,0); return 0;
        case ID_LIBRARY: show_view(hwnd,1); return 0;
        case ID_MODULES: show_view(hwnd,2); return 0;
        case ID_SETTINGS: show_view(hwnd,3); return 0;
        case ID_BACK:
            if (g_view == 4) show_view(hwnd,2); else show_view(hwnd,0);
            return 0;
        case ID_RUN_MODULE: run_sample_module(hwnd); return 0;
        case ID_INFO: show_system_info(hwnd); return 0;
        case ID_EXIT: DestroyWindow(hwnd); return 0;
        default:
            if (LOWORD(wparam) >= ID_SETTING_BASE &&
                LOWORD(wparam) < ID_SETTING_BASE + NU_SETTING_COUNT &&
                HIWORD(wparam) == CBN_SELCHANGE) {
                save_settings(); InvalidateRect(hwnd,NULL,TRUE); return 0;
            }
        }
        break;
    case WM_DESTROY:
        if (g_bitmap) DeleteObject(g_bitmap);
        PostQuitMessage(0); return 0;
    }
    return DefWindowProcW(hwnd,message,wparam,lparam);
}

int WINAPI WinMain(HINSTANCE instance,HINSTANCE previous,LPSTR command_line,int show_command) {
    WNDCLASSW wc; HWND hwnd; MSG msg;
    (void)previous; (void)command_line;
    detect_system(); load_background();
    ZeroMemory(&wc,sizeof(wc));
    wc.style=CS_HREDRAW|CS_VREDRAW; wc.lpfnWndProc=window_proc;
    wc.hInstance=instance; wc.hCursor=LoadCursor(NULL,IDC_ARROW);
    wc.hbrBackground=(HBRUSH)GetStockObject(BLACK_BRUSH);
    wc.lpszClassName=L"NUInternalRuntimeWindow";
    if (!RegisterClassW(&wc)) return 1;
    hwnd=CreateWindowW(wc.lpszClassName,L"N.U Launcher — Native Runtime Preview",
        WS_OVERLAPPEDWINDOW,CW_USEDEFAULT,CW_USEDEFAULT,980,700,
        NULL,NULL,instance,NULL);
    if (!hwnd) return 2;
    ShowWindow(hwnd,show_command); UpdateWindow(hwnd);
    while (GetMessageW(&msg,NULL,0,0)>0) {
        TranslateMessage(&msg); DispatchMessageW(&msg);
    }
    return (int)msg.wParam;
}
