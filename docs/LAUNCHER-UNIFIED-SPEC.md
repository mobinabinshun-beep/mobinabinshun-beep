# N.U Launcher — Unified Specification

**Document status:** implementation baseline for the first downloadable Windows build  
**Version:** 0.1.0-x86 (candidate; not a release until CI and human tests pass)  
**Updated:** 2026-11-15  
**Canonical implementation branch:** \`feature/xp-safe-native-launcher-v0.1\`

## 1. Product decision

The first downloadable build is a small native Windows launcher shell whose only visual content is the owner's existing N.U reference image. It is deliberately not the full game runtime and does not load the browser graphics stack.

The launcher opens the public N.U hub when the user double-clicks the image or presses Enter. Escape closes the launcher. The destination is opened by the operating system's default browser.

## 2. Compatibility target

- Build architecture: x86 (32-bit).
- Minimum intended OS: Windows XP Service Pack 3.
- Also intended for later 32-bit and 64-bit Windows versions through WOW64 where available.
- Installer: NSIS, per-user install, no administrator elevation, desktop and Start Menu shortcuts.
- Native runtime: Win32 + GDI+; no Electron, Node.js, .NET, WebView2, DirectX, WebGL or GPU-specific requirement.
- Missing GDI+ or a missing image must not crash the process; the window falls back to a dark neutral surface.

**Important boundary:** a successful install and launch on Windows XP does not guarantee that the default browser can render the current N.U web hub. Modern web standards, TLS and certificate support vary significantly on unsupported XP browsers. The native shell remains independent of those browser limitations.

## 3. Image-only rendering contract

- Exactly one static PNG is displayed: \`assets/Original reference image file for Niroo Universe (N.U).png\`.
- No procedural sky, Canvas, particles, parallax, atmospheric effects, animated layers, video, sound, telemetry overlay or dynamic background.
- Preserve the source image file; do not recolor, blur, downsample or overwrite it.
- Fit the image inside the client area while preserving its aspect ratio; letterbox with a neutral dark color.
- Resizing only recomputes the fit rectangle.
- Low-capability systems use GDI+'s low-quality interpolation; other systems use high-quality bicubic interpolation. The source pixels remain unchanged.

## 4. Automatic system adaptation

The native process samples once at startup:
- physical RAM via \`GlobalMemoryStatusEx\`;
- logical processor count via \`GetSystemInfo\`;
- display dimensions via \`GetSystemMetrics\`.

Policy:
- Missing RAM telemetry is treated as low confidence and low capability.
- Low-power mode is selected if RAM is below 1 GiB or there is one logical processor.
- Low-power mode reduces only image-scaling interpolation cost. It never starts extra rendering layers or background loops.
- The window's initial dimensions are capped by the current display resolution.
- No continuous benchmark, stress test, hardware fingerprint, network probe or background monitoring is performed.

The static image path intentionally avoids needing GPU telemetry: GDI+ software-compatible drawing is the baseline. CPU/RAM heuristics are conservative hints, not a performance guarantee.

## 5. Installer and installed files

The NSIS installer:
- installs under the current user's Local AppData;
- creates desktop and Start Menu shortcuts;
- includes the native x86 executable and the exact PNG source image;
- includes an uninstaller;
- does not install drivers, services, scheduled tasks, browser extensions or background processes;
- does not modify system-wide environment variables or require admin rights.

## 6. Build and verification

GitHub Actions workflow: \`.github/workflows/launcher-windows-x86.yml\`.

Build steps:
1. compile the x86 executable with MinGW and PE subsystem version 5.01;
2. include the reference PNG in the payload;
3. compile the NSIS setup;
4. upload the setup executable as a workflow artifact.

A green CI build verifies compilation and packaging only. It does not prove runtime behavior on XP. Before calling this a release, test installation, first launch, image loading, resizing, double-click/Enter browser handoff, uninstall, and clean reinstall on Windows XP SP3 x86, Windows 7 x86/x64, and Windows 10/11 x64.

## 7. Known limitations

- This is a launcher shell, not a native port of the N.U games.
- The website is opened in the user's default browser; XP browser compatibility is not guaranteed.
- The installer is unsigned in v0.1; Windows may show publisher/security warnings.
- No automatic updates, package registry, cloud saves, account system, crash uploader or telemetry are included.
- GDI+ availability is expected on XP SP3; if unavailable, the process can still open a fallback window but cannot render the PNG.

## 8. Release gates

Do not publish as stable until CI succeeds and the artifact is downloadable; the executable is verified as PE32/x86 with subsystem target 5.01; installer and uninstaller pass on XP SP3 x86; the image loads and scales without cropping or stretching; a human confirms the browser handoff; and Windows 7/10/11 smoke tests pass.

## 9. Relationship to the browser preview

The previous browser-only launcher at \`launcher.html\` remains a separate calibration prototype. Its WebGL, browser memory and CPU hints are not used by this native image-only shell. Do not claim that its ten-level profile is connected to the game runtime. A later native/game integration must define and test a separate runtime-budget contract before enabling adaptive game rendering.
