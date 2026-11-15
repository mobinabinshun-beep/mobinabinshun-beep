#define WINVER 0x0501
#define _WIN32_WINNT 0x0501
#include <windows.h>
#include <shellapi.h>
#include <stdio.h>
#include <wchar.h>

#define ID_OPEN 1001
#define ID_INFO 1002
#define ID_EXIT 1003

static HBITMAP g_bitmap = NULL;
static BITMAP g_bitmap_info;
static HWND g_open_button = NULL;
static HWND g_info_button = NULL;
static HWND g_exit_button = NULL;
static WCHAR g_os[128] = L"Windows version unavailable";
static WCHAR g_profile[32] = L"SAFE";
static DWORD g_cpu_count = 1;
static ULONGLONG g_total_ram_gb = 0;
static ULONGLONG g_free_ram_gb = 0;
static BOOL g_image_loaded = FALSE;

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
        wsprintfW(g_os, L"Windows %lu.%lu (build %lu)",
                  (unsigned long)os.dwMajorVersion,
                  (unsigned long)os.dwMinorVersion,
                  (unsigned long)os.dwBuildNumber);
    }

    /* Missing telemetry always stays on the safe profile. */
    if (g_total_ram_gb >= 4 && g_free_ram_gb >= 1 && g_cpu_count >= 2) {
        wcscpy(g_profile, L"STANDARD");
    } else {
        wcscpy(g_profile, L"SAFE");
    }
}

static void load_background(void) {
    WCHAR path[MAX_PATH];
    WCHAR *slash;
    DWORD n = GetModuleFileNameW(NULL, path, MAX_PATH);
    if (!n || n >= MAX_PATH) return;
    slash = wcsrchr(path, L'\\');
    if (!slash) return;
    *(slash + 1) = 0;
    if (wcslen(path) + 15 >= MAX_PATH) return;
    wcscat(path, L"background.bmp");
    g_bitmap = (HBITMAP)LoadImageW(NULL, path, IMAGE_BITMAP, 0, 0,
                                   LR_LOADFROMFILE | LR_CREATEDIBSECTION);
    if (g_bitmap) {
        ZeroMemory(&g_bitmap_info, sizeof(g_bitmap_info));
        if (GetObjectW(g_bitmap, sizeof(g_bitmap_info), &g_bitmap_info)) {
            g_image_loaded = TRUE;
        } else {
            DeleteObject(g_bitmap);
            g_bitmap = NULL;
        }
    }
}

static void layout_buttons(HWND hwnd) {
    RECT rc;
    int width, y, button_width = 170, gap = 12, total;
    GetClientRect(hwnd, &rc);
    width = rc.right - rc.left;
    y = rc.bottom - 66;
    total = button_width * 3 + gap * 2;
    int x = (width - total) / 2;
    if (x < 12) x = 12;
    MoveWindow(g_open_button, x, y, button_width, 34, TRUE);
    MoveWindow(g_info_button, x + button_width + gap, y, button_width, 34, TRUE);
    MoveWindow(g_exit_button, x + (button_width + gap) * 2, y, button_width, 34, TRUE);
}

static void paint_background(HWND hwnd, HDC dc) {
    RECT rc;
    HBRUSH brush;
    GetClientRect(hwnd, &rc);
    brush = CreateSolidBrush(RGB(7, 13, 22));
    FillRect(dc, &rc, brush);
    DeleteObject(brush);

    if (g_image_loaded && g_bitmap) {
        HDC memory_dc = CreateCompatibleDC(dc);
        if (memory_dc) {
            HGDIOBJ old = SelectObject(memory_dc, g_bitmap);
            int cw = rc.right - rc.left;
            int ch = rc.bottom - rc.top;
            double sx = (double)cw / (double)g_bitmap_info.bmWidth;
            double sy = (double)ch / (double)g_bitmap_info.bmHeight;
            double scale = sx < sy ? sx : sy;
            int dw = (int)(g_bitmap_info.bmWidth * scale);
            int dh = (int)(g_bitmap_info.bmHeight * scale);
            int dx = (cw - dw) / 2;
            int dy = (ch - dh) / 2;
            SetStretchBltMode(dc, HALFTONE);
            StretchBlt(dc, dx, dy, dw, dh, memory_dc, 0, 0,
                       g_bitmap_info.bmWidth, g_bitmap_info.bmHeight, SRCCOPY);
            SelectObject(memory_dc, old);
            DeleteDC(memory_dc);
        }
    }

    SetBkMode(dc, TRANSPARENT);
    SetTextColor(dc, RGB(244, 247, 250));
    {
        HFONT font = CreateFontW(30, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE,
                                 DEFAULT_CHARSET, OUT_DEFAULT_PRECIS,
                                 CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY,
                                 DEFAULT_PITCH | FF_SWISS, L"Segoe UI");
        HFONT old_font = (HFONT)SelectObject(dc, font);
        TextOutW(dc, 28, 24, L"N.U  |  NIROO UNIVERSE", 22);
        SelectObject(dc, old_font);
        DeleteObject(font);
    }
    {
        WCHAR status[180];
        HFONT font = CreateFontW(16, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
                                 DEFAULT_CHARSET, OUT_DEFAULT_PRECIS,
                                 CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY,
                                 DEFAULT_PITCH | FF_SWISS, L"Segoe UI");
        HFONT old_font = (HFONT)SelectObject(dc, font);
        wsprintfW(status, L"AUTOMATIC SYSTEM PROFILE: %s", g_profile);
        SetTextColor(dc, RGB(205, 220, 232));
        TextOutW(dc, 31, 68, status, (int)wcslen(status));
        SetTextColor(dc, RGB(190, 204, 218));
        TextOutW(dc, 31, 96, L"Static image mode  |  No animated background layers", 52);
        SelectObject(dc, old_font);
        DeleteObject(font);
    }
}

