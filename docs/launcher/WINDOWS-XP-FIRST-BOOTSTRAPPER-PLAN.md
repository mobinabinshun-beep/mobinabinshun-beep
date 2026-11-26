# N.U Launcher — Windows XP-first compatibility and adaptive runtime plan

**Decision ID:** NU-WIN-XP-001  
**Date:** 2026-11-15  
**Status:** Requirements and architecture baseline; no installer binary has been built or validated.  
**Minimum reference target:** Windows XP Service Pack 3, 32-bit (x86).  
**Forward targets:** Windows Vista, 7, 8/8.1, 10 and 11, subject to explicit OS-specific testing.

## 1. User requirements now in force

- Windows XP is the lowest reference system because the exact user's OS/build is not yet known.
- The first installer must be a real downloadable Windows setup package, not a web page or a GitHub source link presented as an installer.
- The launcher must adapt its resource use to the host automatically. The user should not need to understand or manually choose graphics quality for normal operation.
- The launcher background is **one static image only**.
- Cancel all background layers and effects: no Canvas scenery, particles, parallax, animation, dynamic lighting, shader, WebGL background, alternate procedural scene, or visual overlay.
- Do not change game mechanics, wallet, saves, classic LV/XP/Mana HUD, or protected engines as part of the installer work.

## 2. Important compatibility truth

A single modern browser runtime cannot be assumed to run on Windows XP. WebView2, current Chromium/Electron releases and current Tauri/WebView2 hosting are not Windows XP solutions. XP's built-in Internet Explorer is also too old for the current Generation 1 web application, which uses modern JavaScript syntax and browser APIs.

Therefore split the product into two independently testable layers:

1. **Native bootstrapper/installer:** can target XP SP3 x86 using a legacy-compatible Win32 executable and an XP-compatible installer toolchain. It detects OS/CPU/memory, displays the single static image, checks prerequisites, stores a small local profile and reports compatibility clearly.
2. **Game runtime:** the current web-based games need a browser engine that supports their actual HTML/CSS/JavaScript. On XP this is a separate hard compatibility gate. Do not claim the games run on XP until a specific browser/runtime version has been tested against the actual game bundle. Do not silently bundle an obsolete, insecure browser engine.

This allows a genuine XP-compatible launcher shell without falsely promising that the current web game code is XP-compatible.

## 3. Proposed native Windows architecture

### 3.1 Bootstrapper

- Build a small **32-bit x86 native Win32** launcher, using APIs available on XP SP3.
- Prefer a native window and GDI/GDI+ image rendering for the one static artwork. No embedded browser, WebView2, WebGL, Canvas or animated layer in the bootstrapper.
- Keep the binary free of runtime dependencies where possible. If a compiler runtime is required, bundle or statically link the appropriate redistributable only after its licensing and XP compatibility are verified.
- Use Unicode Win32 APIs and avoid APIs introduced after XP.
- Detect the actual OS using version APIs with a manifest-aware strategy; never infer compatibility from the user-agent string.
- Detect x86/x64 OS and process architecture. An x86 bootstrapper should run on both 32-bit XP and modern 64-bit Windows where WOW64 is available.
- Keep native permissions minimal. The bootstrapper must not run as administrator except for the explicit installation/uninstallation operations that require it.
- Keep user data under the current user's profile; never overwrite game saves during update or uninstall.

### 3.2 Installer

- Evaluate an XP-compatible NSIS 3.x toolchain and verify the exact minimum Windows version against the selected compiler/release. Do not assume current installer defaults still support XP.
- Produce a 32-bit installer executable and a portable ZIP as a secondary recovery route.
- Installer must include version, publisher identity, install path selection, shortcut creation, uninstall registration, file hash manifest, and a clear rollback/uninstall path.
- Code-sign the final installer when a valid signing certificate is available. Until then, report it as unsigned; never imply a signature exists.
- Do not publish a binary until it has been built, scanned, hashed and tested on actual XP SP3 x86 and a modern Windows target.

### 3.3 Runtime separation

The native shell must not load game scripts into its own process. It may launch a separately installed compatible browser/runtime only after compatibility verification. If none is available, show a plain explanation and a safe next step; do not crash or attempt to execute unsupported code.

A modern runtime for current Windows can be selected independently (for example WebView2 on supported Windows versions), but it must be a separate adapter. The XP path must never attempt to load WebView2.

## 4. Static image-only launcher presentation

- One local image file, packaged with the installer.
- No animated GIF, video, canvas, SVG filter animation, particles, parallax, CSS keyframe effects, shader, blur layer or image carousel.
- Display the image with a simple native image-fit mode; preserve aspect ratio and do not crop the canonical artwork.
- If the image is missing or invalid, show a flat solid-color background and a small diagnostic message. Do not create a procedural substitute.
- Do not use an image-generation substitute for the canonical N.U artwork. The exact approved asset must be transferred from its authoritative source and verified before release.
- The currently referenced `assets/nu-celestial-city.png` was not verified as present in the public repository during this review. This is a release blocker, not permission to invent a replacement.

## 5. Automatic system adaptation — required behavior

The launcher owns the profile. No user quality picker is required for ordinary startup. A small diagnostic view may show the detected profile, but the default flow is automatic.

