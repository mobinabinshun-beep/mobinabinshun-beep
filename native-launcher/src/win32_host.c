#define WIN32_LEAN_AND_MEAN
#define _WIN32_WINNT 0x0501
#include <windows.h>
#include <stdio.h>
#include "nu_core.h"
#define NU_WINDOW_CLASS "NU_NATIVE_LAUNCHER_WINDOW"
#define NU_BTN_ENTER 1001
#define NU_BTN_EXIT 1002

static NU_Capabilities g_caps;
static NU_Budget g_budget;
static char g_summary[1024];
static HBRUSH g_background_brush;

static void collect_capabilities(void)
{
    SYSTEM_INFO si;
    MEMORYSTATUSEX ms;
    ZeroMemory(&g_caps, sizeof(g_caps));
    ZeroMemory(&si, sizeof(si));
    GetSystemInfo(&si);
    g_caps.logical_processors = (unsigned int)si.dwNumberOfProcessors;
    g_caps.cpu_confidence = 2U;
    ZeroMemory(&ms, sizeof(ms));
    ms.dwLength = sizeof(ms);
    if (GlobalMemoryStatusEx(&ms)) {
        g_caps.physical_ram_mb =
            (unsigned long)(ms.ullTotalPhys / (1024UL * 1024UL));
        g_caps.ram_confidence = 2U;
    } else {
        g_caps.physical_ram_mb = 0UL;
        g_caps.ram_confidence = 0U;
    }
    g_caps.gpu_known = 0U;
    nu_calibrate(&g_caps, &g_budget);
}

static void build_summary(void)
{
    OSVERSIONINFOA os;
    ZeroMemory(&os, sizeof(os));
    os.dwOSVersionInfoSize = sizeof(os);
    GetVersionExA(&os);
    sprintf(g_summary,
        "N.U NATIVE RUNTIME FOUNDATION\r\n\r\n"
        "Windows version: %lu.%lu (build %lu)\r\n"
        "Logical processors: %u\r\n"
        "Physical RAM reported: %lu MB\r\n"
        "N.U RAM ceiling: %lu MB (50%%)\r\n"
        "Initial stable RAM budget: %lu MB (about 33%% total)\r\n"
        "CPU dispatch: one task at a time; cooperative\r\n"
        "Initial CPU budget target: %u%% (not OS-enforced on XP)\r\n"
        "GPU telemetry: unknown / not enforced\r\n\r\n"
        "No browser runtime is embedded or required.\r\n"
        "No game package is installed in this foundation build.",
        (unsigned long)os.dwMajorVersion, (unsigned long)os.dwMinorVersion,
        (unsigned long)os.dwBuildNumber, g_caps.logical_processors,
        g_caps.physical_ram_mb, g_budget.ram_ceiling_mb,
        g_budget.ram_stable_mb, g_budget.cpu_stable_percent);
}

static void paint_window(HWND hwnd)
{
    PAINTSTRUCT ps;
    HDC hdc;
    RECT rect;
    hdc = BeginPaint(hwnd, &ps);
    GetClientRect(hwnd, &rect);
    SetBkMode(hdc, TRANSPARENT);
    SetTextColor(hdc, RGB(232, 222, 194));
    DrawTextA(hdc, g_summary, -1, &rect, DT_LEFT | DT_TOP | DT_WORDBREAK);
    EndPaint(hwnd, &ps);
}

static LRESULT CALLBACK window_proc(HWND hwnd, UINT msg,
                                    WPARAM wparam, LPARAM lparam)
{
    switch (msg) {
    case WM_CREATE:
        CreateWindowA("BUTTON", "ENTER N.U", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
            24, 340, 150, 34, hwnd, (HMENU)NU_BTN_ENTER,
            ((LPCREATESTRUCT)lparam)->hInstance, 0);
        CreateWindowA("BUTTON", "EXIT", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
            190, 340, 100, 34, hwnd, (HMENU)NU_BTN_EXIT,
            ((LPCREATESTRUCT)lparam)->hInstance, 0);
        return 0;
    case WM_COMMAND:
        if (LOWORD(wparam) == NU_BTN_ENTER) {
            MessageBoxA(hwnd,
                "The N.U native core is ready. No signed Generation 1 game package is installed yet.",
                "N.U Runtime", MB_OK | MB_ICONINFORMATION);
            return 0;
        }
        if (LOWORD(wparam) == NU_BTN_EXIT) {
            DestroyWindow(hwnd);
            return 0;
        }
        break;
    case WM_PAINT:
        paint_window(hwnd);
        return 0;
    case WM_DESTROY:
        PostQuitMessage(0);
        return 0;
    }
    return DefWindowProcA(hwnd, msg, wparam, lparam);
}

int WINAPI WinMain(HINSTANCE instance, HINSTANCE previous,
                   LPSTR command_line, int show_command)
{
    WNDCLASSA wc;
    HWND hwnd;
    MSG msg;
    (void)previous;
    (void)command_line;
    collect_capabilities();
    build_summary();
    ZeroMemory(&wc, sizeof(wc));
    wc.lpfnWndProc = window_proc;
    wc.hInstance = instance;
    wc.lpszClassName = NU_WINDOW_CLASS;
    wc.hCursor = LoadCursor(0, IDC_ARROW);
    g_background_brush = CreateSolidBrush(RGB(16, 19, 29));
    if (g_background_brush == 0) return 3;
    wc.hbrBackground = g_background_brush;
    if (!RegisterClassA(&wc)) return 1;
    hwnd = CreateWindowA(NU_WINDOW_CLASS, "N.U - Niroo Universe",
        WS_OVERLAPPEDWINDOW, CW_USEDEFAULT, CW_USEDEFAULT, 620, 470,
        0, 0, instance, 0);
    if (hwnd == 0) return 2;
    ShowWindow(hwnd, show_command);
    UpdateWindow(hwnd);
    while (GetMessageA(&msg, 0, 0, 0) > 0) {
        TranslateMessage(&msg);
        DispatchMessageA(&msg);
    }
    if (g_background_brush != 0) DeleteObject(g_background_brush);
    return (int)msg.wParam;
}
