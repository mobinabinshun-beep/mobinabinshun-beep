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

## HP capsule internal arrival / return motion — Generation 1.25

- [ ] Start at 10/10 HP and confirm the HP HUD frame contains no capsule icon or count.
- [ ] Allow HP to drop below 10; confirm the frame widens and the golden capsule appears at its right inner edge, travels left into the reserved slot, and settles beside the HP bar inside the same frame.
- [ ] Confirm the capsule becomes clickable only after arrival; travel itself does not consume inventory.
- [ ] Take additional damage while HP is already below 10; confirm there is no duplicate arrival and the docked capsule remains in place.
- [ ] Restore HP but keep it below 10; confirm the capsule remains docked.
- [ ] When HP reaches 10/10, confirm the capsule travels back along the exact reverse path toward the right inner corner, fades out, and leaves no visible icon or count.
- [ ] Confirm the real button is hidden during both travel animations and no icon is visible outside the HP frame.
- [ ] Test mouse, touch, Enter/Space, portrait/landscape, desktop/mobile, all three games, and reduced-motion mode.
- Expected: the wider frame contains the capsule dock; capsule visibility is strictly conditional on HP < 10; arrival and return use opposite directions; no duplicates, clipping, inventory changes or wallet-rule changes.
- Actual / browser / device / orientation:
- Result: PASS / PASS WITH LIMITATIONS / FAIL
- Notes:


## HP capsule arrival / reverse-exit precision retest — Generation 1.26

- [ ] At 10/10 HP, confirm the entire widened HP frame is visible but no capsule icon or count is present.
- [ ] Reduce HP below 10; watch the golden capsule appear at the inside-right corner and travel left into the dedicated dock beside the HP rail.
- [ ] Confirm the live clickable button stays hidden until the travelling capsule fully docks.
- [ ] Cause another HP decrease while the capsule is travelling; confirm there is only one visual capsule and no premature live button.
- [ ] While the capsule is still travelling inward, restore HP to 10; confirm the same moving capsule reverses smoothly from its current position toward the right corner and fades out.
- [ ] While the capsule is travelling outward, lower HP again; confirm it reverses smoothly and returns to the dock without duplicating.
- [ ] Once docked and HP remains below 10, click/tap the capsule itself; confirm exactly one capsule is consumed and HP is restored under the existing wallet rules.
- [ ] Restore HP to 10/10; confirm the icon and count are absent after the reverse exit.
- [ ] Verify the widened frame does not overlap the title, game controls, or viewport edges on desktop, narrow mobile portrait, and landscape.
- [ ] Verify reduced-motion behavior, all three Generation 1 games, and no travel-triggered inventory change.
- Expected: one continuous capsule visual, exact path reversal on mid-animation HP changes, no icon at full HP, and a clickable dock only after arrival.
- Actual / browser / device / orientation:
- Result: PASS / PASS WITH LIMITATIONS / FAIL
- Notes:


## Store HP capsule split-action row — Generation 1.27

- [ ] Open N.U Store and confirm there is exactly one Golden HP Capsule purchase row; the separate "Use owned capsule" card is gone.
- [ ] Confirm the capsule icon and owned count sit together on the far left of the row, item details are in the middle, and BUY / NEED 10 XP is a separate control on the far right.
- [ ] With zero owned capsules, confirm the icon is visibly dimmed, count is ×0, and clicking it cannot use a capsule.
- [ ] Buy one capsule using the right-side BUY control; confirm exactly 10 XP is deducted, inventory increases by one, and the left icon lights up with count ×1.
- [ ] With HP below 10 and at least one owned capsule, click precisely the left capsule icon/count control; confirm exactly one capsule is consumed, HP is restored up to 10, and the count decreases by one.
- [ ] Confirm clicking BUY never uses a capsule, and clicking the icon never purchases one.
- [ ] With insufficient XP, confirm BUY is disabled and no wallet values change.
- [ ] With HP at 10/10, confirm icon-use is disabled and the owned capsule remains in inventory.
- [ ] Verify mouse, touch, keyboard focus/Enter/Space, narrow mobile portrait, landscape and desktop layouts.
- Expected: one compact Store row, distinct non-overlapping purchase/use hit targets, count beside the icon, icon glow only when inventory is nonzero, and unchanged wallet transaction rules.
- Actual / browser / device / orientation:
- Result: PASS / PASS WITH LIMITATIONS / FAIL
- Notes:


## Compact mobile HP HUD — Generation 1.28

- [ ] Open any Generation 1 game on a phone in portrait orientation and compare the HP frame with the previous layout; confirm it is visibly narrower and shorter without clipping the label, HP value or bar.
- [ ] Confirm the frame remains centered/within the viewport with comfortable side margins on narrow screens (including 320 CSS-pixel width).
- [ ] When HP drops below 10, confirm the capsule dock remains fully inside the smaller frame and the icon is still tappable.
- [ ] Confirm capsule arrival/reverse-exit motion still fits inside the frame and does not overlap the HP label/value.
- [ ] Rotate to landscape and verify the HP frame remains compact but legible and does not collide with game controls.
- [ ] Verify tablet/desktop sizing remains unchanged.
- [ ] Test all three games, reduced-motion mode, and touch interaction; confirm HP/capsule wallet rules are unchanged.
- Expected: phone HP frame is smaller, all contents remain readable and interactive, no clipping/overlap, and non-phone layout is unchanged.
- Actual / browser / device / viewport width / orientation:
- Result: PASS / PASS WITH LIMITATIONS / FAIL
- Notes:
