# N.U Windows Launcher — Legacy-First Visual & Runtime Baseline

**Decision record:** NU-WIN-LAUNCHER-VISUAL-001  
**Date:** 2026-11-15  
**Target:** Windows XP compatibility first; broader Windows support where the selected runtime permits  
**Status:** Image-only visual direction approved. Legacy host/runtime, canonical asset verification, RAM measurements, installer and real-device validation remain open.

## Related implementation record

- [XP host and real installer plan](./WINDOWS-XP-HOST-AND-INSTALLER-PLAN.md) — pinned legacy-runtime proof-of-concept, separate modern Windows lane, NSIS installer direction and explicit release blockers. This is a plan only; no native host or installer has been built.

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



## 10. Self-adaptive runtime policy

A new isolated module, nu-adaptive-governor.js, is integrated after the shared graphics runtime in index.html. It listens for the existing shared graphics profile and measures short windows of actual frame pacing. Under sustained frame pressure it lowers the shared graphics level by one step; it raises the level by one step only after three consecutive headroom windows. It pauses its sampling while the document is hidden, does not run a synthetic stress test, and does not read or write XP, Mana, HP, wallet, save or progression state. It publishes nu:graphics-adjusted, reapplies the shared game-render adapter, and updates the active Generation 1 game renderer's quality/FPS pacing only. The event consumer changes state.quality and the optional renderer quality hook; it does not mutate save, XP, Mana, HP, wallet or progression data.

This is an initial runtime governor, not proof of full automatic hardware adaptation. It reacts to frame pacing, but browser-exposed RAM/GPU details remain incomplete, it cannot directly measure total system memory pressure in many browsers, and it does not itself guarantee that every game loop obeys the target FPS. The active index.html no longer mounts the sky element, world canvases, horizon, dynamic-layer script or pixel-world script. The runtime now fails closed to a solid CSS base if the canonical image is unavailable. The legacy renderer source files remain in the repository but are not loaded by the active page. The launcher calibration preview also remains a separate preview and is not a native Windows installer.

The governor has focused Node tests for downshifting under poor frame pacing, delayed upshifting within the calibrated ceiling, applying the saved launcher profile, and pausing while hidden. The focused graphics-integrity CI job passed after the image-only wiring and governor tests were included. Separate repository workflows still report failures in HP/HUD and Studio regression suites; those areas are outside this change and the classic LV/XP/Mana HUD remains locked.

## 11. XP compatibility remains a release blocker

The governor uses an ES5-style isolated module to reduce its own parser requirements, but the surrounding application still contains modern JavaScript and browser APIs (including async functions, optional chaining, fetch, CustomEvent and modern CSS). Therefore this addition does **not** make the complete application Windows XP-compatible. A legacy runtime/transpilation strategy and clean XP SP3 execution test remain mandatory before any XP compatibility claim.

## 12. Acceptance statement

The active Generation 1 page now mounts only the canonical image background and no procedural background layers; the launcher applies its calibration automatically by default, the game runtime consumes that saved profile, and the adaptive governor tunes game render quality/FPS pacing from live frame timing. The canonical PNG is still missing from the public source tree, so the image itself cannot yet be displayed and the page uses its neutral CSS base. Complete legacy runtime compatibility, measured RAM, an XP installer, device testing and release acceptance remain unimplemented or unverified.


## 10. Mandatory automatic adaptation contract

The launcher must select and maintain its own resource profile. Manual graphics-level selection is not the intended end-user workflow and must not be required for successful startup.

### Startup
- Start with a conservative bootstrap profile before collecting optional device information.
- Detect the actual runtime/OS capabilities first. Never infer Windows XP support merely from a Windows user-agent string.
- Read memory/CPU/GPU hints only when exposed by the host. Treat missing, contradictory or permission-restricted values as unknown.
- Do not run stress tests, large allocations, WebGL probes or long synchronous loops just to score a device.
- Choose the safest supported profile automatically and proceed to the usable launcher UI without a profile-selection screen.

### Runtime adaptation
- Monitor lightweight, passive signals: task duration/frame delay where available, long tasks where supported, memory pressure only when an actual API exists, visibility changes and repeated resource/load failures.
- Use hysteresis and cooldowns so the profile does not oscillate. A degradation response must be faster than a quality increase.
- On sustained pressure, step down in this order: stop nonessential work; reduce image decode/target dimensions where a verified smaller approved variant exists; reduce polling/update frequency; defer noncritical work; keep the foreground UI responsive.
- On sustained headroom, only restore optional work if such work is explicitly enabled in the product design. The image-only baseline has no decorative renderer to scale up.
- Never use invented RAM values or pretend browser memory hints are exact process measurements.
- Persist only a small profile/version record if persistence is useful. Re-evaluate after runtime/OS changes and allow safe recovery from corrupt or stale settings.

### User experience
- No mandatory performance-level chooser or repeated calibration prompt.
- No blocking hardware scan. Start the shell immediately using the conservative profile; refine silently.
- If detection fails, continue in safe mode and report the limitation in diagnostics, not as a user-facing failure.
- Keep accessibility, text clarity, foreground controls, navigation and game rules invariant across profiles.
- Diagnostics may explain the selected profile and why it changed, but users are not required to configure it.

### Architecture and protected code
- There must be one authoritative capability/performance profile shared by launcher and game adapters; do not create competing benchmark systems.
- The existing protected capability sampler/network probe and locked gameplay/HUD systems are not authorized for modification by this decision. First map their current APIs and tests. If the existing sampler cannot support automatic adaptation, propose a narrow adapter that consumes its output rather than rewriting the protected sampler.
- Do not change network reachability checks as a proxy for hardware performance. Network state may affect network features, not CPU/RAM/GPU classification.
- Any runtime adaptation implementation must include deterministic unit tests for missing APIs, low-memory hints, slow task signals, cooldown/hysteresis, tab hide/resume, stale/corrupt saved profiles and foreground invariants.

### Acceptance gates
- Automatic profile selection occurs without user input.
- The launcher remains usable when all optional hardware APIs are absent.
- No heavy benchmark or unbounded observer/timer is introduced.
- Runtime pressure causes a bounded, explainable step-down without changing foreground geometry or game state.
- XP SP3 and newer Windows targets are tested independently on the actual selected host/runtime.
- RAM targets in Section 5 are verified using process working-set measurements on the stated configurations; browser-provided memory class is not accepted as proof.
