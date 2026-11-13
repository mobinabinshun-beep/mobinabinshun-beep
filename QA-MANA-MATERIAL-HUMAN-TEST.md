# N.U Generation 1.16 — Mana Material Human QA

## Purpose
Validate the five archived N.U Mana SVG materials when used on interactive Mana Collector targets in the public Generation 1 demo.

## Test environment
- Browser and version:
- Device / OS:
- Viewport or screen orientation:
- Display scale / zoom:
- Reduced-motion setting:

## Checks
- [ ] Open the public demo and launch **Mana Collector**.
- [ ] Confirm Mana targets show the N.U pixel-art material glints without blurry scaling.
- [ ] Confirm the target remains visually recognizable and its clickable area matches the visible object.
- [ ] Collect targets with mouse clicks.
- [ ] Collect targets with touch taps on a phone/tablet.
- [ ] Confirm a successful collection emits a brief material-based particle effect.
- [ ] Confirm a missed click/tap does not grant Mana or advance the round.
- [ ] Confirm each successful collection grants exactly +1 Mana.
- [ ] Confirm the round still completes after 10 successful interactions.
- [ ] Confirm full Mana storage prevents collection without consuming an interaction.
- [ ] Confirm Bubble Hunt and Chaos Attack visuals and mechanics are unchanged.
- [ ] Check low-power / reduced-motion behavior and note any distracting animation.
- [ ] Check narrow portrait and wide landscape layouts.

## Findings
- Result: PASS / PASS WITH LIMITATIONS / FAIL
- Steps to reproduce:
- Expected:
- Actual:
- Screenshot or short recording (optional; do not include private data):
- Severity: cosmetic / usability / functional / blocking
- Additional notes:


## Bubble Hunt — roundness and interaction check
- [ ] Every bubble is a true circle (equal width and height), not an oval.
- [ ] Glass highlight follows the round bubble surface.
- [ ] Mouse/touch hit area is centered on the visible circle.
- [ ] Touch targets remain usable on narrow mobile screens.
- [ ] Bubble Hunt still awards exactly +1 XP for each successful hit.
