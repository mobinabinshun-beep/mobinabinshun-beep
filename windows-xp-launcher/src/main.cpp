#define WIN32_LEAN_AND_MEAN
#define WINVER 0x0501
#define _WIN32_WINNT 0x0501
#include <windows.h>
#include <gdiplus.h>
#include <shlwapi.h>
#include <strsafe.h>
#pragma comment(lib, "gdiplus.lib")
#pragma comment(lib, "shlwapi.lib")
using namespace Gdiplus;
static ULONG_PTR g_token = 0;
static Image* g_image = NULL;
static InterpolationMode g_mode = InterpolationModeNearestNeighbor;
static WCHAR g_path[MAX_PATH];
static void DetectProfile() {
  MEMORYSTATUSEX m; SYSTEM_INFO s; ZeroMemory(&m,sizeof(m)); m.dwLength=sizeof(m); GetSystemInfo(&s);
  if (GlobalMemoryStatusEx(&m)) {
    const DWORDLONG mb=m.ullTotalPhys/(1024ULL*1024ULL);
    if (mb<1024ULL) g_mode=InterpolationModeNearestNeighbor;
    else if (mb>=3072ULL && s.dwNumberOfProcessors>=2) g_mode=InterpolationModeHighQualityBilinear;
    else g_mode=InterpolationModeBilinear;
  }
}
static BOOL FindImage() {
  WCHAR module[MAX_PATH]; DWORD n=GetModuleFileNameW(NULL,module,MAX_PATH);
  if (!n || n>=MAX_PATH || !PathRemoveFileSpecW(module)) return FALSE;
  if (FAILED(StringCchCopyW(g_path,MAX_PATH,module))) return FALSE;
  if (FAILED(StringCchCatW(g_path,MAX_PATH,L"\\assets\\Original reference image file for Niroo Universe (N.U).png"))) return FALSE;
  return PathFileExistsW(g_path);
}
static void Paint(HWND w) {
  PAINTSTRUCT ps; HDC dc=BeginPaint(w,&ps); RECT r; GetClientRect(w,&r);
  if (g_image) { Graphics g(dc); g.SetCompositingMode(CompositingModeSourceCopy); g.SetInterpolationMode(g_mode); g.SetPixelOffsetMode(PixelOffsetModeHalf); g.DrawImage(g_image,0,0,r.right-r.left,r.bottom-r.top); }
  EndPaint(w,&ps);
}
static LRESULT CALLBACK Proc(HWND w,UINT m,WPARAM a,LPARAM b) {
  if (m==WM_PAINT) { Paint(w); return 0; }
  if (m==WM_ERASEBKGND) return 1;
  if (m==WM_KEYDOWN && a==VK_ESCAPE) { DestroyWindow(w); return 0; }
  if (m==WM_DESTROY) { PostQuitMessage(0); return 0; }
  return DefWindowProcW(w,m,a,b);
}
int APIENTRY wWinMain(HINSTANCE h,HINSTANCE,LPWSTR,int) {
  DetectProfile(); GdiplusStartupInput in;
  if (GdiplusStartup(&g_token,&in,NULL)!=Ok) { MessageBoxW(NULL,L"GDI+ could not start.",L"N.U Launcher",MB_ICONERROR); return 1; }
  if (!FindImage()) { MessageBoxW(NULL,L"N.U artwork is missing. Repair or reinstall the launcher.",L"N.U Launcher",MB_ICONERROR); GdiplusShutdown(g_token); return 2; }
  g_image=Image::FromFile(g_path,FALSE);
  if (!g_image || g_image->GetLastStatus()!=Ok) { delete g_image; GdiplusShutdown(g_token); MessageBoxW(NULL,L"N.U artwork could not be decoded.",L"N.U Launcher",MB_ICONERROR); return 3; }
  WNDCLASSW wc; ZeroMemory(&wc,sizeof(wc)); wc.lpfnWndProc=Proc; wc.hInstance=h; wc.lpszClassName=L"NUXPImageLauncher"; wc.hCursor=LoadCursor(NULL,IDC_ARROW);
  if (!RegisterClassW(&wc)) { delete g_image; GdiplusShutdown(g_token); return 4; }
  HWND w=CreateWindowExW(WS_EX_APPWINDOW,wc.lpszClassName,L"N.U Launcher",WS_POPUP,0,0,GetSystemMetrics(SM_CXSCREEN),GetSystemMetrics(SM_CYSCREEN),NULL,NULL,h,NULL);
  if (!w) { delete g_image; GdiplusShutdown(g_token); return 5; }
  ShowWindow(w,SW_SHOW); UpdateWindow(w); MSG msg; while (GetMessageW(&msg,NULL,0,0)>0) { TranslateMessage(&msg); DispatchMessageW(&msg); }
  delete g_image; GdiplusShutdown(g_token); return (int)msg.wParam;
}