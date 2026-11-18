# N.U Interaction Debug Backlog — 2026-11-19

**Owner:** N.U project owner  
**Canonical protocol:** [Interaction Core & Debug Data Protocol](./INTERACTION-CORE-AND-DEBUG-PROTOCOL-2026-11-19.md)  
**Active human-QA record:** [Issue #210](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/210)  
**Rule:** A checked item means code/test evidence exists, not human acceptance. Preserve original failed reports and append resolutions; never overwrite findings.

## Shared core and translators
- [x] Shared `NUInteractionCore` API and semantic event stream.
- [x] Separate translator declarations: direct touch, direct physical mouse, selective/action, simulated mouse.
- [x] Distinguish move/hover, navigate, select, confirm, activate, cancel and producer-defined execute.
- [x] Bounded in-memory debug ledger and JSON export schema.
- [x] Focused tests for translator classification, Gateway event observation and bounded ledger.
- [x] Run the focused interaction tests and Gateway regression in GitHub Actions: 68/68 passed; full Generation 1 suite 338/338 passed (run links recorded below).
- [x] Verify the exact deployed demo build and cache version: Pages build identity matches `bc3557e96a58cb3d0cff73fc3fd5139e44ae2a84`; `nu-games.js` cache key is `20261119-single-gamepad-input-r1`.
- [ ] Verify on physical touch, physical mouse, keyboard-emulated controller and gamepad.

## Platform and system interactions
- [x] Observe direct mouse press/release/hover and direct touch press/move/activate/cancel.
- [x] Observe selective click, form selection/change, keyboard confirm/cancel.
- [ ] Add explicit lifecycle producers for tabs, links, dialogs, focus transitions, drag/drop, scroll controls and dynamically generated UI.
- [ ] Verify no duplicate semantic activation for touch compatibility clicks and programmatic clicks.

## Gateway
- [x] Observe Gateway directional navigation, confirm and cancel events.
- [ ] Record open/pause ordering, dwell source/timing, option focus, select, activation result, close reason and re-entry guard as one correlated trace.
- [ ] Verify full hierarchy, extra-Down exit, held input, and fresh-input gameplay resume on actual devices.

## Simulated mouse
- [x] Observe virtual pointer movement and hit-tested target changes.
- [x] Preserve separate directional movement and confirmation semantics.
- [ ] Trace pointer coordinates → hit-test target → dispatched pointer/mouse event → game handler → action outcome.
- [ ] Verify pointer/canvas aim and click activation in every game view.

## Game-object instrumentation
### Bubble Hunt
- [ ] Bubble spawn / stable object ID / position.
- [ ] Pointer hover or touch target / hit test.
- [ ] Click/pop / miss / despawn.
- [ ] Score, XP and wallet outcome correlation.

### Mana Collector
- [ ] Mana particle/orb spawn / stable object ID / position.
- [ ] Pointer or touch targeting / collection attempt.
- [ ] Collection success / miss / despawn.
- [ ] Mana delta, capsule/charge and round outcome correlation.

### Chaos Attack
- [ ] Chaos mass/cluster spawn / stable object ID / position.
- [ ] Targeting / overlap / collision / split or merge where supported.
- [ ] Damage/effect / hit or miss / despawn.
- [ ] Health, Mana/Arcane Shield and round outcome correlation.

## Debug record and human evidence
- [x] Canonical protocol and this backlog are tracked in the repository.
- [x] Original owner report remains linked from Issue #210; this change does not convert it to a pass.
- [ ] Attach exported `nu-interaction-debug/v1` JSON for each reproducible failure.
- [ ] Add device/browser/build/input type, exact steps, expected vs observed, timestamp and evidence link to every human report.
- [ ] For every correction, link prior finding → fix commit → automated run → deployed build → human retest without deleting the earlier failure.

## Current release gates
- Source changes: committed on the existing default line; no feature branch was created.
- Machine test result: **PASS** on runtime candidate `bc3557e96a58cb3d0cff73fc3fd5139e44ae2a84`.
- Demo deployment: **VERIFIED** by Pages run [44404722479](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44404722479); deployed Pages build version equals the candidate SHA.
- Demo URL: https://mobinabinshun-beep.github.io/mobinabinshun-beep/
- Cache key: `nu-games.js?v=20261119-single-gamepad-input-r1`.
- Pre-change baseline: `backup/pre-gamepad-single-input-route-2026-11-19` → `1384d160735ad12f68011469e740fd0288384e24` (verified before the first write).
- Post-validation recovery checkpoint: `checkpoint/machine-approved-gamepad-single-input-2026-11-19-final` → `bc3557e96a58cb3d0cff73fc3fd5139e44ae2a84` (verified).
- Human QA: **PENDING**; physical-device retest has not been performed. Issue #210 remains open.
- Owner acceptance: **NOT GRANTED**.


## 2026-11-19 — Gamepad single-route correction

### Confirmed code-level finding

`nu-controller-pointer.js` and `nu-games.js` both polled the Gamepad API. The same D-pad/stick direction could move the simulated pointer and also move the game's keyboard target; the same confirm button could dispatch a simulated pointer press and separately activate the keyboard target. That created two competing execution paths for one physical input.

### Applied correction

- Removed the game-level Gamepad polling loop and its start/stop lifecycle from `nu-games.js`.
- Kept `nu-controller-pointer.js` as the sole Gamepad API poller and shared simulated-mouse route.
- Connected `nu:simulated-pointer-move` to Gateway-return resume, without a second target-selection or activation path.
- Added a runtime harness test: one connected gamepad moves the pointer once and one confirm produces exactly one pointerdown, pointerup and click.
- Added a contract test proving `nu-games.js` no longer polls Gamepad input independently.
- Added `nu-games.js` and the controller-input test to the Gateway workflow's push filters.
- Bumped the `nu-games.js` cache key in `index.html`; the classic LV/XP/Mana HUD markup, styles and behavior were not changed.

### Machine evidence

- Gateway regression: **68/68 PASS** — [run 44404722555](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44404722555).
- Arcane Shield/Mana focused suite: **83/83 PASS**; full Generation 1 suite: **338/338 PASS** — [run 44404722628](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44404722628).
- Graphics integrity: **13/13 PASS** — [run 44404722420](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44404722420).
- Graphics preview smoke checks: **PASS**; five-page local reference validation completed — [run 44404722543](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44404722543).
- Studio export regression: **338/338 PASS** on the same runtime code candidate before the cache-key-only HTML update — [run 44404454875](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44404454875).
- Pages deployment: **SUCCESS**, with `pages_build_version` exactly equal to `bc3557e96a58cb3d0cff73fc3fd5139e44ae2a84` — [run 44404722479](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44404722479).

### Recovery and process deviation

- Pre-change recovery ref was created and read back before the first source write.
- A first workflow-file write duplicated its header and failed before jobs started; the workflow was corrected in a successor commit.
- The first test revision used the wrong source variable name for the Gamepad button array (`buttons[0]` instead of the adapter's `b[0]`); the assertion was corrected. The final candidate passed all listed checks.
- Because a push to the default branch automatically starts Pages deployment, the initial deployment began before all regression tests had completed and before the final post-validation checkpoint was created. This ordering deviation is recorded, not concealed. The exact pre-change baseline remained available; the final recovery checkpoint now points to the tested/deployed SHA.
- The Pages workflow confirms the deployed artifact identity. A separate HTTP read-back of the live page was not available in this operation; treat browser-level cache delivery as requiring human smoke confirmation.

### Still open — not solved by this correction

- Human retest with a real Gamepad and keyboard-emulated controller.
- Direct physical mouse and touch verification.
- End-to-end pointer coordinates → hit-test → game handler → action outcome for Bubble Hunt, Mana Collector and Chaos Attack.
- Stable object/action/source/outcome identifiers and exported interaction traces for game objects.
- Full runtime integration of all touch, physical-mouse and selective/action translators into the shared semantic core.
- Gateway hierarchy, held-input and fresh-input return verification on actual devices.

The original human report in Issue #210 remains preserved and authoritative until the owner retests this exact deployed build. Machine approval is not human acceptance.
