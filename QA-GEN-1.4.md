# N.U Generation 1.4 — Source Review & QA Record

**Date:** 2026-11-09  
**Repository:** mobinabinshun-beep/mobinabinshun-beep  
**Release:** Generation 1.4 · Pixel World

## Changes applied

- Added `nu-pixel-world.js` as an independent 320×180 procedural pixel-art city layer.
- Added a separate canvas element and CSS stacking layer; the existing adaptive runtime remains untouched.
- Pixel-world animation starts only after the existing calibration completes (including safe-mode fallback).
- Rendering uses a 12–24 FPS quality-dependent cap, pauses when the document is hidden, and uses a static scene under reduced-motion preference.
- Added irregular skyline silhouettes, stepped building tops, sparse stars, window lights, local dawn/day/dusk/night palettes and subtle parallax.
- Throttled camera CSS updates and paused gameplay/runtime animation when the tab is hidden.
- Added a guard so additional Chaos targets do not continue processing after a death transition has already occurred.
- Updated the package manifest and README with the new renderer and known limitations.

## Source-review findings

| Area | Finding | Status |
|---|---|---|
| Runtime | Adaptive runtime baseline must remain immutable | Preserved; `nu-engine.js` blob unchanged |
| Pixel layer | Previously no dedicated pixel-art renderer | Added as independent module |
| Startup | Pixel scene should not animate during calibration | Deferred until `nu:calibrated` |
| Background tabs | Ambient and game loops could continue unnecessarily | Pause/resume handling added |
| Camera | Pointer events could cause excessive style writes | Updates throttled to animation frames |
| Chaos death | More than one target could process in the same frame after death | Guard added |
| Economy | Credits, upgrade progression and capsule upgrade flow are not implemented | Explicitly documented as future work |
| Mana | Capacity checks exist; no spending/upgrading UI exists yet | Prototype limitation documented |
| Network | Four same-origin probes are not a public Internet speed test or true packet-loss test | Existing limitation retained |
| Saves | localStorage only; browser/device scoped | Retained and documented |

## Important gameplay semantics still needing a dedicated implementation pass

1. Mana upgrade level reducing per-shot cost is not implemented.
2. XP capsule conversion and the complete XP/credit conversion chain are not fully implemented.
3. N-Credit / X-Credit economy, savings/investment and betting modes are not implemented.
4. The full three camera modes (Explore, Study, Sleep) are not yet implemented; current parallax is a first visual layer only.
5. A complete mobile touch camera gesture and orientation parallax need device testing.
6. A true server-backed speed, packet-loss and download throughput diagnostic would require a dedicated endpoint and consent-aware payload limits.

## Manual test checklist

- [ ] Open GitHub Pages and wait for calibration; ensure no blank or blocked screen.
- [ ] Confirm the pixel skyline appears after calibration.
- [ ] Confirm reduced-motion mode produces a static skyline.
- [ ] Switch tabs and return; confirm animations resume without duplicated loops.
- [ ] Launch Bubble, Mana and Chaos separately.
- [ ] Confirm a missed click does not consume a successful interaction.
- [ ] Confirm pause/resume preserves target positions and 1/10 progress.
- [ ] Test full Mana capacity and Chaos with insufficient Mana.
- [ ] Let multiple Chaos targets cross the damage boundary in a short interval; confirm one death transition only.
- [ ] Open a publication while gameplay is active and verify the reading panel does not block intended reading controls.
- [ ] Test portrait/landscape and a low-power device.

## Release confidence

This is a source-reviewed prototype update, not a claim of complete runtime QA. The live GitHub Pages URL could not be independently fetched during this review, so deployment success and real-device rendering remain unverified. The next release should follow after manual team testing.
