#define WIN32_LEAN_AND_MEAN
#define WINVER 0x0501
#define _WIN32_WINNT 0x0501
#include <windows.h>
#include <commdlg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "nu_runtime.h"
static NU_Budget budget;
static HBITMAP background_bitmap=NULL;
static uint8_t *package_data=NULL;
static uint64_t package_reserved_bytes=0u,vm_reserved_bytes=0u,background_reserved_bytes=0u;
static int runtime_memory_ready=0;
static BITMAP background_info;
#define ID_OPEN_PACKAGE 1001
#define ID_EXIT_HOST 1002
static NU_VM active_vm;
static int vm_active=0;
static uint32_t scheduler_slot=0u;
static char status_text[256]="Ready. Press O to open a Generation 1 .nup package.";

static void load_background(void){
 char path[MAX_PATH];char *slash;DWORD length;WIN32_FILE_ATTRIBUTE_DATA file_data;
 uint64_t image_bytes;
 length=GetModuleFileNameA(NULL,path,MAX_PATH);
 if(!length||length>=MAX_PATH)return;
 slash=strrchr(path,'\\');
 if(!slash)slash=strrchr(path,'/');
 if(!slash)return;
 slash[1]='\0';
 if(lstrlenA(path)+lstrlenA("background.bmp")>=MAX_PATH)return;
 lstrcatA(path,"background.bmp");
 if(!GetFileAttributesExA(path,GetFileExInfoStandard,&file_data))return;
 image_bytes=((uint64_t)file_data.nFileSizeHigh<<32)|(uint64_t)file_data.nFileSizeLow;
 if(!NU_BudgetReserve(&budget,image_bytes))return;
 background_reserved_bytes=image_bytes;
 background_bitmap=(HBITMAP)LoadImageA(NULL,path,IMAGE_BITMAP,0,0,
     LR_LOADFROMFILE|LR_CREATEDIBSECTION);
 if(!background_bitmap){
  NU_BudgetRelease(&budget,background_reserved_bytes);
  background_reserved_bytes=0u;return;
 }
 ZeroMemory(&background_info,sizeof(background_info));
 GetObjectA(background_bitmap,sizeof(background_info),&background_info);
}

