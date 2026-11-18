#define WIN32_LEAN_AND_MEAN
#define WINVER 0x0501
#define _WIN32_WINNT 0x0501
#include <windows.h>
#include <commdlg.h>
#include <stdio.h>
#include "nu_runtime.h"
static NU_Budget budget;
static char status_text[256]="Ready. Press O to open a Generation 1 .nup package.";
static uint8_t package_data[NU_PACKAGE_MAX_CODE+16u];
static void load_package(HWND hwnd){
 OPENFILENAMEA ofn;FILE *fp;long size;size_t got;NU_PackageView view;NU_VM vm;uint32_t slots;int result;char path[MAX_PATH];
 path[0]='\0';ZeroMemory(&ofn,sizeof(ofn));ofn.lStructSize=sizeof(ofn);ofn.hwndOwner=hwnd;
 ofn.lpstrFilter="N.U VM package (*.nup)\0*.nup\0All files (*.*)\0*.*\0\0";ofn.lpstrFile=path;ofn.nMaxFile=MAX_PATH;
 ofn.Flags=OFN_FILEMUSTEXIST|OFN_PATHMUSTEXIST|OFN_HIDEREADONLY;if(!GetOpenFileNameA(&ofn))return;
 fp=fopen(path,"rb");if(!fp){lstrcpyA(status_text,"Cannot open package.");InvalidateRect(hwnd,NULL,TRUE);return;}
 if(fseek(fp,0L,SEEK_END)!=0){fclose(fp);return;}size=ftell(fp);
 if(size<16L||size>(long)sizeof(package_data)){fclose(fp);lstrcpyA(status_text,"Package size rejected.");InvalidateRect(hwnd,NULL,TRUE);return;}
 rewind(fp);got=fread(package_data,1u,(size_t)size,fp);fclose(fp);
 if(got!=(size_t)size||!NU_PackageValidate(package_data,got,&view)){lstrcpyA(status_text,"Package rejected: ABI, generation, size or CRC.");InvalidateRect(hwnd,NULL,TRUE);return;}
 NU_VMInit(&vm,view.code,view.code_size,100000u);slots=0u;result=1;
 while(result>0&&slots<200000u){++slots;if(NU_SchedulerGrantSlot(slots))result=NU_VMStep(&vm);}
 if(vm.fault||result<0)lstrcpyA(status_text,"Module stopped safely: invalid opcode or execution limit.");
 else if(vm.halted)wsprintfA(status_text,"Generation 1 module completed. Instructions: %lu",(unsigned long)vm.steps);
 else lstrcpyA(status_text,"Module paused at scheduler slice limit.");
 InvalidateRect(hwnd,NULL,TRUE);
}
static LRESULT CALLBACK window_proc(HWND hwnd,UINT msg,WPARAM wp,LPARAM lp){
 PAINTSTRUCT ps;HDC dc;char line[160];(void)lp;
 switch(msg){
 case WM_CREATE:SetPriorityClass(GetCurrentProcess(),BELOW_NORMAL_PRIORITY_CLASS);return 0;
 case WM_KEYDOWN:if(wp=='O'){load_package(hwnd);return 0;}if(wp==VK_ESCAPE){PostQuitMessage(0);return 0;}break;
 case WM_PAINT:
  dc=BeginPaint(hwnd,&ps);SetBkMode(dc,TRANSPARENT);SetTextColor(dc,RGB(30,42,56));
  TextOutA(dc,24,24,"N.U / NIROO UNIVERSE",20);
  TextOutA(dc,24,58,"Native Runtime Host - Generation 1 - NUVM/1",43);
  wsprintfA(line,"RAM budget: %lu MiB | Disk cache ceiling: 1024 MiB",(unsigned long)(budget.ram_limit_bytes/(1024u*1024u)));TextOutA(dc,24,98,line,lstrlenA(line));
  wsprintfA(line,"CPU cooperative slots: 1 N.U slot per 2 scheduler slots | logical CPUs: %lu",(unsigned long)budget.logical_processors);TextOutA(dc,24,124,line,lstrlenA(line));
  wsprintfA(line,"Renderer ceiling: %lux%lu at %lu FPS (application-side)",(unsigned long)budget.render_width,(unsigned long)budget.render_height,(unsigned long)budget.target_fps);TextOutA(dc,24,150,line,lstrlenA(line));
  TextOutA(dc,24,196,status_text,lstrlenA(status_text));TextOutA(dc,24,238,"O = Open .nup package     ESC = Exit",37);EndPaint(hwnd,&ps);return 0;
 case WM_DESTROY:PostQuitMessage(0);return 0;
 }
 return DefWindowProcA(hwnd,msg,wp,lp);
}
int WINAPI WinMain(HINSTANCE inst,HINSTANCE prev,LPSTR cmd,int show){
 WNDCLASSA wc;HWND hwnd;MSG msg;MEMORYSTATUS mem;SYSTEM_INFO si;(void)prev;(void)cmd;
 ZeroMemory(&mem,sizeof(mem));mem.dwLength=sizeof(mem);GlobalMemoryStatus(&mem);GetSystemInfo(&si);
 NU_BudgetInit(&budget,(uint64_t)mem.dwTotalPhys,(uint64_t)mem.dwAvailPhys,(uint32_t)si.dwNumberOfProcessors);
 ZeroMemory(&wc,sizeof(wc));wc.style=CS_HREDRAW|CS_VREDRAW;wc.lpfnWndProc=window_proc;wc.hInstance=inst;wc.hCursor=LoadCursor(NULL,IDC_ARROW);wc.hbrBackground=(HBRUSH)(COLOR_WINDOW+1);wc.lpszClassName="NU_NATIVE_RUNTIME_HOST";
 if(!RegisterClassA(&wc))return 1;
 hwnd=CreateWindowA(wc.lpszClassName,"N.U Native Runtime",WS_OVERLAPPEDWINDOW,CW_USEDEFAULT,CW_USEDEFAULT,720,360,NULL,NULL,inst,NULL);if(!hwnd)return 1;
 ShowWindow(hwnd,show);UpdateWindow(hwnd);while(GetMessageA(&msg,NULL,0,0)>0){TranslateMessage(&msg);DispatchMessageA(&msg);}return (int)msg.wParam;
}
