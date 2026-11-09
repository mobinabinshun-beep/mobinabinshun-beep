# N.U Generation 1.5 — Source Review and Team QA

**Date:** 2026-11-09  
**Repository:** mobinabinshun-beep/mobinabinshun-beep  
**Release:** Generation 1.5 · Layered World Renderer

## Changes

- Layered 480×270 pixel world: sky, sun/moon, night-only stars, clouds, land, forest, coast, river, terraces, city skyline and distant traffic.
- Local-time dawn/day/dusk/night palette.
- Three ambient profiles: Sleep, Study and Game.
- Mouse-follow camera activates on mouse input; inverse touch drag activates on touch input.
- Touch drag gestures are excluded from successful game interactions.
- Bubble targets are larger; Mana particles are smaller and less prominent.
- Chaos masses advance toward the defensive line. Every unneutralized mass damages HP once on crossing and then disappears. A successful N-BI shot neutralizes exactly one mass.
- Full-width XP capsule, Mana capsule above it, fill boundary markers, +1 feedback and scanner-sweep HP bar.
- Adaptive runtime `nu-engine.js` remains unchanged.

## IP source review

Read `NU-WORLD-VISUAL-BIBLE-G1.5.md` for confirmed facts, proposals, exclusions and the source register. The design draws from published descriptions of Niroo City as a technology/nature-integrated city with green terraces, public spaces, suspended paths and distant/hovering traffic. The current landscape geography is explicitly non-canonical placeholder art.

The supplied JanitorAI profile could not be retrieved during this review and was not used as a source for character canon.

## Source-level checks

- [x] Renderer is a separate module.
- [x] Canvas is included in the existing page and script order.
- [x] Renderer waits for calibration event.
- [x] Daytime stars are suppressed.
- [x] Reduced-motion mode avoids continuous animation.
- [x] Hidden-tab renderer/game pause handling is present.
- [x] Chaos damage is tied to boundary crossing rather than a fixed static y value.
- [x] Touch drag is separated from taps.
- [x] XP fill marker is set from the current capsule fill percentage.
- [x] Core adaptive runtime file is unchanged.

## Manual team test required

- [ ] Wait for calibration, then confirm the world fades in.
- [ ] Test local daytime: no stars, visible sun, dim city windows.
- [ ] Test night: moon/stars visible, windows brighter.
- [ ] Move mouse: camera follows pointer.
- [ ] Drag finger: camera moves in the opposite direction.
- [ ] Tap a Bubble: counter increments once, +1 XP appears at the XP fill boundary.
- [ ] Tap Mana: counter increments once, +1 Mana appears at the Mana fill boundary.
- [ ] In Chaos, hit one mass: exactly one disappears and 10 Mana is spent.
- [ ] Allow remaining masses to cross the line: each causes one HP damage, then disappears.
- [ ] Pause/resume and verify the round remains frozen.
- [ ] Test portrait and landscape layouts on mobile.
- [ ] Enable reduced motion and verify the world remains static.
- [ ] Check the public GitHub Pages deployment.

## Limitations

This is source-level implementation review, not a real-device QA pass. Live GitHub Pages deployment could not be independently verified during this session. Browser time is used for the day/night cycle; it is a local visual clock, not a simulation of Niroo's canonical astronomy. The 3D-like depth is layered 2D parallax, not a full 3D scene.
