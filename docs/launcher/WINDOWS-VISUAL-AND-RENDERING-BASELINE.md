# N.U Windows Launcher — Visual & Rendering Baseline

**Decision record:** NU-WIN-LAUNCHER-VISUAL-001  
**Date:** 2026-11-15  
**Target:** Windows 10/11, first downloadable Generation 1 launcher  
**Status:** Rendering architecture selected from existing source; canonical artwork transfer and native packaging remain release blockers.

## 1. Decision summary

The first Windows launcher will preserve the existing N.U browser-first rendering stack. It will **not** introduce Three.js, Babylon.js, Unity, Unreal, or a new WebGL scene engine for Generation 1.

The selected visual composition is:

1. The supplied N.U celestial-city artwork is the canonical, immutable background base.
2. The existing N.U Background Engine loads that image as a non-interactive image layer.
3. Existing Canvas 2D world/pixel rendering remains the fallback when the canonical image is unavailable or fails to load.
4. Atmospheric motion remains a separate, optional Canvas 2D layer and must never replace or reconstruct the canonical artwork.
5. Existing game rendering and its calibrated budget adapter remain independent of background decoration.

This is the lowest-risk route because it reuses the actual Generation 1 source, keeps the current visual identity, and avoids a graphics migration during the first desktop packaging milestone.

## 2. Evidence from the current source

| Responsibility | Existing source | Observed implementation | Decision |
|---|---|---|---|
| Canonical background | `nu-background-engine.js` v0.4 | Loads `./assets/nu-celestial-city.png`; image-first; `object-fit: contain`; non-interactive background layer | Keep as the primary background path |
| Pixel-world fallback | `nu-pixel-world.js` v0.2 | 480×270 Canvas 2D renderer; city, sky, land, traffic and ambient profiles; 12–24 FPS tiers; reduced-motion and hidden-tab handling | Keep as fallback, not as a second competing full scene |
| Atmospheric compositor | `nu-dynamic-layers.js` v0.3 | Separate Canvas 2D glow, arcs and particles; budgeted particle count and overlay FPS | Keep optional and isolated; no input handling |
| Shared graphics budget | `nu-graphics-core.js` | One capability profile; bounded levels; DPR, FPS, particle and canvas-pixel budgets | Keep as the sole shared budget source |
| Runtime policy | `nu-graphics-runtime.js` | Uses canonical image when loaded; stops fallback renderers; otherwise enables pixel and dynamic fallback | Preserve image-first/fail-safe behavior |
| Game presentation adapter | `nu-game-render-adapter.js` | Applies presentation-only CSS budgets to the existing game surface | Keep separate from game rules and wallet/save logic |

The launcher archive's browser calibration preview checks WebGL capability/limits, but that is a capability probe. It does not establish that the N.U world is currently rendered by WebGL. The inspected world and atmospheric renderers are Canvas 2D plus a canonical image layer.

## 3. Final visual direction for the first Windows build

### 3.1 Background identity

- **Base:** N.U celestial-city reference artwork, unchanged and not procedurally repainted.
- **Fit:** preserve the complete artwork using the current `contain` behavior; do not crop the canonical reference to fill arbitrary aspect ratios.
- **Palette:** retain the existing restrained dark celestial blue, cool cyan and subdued warm-gold atmospheric accents already present in the project.
- **Motion:** optional and subtle; the artwork itself remains stable. No permanent neon wash, aggressive camera movement, full-screen blur, or decorative layer over foreground text.
- **Canon boundary:** the current procedural desert/forest/coast/river/farm arrangement is a visual proposal, not approved canonical geography. It must not be promoted as a definitive Niroo City map.

### 3.2 Fallback scene

If the canonical PNG is missing, corrupt, or fails to load:

- keep the existing 480×270 pixel-world Canvas 2D renderer as the visible fallback;
- allow the separate dynamic atmosphere only within the calibrated budget;
- keep the page usable while fallback initialization occurs;
- report the asset failure diagnostically without showing a frightening blocking error;
- do not silently substitute a newly invented background image.

### 3.3 Foreground safety

The mandatory world stack remains:

- layer 0 — canonical background image;
- layer 1 — sky/atmosphere;
- layer 2 — decorative world canvases and effects;
- layer 3 — normal page shell and foreground content.

All decorative layers must remain pointer-transparent, aria-hidden where appropriate, non-focusable, and isolated from foreground DOM. They must pause when hidden and honor reduced-motion. They may not alter the classic LV/XP/Mana HUD, menus, Gateway, wallet, profile, game controls, text contrast, or gameplay input.

## 4. Rendering-engine decision

**Selected for Generation 1: existing Canvas 2D + image compositor, with WebGL kept as a capability signal only.**

