# N.U Windows XP Host and Real Installer Plan

**Record:** NU-WIN-LAUNCHER-HOST-002  
**Date:** 2026-11-15  
**Branch:** `launcher/windows-visual-rendering-baseline-2026-11-15`  
**Status:** Architecture direction selected; executable host, installer and XP validation are NOT built.

## 1. Unknown reference PC — conservative baseline

The owner does not know the exact Windows XP edition or service pack. Engineering therefore uses this provisional minimum target:

- Windows XP SP3, 32-bit (x86)
- 512 MB total RAM as a minimum test machine; 1 GB as the recommended XP test machine
- No requirement for WebGL or GPU acceleration
- Offline first; network-dependent features must fail safely

This is a test baseline, not a claim that every XP installation is supported. XP x64, XP SP2 and earlier remain unverified. The installer must detect unsupported service packs/architectures and show a clear message rather than attempting a partial install.

## 2. Host/runtime decision

A modern WebView2/Tauri/Electron host is not the XP route.

The CEF upstream branch table lists CEF branch 2623 / Chromium 49 as the final XP-capable CEF branch; its Windows build requirements explicitly say WinXP+ and require an older Visual Studio toolchain. CEF branch 2704 and later in that table move to Windows 7+. CEF Python's legacy release notes further specify Windows XP SP3 or later for its Chromium 49 package.

**Provisional XP proof-of-concept:** a 32-bit native bootstrap with a pinned CEF 2623 / Chromium 49 runtime, loading only packaged local N.U assets. This is a compatibility experiment, not yet an approved shipping runtime. Chromium 49 is obsolete and must not be used as a general-purpose browser or trusted with arbitrary remote content.

**Modern Windows lane:** use a separately maintained, current supported browser runtime for modern Windows. Do not force the XP engine onto modern Windows or claim a single browser runtime covers all versions.

Before selecting the final host, prove all of the following on a clean XP SP3 x86 VM:
1. The native process starts without modern .NET, WebView2 or a modern Edge installation.
2. The CEF subprocesses and local app start from a clean install.
3. Local UI, navigation and Generation 1 entry points work after a compatibility audit.
4. Remote content is disabled by default; unsupported TLS/network services fail closed.
5. GPU acceleration is disabled for the XP proof-of-concept unless a specific machine proves it stable.
6. The complete installed working set and startup peak are measured, not inferred from browser memory hints.

## 3. JavaScript and CSS compatibility gate

The current web source is not Chromium 49 compatible as-is. The inspected launcher and runtime include modern syntax/APIs such as async functions, optional chaining, object spread, fetch, AbortSignal.timeout, URL, CustomEvent and modern CSS layout/features.

The XP build therefore needs a separate compatibility output:
- Transpile the full shipped JavaScript bundle to syntax accepted by Chromium 49.
- Supply only the required, audited polyfills; do not load remote polyfills.
- Audit CSS for unsupported properties and provide a small legacy stylesheet where needed.
- Keep source files canonical; generate the legacy bundle as a build artifact rather than hand-maintaining a divergent copy.
- Add a static compatibility test that rejects unsupported syntax/API usage in the XP output.

A successful syntax build is not a runtime pass. Browser execution on XP SP3 remains mandatory.

## 4. Real installer direction

Use **NSIS** as the first installer proof-of-concept, with a 32-bit setup executable and an explicit XP SP3 minimum-version check. NSIS documentation describes installer support for XP and newer Windows versions. Inno Setup 6 is not suitable for the XP lane because its release notes state that XP support was removed.

The NSIS script must:
- Install the x86 XP runtime and local application assets together; no web bootstrap/download at install time.
- Check Windows version, service pack and architecture before copying files.
- Create Start Menu/Desktop shortcuts only after all required files are verified.
- Include a working uninstaller and preserve user saves during ordinary uninstall/upgrade.
- Write an install manifest containing app version, runtime version and architecture.
- Fail with a readable diagnostic if the host prerequisites are absent.
- Never present a browser preview or a documentation link as the installer.