### 5.1 Startup sampling (bounded, low overhead)

Collect only signals available on the current OS:
- OS version/build and architecture;
- physical memory total and currently available memory, using XP-compatible APIs where available;
- processor count and architecture;
- display dimensions and color depth;
- GPU/driver and DirectX capabilities only when a safe, bounded query is available;
- game/browser runtime compatibility and availability;
- startup and first-frame timing from the actual application.

Missing signals must be marked unknown, not treated as zero or as evidence of a powerful device. Do not run a stress test, continuous benchmark, network throughput test, or packet-loss test during startup.

### 5.2 Conservative baseline

- XP SP3 x86 is the design baseline, not a guarantee that all hardware sold with XP can run every game.
- Begin with the smallest supported rendering workload.
- For the native shell: one static bitmap, no animation, no background thread for visuals, no GPU dependency.
- For game rendering: select the lowest compatible profile initially; increase only when observed frame pacing and memory headroom remain stable.
- Use hysteresis: lower the budget promptly when frame time or memory pressure degrades; raise it slowly after sustained stability.
- Never increase resource budgets above the safe ceiling measured for the current session.
- A failed/unknown GPU query must choose a software/low-feature-safe path, not block the native launcher.
- Do not equate WebGL texture size, logical CPU count or one short JavaScript timing sample with true GPU/CPU performance.

### 5.3 Runtime feedback loop

The existing browser calibration preview is not sufficient for this requirement:
- it exposes approximate browser memory and logical-core hints;
- its CPU score is a tiny JavaScript sample, not a native benchmark;
- its GPU check is a WebGL capability/texture-limit probe, not a real performance test;
- its selected profile is stored locally but the archived launcher record says it is not yet connected to every Generation 1 game/render loop.

The production implementation must connect the selected native/browser profile to the actual renderer through a narrow, versioned contract. Measure actual frame intervals and memory pressure where available. Adjust only optional rendering work. Never alter game rules, hit detection, timing semantics, XP/Mana rewards, wallet, save data or foreground UI to compensate.

If the game cannot sustain the minimum profile, stop before game launch and show a clear compatibility result. Do not pretend that lowering settings can make unsupported APIs available.

## 6. Windows support matrix and release gates

| Platform | Bootstrapper target | Game runtime claim |
|---|---|---|
| Windows XP SP3 x86 | Primary compatibility target; must be physically tested | Not supported until a specific compatible browser/runtime passes all game tests |
| Windows Vista / 7 | x86 installer candidate; test separately | Runtime/browser compatibility must be verified per OS |
| Windows 8 / 8.1 | x86 installer candidate; test separately | Runtime/browser compatibility must be verified per OS |
| Windows 10 / 11 | x86 bootstrapper should run on x86/x64 Windows; verify | Use a supported modern runtime adapter |
| Windows 95 / 98 / ME / 2000 / XP before SP3 | Out of scope unless separately approved and tested | No compatibility claim |

"Runs on every Windows version" is not a safe engineering promise. The first support statement should be exact: XP SP3 x86 for the native shell, plus only those newer OS/browser combinations that pass the test matrix.

### Required release tests

- [ ] Build from a reproducible source revision using the documented XP-compatible toolchain.
- [ ] Run installer and uninstaller on a clean Windows XP SP3 x86 virtual machine and physical machine if available.
- [ ] Test Windows 7, 10 and 11 x64 (plus x86 where available).
- [ ] Verify no missing DLL/runtime dependency on a clean installation.
- [ ] Verify image-only rendering, missing-image fallback, window resizing and DPI/display modes.
- [ ] Verify no background worker, Canvas, WebGL, animation or visual layer is started by the native shell.
- [ ] Verify OS/architecture detection and unsupported-runtime messaging.
- [ ] Verify automatic low-resource startup and runtime downshift behavior under controlled CPU/memory pressure.
- [ ] Verify game launch gate does not start unsupported game code.
- [ ] Verify existing saves and protected game systems are untouched.
- [ ] Run malware scanning, produce SHA-256 hashes, and document signature status.
- [ ] Attach the actual installer and portable package to a GitHub Release only after all required gates pass.

## 7. Scope and protected areas

The work must not edit:
- classic LV / XP / Mana HUD;
- wallet, game economy, saves, progression or game rules;
- existing game mechanics or input handling;
- protected network/capability probes unless a separately authorized adapter is introduced;
- archived renderer snapshots;
- canonical artwork source.

The launcher-specific HTML preview and native bootstrapper may be changed in their own scoped branch. Any removal of the web preview's decorative background must be limited to launcher files; it must not change the in-game world background without a separate explicit request.

Before code changes, follow root `AGENTS.md` and `docs/operations/LOCKED-AREAS.md`.

## 8. Delivery honesty

At this document's creation:
- no XP-compatible native bootstrapper source has been added;
- no installer binary has been compiled;
- no canonical image has been verified in the public source tree;
- no XP virtual machine/device test has been run;
- no browser/runtime has been validated for current Generation 1 games on XP.

The next implementation milestone is the native x86 bootstrapper skeleton and its reproducible XP-compatible build configuration. Only a successfully built and tested binary may be called a downloadable installer.
