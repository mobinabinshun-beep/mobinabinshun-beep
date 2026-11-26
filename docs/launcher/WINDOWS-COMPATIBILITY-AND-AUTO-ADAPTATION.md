# N.U Windows Compatibility, Image-Only Scene & Automatic Adaptation

**Status:** Engineering decision record; implementation and release are blocked pending legacy-platform validation.  
**Date:** 2026-11-15  
**Scope:** Native Windows installer, lowest-supported Windows baseline, image-only world background, and automatic runtime adaptation.

## 1. User-approved product direction

- Windows is the first desktop delivery family.
- Windows XP is the provisional lowest compatibility reference because the exact machine/OS build is not yet known.
- The launcher, not the user, chooses the initial performance profile and applies it automatically.
- The world background is one canonical image only. Remove the sky, horizon, procedural world, pixel-world canvas, dynamic atmosphere, particles, parallax layers and all background fallbacks from the active launcher/world composition.
- Keep foreground navigation, text, controls, accessibility and game HUD separate and unchanged.
- Preserve game rules, XP/Mana/HP values, wallet, saves and the protected classic LV/XP/Mana HUD.

## 2. Important compatibility finding

The previous Tauri 2 + WebView2 recommendation is **not a Windows XP solution**. Microsoft documents WebView2 support on Windows 10 version 1709 and later and Windows 11; XP is not in its supported operating-system list. Therefore:
- Do not label a Tauri 2/WebView2 package as XP-compatible.
- Do not build or publish an XP installer from that stack.
- Keep the Tauri/WebView2 candidate only for a separate modern Windows build, if later selected.

Official references:
- Microsoft WebView2 supported Windows versions: https://learn.microsoft.com/en-us/microsoft-edge/webview2
- Microsoft Edge supported operating systems: https://learn.microsoft.com/en-us/deployedge/microsoft-edge-supported-operating-systems

## 3. Lowest-baseline assumption and release policy

Until the target computer can be identified, use **Windows XP SP3 x86 as a provisional test target only**, not as a verified support promise. XP SP2, XP x64, Vista, 7, 8/8.1, 10 and 11 must each be explicitly tested before claiming support.

A single installer cannot be claimed to support “all Windows” without a defined OS, CPU architecture, instruction-set and runtime matrix. Release notes must list exact supported editions/builds and x86/x64 architecture. If XP compatibility cannot be proven without relying on obsolete and unsafe browser runtimes, ship a clearly separate legacy/offline build or declare XP unsupported; never silently substitute an incompatible modern installer.

Windows XP is out of security support. An XP build must not be represented as safe for sensitive accounts, credentials, payments or modern web browsing. No credentials or sensitive personal data should be collected by an XP legacy runtime.

## 4. Existing source findings (verified)

- `launcher.html` calls itself **“LAUNCHER CALIBRATION PREVIEW · NOT A NATIVE INSTALLER”**. It is a browser preview, not a Windows setup executable.
- `nu-launcher.js` currently presents ten manually selectable levels and lets the user apply one. That conflicts with the new automatic-only direction.
- The launcher calibration checks browser-reported memory, logical CPU count, a short bounded JavaScript sample, WebGL capability and one same-origin reachability request. These are approximate hints, not native hardware measurements.
- `nu-graphics-core.js` creates a shared, one-time budget profile. It does not yet implement continuous runtime adaptation based on sustained frame-time degradation.
- The current world page contains `.sky`, `#pixel-world`, `#world-canvas`, `.horizon`, `nu-dynamic-layers.js`, `nu-pixel-world.js` and a procedural fallback path.
- The active public source does not contain `assets/nu-celestial-city.png` at the expected path. The private archive's `Material/Background.svg` entry currently resolves to an empty file. The canonical artwork is therefore not available for a safe image-only cutover.
- `AGENTS.md` and `docs/operations/LOCKED-AREAS.md` protect the classic LV/XP/Mana HUD. This work must not modify that HUD or its wiring.

