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


## HP Capsule HUD click and feedback check — Generation 1.18
- [ ] Start any Generation 1 game and lower HP below 10 (e.g. allow Chaos Attack to cause damage).
- [ ] Confirm an owned HP Capsule is visible in the HP bar.
- [ ] Click/tap the capsule icon itself (not the HP bar background).
- [ ] Confirm exactly one capsule is consumed and HP increases by up to 10, capped at 10/10.
- [ ] Confirm a brief `+N HP` pop appears at the capsule icon, similar in timing/placement to target interaction feedback.
- [ ] Confirm the existing HP bar glow and transaction notification also appear.
- [ ] At 10/10 HP, confirm a warning appears and no capsule is consumed.
- [ ] With zero capsules, confirm the icon is hidden and no gameplay interaction is triggered.
- [ ] Verify mouse, touch, keyboard activation (Enter/Space), portrait and landscape layouts.
- [ ] Verify reduced-motion mode remains readable without the pop animation.
- Result: PASS / PASS WITH LIMITATIONS / FAIL
- Browser/device/orientation:
- Steps to reproduce:
- Expected vs actual:
- Severity: cosmetic / usability / functional / blocking
- Notes:


## HP capsule HUD interaction — Generation 1.19 debug retest
- [ ] Ensure at least one HP Capsule is owned and HP is below 10.
- [ ] Open Bubble Hunt, Mana Collector, and Chaos Attack; verify the capsule button works in each game.
- [ ] Tap/click directly on the capsule image and count label; confirm one capsule is consumed once per activation.
- [ ] Confirm `+N HP` appears above the capsule icon even when the final capsule is consumed and the button hides after use.
- [ ] Confirm the animation is not clipped by the game canvas/stage and remains visible near the fixed HP bar.
- [ ] Confirm pointer/touch activation and keyboard Enter/Space activation.
- [ ] Confirm the HP bar profile hover/click does not swallow capsule activation.
- [ ] Confirm HP-full and empty-inventory warnings do not consume capsules.
- [ ] Confirm portrait/landscape mobile and desktop behavior.
- Result: PASS / PASS WITH LIMITATIONS / FAIL
- Device/browser/orientation:
- Owned capsules before test:
- HP before and after:
- Steps to reproduce:
- Expected vs actual:
- Severity and notes:


## HP Capsule — Generation 1.20 direct-click retest
- [ ] Confirm the capsule count is at least 1 and HP is below 10.
- [ ] Tap/click the button image, then separately the count text; both must consume exactly one capsule per activation.
- [ ] Confirm keyboard Enter and Space activation each consume exactly one capsule.
- [ ] Confirm the click does not open/close the HP asset profile or trigger the game canvas.
- [ ] Confirm the `+N HP` pop is visibly anchored to the icon and remains above all HUD overlays.
- [ ] Confirm the button has a visible focus outline and at least a 42×42 CSS-pixel hit area.
- [ ] Verify on desktop mouse and mobile touch, in portrait and landscape.
- Expected: HP rises by min(10, missing HP), pill count drops by exactly one, and one interaction pop appears.
- Actual / browser / device / screen orientation:
- Result: PASS / PASS WITH LIMITATIONS / FAIL
- Notes:


## HP Capsule — Generation 1.22 interaction burst human retest

- [ ] With HP below 10 and at least one capsule, click/tap the HP capsule icon once.
- [ ] Confirm the feedback originates at the capsule icon: a bright green circular ring expands, eight small particles radiate outward, and a glowing `+N HP` label rises.
- [ ] Confirm the burst stays visible above the HUD and is not clipped by the game canvas/stage.
- [ ] Confirm exactly one burst and one capsule consumption per activation (mouse, touch, Enter and Space).
- [ ] Confirm the HP bar updates and the capsule count decreases by exactly one.
- [ ] At full HP or with zero capsules, confirm warning feedback appears but no success burst and no capsule is consumed.
- [ ] Verify reduced-motion mode: feedback remains readable without the particle/ring animation.
- [ ] Test desktop and mobile, portrait and landscape, across Bubble Hunt, Mana Collector and Chaos Attack.
- Expected: successful use produces the icon-anchored ring/particle/label burst; all wallet rules remain unchanged.
- Actual / browser / device / screen orientation:
- Result: PASS / PASS WITH LIMITATIONS / FAIL
- Notes:

## HP capsule arrival / return motion — Generation 1.23

- [ ] Begin a game with HP at 10/10 and note the capsule icon is in its normal HUD position.
- [ ] In Chaos Attack, allow one breach to reduce HP below 10.
- [ ] Confirm one golden capsule image appears from the HP rail's left corner and travels to the capsule dock at the rail's right side.
- [ ] Confirm the real capsule button remains usable after the arrival animation; animation itself does not consume a capsule.
- [ ] Take additional damage while HP is already below 10; confirm the docked icon does not replay or duplicate.
- [ ] Restore HP gradually; confirm the capsule stays docked until HP reaches 10/10.
- [ ] On reaching full HP (through a successful capsule use or round-completion heal), confirm the visual capsule travels back along the reverse path to the rail corner and fades out.
- [ ] Confirm no capsule inventory is consumed by either travel animation; only an intentional click/tap/Enter/Space on the capsule button consumes one.
- [ ] Verify portrait/landscape, desktop/mobile, all three games, and reduced-motion mode.
- Expected: one arrival per transition from full to damaged, one reverse/fade per transition back to full, with no duplicate icons, clipped animation or wallet changes.
- Actual / browser / device / orientation:
- Result: PASS / PASS WITH LIMITATIONS / FAIL
- Notes:

