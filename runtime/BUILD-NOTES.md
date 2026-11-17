# Build notes — N.U native Generation 1 candidate

- Target: 32-bit Win32 GUI shell, ANSI Win32 + GDI only.
- Requested PE subsystem version: 5.01 (Windows XP).
- Runtime: portable C99 VM; no browser, WebView, Electron, .NET or modern JavaScript runtime dependency.
- Build output: NULauncher-G1.exe (CI artifact, not an installer).
- XP compatibility is unverified until tested on Windows XP SP3 x86 and its imports/runtime dependencies are audited.
- The portable VM can be built and tested on Linux/macOS/Windows with a C99 compiler. Each platform needs its own small host adapter before it can launch a native window.
