#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <shellapi.h>
#include <stdio.h>
#include <string.h>

static const char* kDemoUrl = "https://mobinabinshun-beep.github.io/mobinabinshun-beep/";
static HBITMAP g_background = NULL;
static char g_status[256] = "Detecting this PC...";
static char g_os[96] = "Windows";
static char g_specs[160] = "";
static int g_level = 3;
static RECT g_launchButton = { 470, 378, 660, 430 };
static RECT g_siteButton = { 270, 378, 450, 430 };

static void GetExeFolder(char* out, DWORD cap) {
    GetModuleFileNameA(NULL, out, cap);
    char* slash = strrchr(out, '\\');
    if (slash) *(slash + 1) = 0;
}
static void LoadBackground() {
    char path[MAX_PATH];
    GetExeFolder(path, MAX_PATH);
    strncat(path, "launcher-background.bmp", MAX_PATH - strlen(path) - 1);
    g_background = (HBITMAP)LoadImageA(NULL, path, IMAGE_BITMAP, 0, 0, LR_LOADFROMFILE | LR_CREATEDIBSECTION);
}
static void DetectMachine() {
    OSVERSIONINFOA os;
    ZeroMemory(&os, sizeof(os));
    os.dwOSVersionInfoSize = sizeof(os);
    if (GetVersionExA(&os)) {
        if (os.dwMajorVersion == 5 && os.dwMinorVersion == 1) lstrcpyA(g_os, "Windows XP");
        else if (os.dwMajorVersion == 5) lstrcpyA(g_os, "Windows XP / Server 2003 family");
        else if (os.dwMajorVersion == 6 && os.dwMinorVersion == 0) lstrcpyA(g_os, "Windows Vista");
        else if (os.dwMajorVersion == 6 && os.dwMinorVersion == 1) lstrcpyA(g_os, "Windows 7");
        else if (os.dwMajorVersion == 6 && os.dwMinorVersion == 2) lstrcpyA(g_os, "Windows 8 / newer (legacy version report)");
        else if (os.dwMajorVersion >= 10) lstrcpyA(g_os, "Windows 10 / 11 family");
    }
    SYSTEM_INFO si;
    GetSystemInfo(&si);
    MEMORYSTATUSEX ms;
    ZeroMemory(&ms, sizeof(ms));
    ms.dwLength = sizeof(ms);
    unsigned long long ramGB = 0;
    if (GlobalMemoryStatusEx(&ms)) ramGB = (unsigned long long)(ms.ullTotalPhys / (1024ULL * 1024ULL * 1024ULL));
    int cores = (int)si.dwNumberOfProcessors;
    g_level = 8;
    if (ramGB <= 1) g_level = 1;
    else if (ramGB <= 2) g_level = 2;
    else if (ramGB <= 4) g_level = 4;
    else if (ramGB <= 8) g_level = 6;
    if (cores <= 1 && g_level > 2) g_level = 2;
    else if (cores <= 2 && g_level > 4) g_level = 4;
    else if (cores <= 4 && g_level > 6) g_level = 6;
    if (os.dwMajorVersion == 5 && g_level > 3) g_level = 3;
    wsprintfA(g_specs, "%s  |  %lu CPU thread(s)  |  %I64u GB RAM", g_os, (unsigned long)cores, ramGB);
    wsprintfA(g_status, "Automatic safe ceiling: Level %d", g_level);
}
static void DrawTextLine(HDC dc, const char* text, int x, int y, int size, COLORREF color, int bold) {
    HFONT font = CreateFontA(size, 0, 0, 0, bold ? FW_BOLD : FW_NORMAL, FALSE, FALSE, FALSE,
        DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, ANTIALIASED_QUALITY,
        DEFAULT_PITCH | FF_SWISS, "Arial");
    HFONT old = (HFONT)SelectObject(dc, font);
    SetBkMode(dc, TRANSPARENT);
    SetTextColor(dc, color);
    TextOutA(dc, x, y, text, lstrlenA(text));
    SelectObject(dc, old);
    DeleteObject(font);
}
static void DrawButton(HDC dc, RECT r, const char* label, COLORREF fill) {
    HBRUSH brush = CreateSolidBrush(fill);
    HPEN pen = CreatePen(PS_SOLID, 1, RGB(150, 211, 222));
    HBRUSH oldBrush = (HBRUSH)SelectObject(dc, brush);
    HPEN oldPen = (HPEN)SelectObject(dc, pen);
    RoundRect(dc, r.left, r.top, r.right, r.bottom, 10, 10);
    SetBkMode(dc, TRANSPARENT);
    SetTextColor(dc, RGB(245, 250, 252));
    HFONT font = CreateFontA(16, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET,
        OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, ANTIALIASED_QUALITY, DEFAULT_PITCH | FF_SWISS, "Arial");
    HFONT oldFont = (HFONT)SelectObject(dc, font);
    RECT tr = r;
    DrawTextA(dc, label, -1, &tr, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
    SelectObject(dc, oldFont);
    DeleteObject(font);
    SelectObject(dc, oldBrush); SelectObject(dc, oldPen);
    DeleteObject(brush); DeleteObject(pen);
}
static void Paint(HWND hwnd) {
    PAINTSTRUCT ps;
    HDC dc = BeginPaint(hwnd, &ps);
    RECT client; GetClientRect(hwnd, &client);
    if (g_background) {
        HDC mem = CreateCompatibleDC(dc);
        HBITMAP old = (HBITMAP)SelectObject(mem, g_background);
        BITMAP bm; GetObject(g_background, sizeof(bm), &bm);
        SetStretchBltMode(dc, HALFTONE);
        StretchBlt(dc, 0, 0, client.right, client.bottom, mem, 0, 0, bm.bmWidth, bm.bmHeight, SRCCOPY);
        SelectObject(mem, old); DeleteDC(mem);
    } else {
        HBRUSH bg = CreateSolidBrush(RGB(7, 16, 28));
        FillRect(dc, &client, bg); DeleteObject(bg);
    }
    // A single still image is the only background layer. Text and controls are foreground UI.
    DrawTextLine(dc, "N.U", 42, 32, 42, RGB(247, 250, 252), 1);
    DrawTextLine(dc, "NIROO UNIVERSE  |  WINDOWS LAUNCHER", 48, 83, 14, RGB(184, 220, 229), 1);
    DrawTextLine(dc, "A smaller, calmer way into N.U.", 48, 160, 27, RGB(255, 255, 255), 1);
    DrawTextLine(dc, "The launcher checks this computer and chooses a conservative", 50, 207, 16, RGB(227, 238, 242), 0);
    DrawTextLine(dc, "graphics ceiling automatically. No manual quality setup required.", 50, 231, 16, RGB(227, 238, 242), 0);
    DrawTextLine(dc, g_specs, 50, 296, 14, RGB(231, 239, 242), 1);
    DrawTextLine(dc, g_status, 50, 324, 16, RGB(180, 231, 210), 1);
    DrawButton(dc, g_siteButton, "N.U WEBSITE", RGB(35, 68, 82));
    DrawButton(dc, g_launchButton, "OPEN N.U", RGB(18, 111, 100));
    DrawTextLine(dc, "Prototype 0.1  |  32-bit native shell  |  Local hardware check", 42, 452, 11, RGB(193, 207, 214), 0);
    EndPaint(hwnd, &ps);
}
static void OpenDemo() {
    char url[512];
    wsprintfA(url, "%s?nuNativeLevel=%d", kDemoUrl, g_level);
    HINSTANCE result = ShellExecuteA(NULL, "open", url, NULL, NULL, SW_SHOWNORMAL);
    if ((INT_PTR)result <= 32) {
        MessageBoxA(NULL,
            "Windows could not open the N.U website in the default browser.\n\n"
            "This can happen on older Windows installations whose browser no longer supports modern HTTPS. "
            "Install a browser compatible with your Windows version, then try again.",
            "N.U Launcher - Browser required", MB_ICONWARNING | MB_OK);
    }
}
static LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    switch (msg) {
    case WM_PAINT: Paint(hwnd); return 0;
    case WM_LBUTTONUP: {
        POINT p; p.x = LOWORD(lp); p.y = HIWORD(lp);
        if (PtInRect(&g_launchButton, p)) OpenDemo();
        else if (PtInRect(&g_siteButton, p)) ShellExecuteA(NULL, "open", "https://github.com/mobinabinshun-beep/mobinabinshun-beep", NULL, NULL, SW_SHOWNORMAL);
        return 0;
    }
    case WM_DESTROY: PostQuitMessage(0); return 0;
    }
    return DefWindowProcA(hwnd, msg, wp, lp);
}
int WINAPI WinMain(HINSTANCE instance, HINSTANCE, LPSTR, int show) {
    DetectMachine();
    LoadBackground();
    WNDCLASSA wc; ZeroMemory(&wc, sizeof(wc));
    wc.lpfnWndProc = WindowProc; wc.hInstance = instance;
    wc.hCursor = LoadCursor(NULL, IDC_ARROW); wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.lpszClassName = "NU_LAUNCHER_WIN32_V01";
    if (!RegisterClassA(&wc)) return 1;
    HWND hwnd = CreateWindowExA(0, wc.lpszClassName, "N.U Launcher 0.1",
        WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX,
        CW_USEDEFAULT, CW_USEDEFAULT, 760, 540, NULL, NULL, instance, NULL);
    if (!hwnd) return 2;
    ShowWindow(hwnd, show); UpdateWindow(hwnd);
    MSG msg; while (GetMessageA(&msg, NULL, 0, 0) > 0) { TranslateMessage(&msg); DispatchMessageA(&msg); }
    if (g_background) DeleteObject(g_background);
    return (int)msg.wParam;
}
