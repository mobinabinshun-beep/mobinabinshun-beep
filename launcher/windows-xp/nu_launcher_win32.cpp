#define WIN32_LEAN_AND_MEAN
#define _WIN32_WINNT 0x0501
#define WINVER 0x0501
#include <windows.h>
#include <shellapi.h>
#include <stdio.h>
#include <string.h>

#define APP_CLASS "NU_LAUNCHER_V1"
#define MAX_MODULES 64
#define MAX_TEXT 128
#define ID_LIST 1001
#define ID_LAUNCH 1002
#define ID_STOP 1003
#define ID_STATUS 1004

typedef struct NU_HostAPI_V1 {
    unsigned int abiVersion;
    HWND hostWindow;
    void (__stdcall *setStatus)(const char *);
} NU_HostAPI_V1;

typedef int (__stdcall *NU_ModuleStartFn)(HWND, const NU_HostAPI_V1 *);
typedef void (__stdcall *NU_ModuleStopFn)(void);

typedef struct ModuleRecord {
    char id[64];
    char title[MAX_TEXT];
    char path[MAX_PATH];
} ModuleRecord;

static HINSTANCE g_instance = NULL;
static HWND g_window = NULL, g_list = NULL, g_status = NULL;
static ModuleRecord g_modules[MAX_MODULES];
static int g_moduleCount = 0;
static HMODULE g_module = NULL;
static NU_ModuleStopFn g_stop = NULL;
static HWND g_moduleWindow = NULL;
static char g_basePath[MAX_PATH];

