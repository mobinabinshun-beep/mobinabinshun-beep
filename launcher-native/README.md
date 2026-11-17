# N.U Native Launcher — Generation 1

This is the first native Windows host prototype. It is a Win32/GDI application, not a browser wrapper and not a Chromium/WebView application.

## Current scope
- Native window with a minimal launcher shell.
- Generation 1 .numod manifest validation and .nuvm text-bytecode loading.
- A deterministic, single-threaded interpreter for CLEAR, RECT, and TEXT.
- Sequential execution in 100 ms scheduling windows, with a cooperative CPU execution window capped at 50 ms (levels 1–10 select 5–50 ms).
- Conservative hardware discovery using Windows APIs available on Windows XP SP3.
- Software GDI rendering; no GPU acceleration or GPU telemetry is claimed.

## Build
For the intended Windows XP SP3 x86 target, use Visual Studio 2010 / Windows SDK 7.1 with the v100 toolset:

1. Open an x86 Developer Command Prompt.
2. Run build-xp.bat.
3. The output is build\NU-Launcher.exe.

The script intentionally uses the legacy XP-compatible toolset and Win32 APIs. A successful build on a modern compiler is not proof of Windows XP compatibility. The resulting executable still requires testing on a real XP SP3 x86 machine or a verified VM.

## Run
Start build\NU-Launcher.exe, choose Load module, and select samples\hello.numod. Press Run to execute the sample.

## Safety boundary
Generation 1 bytecode is interpreted by the built-in allow-listed VM. The prototype does not load DLLs, execute arbitrary native package code, install drivers, modify system settings, or elevate privileges. Package signatures, cryptographic hashes, dependency resolution, process isolation and rollback are not yet implemented.

## Resource-control truth
The host serializes VM work and enforces a cooperative 5–50 ms execution window per 100 ms timer period. This is a soft application-level CPU budget, not an OS-wide CPU quota. The host attempts a Windows Job Object commit-memory limit at 50% of detected physical RAM and reports whether it was applied. This limits committed memory for the job, not physical resident RAM and does not reserve memory; if job assignment fails, the cap is not active. GDI avoids a dedicated GPU workload, but Windows XP provides no generic vendor-independent GPU quota/telemetry API. Do not market these limits as hard guarantees.
