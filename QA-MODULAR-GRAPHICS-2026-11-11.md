# N.U Modular Graphics Runtime — QA checklist

Branch: `feature/modular-graphics-runtime-2026-11-11`

## Static checks to run before merge
- [ ] JavaScript syntax checks pass for all runtime modules and Generation 1 scripts.
- [ ] Manifest parses as valid JSON and lists every loaded module.
- [ ] All script references in index.html resolve to tracked files.
- [ ] Archived reference artwork URL returns a valid PNG response.
- [ ] Calibration event passes the existing sample to the graphics core (no second sample).
- [ ] Reduced Motion disables the dynamic canvas.
- [ ] Hidden-tab transition stops animation and visible-tab transition resumes it.
- [ ] Existing game canvas and HUD remain above background layers.

## Human tests after public deployment
- [ ] Android low-end: initial load, scroll, menu, Bubble Hunt, Mana Collector, Chaos Attack.
- [ ] Android mid/high-end: verify quality and smoothness without excessive heat.
- [ ] iOS Safari: touch, scroll, rotation, tab resume.
- [ ] Desktop Chrome/Firefox/Safari: mouse, resize, window focus.
- [ ] Reduced Motion OS preference: static visual.
- [ ] Save XP/Mana, reload, confirm persistence unchanged.
- [ ] Ten successful interactions and missed taps preserve the existing game rules.
- [ ] Compare screenshot against the archived artwork and check HUD/text contrast.

## Acceptance status
- Source-level integration: implemented, awaiting CI result.
- Archive asset URL: configured; browser loading still requires runtime verification.
- Public Pages deployment: must be verified after merge.
- Human device testing: pending user feedback.
- Native Android/iOS packages: out of scope for this web preview.

Do not mark device acceptance as passed until tester supplies device/browser, screen size, quality tier, console errors, and a result for each game.
