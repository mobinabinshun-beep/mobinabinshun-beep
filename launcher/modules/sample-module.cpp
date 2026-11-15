#define WIN32_LEAN_AND_MEAN
#include <windows.h>
typedef struct NU_HostAPI_V1 { unsigned int abiVersion; HWND hostWindow; HWND contentWindow; void (__stdcall *setStatus)(const char *); } NU_HostAPI_V1;
static HWND g_view = NULL;
extern "C" __declspec(dllexport) int __stdcall NU_ModuleStart(HWND parent, const NU_HostAPI_V1 *api) {
 RECT r;
 if (!api || api->abiVersion != 1 || parent != api->contentWindow) return 0;
 GetClientRect(parent, &r);
 g_view = CreateWindowA("STATIC", "N.U Generation 1 sample module", WS_CHILD|WS_VISIBLE|SS_CENTER,
   12, 24, r.right-24, 48, parent, NULL, GetModuleHandle(NULL), NULL);
 if (!g_view) return 0;
 if (api->setStatus) api->setStatus("Sample module mounted in the launcher's content area.");
 return 1;
}
extern "C" __declspec(dllexport) void __stdcall NU_ModuleStop(void) {
 if (g_view && IsWindow(g_view)) DestroyWindow(g_view);
 g_view = NULL;
}
