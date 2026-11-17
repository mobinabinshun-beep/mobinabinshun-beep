#define WIN32_LEAN_AND_MEAN
#define WINVER 0x0501
#define _WIN32_WINNT 0x0501
#include <windows.h>
#include <commdlg.h>
#include <string>
#include <vector>
#include <fstream>
#include <sstream>
#include <algorithm>
#include <cstdlib>
#include <cstdio>

#pragma comment(lib, "comdlg32.lib")

static const char *APP_TITLE = "N.U Launcher - Generation 1";
static const UINT TIMER_ID = 1;
static const UINT ID_CALIBRATE = 1001;
static const UINT ID_LOAD = 1002;
static const UINT ID_LEVEL_DOWN = 1003;
static const UINT ID_LEVEL_UP = 1004;
static const UINT ID_RUN = 1005;
static const UINT ID_EXIT = 1006;

enum OpCode { OP_CLEAR, OP_RECT, OP_TEXT };
struct Instruction {
    OpCode op;
    int a, b, c, d, r, g, blue;
    std::string text;
};
struct RuntimeState {
    COLORREF background;
    std::vector<Instruction> program;
    size_t pc;
    bool running;
    std::string moduleName;
    std::string status;
    int level;
    int stableLevel;
    DWORD cpuCores;
    DWORDLONG totalRam;
    DWORDLONG freeRam;
    DWORD cpuWindowMs;
    DWORD lastTick;
    FILETIME lastKernel, lastUser;
    double processCpuPercent;
};

static RuntimeState g;
static HWND gWindow = NULL;
static HWND gStatus = NULL;

static DWORDLONG FileTimeValue(const FILETIME &ft) {
    ULARGE_INTEGER v;
    v.LowPart = ft.dwLowDateTime;
    v.HighPart = ft.dwHighDateTime;
    return v.QuadPart;
}

static void SampleHardware() {
    SYSTEM_INFO si;
    MEMORYSTATUSEX ms;
    GetSystemInfo(&si);
    ZeroMemory(&ms, sizeof(ms));
    ms.dwLength = sizeof(ms);
    g.cpuCores = si.dwNumberOfProcessors ? si.dwNumberOfProcessors : 1;
    if (GlobalMemoryStatusEx(&ms)) {
        g.totalRam = ms.ullTotalPhys;
        g.freeRam = ms.ullAvailPhys;
    } else {
        g.totalRam = 0;
        g.freeRam = 0;
    }
    FILETIME createTime, exitTime, kernelTime, userTime;
    if (GetProcessTimes(GetCurrentProcess(), &createTime, &exitTime, &kernelTime, &userTime)) {
        DWORD now = GetTickCount();
        DWORD elapsed = now - g.lastTick;
        if (g.lastTick && elapsed) {
            DWORDLONG oldCpu = FileTimeValue(g.lastKernel) + FileTimeValue(g.lastUser);
            DWORDLONG newCpu = FileTimeValue(kernelTime) + FileTimeValue(userTime);
            DWORDLONG delta = newCpu >= oldCpu ? newCpu - oldCpu : 0;
            g.processCpuPercent = (double)delta / ((double)elapsed * 10000.0) * 100.0;
            if (g.processCpuPercent > 100.0 * g.cpuCores) g.processCpuPercent = 100.0 * g.cpuCores;
        }
        g.lastTick = now;
        g.lastKernel = kernelTime;
        g.lastUser = userTime;
    }
}

static void Calibrate() {
    SampleHardware();
    int level = 8;
    if (!g.totalRam || g.totalRam <= 512ULL * 1024ULL * 1024ULL) level = 2;
    else if (g.totalRam <= 1024ULL * 1024ULL * 1024ULL) level = 4;
    else if (g.totalRam <= 2ULL * 1024ULL * 1024ULL * 1024ULL) level = 6;
    if (g.cpuCores <= 1 && level > 4) level = 4;
    g.stableLevel = level;
    if (g.level > g.stableLevel) g.level = g.stableLevel;
    g.cpuWindowMs = (DWORD)(g.level * 5);
    g.status = "Calibration complete (conservative native telemetry; no stress test).";
}

static bool SafeRelativePath(const std::string &p) {
    if (p.empty() || p.find("..") != std::string::npos || p.find(':') != std::string::npos) return false;
    if (p[0] == '\\' || p[0] == '/') return false;
    return true;
}

static std::string DirectoryOf(const std::string &path) {
    size_t n = path.find_last_of("\\/");
    return n == std::string::npos ? "." : path.substr(0, n);
}

