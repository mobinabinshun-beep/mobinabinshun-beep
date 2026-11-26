#define UNICODE
#define _UNICODE
#include <windows.h>
#include <gdiplus.h>
#include <shellapi.h>
#include <string>
using namespace Gdiplus;
static ULONG_PTR g_gdiplusToken = 0;
static Image* g_image = 0;
static bool g_lowPower = true;
static const wchar_t* kHomeUrl = L"https://mobinabinshun-beep.github.io/mobinabinshun-beep/";
static std::wstring appDirectory() {
    wchar_t path[MAX_PATH]; DWORD n = GetModuleFileNameW(0, path, MAX_PATH);
    if (!n || n >= MAX_PATH) return L".";
    std::wstring value(path); std::wstring::size_type slash = value.find_last_of(L"\\/");
    if (slash != std::wstring::npos) value.resize(slash);
    return value;
}
static void detectSystem() {
    SYSTEM_INFO info; GetSystemInfo(&info);
    MEMORYSTATUSEX memory; memory.dwLength = sizeof(memory);
    bool memoryKnown = GlobalMemoryStatusEx(&memory) != 0;
    DWORD cores = info.dwNumberOfProcessors ? info.dwNumberOfProcessors : 1;
    g_lowPower = !memoryKnown || memory.ullTotalPhys < (1024ULL * 1024ULL * 1024ULL) || cores <= 1;
}
static void openNirooUniverse(HWND owner) {
    HINSTANCE result = ShellExecuteW(owner, L"open", kHomeUrl, 0, 0, SW_SHOWNORMAL);
    if ((INT_PTR)result <= 32)
        MessageBoxW(owner, L"Windows could not open the N.U website. Check that a web browser is installed.", L"N.U Launcher", MB_OK | MB_ICONWARNING);
}
static void paintImage(HWND hwnd) {
    PAINTSTRUCT ps; HDC hdc = BeginPaint(hwnd, &ps);
    RECT client; GetClientRect(hwnd, &client);
    Graphics graphics(hdc); graphics.Clear(Color(255, 5, 12, 20));
    if (g_image && g_image->GetLastStatus() == Ok) {
        UINT iw = g_image->GetWidth(), ih = g_image->GetHeight();
        int cw = client.right - client.left, ch = client.bottom - client.top;
        if (iw && ih && cw > 0 && ch > 0) {
            double sx = (double)cw / (double)iw, sy = (double)ch / (double)ih;
            double scale = sx < sy ? sx : sy;
            int dw = (int)(iw * scale), dh = (int)(ih * scale);
            int x = (cw - dw) / 2, y = (ch - dh) / 2;
            graphics.SetInterpolationMode(g_lowPower ? InterpolationModeLowQuality : InterpolationModeHighQualityBicubic);
            graphics.SetPixelOffsetMode(g_lowPower ? PixelOffsetModeHighSpeed : PixelOffsetModeHighQuality);
            graphics.DrawImage(g_image, x, y, dw, dh);
        }
    }
    EndPaint(hwnd, &ps);
}
static LRESULT CALLBACK windowProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam) {
    switch (message) {
    case WM_PAINT: paintImage(hwnd); return 0;
    case WM_SIZE: InvalidateRect(hwnd, 0, FALSE); return 0;
    case WM_LBUTTONDBLCLK: openNirooUniverse(hwnd); return 0;
    case WM_KEYDOWN:
        if (wParam == VK_RETURN) { openNirooUniverse(hwnd); return 0; }
        if (wParam == VK_ESCAPE) { DestroyWindow(hwnd); return 0; }
        return 0;
    case WM_DESTROY: PostQuitMessage(0); return 0;
    default: return DefWindowProcW(hwnd, message, wParam, lParam);
    }
}
int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, LPWSTR, int showCommand) {
    detectSystem();
    GdiplusStartupInput gdiplusInput;
    if (GdiplusStartup(&g_gdiplusToken, &gdiplusInput, 0) == Ok) {
        std::wstring imagePath = appDirectory();
        imagePath += L"\\assets\\Original reference image file for Niroo Universe (N.U).png";
        g_image = Image::FromFile(imagePath.c_str(), FALSE);
        if (g_image && g_image->GetLastStatus() != Ok) { delete g_image; g_image = 0; }
    }
    const wchar_t* className = L"NUImageOnlyLauncherWindow";
    WNDCLASSEXW wc; ZeroMemory(&wc, sizeof(wc));
    wc.cbSize = sizeof(wc); wc.style = CS_HREDRAW | CS_VREDRAW | CS_DBLCLKS;
    wc.lpfnWndProc = windowProc; wc.hInstance = instance;
    wc.hCursor = LoadCursor(0, IDC_ARROW); wc.hIcon = LoadIcon(0, IDI_APPLICATION);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1); wc.lpszClassName = className;
    if (!RegisterClassExW(&wc)) {
        if (g_image) delete g_image; if (g_gdiplusToken) GdiplusShutdown(g_gdiplusToken); return 1;
    }
    int screenW = GetSystemMetrics(SM_CXSCREEN), screenH = GetSystemMetrics(SM_CYSCREEN);
    int width = screenW < 900 ? screenW - 40 : 860, height = screenH < 680 ? screenH - 80 : 600;
    if (width < 320) width = screenW; if (height < 240) height = screenH;
    RECT bounds = { 0, 0, width, height }; AdjustWindowRect(&bounds, WS_OVERLAPPEDWINDOW, FALSE);
    HWND hwnd = CreateWindowExW(0, className, L"N.U Launcher — double-click image to open N.U",
        WS_OVERLAPPEDWINDOW, CW_USEDEFAULT, CW_USEDEFAULT, bounds.right - bounds.left, bounds.bottom - bounds.top,
        0, 0, instance, 0);
    if (!hwnd) { if (g_image) delete g_image; if (g_gdiplusToken) GdiplusShutdown(g_gdiplusToken); return 2; }
    ShowWindow(hwnd, showCommand); UpdateWindow(hwnd);
    MSG msg; while (GetMessageW(&msg, 0, 0, 0) > 0) { TranslateMessage(&msg); DispatchMessageW(&msg); }
    if (g_image) delete g_image; if (g_gdiplusToken) GdiplusShutdown(g_gdiplusToken);
    return (int)msg.wParam;
}