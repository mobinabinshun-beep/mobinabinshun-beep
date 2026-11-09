# N.U Generation 1.6 — QA & Acceptance Checklist

## Changes recorded
- Chaos target approach speeds escalate by sequence: 1, 2, 4, 8, then capped at 8.
- Every unneutralized Chaos mass that crosses the defensive boundary causes 1 HP damage. A successful N-BI interaction neutralizes one mass.
- Successful interactions display the current n/10 marker at the object's interaction point.
- Completing a full ten-interaction round restores 1 HP, up to 10.
- Bubble hit areas enlarged; Mana particle size reduced.
- XP bar layout spans the bottom edge; Mana capsule rail is placed on the left-side upper rail.
- HP bar receives a moving ECG-style trace; brightness is intended to follow remaining HP.
- Mouse camera activation is lazy and separate from the touch-drag camera path.
- Aircraft and road traffic are assigned separate vertical bands.
- Adaptive runtime `nu-engine.js` remains unchanged.

## Manual test checklist
- [ ] Run on Android Chrome: verify touch camera drag moves the scene opposite the finger.
- [ ] Confirm a drag never registers as a game click.
- [ ] Confirm a tap on a valid target advances exactly one step and displays n/10 on that object.
- [ ] Confirm a missed tap does not advance the counter.
- [ ] Confirm Chaos masses accelerate in sequence and every unneutralized mass deals one damage at the boundary.
- [ ] Confirm neutralized Chaos masses do not damage HP.
- [ ] Confirm death empties only the partial XP capsule and preserves level / Mana / credits according to current save rules.
- [ ] Confirm completing a ten-interaction round restores one HP but never exceeds 10.
- [ ] Confirm XP bar spans the bottom and Mana is on the left-side upper rail.
- [ ] Confirm +1 appears at the current capsule fill edge.
- [ ] Confirm the HP scanner trace remains legible at low HP.
- [ ] Confirm stars are hidden during day and visible at night.
- [ ] Confirm aircraft do not visually pass through buildings and road vehicles stay on the road band.
- [ ] Confirm the page remains responsive at quality levels 1–3.
- [ ] Confirm pause/resume and hidden-tab behavior.

## Not implemented (do not mark as passed)
- Nine Mana capsule upgrade levels.
- N-BI cost reduction from 10 Mana to 1 Mana per shot.
- HP capsule purchase/refill economy.
- X-Credit and N-Credit earning / spending.
- Savings, investment and betting modes.
- Complete Android long-press wallet tooltip.
- True 3D depth / spherical camera.
- Automated browser and physical-device regression tests.

## Release status
Source changes have been committed. This report does not claim live-device QA or successful deployment. Manual acceptance on Android and desktop is required before calling Generation 1.6 stable.