Reasons:
- It is already implemented and integrated with the existing world.
- The 480×270 pixel renderer is intentionally low-resolution and inexpensive.
- The canonical image path avoids reconstructing source artwork.
- The graphics core already provides a single shared performance budget.
- A new 3D engine would add package weight, shader/device compatibility work, new failure modes and regression scope without a demonstrated Generation 1 requirement.

No new renderer should be added unless a measured, approved requirement cannot be met by the existing stack. If a later generation needs true 3D scenes, evaluate that as a separate architecture decision and do not migrate Generation 1 as a side effect.

## 5. Windows host boundary

The renderer remains web-technology-based inside the desktop host. The Windows host is a packaging/runtime shell, not a reason to rewrite the game renderer.

**Recommended host candidate for implementation:** Tauri 2 using the Windows WebView2 runtime, with an explicit WebView2 bootstrap/availability check and a documented offline/first-run behavior. This is a recommendation for the packaging milestone, not a claim that Tauri, WebView2 deployment, signing, or an installer already exists in this repository.

The desktop shell must:
- open the launcher calibration UI first;
- not start game modules before the calibration gate is complete;
- load local packaged assets using a stable app origin;
- preserve the same image-first/fallback rendering policy;
- avoid requiring an Internet connection merely to display the packaged background and local Generation 1 interface;
- keep external publication links and online checks clearly separate from local rendering;
- not grant games or future plugins broad native filesystem/process permissions.

Before release, validate WebView2 availability, WebGL capability reporting, Canvas 2D output, DPI scaling, window resize, multi-monitor movement, sleep/resume, reduced motion, and GPU-driver fallback on real Windows 10/11 devices.

## 6. Current blocker: canonical artwork is referenced but not verified in the public source tree

The runtime points to `assets/nu-celestial-city.png`. The graphics CI workflow explicitly allows for the case where this asset has not yet been transferred, and the background test validates its expected Git blob only if the file exists.

Therefore:
- the design decision can be fixed now;
- the exact canonical image cannot be declared packaged or verified from this source review;
- do not create a replacement image or alter the asset path to conceal the missing transfer;
- the original approved binary must be transferred into the public source at the expected path and verified against the expected blob SHA recorded by `tests/nu-background-engine.test.js`;
- only after transfer should the Windows package embed it and the image-load/failure paths be tested.

## 7. Performance policy

Use the existing shared profile. Do not start a second benchmark in the desktop shell.

When performance degrades, reduce optional effects in this order:
1. decorative particle count;
2. decorative update frequency;
3. optional parallax/camera movement;
4. optional glow/atmosphere;
5. fallback scene update frequency/resolution within its existing safe policy.

Never reduce foreground readability, change gameplay rules, alter rewards/economy, or change the classic resource HUD to compensate for a graphics budget.

The current browser capability sampler is heuristic. It is not a native CPU/GPU benchmark and does not prove hardware safety. A Windows-native telemetry adapter may be considered separately after the first packaged build; it must not replace or mutate the protected Generation 1 sampler without a dedicated authorization/review.

## 8. Required implementation and release gates

- [ ] Transfer and verify the canonical artwork at `assets/nu-celestial-city.png`.
- [ ] Build the Windows host around the existing launcher entry point.
- [ ] Confirm local asset URLs resolve correctly in the packaged app.
- [ ] Confirm calibration precedes game launch and no game starts automatically.
- [ ] Confirm canonical image success and missing/corrupt-image fallback.
- [ ] Run `node --check` on the graphics runtime files.
- [ ] Run `node --test tests/nu-background-engine.test.js tests/nu-layer-contract.test.js`.
- [ ] Run the graphics CI workflow.
- [ ] Manually test Windows 10 and Windows 11, including WebView2, GPU-disabled/restricted mode, DPI scaling, resize, hidden/minimized resume, and reduced-motion.
- [ ] Confirm foreground controls remain visible and interactive in every test.
- [ ] Record installer artifact hash, signing status, version and rollback path.
- [ ] Obtain project-owner visual acceptance before calling the build a release.

## 9. Scope explicitly excluded from this decision

This record does not authorize changes to:
- the classic LV/XP/Mana HUD or its lock;
- game mechanics, physics, XP/Mana/HP, wallet, saves or progression;
- the protected capability sampler/network probe;
- Gateway/menu architecture;
- Generation 2 or archived experiments;
- canonical artwork itself;
- plugin/package sandboxing, signed catalog, dependency resolver, auto-update or cloud services.

## 10. Acceptance statement

For the first Windows launcher, the visual and rendering baseline is **canonical celestial-city image + existing Canvas 2D pixel-world fallback + optional budgeted Canvas 2D atmosphere**, governed by the existing shared graphics budget and foreground-safety protocol.

The architecture choice is source-grounded. The canonical asset transfer, Windows host implementation, installer, signing, real-device tests and owner acceptance remain separate unfinished work and must be reported as such.