static bool LoadModule(const char *manifestPath) {
    std::ifstream mf(manifestPath);
    if (!mf) { g.status = "Cannot open module manifest."; return false; }
    g.running = false;
    g.program.clear();
    g.pc = 0;
    std::string line, id, entry;
    int generation = 0;
    bool inModule = false;
    while (std::getline(mf, line)) {
        if (line == "[Module]") { inModule = true; continue; }
        if (!line.empty() && line[0] == '[') { inModule = false; continue; }
        if (!inModule) continue;
        size_t eq = line.find('=');
        if (eq == std::string::npos) continue;
        std::string key = line.substr(0, eq), value = line.substr(eq + 1);
        if (key == "id") id = value;
        else if (key == "generation") generation = atoi(value.c_str());
        else if (key == "entry") entry = value;
    }
    if (id.empty() || generation != 1 || !SafeRelativePath(entry) || entry.size() < 5 || entry.substr(entry.size() - 5) != ".nuvm") {
        g.status = "Rejected module: invalid id, generation, or entry path.";
        return false;
    }
    std::string programPath = DirectoryOf(manifestPath) + "\\" + entry;
    std::ifstream pf(programPath.c_str());
    if (!pf) { g.status = "Module entry file not found."; return false; }

    std::vector<Instruction> parsed;
    while (std::getline(pf, line)) {
        if (line.empty() || line[0] == '#') continue;
        if (line.size() > 512 || parsed.size() >= 4096) {
            g.status = "Rejected module: instruction or package limit exceeded.";
            return false;
        }
        std::istringstream in(line);
        std::string op;
        Instruction ins;
        ins.a = ins.b = ins.c = ins.d = 0;
        ins.r = ins.g = ins.blue = 0;
        in >> op;
        if (op == "CLEAR") {
            ins.op = OP_CLEAR;
            if (!(in >> ins.r >> ins.g >> ins.blue)) { g.status = "Malformed CLEAR instruction."; return false; }
        } else if (op == "RECT") {
            ins.op = OP_RECT;
            if (!(in >> ins.a >> ins.b >> ins.c >> ins.d >> ins.r >> ins.g >> ins.blue)) { g.status = "Malformed RECT instruction."; return false; }
            if (ins.c < 0 || ins.d < 0 || ins.c > 4096 || ins.d > 4096) { g.status = "Rejected rectangle bounds."; return false; }
        } else if (op == "TEXT") {
            ins.op = OP_TEXT;
            if (!(in >> ins.a >> ins.b)) { g.status = "Malformed TEXT instruction."; return false; }
            std::getline(in, ins.text);
            if (ins.text.size() > 120) { g.status = "Rejected text length."; return false; }
        } else {
            g.status = "Rejected unknown VM opcode (allow-list only).";
            return false;
        }
        ins.r = std::max(0, std::min(255, ins.r));
        ins.g = std::max(0, std::min(255, ins.g));
        ins.blue = std::max(0, std::min(255, ins.blue));
        parsed.push_back(ins);
    }
    if (parsed.empty()) { g.status = "Module has no executable instructions."; return false; }
    g.program.swap(parsed);
    g.pc = 0;
    g.running = false;
    g.background = RGB(12, 16, 26);
    g.moduleName = id;
    g.status = "Generation 1 module validated. Press Run.";
    InvalidateRect(gWindow, NULL, TRUE);
    return true;
}

static void ExecuteInstruction(const Instruction &ins) {
    if (ins.op == OP_CLEAR) g.background = RGB(ins.r, ins.g, ins.blue);
    ++g.pc;
}

static void RunSlice() {
    if (!g.running || g.program.empty()) return;
    DWORD start = GetTickCount();
    DWORD budget = g.cpuWindowMs;
    do {
        if (g.pc >= g.program.size()) {
            g.running = false;
            g.status = "Module completed.";
            break;
        }
        ExecuteInstruction(g.program[g.pc]);
    } while ((DWORD)(GetTickCount() - start) < budget);
    InvalidateRect(gWindow, NULL, FALSE);
}

static void DrawProgram(HDC dc) {
    HBRUSH bg = CreateSolidBrush(g.background);
    RECT rc;
    GetClientRect(gWindow, &rc);
    rc.top = 88;
    FillRect(dc, &rc, bg);
    DeleteObject(bg);
    SetBkMode(dc, TRANSPARENT);
    for (size_t i = 0; i < g.pc && i < g.program.size(); ++i) {
        const Instruction &ins = g.program[i];
        if (ins.op == OP_RECT) {
            RECT r = { ins.a, ins.b + 88, ins.a + ins.c, ins.b + 88 + ins.d };
            HBRUSH brush = CreateSolidBrush(RGB(ins.r, ins.g, ins.blue));
            FillRect(dc, &r, brush);
            DeleteObject(brush);
        } else if (ins.op == OP_TEXT) {
            SetTextColor(dc, RGB(235, 240, 250));
            TextOutA(dc, ins.a, ins.b + 88, ins.text.c_str(), (int)ins.text.size());
        }
    }
}

static void UpdateStatus() {
    SampleHardware();
    char buf[512];
    double totalMb = (double)g.totalRam / (1024.0 * 1024.0);
    double freeMb = (double)g.freeRam / (1024.0 * 1024.0);
    std::sprintf(buf, "CPU cores: %lu | Process CPU sample: %.1f%% | RAM: %.0f MB total / %.0f MB available | Level: %d/10 | CPU slice: %lu/100 ms | VM: %s",
        (unsigned long)g.cpuCores, g.processCpuPercent, totalMb, freeMb, g.level,
        (unsigned long)g.cpuWindowMs, g.running ? "RUNNING" : "IDLE");
    if (gStatus) SetWindowTextA(gStatus, buf);
}

static LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    switch (msg) {
    case WM_CREATE:
        CreateWindowA("BUTTON", "Calibrate", WS_CHILD | WS_VISIBLE, 10, 10, 90, 28, hwnd, (HMENU)ID_CALIBRATE, NULL, NULL);
        CreateWindowA("BUTTON", "Load module", WS_CHILD | WS_VISIBLE, 106, 10, 100, 28, hwnd, (HMENU)ID_LOAD, NULL, NULL);
        CreateWindowA("BUTTON", "Level -", WS_CHILD | WS_VISIBLE, 212, 10, 70, 28, hwnd, (HMENU)ID_LEVEL_DOWN, NULL, NULL);
        CreateWindowA("BUTTON", "Level +", WS_CHILD | WS_VISIBLE, 288, 10, 70, 28, hwnd, (HMENU)ID_LEVEL_UP, NULL, NULL);
        CreateWindowA("BUTTON", "Run / Pause", WS_CHILD | WS_VISIBLE, 364, 10, 95, 28, hwnd, (HMENU)ID_RUN, NULL, NULL);
        CreateWindowA("BUTTON", "Exit", WS_CHILD | WS_VISIBLE, 465, 10, 70, 28, hwnd, (HMENU)ID_EXIT, NULL, NULL);
        gStatus = CreateWindowA("STATIC", "N.U ready. Load a Generation 1 module.", WS_CHILD | WS_VISIBLE, 10, 46, 760, 36, hwnd, NULL, NULL, NULL);
        SetTimer(hwnd, TIMER_ID, 100, NULL);
        return 0;
    case WM_COMMAND:
        switch (LOWORD(wp)) {
        case ID_CALIBRATE:
            Calibrate(); UpdateStatus(); break;
        case ID_LOAD: {
            char file[MAX_PATH] = "";
            OPENFILENAMEA ofn;
            ZeroMemory(&ofn, sizeof(ofn));
            ofn.lStructSize = sizeof(ofn);
            ofn.hwndOwner = hwnd;
            ofn.lpstrFilter = "N.U Module Manifest (*.numod)\0*.numod\0All files (*.*)\0*.*\0";
            ofn.lpstrFile = file;
            ofn.nMaxFile = MAX_PATH;
            ofn.Flags = OFN_FILEMUSTEXIST | OFN_PATHMUSTEXIST;
            if (GetOpenFileNameA(&ofn)) LoadModule(file);
            UpdateStatus(); break;
        }
        case ID_LEVEL_DOWN:
            if (g.level > 1) --g.level;
            g.cpuWindowMs = (DWORD)(g.level * 5); UpdateStatus(); break;
        case ID_LEVEL_UP:
            if (g.level < g.stableLevel) ++g.level;
            g.cpuWindowMs = (DWORD)(g.level * 5); UpdateStatus(); break;
        case ID_RUN:
            if (!g.program.empty()) {
                g.running = !g.running;
                g.status = g.running ? "Sequential VM execution started." : "Execution paused.";
            }
            UpdateStatus(); break;
        case ID_EXIT:
            DestroyWindow(hwnd); break;
        }
        return 0;
    case WM_TIMER:
        RunSlice(); UpdateStatus(); return 0;
    case WM_PAINT: {
        PAINTSTRUCT ps;
        HDC dc = BeginPaint(hwnd, &ps);
        DrawProgram(dc);
        SetTextColor(dc, RGB(220, 225, 235));
        TextOutA(dc, 12, 92, g.status.c_str(), (int)g.status.size());
        EndPaint(hwnd, &ps); return 0;
    }
    case WM_DESTROY:
        KillTimer(hwnd, TIMER_ID);
        PostQuitMessage(0); return 0;
    }
    return DefWindowProcA(hwnd, msg, wp, lp);
}

int WINAPI WinMain(HINSTANCE instance, HINSTANCE, LPSTR, int show) {
    ZeroMemory(&g, sizeof(g));
    g.background = RGB(12, 16, 26);
    g.level = 4;
    g.stableLevel = 4;
    g.cpuWindowMs = 20;
    g.status = "N.U native host ready. This is a Generation 1 VM prototype.";
    Calibrate();
    WNDCLASSA wc;
    ZeroMemory(&wc, sizeof(wc));
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = instance;
    wc.lpszClassName = "NU_NATIVE_LAUNCHER_G1";
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    if (!RegisterClassA(&wc)) return 1;
    gWindow = CreateWindowA(wc.lpszClassName, APP_TITLE, WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT, 820, 560, NULL, NULL, instance, NULL);
    if (!gWindow) return 2;
    ShowWindow(gWindow, show);
    UpdateWindow(gWindow);
    MSG msg;
    while (GetMessageA(&msg, NULL, 0, 0) > 0) {
        TranslateMessage(&msg);
        DispatchMessageA(&msg);
    }
    return (int)msg.wParam;
}