static void show_system_info(HWND hwnd) {
    WCHAR message[512];
    wsprintfW(message,
        L"%s\r\n\r\nProcessor count: %lu\r\nPhysical RAM: %I64u GB\r\nAvailable RAM: %I64u GB\r\nAutomatic profile: %s\r\nBackground image: %s\r\n\r\nThe profile is a conservative local estimate, not a performance guarantee.",
        g_os, (unsigned long)g_cpu_count, g_total_ram_gb, g_free_ram_gb,
        g_profile, g_image_loaded ? L"loaded" : L"not found (solid fallback)");
    MessageBoxW(hwnd, message, L"N.U System Information", MB_OK | MB_ICONINFORMATION);
}

static LRESULT CALLBACK window_proc(HWND hwnd, UINT message, WPARAM wparam, LPARAM lparam) {
    switch (message) {
    case WM_CREATE:
        g_open_button = CreateWindowW(L"BUTTON", L"OPEN N.U WEB DEMO",
            WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON, 0, 0, 170, 34,
            hwnd, (HMENU)ID_OPEN, GetModuleHandleW(NULL), NULL);
        g_info_button = CreateWindowW(L"BUTTON", L"SYSTEM INFORMATION",
            WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON, 0, 0, 170, 34,
            hwnd, (HMENU)ID_INFO, GetModuleHandleW(NULL), NULL);
        g_exit_button = CreateWindowW(L"BUTTON", L"EXIT",
            WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON, 0, 0, 170, 34,
            hwnd, (HMENU)ID_EXIT, GetModuleHandleW(NULL), NULL);
        layout_buttons(hwnd);
        return 0;
    case WM_SIZE:
        layout_buttons(hwnd);
        InvalidateRect(hwnd, NULL, TRUE);
        return 0;
    case WM_ERASEBKGND:
        return 1;
    case WM_PAINT: {
        PAINTSTRUCT ps;
        HDC dc = BeginPaint(hwnd, &ps);
        paint_background(hwnd, dc);
        EndPaint(hwnd, &ps);
        return 0;
    }
    case WM_COMMAND:
        switch (LOWORD(wparam)) {
        case ID_OPEN:
            ShellExecuteW(hwnd, L"open",
                L"https://mobinabinshun-beep.github.io/mobinabinshun-beep/",
                NULL, NULL, SW_SHOWNORMAL);
            return 0;
        case ID_INFO:
            show_system_info(hwnd);
            return 0;
        case ID_EXIT:
            DestroyWindow(hwnd);
            return 0;
        }
        break;
    case WM_DESTROY:
        if (g_bitmap) DeleteObject(g_bitmap);
        PostQuitMessage(0);
        return 0;
    }
    return DefWindowProcW(hwnd, message, wparam, lparam);
}

int WINAPI WinMain(HINSTANCE instance, HINSTANCE previous, LPSTR command_line, int show_command) {
    WNDCLASSW wc;
    HWND hwnd;
    MSG msg;
    (void)previous; (void)command_line;

    detect_system();
    load_background();
    ZeroMemory(&wc, sizeof(wc));
    wc.style = CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc = window_proc;
    wc.hInstance = instance;
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);
    wc.lpszClassName = L"NUXPFirstLauncherWindow";
    if (!RegisterClassW(&wc)) return 1;

    hwnd = CreateWindowW(wc.lpszClassName, L"N.U Launcher — XP-first preview",
        WS_OVERLAPPEDWINDOW, CW_USEDEFAULT, CW_USEDEFAULT, 900, 620,
        NULL, NULL, instance, NULL);
    if (!hwnd) return 2;
    ShowWindow(hwnd, show_command);
    UpdateWindow(hwnd);

    while (GetMessageW(&msg, NULL, 0, 0) > 0) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }
    return (int)msg.wParam;
}
