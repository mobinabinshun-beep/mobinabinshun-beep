# N.U Windows Launcher 0.1 — implementation and acceptance plan

**Status:** first native installer candidate; CI build required; not yet human/device accepted.

## Design decisions

1. Keep the native launcher small and 32-bit so it can be evaluated on older Windows installations.
2. Use only the existing canonical still artwork as a single background image. Do not instantiate background animation, parallax, atmospheric compositor, procedural canvas or other visual layers in the native shell.
3. Detect RAM and logical processor count at startup. Calculate a conservative level ceiling, then pass it to the browser application as `nuNativeLevel`.
4. Keep the browser's own graphics/WebGL checks. The final level is the minimum of the native ceiling and the browser capability result; browser capability cannot raise the native limit.
5. Do not bundle legacy Chromium or Internet Explorer. Doing so would add a large, insecure, unsupported runtime and still would not guarantee broad compatibility.

## Current compatibility statement

- Native launcher: compiled as 32-bit Win32, subsystem version 5.1, statically linked; this is intended to maximize compatibility but is not proof of XP support.
- Installer: built with NSIS on a current Windows runner. The installer must be tested on XP SP3 and supported newer Windows versions before advertising XP support.
- N.U web demo: still requires a browser capable of modern HTTPS, JavaScript, CSS and Canvas/WebGL features. The shell may run on an OS whose default browser cannot run the web demo.
- The project target remains broad Windows compatibility, with XP/low-resource testing as the strictest legacy gate, not as an unsupported promise.

## Automatic profile heuristic

- RAM at or below 1 GB: level 1.
- RAM at or below 2 GB: level 2.
- RAM at or below 4 GB: level 4.
- RAM at or below 8 GB: level 6.
- More than 8 GB: level 8.
- One logical CPU caps at level 2; two cap at level 4; four cap at level 6.
- Windows 5.x caps at level 3 until actual XP testing.
- The browser engine can reduce the native ceiling further based on WebGL, memory class, CPU sampling, reduced-motion and data-saving signals.

These thresholds are deliberately conservative and are an initial policy, not measured performance claims.

## Acceptance gates

- [ ] GitHub Actions produces `N.U-Launcher-Setup-0.1.exe` and its checksum.
- [ ] Installer installs and uninstalls cleanly on Windows XP SP3 x86 VM.
- [ ] Installer installs and uninstalls cleanly on Windows 7 x86/x64.
- [ ] Installer installs and uninstalls cleanly on Windows 10/11 x64.
- [ ] Launcher starts without missing-DLL errors on each target.
- [ ] Single background image loads; no extra background layers or animation run.
- [ ] RAM/CPU detection and XP cap are visible and sensible.
- [ ] Browser launch passes `nuNativeLevel`; browser graphics level never exceeds that ceiling.
- [ ] Test with a modern browser on each supported OS; separately record unsupported default-browser behavior.
- [ ] Verify keyboard navigation/accessibility and high-DPI resizing.

Do not label the build “XP supported” or “all Windows supported” until the corresponding VM/device gates pass.