## 5. Image-only scene acceptance criteria

1. Identify and transfer the approved canonical image as a real, non-empty repository asset; record its checksum and dimensions.
2. Render that one image as the only world-scene visual. Preserve the source artwork; do not repaint, reconstruct, blur, parallax, animate, or overlay it.
3. Remove active scene layers and their script registrations: sky, horizon, world canvas, pixel-world canvas, dynamic atmospheric canvas, particles, procedural city/weather/traffic and fallback renderer.
4. Keep the image decorative, `aria-hidden`, non-focusable and `pointer-events:none`; keep all foreground UI above it.
5. If the image is missing or corrupt, report a visible diagnostic and keep the foreground usable. Do not reactivate procedural or animated fallback layers.
6. Update tests to assert that no decorative canvas/layer scripts are mounted and that the canonical image is the sole scene asset.
7. Do not alter the game canvas, game mechanics, resource HUD, wallet or save system as part of this background-only change.

## 6. Automatic adaptation requirements

The launcher must automatically select and apply a conservative profile. Users must not need to choose a graphics level for normal startup.

- Use one shared profile for the launcher and game renderer; avoid competing benchmarks.
- Start with conservative defaults when hardware data is missing or unreliable.
- Prefer browser/runtime-observable signals (frame-time windows, visibility, reduced-motion, failed context creation) over unsupported assumptions about CPU/GPU model.
- Do not run stress tests or long synthetic workloads.
- Use hysteresis: reduce optional work quickly after sustained frame-time misses; restore gradually only after a stable interval.
- Bound game-canvas pixel count and frame rate; preserve input responsiveness and game simulation correctness.
- With the image-only scene, do not spend resources on decorative animation, particles, parallax, glow or world canvases.
- Expose a small diagnostic profile (selected tier, reason, sample confidence and last adjustment) for QA, not a user-facing manual level picker.
- Recalibrate after major lifecycle changes (startup, visibility restore, display/DPI change) without repeatedly benchmarking the machine.
- Never modify XP/Mana/HP calculations, saves, wallet or gameplay timing to fake a performance improvement.

## 7. Installer architecture and packaging gates

No native installer, executable, signed package or XP-compatible runtime has been built by this documentation change.

Before producing a setup file:
1. Confirm whether the minimum XP target is SP3 x86, and whether XP x64 is in scope.
2. Select a host/runtime that actually starts on that exact OS. WebView2/Tauri 2 is excluded for XP.
3. Audit the current app's JavaScript and CSS against the selected legacy engine. The current source uses modern syntax/APIs (including `const`, arrow functions, async functions, optional chaining, object spread, `fetch`, and modern CSS layout/features); an XP-specific build may require transpilation, polyfills and a dedicated compatibility UI.
4. Choose an installer toolchain whose generated installer itself supports the minimum OS and architecture.
5. Build on a reproducible Windows CI runner; test clean install, upgrade, uninstall, offline start, missing-runtime behavior and rollback.
6. Test on real XP SP3 x86 hardware/VM plus each newer OS claimed in the support matrix. A successful modern Windows build does not prove XP support.
7. Publish checksums, exact OS support matrix, runtime dependencies and known limitations. Sign artifacts where the toolchain and certificate allow it.

## 8. Current release status

- Browser calibration preview: exists.
- Native Windows installer: not built.
- XP compatibility: unverified; no installer may be advertised as XP-compatible.
- Automatic startup profile: partially implemented in the browser preview; still has a manual level picker.
- Continuous runtime adaptation: not implemented.
- Image-only background: not implemented; canonical asset is missing.
- Source code/runtime/visual assets: unchanged by this decision record.

## 9. Protected scope

Do not edit the classic LV/XP/Mana HUD, game mechanics, wallet, saves/progression, network probe, Gateway architecture, Generation 2 experiments, archived material or canonical artwork without a separate, explicit scope authorization. The image-only change applies only to the world background composition and must preserve foreground isolation.