static void load_package(HWND hwnd){
 OPENFILENAMEA ofn;FILE *fp;long size;size_t got;NU_PackageView view;char path[MAX_PATH];
 path[0]='\0';if(!runtime_memory_ready||!package_data){lstrcpyA(status_text,"Insufficient N.U memory budget for module loading.");InvalidateRect(hwnd,NULL,TRUE);return;}ZeroMemory(&ofn,sizeof(ofn));ofn.lStructSize=sizeof(ofn);ofn.hwndOwner=hwnd;
 ofn.lpstrFilter="N.U VM package (*.nup)\0*.nup\0All files (*.*)\0*.*\0\0";ofn.lpstrFile=path;ofn.nMaxFile=MAX_PATH;
 ofn.Flags=OFN_FILEMUSTEXIST|OFN_PATHMUSTEXIST|OFN_HIDEREADONLY;if(!GetOpenFileNameA(&ofn))return;
 fp=fopen(path,"rb");if(!fp){lstrcpyA(status_text,"Cannot open package.");InvalidateRect(hwnd,NULL,TRUE);return;}
 if(fseek(fp,0L,SEEK_END)!=0){fclose(fp);return;}size=ftell(fp);
 if(size<(long)NU_PACKAGE_HEADER_SIZE||size>(long)(NU_PACKAGE_MAX_CODE+NU_PACKAGE_HEADER_SIZE)){fclose(fp);lstrcpyA(status_text,"Package size rejected.");InvalidateRect(hwnd,NULL,TRUE);return;}
 rewind(fp);got=fread(package_data,1u,(size_t)size,fp);fclose(fp);
 if(got!=(size_t)size||!NU_PackageValidate(package_data,got,&view)){lstrcpyA(status_text,"Package rejected: ABI, generation, size or CRC.");InvalidateRect(hwnd,NULL,TRUE);return;}
 NU_VMInit(&active_vm,view.code,view.code_size,100000u);
 scheduler_slot=0u;vm_active=1;
 if(!SetTimer(hwnd,1u,1u,NULL)){vm_active=0;lstrcpyA(status_text,"Cannot start cooperative scheduler.");}
 else lstrcpyA(status_text,"Generation 1 module queued; cooperative execution started.");
 InvalidateRect(hwnd,NULL,TRUE);
}
static void scheduler_tick(HWND hwnd){
 uint32_t batch;int result;
 if(!vm_active)return;
 ++scheduler_slot;
 if(!NU_SchedulerGrantSlot(scheduler_slot))return;
 result=1;
 for(batch=0u;batch<64u&&result>0;++batch)result=NU_VMStep(&active_vm);
 if(result<=0){
  vm_active=0;KillTimer(hwnd,1u);
  if(active_vm.fault||result<0)lstrcpyA(status_text,"Module stopped safely: invalid opcode or execution limit.");
  else wsprintfA(status_text,"Generation 1 module completed. Instructions: %lu",(unsigned long)active_vm.steps);
  InvalidateRect(hwnd,NULL,TRUE);
 }
}
static LRESULT CALLBACK window_proc(HWND hwnd,UINT msg,WPARAM wp,LPARAM lp){
 PAINTSTRUCT ps;HDC dc;char line[160];(void)lp;
 switch(msg){
 case WM_CREATE:
  SetPriorityClass(GetCurrentProcess(),BELOW_NORMAL_PRIORITY_CLASS);
  load_background();
  CreateWindowA("BUTTON","Open module",WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON,
      24,292,132,30,hwnd,(HMENU)ID_OPEN_PACKAGE,GetModuleHandleA(NULL),NULL);
  CreateWindowA("BUTTON","Exit N.U",WS_CHILD|WS_VISIBLE|BS_PUSHBUTTON,
      166,292,100,30,hwnd,(HMENU)ID_EXIT_HOST,GetModuleHandleA(NULL),NULL);
  return 0;
 case WM_COMMAND:
  if(LOWORD(wp)==ID_OPEN_PACKAGE){load_package(hwnd);return 0;}
  if(LOWORD(wp)==ID_EXIT_HOST){PostQuitMessage(0);return 0;}
  break;
 case WM_KEYDOWN:if(wp=='O'){load_package(hwnd);return 0;}if(wp==VK_ESCAPE){PostQuitMessage(0);return 0;}break;
 case WM_TIMER:if(wp==1u){scheduler_tick(hwnd);return 0;}break;
 case WM_PAINT:{
  RECT rc;HDC memory_dc;HBITMAP previous_bitmap;HBRUSH background_brush;
  int client_width,client_height,draw_width,draw_height,draw_x,draw_y;
  dc=BeginPaint(hwnd,&ps);GetClientRect(hwnd,&rc);
  client_width=rc.right-rc.left;client_height=rc.bottom-rc.top;
  background_brush=CreateSolidBrush(RGB(8,12,20));
  FillRect(dc,&rc,background_brush);DeleteObject(background_brush);
  if(background_bitmap&&background_info.bmWidth>0&&background_info.bmHeight>0){
   double scale_x=(double)client_width/(double)background_info.bmWidth;
   double scale_y=(double)client_height/(double)background_info.bmHeight;
   double scale=scale_x<scale_y?scale_x:scale_y;
   draw_width=(int)((double)background_info.bmWidth*scale);
   draw_height=(int)((double)background_info.bmHeight*scale);
   draw_x=(client_width-draw_width)/2;draw_y=(client_height-draw_height)/2;
   memory_dc=CreateCompatibleDC(dc);
   if(memory_dc){
    previous_bitmap=(HBITMAP)SelectObject(memory_dc,background_bitmap);
    SetStretchBltMode(dc,HALFTONE);
    StretchBlt(dc,draw_x,draw_y,draw_width,draw_height,memory_dc,0,0,
       background_info.bmWidth,background_info.bmHeight,SRCCOPY);
    SelectObject(memory_dc,previous_bitmap);DeleteDC(memory_dc);
   }
  }
  SetBkMode(dc,TRANSPARENT);SetTextColor(dc,RGB(255,255,255));
  TextOutA(dc,24,22,"N.U / NIROO UNIVERSE",20);
  TextOutA(dc,24,48,"Native Runtime Host - Generation 1 - NUPK/1 + NUVM/1",52);
  wsprintfA(line,"RAM budget: %lu MiB | Disk staging: 1024 MiB",(unsigned long)(budget.ram_limit_bytes/(1024u*1024u)));TextOutA(dc,24,82,line,lstrlenA(line));
  wsprintfA(line,"CPU cooperative slots: 1 N.U slot per 2 scheduler slots | logical CPUs: %lu",(unsigned long)budget.logical_processors);TextOutA(dc,24,106,line,lstrlenA(line));
  wsprintfA(line,"Render target: %lux%lu at %lu FPS (not a GPU hard cap)",(unsigned long)budget.render_width,(unsigned long)budget.render_height,(unsigned long)budget.target_fps);TextOutA(dc,24,130,line,lstrlenA(line));
  wsprintfA(line,"RAM reserved: %lu MiB (host buffers + VM + image estimate)",(unsigned long)(budget.ram_reserved_bytes/(1024u*1024u)));TextOutA(dc,24,154,line,lstrlenA(line));
  TextOutA(dc,24,186,status_text,lstrlenA(status_text));
  EndPaint(hwnd,&ps);return 0;
 }
 case WM_DESTROY:KillTimer(hwnd,1u);vm_active=0;if(background_bitmap)DeleteObject(background_bitmap);if(background_reserved_bytes)NU_BudgetRelease(&budget,background_reserved_bytes);if(package_data)free(package_data);if(package_reserved_bytes)NU_BudgetRelease(&budget,package_reserved_bytes);if(vm_reserved_bytes)NU_BudgetRelease(&budget,vm_reserved_bytes);PostQuitMessage(0);return 0;
 }
 return DefWindowProcA(hwnd,msg,wp,lp);
}
int WINAPI WinMain(HINSTANCE inst,HINSTANCE prev,LPSTR cmd,int show){
 WNDCLASSA wc;HWND hwnd;MSG msg;MEMORYSTATUS mem;SYSTEM_INFO si;(void)prev;(void)cmd;
 ZeroMemory(&mem,sizeof(mem));mem.dwLength=sizeof(mem);GlobalMemoryStatus(&mem);GetSystemInfo(&si);
 NU_BudgetInit(&budget,(uint64_t)mem.dwTotalPhys,(uint64_t)mem.dwAvailPhys,(uint32_t)si.dwNumberOfProcessors);
 if(NU_BudgetReserve(&budget,(uint64_t)sizeof(active_vm))){
  vm_reserved_bytes=(uint64_t)sizeof(active_vm);
  if(NU_BudgetReserve(&budget,(uint64_t)(NU_PACKAGE_MAX_CODE+NU_PACKAGE_HEADER_SIZE))){
   package_reserved_bytes=(uint64_t)(NU_PACKAGE_MAX_CODE+NU_PACKAGE_HEADER_SIZE);
   package_data=(uint8_t*)malloc((size_t)package_reserved_bytes);
   if(!package_data){NU_BudgetRelease(&budget,package_reserved_bytes);package_reserved_bytes=0u;}
  }
 }
 runtime_memory_ready=(package_data!=NULL&&vm_reserved_bytes!=0u);
 if(!runtime_memory_ready)lstrcpyA(status_text,"N.U memory budget too small; module loading disabled.");
 ZeroMemory(&wc,sizeof(wc));wc.style=CS_HREDRAW|CS_VREDRAW;wc.lpfnWndProc=window_proc;wc.hInstance=inst;wc.hCursor=LoadCursor(NULL,IDC_ARROW);wc.hbrBackground=(HBRUSH)(COLOR_WINDOW+1);wc.lpszClassName="NU_NATIVE_RUNTIME_HOST";
 if(!RegisterClassA(&wc))return 1;
 hwnd=CreateWindowA(wc.lpszClassName,"N.U Native Runtime",WS_OVERLAPPEDWINDOW,CW_USEDEFAULT,CW_USEDEFAULT,720,360,NULL,NULL,inst,NULL);if(!hwnd)return 1;
 ShowWindow(hwnd,show);UpdateWindow(hwnd);while(GetMessageA(&msg,NULL,0,0)>0){TranslateMessage(&msg);DispatchMessageA(&msg);}return (int)msg.wParam;
}
