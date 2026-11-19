# Windows XP-first Launcher v0.1 — Implementation Record

**Date:** 2026-11-15  
**Branch:** \`feature/xp-safe-native-launcher-v0.1\`  
**Scope:** native image-only launcher and installer; no game-engine or classic HUD changes.

## Decisions

- Treat Windows XP SP3 x86 as the minimum intended test target because the user's exact Windows version is unknown.
- Use native Win32/GDI+ instead of Electron, modern .NET, WebView2 or browser Canvas.
- Show only the existing owner-supplied N.U PNG as a static image.
- Remove all background animation/layers from this first native launcher surface by not loading the browser renderer at all.
- Detect physical RAM and logical CPU count once; choose low-cost image interpolation when telemetry is missing or the machine is weak.
- Use a per-user NSIS installer with desktop and Start Menu shortcuts and an uninstaller.
- Build x86 and set the PE subsystem target to Windows 5.01 (XP).

## Files

- \`launcher/native/nu-launcher-win32.cpp\` — native Win32 shell.
- \`installer/NULauncher.nsi\` — NSIS installer.
- \`.github/workflows/launcher-windows-x86.yml\` — automated x86 build and artifact.
- \`docs/LAUNCHER-UNIFIED-SPEC.md\` — canonical launcher contract.

## Verification status

This record describes the implementation target, not a claim that a binary has already been tested on XP. The CI artifact must be built first. Real XP SP3 installation, image rendering and uninstall tests remain mandatory before stable release. The default browser handoff is explicitly outside the native shell's compatibility guarantee.
