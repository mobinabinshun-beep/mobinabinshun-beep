# N.U Launcher — Windows XP-first bootstrap

## Scope

This is a native 32-bit Win32/GDI+ image shell. It displays the repository's original N.U artwork full-screen, without browser gradients, panels, animated atmosphere, transparent compositing, parallax, or navigation overlays. Press **Esc** to close.

The renderer uses the GDI+ software path: no WebGL, DirectX 10+, Electron, modern browser, or GPU acceleration is required.

## Compatibility target

- Intended minimum: Windows XP SP3 x86.
- Forward target: Windows 7, 8.1, 10 and 11, subject to OS/runtime verification.
- Built as 32-bit to support 32-bit XP and later 64-bit Windows via WoW64.
- XP is end-of-life and unsafe for sensitive online activity.
- This is only the native image shell. It does not yet host the HTML games, connect calibration budgets to game render loops, install a browser, or implement package updates/signatures.

## Automatic adaptation in this slice

Reads physical-memory class and logical processor count with XP-era APIs. Under 1 GiB RAM, or if detection fails, it uses nearest-neighbor scaling. Between 1 and 3 GiB it uses bilinear scaling. At 3 GiB or more with at least two logical processors it uses high-quality bilinear scaling. This is a conservative display-quality adjustment, not a frame-rate guarantee or GPU detector.

## Build

Prerequisites: Visual C++ 2010 (v100) or another explicitly XP-targeted compiler, Windows SDK with Win32/GDI+ headers and libraries, and Inno Setup 5.x.

From a Visual C++ 2010 command prompt at the repository root:

```bat
cd windows-xp-launcher
if not exist build mkdir build
cl /nologo /O1 /MT /DWIN32_LEAN_AND_MEAN /DWINVER=0x0501 /D_WIN32_WINNT=0x0501 src\main.cpp /link /SUBSYSTEM:WINDOWS,5.01 gdiplus.lib shlwapi.lib user32.lib gdi32.lib /OUT:build\NULauncher.exe
```

Then compile `N.U-Launcher-XP.iss` with Inno Setup 5.x. Output: `windows-xp-launcher\output\N.U-Launcher-XP-Setup.exe`.

## Release gate

Do not distribute until built on an XP-targeting toolchain, scanned, and tested on XP SP3 x86, Windows 7 x86/x64, and Windows 10/11 x64. Record OS build, architecture, RAM, launch/image/close/install/uninstall results, and SHA-256. Source code is not an installer; no binary is claimed to exist yet.