NSIS compatibility must be tested on the target OS using the actual generated setup executable. The NSIS documentation is not a substitute for that test.

## 5. Automatic resource adaptation contract

The launcher must never ask users to choose a graphics level.

1. Start immediately with a conservative profile.
2. Read native OS/CPU/physical-memory information through the host when available. Treat unavailable data as unknown.
3. Do not perform synthetic stress tests, allocate large buffers, or create WebGL contexts to score the machine.
4. Use passive runtime signals (frame pacing, task duration, process memory pressure where the host exposes it, load failures and foreground responsiveness).
5. Degrade quickly under sustained pressure, restore quality only after a longer stable interval, and use cooldown/hysteresis to prevent oscillation.
6. Preserve foreground controls, text readability, layout and game state at every tier.
7. Persist only a versioned, bounded profile; recover safely from corrupt or stale settings.
8. Keep the image-only launcher background invariant: one static approved image, or a neutral solid fill if it is missing. There are no decorative layers to scale up.

The existing browser governor in this branch is an initial frame-pacing governor, not proof of full native adaptation. It does not provide authoritative process-memory or GPU-pressure measurements. The protected capability sampler/network probe must not be rewritten under this task; any native readings must enter through a narrow, isolated host adapter.

## 6. Image-only launcher invariant

- One static approved canonical image only.
- No procedural fallback, pixel-world, atmosphere, particles, parallax, glow, background canvas or recurring background animation.
- Missing image means neutral solid background, never a second renderer.
- Foreground UI remains unchanged and interactive.

The public source tree currently does not contain `assets/nu-celestial-city.png`; the image reference in the background engine therefore cannot yet be packaged. The exact approved asset and its integrity hash must be supplied/verified before a setup can be called complete.

## 7. Installer and compatibility release gates

- [ ] Verify and add the exact approved static image.
- [ ] Build the native x86 host against the pinned XP-capable runtime.
- [ ] Generate the ES5/Chromium-49 compatibility bundle and run static compatibility checks.
- [ ] Build the NSIS setup from the complete staged application directory.
- [ ] Install, launch, use and uninstall on a clean Windows XP SP3 x86 VM.
- [ ] Repeat on a 512 MB and a 1 GB memory configuration; record process working set and startup peak.
- [ ] Verify offline launch, missing-image fallback, no background renderer, and no mandatory user tuning.
- [ ] Build and test the separate modern Windows lane.
- [ ] Record SHA-256, file size, architecture, runtime version, installer version, signing status and test evidence.
- [ ] Only then publish a real Setup download.

## 8. Current blockers — do not claim a release

- No native Windows host project or verified XP-compatible runtime is present in the inspected source tree.
- No NSIS installer script or Windows build workflow is present in the inspected source tree.
- The approved canonical background PNG is absent from the public source tree.
- The current launcher page is still a browser calibration preview, not a native installer.
- The provisional RAM goals are not measured.
- XP SP3 execution has not been demonstrated.

**Release status: NOT BUILDABLE AS A VERIFIED XP SETUP YET.** The next implementation milestone is the isolated XP host proof-of-concept, followed by packaging. Do not produce a placeholder EXE or claim a generated web archive is a native installer.

## References

- CEF supported and legacy branches/build requirements: https://github.com/chromiumembedded/cef/blob/master/docs/branches_and_building.md
- CEF Python 49 legacy XP release notes: https://github.com/cztomczak/cefpython/releases
- CEF Python XP security/limitations note: https://github.com/cztomczak/cefpython/blob/master/docs/Knowledge-Base.md
- NSIS feature and OS compatibility overview: https://nsis.sourceforge.io/Features
- NSIS changelog: https://nsis.sourceforge.io/Docs/AppendixF.html
- Inno Setup 6 XP support removal: https://github.com/HeliumProject/InnoSetup/blob/master/whatsnew.htm