static void SetStatusText(const char *value) {
    if (g_status) SetWindowTextA(g_status, value ? value : "");
}
static void __stdcall HostSetStatus(const char *value) {
    SetStatusText(value);
}
static int SafeRelativePath(const char *path) {
    if (!path || !path[0]) return 0;
    if (strstr(path, "..") || path[0] == '\\' || path[0] == '/') return 0;
    if (strchr(path, ':')) return 0;
    return 1;
}
static void LoadRegistry(void) {
    char filePath[MAX_PATH], line[512];
    FILE *f;
    int i;
    GetModuleFileNameA(NULL, g_basePath, MAX_PATH);
    for (i = (int)strlen(g_basePath) - 1; i >= 0 && g_basePath[i] != '\\'; --i) g_basePath[i] = 0;
    lstrcpynA(filePath, g_basePath, MAX_PATH);
    lstrcatA(filePath, "modules\\modules.ini");
    f = fopen(filePath, "r");
    if (!f) return;
    while (fgets(line, sizeof(line), f) && g_moduleCount < MAX_MODULES) {
        char *p1, *p2, *p3, *end;
        if (line[0] == ';' || line[0] == '#' || line[0] == '\r' || line[0] == '\n') continue;
        p1 = strtok(line, "|\r\n"); p2 = strtok(NULL, "|\r\n"); p3 = strtok(NULL, "|\r\n");
        if (!p1 || !p2 || !p3 || !SafeRelativePath(p3)) continue;
        lstrcpynA(g_modules[g_moduleCount].id, p1, sizeof(g_modules[g_moduleCount].id));
        lstrcpynA(g_modules[g_moduleCount].title, p2, sizeof(g_modules[g_moduleCount].title));
        lstrcpynA(g_modules[g_moduleCount].path, p3, sizeof(g_modules[g_moduleCount].path));
        end = strrchr(g_modules[g_moduleCount].path, '.');
        if (!end || lstrcmpiA(end, ".dll") != 0) continue;
        ++g_moduleCount;
    }
    fclose(f);
}
static void StopModule(void) {
    if (g_stop) { g_stop(); g_stop = NULL; }
    if (g_moduleWindow && IsWindow(g_moduleWindow)) DestroyWindow(g_moduleWindow);
    g_moduleWindow = NULL;
    if (g_module) { FreeLibrary(g_module); g_module = NULL; }
    if (g_list) ShowWindow(g_list, SW_SHOW);
    SetStatusText("Ready. Select a trusted module.");
}
static void LaunchSelected(void) {
    int index = (int)SendMessageA(g_list, LB_GETCURSEL, 0, 0);
    char fullPath[MAX_PATH], message[256];
    NU_HostAPI_V1 api;
    FARPROC startProc;
    if (index < 0 || index >= g_moduleCount) { SetStatusText("Select a module first."); return; }
    if (g_module) StopModule();
    lstrcpynA(fullPath, g_basePath, MAX_PATH);
    lstrcatA(fullPath, g_modules[index].path);
    g_module = LoadLibraryA(fullPath);
    if (!g_module) { SetStatusText("Module could not be loaded."); return; }
    startProc = GetProcAddress(g_module, "NU_ModuleStart");
    g_stop = (NU_ModuleStopFn)GetProcAddress(g_module, "NU_ModuleStop");
    if (!startProc) { FreeLibrary(g_module); g_module = NULL; g_stop = NULL; SetStatusText("Module ABI entry point missing."); return; }
    api.abiVersion = 1; api.hostWindow = g_window; api.setStatus = HostSetStatus;
    if (!((NU_ModuleStartFn)startProc)(g_window, &api)) {
        lstrcpynA(message, "Module start failed: ", sizeof(message));
        lstrcatA(message, g_modules[index].title);
        StopModule(); SetStatusText(message); return;
    }
    ShowWindow(g_list, SW_HIDE);
    SetStatusText("Module running. Use Exit Module to return.");
}
static LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    switch (msg) {
    case WM_CREATE: {
        HFONT font = (HFONT)GetStockObject(DEFAULT_GUI_FONT);
        g_list = CreateWindowExA(WS_EX_CLIENTEDGE, "LISTBOX", "", WS_CHILD|WS_VISIBLE|WS_VSCROLL|LBS_NOTIFY, 24, 70, 420, 250, hwnd, (HMENU)ID_LIST, g_instance, NULL);
        CreateWindowA("STATIC", "N.U  |  NIROO UNIVERSE", WS_CHILD|WS_VISIBLE, 24, 22, 360, 28, hwnd, NULL, g_instance, NULL);
        CreateWindowA("BUTTON", "Launch", WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON, 24, 340, 120, 32, hwnd, (HMENU)ID_LAUNCH, g_instance, NULL);
        CreateWindowA("BUTTON", "Exit Module", WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON, 156, 340, 120, 32, hwnd, (HMENU)ID_STOP, g_instance, NULL);
        g_status = CreateWindowA("STATIC", "Loading module registry...", WS_CHILD|WS_VISIBLE, 24, 390, 500, 24, hwnd, (HMENU)ID_STATUS, g_instance, NULL);
        SendMessageA(g_list, WM_SETFONT, (WPARAM)font, TRUE);
        LoadRegistry();
        { int i; for (i=0;i<g_moduleCount;i++) SendMessageA(g_list, LB_ADDSTRING, 0, (LPARAM)g_modules[i].title); }
        SetStatusText(g_moduleCount ? "Ready. Select a trusted module." : "No modules registered. Add entries to modules/modules.ini.");
        return 0;
    }
    case WM_COMMAND:
        if (LOWORD(wp) == ID_LAUNCH) LaunchSelected();
        else if (LOWORD(wp) == ID_STOP) StopModule();
        else if (LOWORD(wp) == ID_LIST && HIWORD(wp) == LBN_DBLCLK) LaunchSelected();
        return 0;
    case WM_CLOSE: StopModule(); DestroyWindow(hwnd); return 0;
    case WM_DESTROY: PostQuitMessage(0); return 0;
    case WM_PAINT: {
        PAINTSTRUCT ps; HDC dc = BeginPaint(hwnd, &ps);
        RECT r; GetClientRect(hwnd, &r);
        FillRect(dc, &r, (HBRUSH)(COLOR_WINDOW+1));
        EndPaint(hwnd, &ps); return 0;
    }
    }
    return DefWindowProcA(hwnd, msg, wp, lp);
}
int WINAPI WinMain(HINSTANCE instance, HINSTANCE previous, LPSTR commandLine, int show) {
    WNDCLASSA wc; MSG msg;
    (void)previous; (void)commandLine;
    g_instance = instance;
    ZeroMemory(&wc, sizeof(wc));
    wc.lpfnWndProc = WindowProc; wc.hInstance = instance; wc.lpszClassName = APP_CLASS;
    wc.hCursor = LoadCursor(NULL, IDC_ARROW); wc.hbrBackground = (HBRUSH)(COLOR_WINDOW+1);
    if (!RegisterClassA(&wc)) return 1;
    g_window = CreateWindowA(APP_CLASS, "N.U Launcher — Core Preview", WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT, 560, 480, NULL, NULL, instance, NULL);
    if (!g_window) return 2;
    ShowWindow(g_window, show); UpdateWindow(g_window);
    while (GetMessageA(&msg, NULL, 0, 0) > 0) { TranslateMessage(&msg); DispatchMessageA(&msg); }
    return (int)msg.wParam;
}
