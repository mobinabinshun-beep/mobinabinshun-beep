#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include "../nu-core/nuvm.h"
static const char *g_status="not run"; static int g_value=0;
static void run_smoke(void){
    static const uint8_t code[]={NU_OP_PUSH_I32,19,0,0,0,NU_OP_PUSH_I32,23,0,0,0,NU_OP_ADD,NU_OP_HALT};
    nuvm_config c; nuvm_result r; c.abi_version=NUVM_ABI_VERSION; c.instruction_budget=64u; c.stack_limit=32u;
    r=nuvm_execute(code,sizeof(code),&c); g_status=nuvm_status_string(r.status); g_value=(int)r.result;
}
static LRESULT CALLBACK wndproc(HWND h,UINT m,WPARAM w,LPARAM l){
    PAINTSTRUCT ps; HDC dc; RECT r; char line[160]; (void)w;(void)l;
    if(m==WM_PAINT){dc=BeginPaint(h,&ps);GetClientRect(h,&r);SetBkMode(dc,TRANSPARENT);
        SetTextColor(dc,RGB(230,242,248));DrawTextA(dc,"N.U | NIROO UNIVERSE",-1,&r,DT_CENTER|DT_TOP|DT_SINGLELINE);
        r.top+=58;SetTextColor(dc,RGB(150,210,226));DrawTextA(dc,"GENERATION 1 / NATIVE HOST PROTOTYPE",-1,&r,DT_CENTER|DT_TOP|DT_SINGLELINE);
        r.top+=62;SetTextColor(dc,RGB(210,225,232));DrawTextA(dc,"N.U virtual machine self-test:",-1,&r,DT_CENTER|DT_TOP|DT_SINGLELINE);
        r.top+=28;wsprintfA(line,"VM: %s | 19 + 23 = %d",g_status,g_value);DrawTextA(dc,line,-1,&r,DT_CENTER|DT_TOP|DT_SINGLELINE);
        r.top+=48;SetTextColor(dc,RGB(155,177,190));DrawTextA(dc,"Engineering shell only — not a game launcher release.",-1,&r,DT_CENTER|DT_TOP|DT_SINGLELINE);
        r.top+=24;DrawTextA(dc,"Package manager, translators and adaptive scheduler are not connected.",-1,&r,DT_CENTER|DT_TOP|DT_SINGLELINE);
        EndPaint(h,&ps);return 0;}
    if(m==WM_DESTROY){PostQuitMessage(0);return 0;}return DefWindowProcA(h,m,w,l);
}
int WINAPI WinMain(HINSTANCE inst,HINSTANCE prev,LPSTR cmd,int show){
    WNDCLASSA wc;HWND h;MSG msg;(void)prev;(void)cmd;run_smoke();ZeroMemory(&wc,sizeof(wc));
    wc.lpfnWndProc=wndproc;wc.hInstance=inst;wc.lpszClassName="NU_LAUNCHER_G1_HOST";
    wc.hCursor=LoadCursorA(0,IDC_ARROW);wc.hbrBackground=(HBRUSH)(COLOR_WINDOW+1);
    if(!RegisterClassA(&wc))return 10;
    h=CreateWindowExA(0,wc.lpszClassName,"N.U Launcher — Generation 1",WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT,CW_USEDEFAULT,760,460,0,0,inst,0);if(!h)return 11;
    ShowWindow(h,show);UpdateWindow(h);while(GetMessageA(&msg,0,0,0)>0){TranslateMessage(&msg);DispatchMessageA(&msg);}
    return (int)msg.wParam;
}
