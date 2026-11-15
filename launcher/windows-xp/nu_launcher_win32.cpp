#define WIN32_LEAN_AND_MEAN
#define _WIN32_WINNT 0x0501
#define WINVER 0x0501
#include <windows.h>
#include <stdio.h>
#include <string.h>
#define APP_CLASS "NU_LAUNCHER_V1"
#define MAX_MODULES 64
#define MAX_TEXT 128
#define ID_LIST 1001
#define ID_LAUNCH 1002
#define ID_STOP 1003
#define ID_STATUS 1004
typedef struct NU_HostAPI_V1 { unsigned int abiVersion; HWND hostWindow; HWND contentWindow; void (__stdcall *setStatus)(const char *); } NU_HostAPI_V1;
typedef int (__stdcall *NU_ModuleStartFn)(HWND, const NU_HostAPI_V1 *);
typedef void (__stdcall *NU_ModuleStopFn)(void);
typedef struct ModuleRecord { char id[64]; char title[MAX_TEXT]; char path[MAX_PATH]; } ModuleRecord;
static HINSTANCE g_instance = NULL;
static HWND g_window = NULL, g_list = NULL, g_status = NULL, g_content = NULL;
static ModuleRecord g_modules[MAX_MODULES]; static int g_moduleCount = 0;
static HMODULE g_module = NULL; static NU_ModuleStopFn g_stop = NULL;
static char g_basePath[MAX_PATH]; static HBITMAP g_background = NULL;
static void SetStatusText(const char *v) { if (g_status) SetWindowTextA(g_status, v ? v : ""); }
static void __stdcall HostSetStatus(const char *v) { SetStatusText(v); }
static BOOL CALLBACK DestroyModuleChild(HWND child, LPARAM unused) { (void)unused; DestroyWindow(child); return TRUE; }
static int SafeRelativePath(const char *p) { if (!p || !p[0] || strstr(p,"..") || p[0]=='\\' || p[0]=='/') return 0; return strchr(p,':') == NULL; }
static void LoadRegistry(void) {
 char filePath[MAX_PATH], line[512]; FILE *f; int i;
 GetModuleFileNameA(NULL,g_basePath,MAX_PATH);
 for(i=(int)strlen(g_basePath)-1;i>=0 && g_basePath[i]!='\\';--i) g_basePath[i]=0;
 lstrcpynA(filePath,g_basePath,MAX_PATH); lstrcatA(filePath,"modules\\modules.ini");
 f=fopen(filePath,"r"); if(!f)return;
 while(fgets(line,sizeof(line),f) && g_moduleCount<MAX_MODULES) {
  char *p1,*p2,*p3,*end;
  if(line[0]==';'||line[0]=='#'||line[0]=='\r'||line[0]=='\n')continue;
  p1=strtok(line,"|\r\n"); p2=strtok(NULL,"|\r\n"); p3=strtok(NULL,"|\r\n");
  if(!p1||!p2||!p3||!SafeRelativePath(p3))continue;
  lstrcpynA(g_modules[g_moduleCount].id,p1,sizeof(g_modules[g_moduleCount].id));
  lstrcpynA(g_modules[g_moduleCount].title,p2,sizeof(g_modules[g_moduleCount].title));
  lstrcpynA(g_modules[g_moduleCount].path,p3,sizeof(g_modules[g_moduleCount].path));
  end=strrchr(g_modules[g_moduleCount].path,'.'); if(!end||lstrcmpiA(end,".dll")!=0)continue;
  ++g_moduleCount;
 }
 fclose(f);
}
static void StopModule(void) {
 if(g_stop){g_stop();g_stop=NULL;}
 if(g_content)EnumChildWindows(g_content,DestroyModuleChild,0);
 if(g_module){FreeLibrary(g_module);g_module=NULL;}
 if(g_content)ShowWindow(g_content,SW_HIDE);
 if(g_list)ShowWindow(g_list,SW_SHOW);
 SetStatusText("Ready. Select a trusted module.");
}
static void LaunchSelected(void) {
 int n=(int)SendMessageA(g_list,LB_GETCURSEL,0,0); char path[MAX_PATH],msg[256];
 NU_HostAPI_V1 api; FARPROC start;
 if(n<0||n>=g_moduleCount){SetStatusText("Select a module first.");return;}
 if(g_module)StopModule();
 lstrcpynA(path,g_basePath,MAX_PATH); lstrcatA(path,g_modules[n].path);
 g_module=LoadLibraryA(path); if(!g_module){SetStatusText("Module could not be loaded.");return;}
 start=GetProcAddress(g_module,"NU_ModuleStart"); g_stop=(NU_ModuleStopFn)GetProcAddress(g_module,"NU_ModuleStop");
 if(!start){FreeLibrary(g_module);g_module=NULL;g_stop=NULL;SetStatusText("Module ABI entry point missing.");return;}
 api.abiVersion=1;api.hostWindow=g_window;api.contentWindow=g_content;api.setStatus=HostSetStatus;
 if(!((NU_ModuleStartFn)start)(g_content,&api)){
  lstrcpynA(msg,"Module start failed: ",sizeof(msg));lstrcatA(msg,g_modules[n].title);
  StopModule();SetStatusText(msg);return;
 }
 ShowWindow(g_list,SW_HIDE);ShowWindow(g_content,SW_SHOW);
 SetStatusText("Module running inside N.U. Use Exit Module to return.");
}
static LRESULT CALLBACK WindowProc(HWND w,UINT m,WPARAM wp,LPARAM lp) {
 switch(m) {
 case WM_CREATE: {
  HFONT font=(HFONT)GetStockObject(DEFAULT_GUI_FONT); char imagePath[MAX_PATH];
  g_list=CreateWindowExA(WS_EX_CLIENTEDGE,"LISTBOX","",WS_CHILD|WS_VISIBLE|WS_VSCROLL|LBS_NOTIFY,24,70,480,250,w,(HMENU)ID_LIST,g_instance,NULL);
  CreateWindowA("STATIC","N.U  |  NIROO UNIVERSE",WS_CHILD|WS_VISIBLE,24,22,360,28,w,NULL,g_instance,NULL);
  g_content=CreateWindowA("STATIC","",WS_CHILD,12,62,520,260,w,NULL,g_instance,NULL);
  CreateWindowA("BUTTON","Launch",WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON,24,340,120,32,w,(HMENU)ID_LAUNCH,g_instance,NULL);
  CreateWindowA("BUTTON","Exit Module",WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON,156,340,120,32,w,(HMENU)ID_STOP,g_instance,NULL);
  g_status=CreateWindowA("STATIC","Loading module registry...",WS_CHILD|WS_VISIBLE,24,390,500,24,w,(HMENU)ID_STATUS,g_instance,NULL);
  SendMessageA(g_list,WM_SETFONT,(WPARAM)font,TRUE); LoadRegistry();
  {int i;for(i=0;i<g_moduleCount;i++)SendMessageA(g_list,LB_ADDSTRING,0,(LPARAM)g_modules[i].title);}
  lstrcpynA(imagePath,g_basePath,MAX_PATH);lstrcatA(imagePath,"assets\\launcher-background.bmp");
  g_background=(HBITMAP)LoadImageA(NULL,imagePath,IMAGE_BITMAP,0,0,LR_LOADFROMFILE|LR_CREATEDIBSECTION);
  SetStatusText(g_moduleCount?"Ready. Select a trusted module.":"No modules registered. Add modules/modules.ini.");return 0;
 }
 case WM_COMMAND:
  if(LOWORD(wp)==ID_LAUNCH)LaunchSelected();else if(LOWORD(wp)==ID_STOP)StopModule();
  else if(LOWORD(wp)==ID_LIST&&HIWORD(wp)==LBN_DBLCLK)LaunchSelected();return 0;
 case WM_SIZE:
  if(g_list)MoveWindow(g_list,24,70,LOWORD(lp)-48,HIWORD(lp)-220,TRUE);
  if(g_content)MoveWindow(g_content,12,62,LOWORD(lp)-24,HIWORD(lp)-150,TRUE);
  if(g_status)MoveWindow(g_status,24,HIWORD(lp)-55,LOWORD(lp)-48,24,TRUE);return 0;
 case WM_CLOSE:StopModule();DestroyWindow(w);return 0;
 case WM_DESTROY:if(g_background)DeleteObject(g_background);PostQuitMessage(0);return 0;
 case WM_PAINT: {
  PAINTSTRUCT ps;HDC dc=BeginPaint(w,&ps);RECT r;GetClientRect(w,&r);
  if(g_background){BITMAP bm;HDC mem=CreateCompatibleDC(dc);GetObject(g_background,sizeof(bm),&bm);SelectObject(mem,g_background);StretchBlt(dc,0,0,r.right,r.bottom,mem,0,0,bm.bmWidth,bm.bmHeight,SRCCOPY);DeleteDC(mem);}
  else FillRect(dc,&r,(HBRUSH)(COLOR_WINDOW+1));EndPaint(w,&ps);return 0;
 }
 }
 return DefWindowProcA(w,m,wp,lp);
}
int WINAPI WinMain(HINSTANCE inst,HINSTANCE prev,LPSTR cmd,int show) {
 WNDCLASSA wc;MSG msg;(void)prev;(void)cmd;g_instance=inst;ZeroMemory(&wc,sizeof(wc));
 wc.lpfnWndProc=WindowProc;wc.hInstance=inst;wc.lpszClassName=APP_CLASS;wc.hCursor=LoadCursor(NULL,IDC_ARROW);wc.hbrBackground=(HBRUSH)(COLOR_WINDOW+1);
 if(!RegisterClassA(&wc))return 1;
 g_window=CreateWindowA(APP_CLASS,"N.U Launcher — Core Preview",WS_OVERLAPPEDWINDOW,CW_USEDEFAULT,CW_USEDEFAULT,560,500,NULL,NULL,inst,NULL);
 if(!g_window)return 2;ShowWindow(g_window,show);UpdateWindow(g_window);
 while(GetMessageA(&msg,NULL,0,0)>0){TranslateMessage(&msg);DispatchMessageA(&msg);}return (int)msg.wParam;
}