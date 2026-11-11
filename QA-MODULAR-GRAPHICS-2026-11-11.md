# N.U Modular Graphics Runtime — QA checklist

Branch: `feature/modular-graphics-runtime-2026-11-11`

## Automated/static checks
- [ ] Verify all five new JavaScript modules load without console errors.
- [ ] Verify image request to `assets/niroo-celestial-city.jpg` succeeds after the image is uploaded.
- [ ] Verify `nu:graphics-ready` fires once and profile is immutable.
- [ ] Verify Reduced Motion disables dynamic canvas.
- [ ] Verify hidden-tab transition stops animation and visible-tab transition resumes.
- [ ] Verify economy tier hides dynamic particles and lowers background opacity.
- [ ] Verify existing game canvas and HUD remain above background layers.

## Human tests
- [ ] Android low-end: initial load, scroll, menu, Bubble Hunt, Mana Collector, Chaos Attack.
- [ ] Android mid/high-end: verify quality and smoothness without excessive heat.
- [ ] iOS Safari: touch, scroll, rotation, tab resume.
- [ ] Desktop Chrome/Firefox/Safari: mouse, resize, window focus.
- [ ] Reduced Motion OS preference: static visual.
- [ ] Save XP/Mana, reload, confirm persistence unchanged.
- [ ] Ten successful interactions and missed taps preserve the existing game rules.
- [ ] Compare screenshot against approved artwork and ensure text/HUD contrast.

## Do not mark as passed until
A tester supplies device/browser, screen size, graphics tier, console errors, and a short result for each of the three games.

## Known not yet verified
The supplied background image is not committed in this branch. The game simulation frame limiter is not wired to the profile yet. Native Android/iOS packages are out of scope for this web-preview branch.
