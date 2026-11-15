# N.U Windows Launcher — Legacy-First Visual & Runtime Baseline

**Decision record:** NU-WIN-LAUNCHER-VISUAL-001  
**Date:** 2026-11-15  
**Target:** Windows XP compatibility first; broader Windows support where the selected runtime permits  
**Status:** Image-only visual direction approved. Legacy host/runtime, canonical asset verification, RAM measurements, installer and real-device validation remain open.

## 1. Updated decision

The earlier Windows 10/11 and Tauri 2/WebView2 recommendation is withdrawn as the baseline. Windows XP is now the oldest target and compatibility reference.

The launcher visual is intentionally reduced to **one static canonical N.U image**: no animated or procedural background, pixel-world, atmosphere, particles, parallax, glow, camera motion, extra canvas, or decorative overlays. The image must preserve its aspect ratio. Foreground UI, buttons, calibration, text and navigation remain unchanged and interactive.

If the image cannot load, show a neutral solid background and preserve launcher usability. Do not start a second renderer or invent a replacement image.

## 2. Background resources to disable

The launcher image-only build must not start or mount the procedural pixel-world renderer, dynamic atmospheric compositor, particle/cloud/traffic effects, glow/parallax, background animation loops/timers, or background-specific canvases. Do not delete shared game-rendering modules merely to simplify the launcher; disable or exclude only the launcher integration actually used, after checking script references and regression tests.

The static image must be decorative, pointer-transparent, non-focusable and hidden from assistive technology when it conveys no information. This decision does not authorize edits to the locked classic LV/XP/Mana HUD or game rules.

## 3. Canonical image

The existing Generation 1 background engine references assets/nu-celestial-city.png, but transfer of that asset into the public source tree was not verified. Before implementation, verify that the approved original exists at that path and matches the expected Git blob SHA in tests/nu-background-engine.test.js. Use the exact approved image without repainting or inventing a substitute.

The launcher.html inspected for this decision currently uses a CSS gradient and does not show the canonical image being mounted. Therefore image-only launcher presentation is **not yet implemented** by this documentation update.

## 4. Windows XP compatibility boundary

Windows XP is a legacy, unsupported operating system. Lowering graphics settings alone cannot make a modern host compatible. The host, browser engine, JavaScript syntax, CSS features, TLS/network stack, installer format and system APIs must all be checked.

- Tauri 2 + WebView2 is withdrawn as the XP baseline; do not describe it as XP-compatible.
- Do not assume current Chromium, Edge WebView2, Electron or modern .NET runtimes run on XP.
- Select a legacy-compatible host/browser engine only after a proof-of-concept on a clean XP SP3 virtual machine and a representative low-spec device.
- Any legacy browser/runtime must be isolated from sensitive browsing and must not be presented as secure for general Internet use.
- Prefer local packaged assets and offline startup. Online features must fail gracefully when modern TLS or certificates are unavailable.
- Keep a separate modern Windows build possible if the XP-compatible runtime cannot provide equivalent web/network capabilities.

The current launcher preview uses modern JavaScript syntax and browser APIs. It must not be assumed to parse or run on XP-era browsers without a compatibility audit and an appropriate legacy entry point or transpilation/polyfills.

## 5. Provisional RAM target — not certified

No trustworthy measured RAM requirement or Windows XP installer build exists in the inspected repository. Browser memory hints are not process-level measurements. Use these as initial engineering test goals, not published compatibility guarantees:

| Metric | Provisional target |
|---|---:|
| Total system RAM for minimum test configuration | 512 MB |
| Total system RAM recommended for XP test configuration | 1 GB |
| Launcher incremental steady-state working set | <= 120 MB |
| Launcher incremental startup peak working set | <= 180 MB |
| Background workload | One static image; zero animation loops/canvases |

If the selected XP-compatible host cannot meet these goals, record actual measurements and revise the target rather than claiming success. Measure installer disk footprint separately; RAM and disk size are different requirements.

## 6. Low-resource operating policy

Load only the local image and essential launcher UI. Do not create WebGL contexts, animation frames, canvas renderers, particle arrays or recurring background timers for the launcher. Avoid high-resolution image variants; test image decode memory on the minimum device. Do not require network access to display the launcher. Missing hardware information is unknown, not proof of capability or incompatibility. Never reduce foreground readability or hide controls to meet a memory target.

## 7. Required implementation and release gates

- [ ] Verify the approved image file and expected blob SHA.
- [ ] Replace the launcher CSS gradient with the single approved static image, preserving foreground layout and contrast.
- [ ] Confirm no launcher background canvas, particle engine, parallax, glow or recurring visual timer is loaded.
- [ ] Audit launcher JavaScript/CSS/APIs for the chosen XP-era runtime.
- [ ] Produce a proof-of-concept on clean Windows XP SP3 without a modern unsupported WebView.
- [ ] Measure idle and startup peak working set on 512 MB and 1 GB configurations.
- [ ] Verify offline startup and graceful failure of unsupported online/TLS features.
- [ ] Verify on supported newer Windows versions.
- [ ] Run focused launcher, image, foreground-interaction and regression tests.
- [ ] Record installer format, artifact hash, signing status, version, actual RAM/disk footprint and rollback path.
- [ ] Obtain project-owner acceptance before calling any build a release.

## 8. Scope exclusions

This decision does not authorize changes to the classic LV/XP/Mana HUD or its lock, game mechanics, XP/Mana/HP, wallet, saves or progression, protected capability sampler/network probe, Gateway/menu architecture, Generation 2, archived experiments, canonical artwork, package sandboxing, signed catalog, dependency resolver, auto-update or cloud services.

## 9. Acceptance statement

The new direction is **one static canonical image and no background effects or renderer layers**, with Windows XP as the oldest compatibility target and low-spec Windows hardware as the performance reference. This is a documented design decision only. Image-only launcher CSS, XP-compatible runtime/installer, RAM measurements, compatibility testing and release acceptance remain unimplemented and unverified.
