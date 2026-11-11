# N.U Celestial Background & Modular Scene Runtime — 2026-11-12

## Status
Image-first Generation 1 visual code is merged to the default public branch. The public Pages deployment succeeded, but the exact source PNG is stored only in the private team archive; a same-origin runtime copy at `assets/nu-celestial-city.png` is still required before the new image can display. Until then, the legacy procedural background is restored as fallback.

## Source and visual direction
- Canonical base asset: `NU-INGEST-ARCHIVE/ASSETS/NU-Celestial-City/Original reference image file for Niroo Universe (N.U).png`.
- The exact PNG is present in the private archive Git tree (blob `d73afd484ef8b459c908c1942ee0f47d27f93aa5`, 2,467,298 bytes). GitHub Actions confirmed that anonymous raw access returns 404 because the archive is private. A public execution-repository copy is required; do not expose the whole archive.
- The source image is an owner-supplied visual direction, not proof that its exact skyline/map is N.U Canon. The Gen1 Visual Bible marks the definitive city map, architecture, biome order and lighting details as proposals pending a canonical art pack.

## Scene composition
1. Invariant full-screen source artwork. It is not blurred, pixelated, downsampled by our code, swapped for generated imagery, or removed on low-end devices.
2. Independent transparent atmosphere compositor: subtle warm light, celestial orbit strokes and low-density motes. The compositor is optional and can be stopped independently.
3. Camera parallax: uses existing camera input variables to move the image subtly; disabled on economy profile and reduced-motion.
4. Existing UI and game-stage canvases remain in the foreground. The old procedural world canvas is paused/hidden only after the source image loads successfully; if the asset fails, the old Generation 1 procedural scene is re-enabled as fallback.

## Modes
- Ambient: low-amplitude atmosphere and image parallax.
- Focus: reduced brightness/motion and sparse effects to protect reading focus.
- Game: slightly richer atmospheric motion while gameplay UI stays foregrounded.
- Sleep: almost-static background; effects can be paused for resource saving.
- Intro/menu/profile/shop overlays freeze the optional compositor and image camera state. Returning to the page resumes the selected mode.

## Four engine responsibilities
- Capability/budget core: reuses the one existing bounded startup sample and locks a conservative browser presentation budget.
- Background engine: owns the source image, image-load fallback, camera and scene mode.
- Dynamic layers engine: independent transparent Canvas 2D compositor, bounded by the selected budget and reduced-motion/visibility state.
- Game render adapter: passes display tier to the existing game presentation and pixel renderer APIs; does not alter rules, target generation, XP, Mana, HP or save format.

## Preservation boundaries
- `nu-engine.js` remains frozen under `ENGINE-LOCK.md`.
- Existing game rules, touch/mouse input, collision, economy and save structures remain unchanged.
- `nu-pixel-world.js` receives only a reversible `setEnabled()` visibility/pause hook; its original procedural renderer remains available as fallback.
- Native Android/iOS renderers, native packages, offline launcher and server-authoritative online features are not implemented by this browser scene update.

## Acceptance gates
- Automated syntax, manifest and local-script checks must pass.
- Confirm the PNG URL loads from GitHub raw in browser.
- Check low/economy tier: image still full-quality source; optional effects disabled or minimal.
- Check balanced/enhanced/ultra: atmosphere and parallax increase only within budget.
- Check Reduced Motion, hidden-tab pause/resume, intro/menu/profile/shop freeze/resume.
- Check game-stage UI and all three Generation 1 games remain interactive.
- Do not call the background core locked/approved until desktop, low-end Android and iOS Safari human tests pass.
