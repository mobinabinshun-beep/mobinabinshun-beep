# N.U Interaction Debug Backlog — 2026-11-19

**Owner:** N.U project owner  
**Canonical protocol:** [Interaction Core & Debug Data Protocol](./INTERACTION-CORE-AND-DEBUG-PROTOCOL-2026-11-19.md)  
**Active human-QA record:** [Issue #210](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/210)  
**Latest change record:** [Game-object producers and cache-safe deployment](./INTERACTION-GAME-OBJECT-PRODUCERS-CHANGE-RECORD-2026-11-19.md)  
**Input taxonomy and controller settings specification:** [User Input Modes & Controller Settings](./USER-INPUT-MODES-AND-CONTROLLER-SETTINGS-2026-11-21.md)  
**Rule:** A checked item means code/test evidence exists, not human acceptance. Preserve original failed reports and append resolutions; never overwrite findings.

## New owner-directed agenda — user input modes and controller settings (2026-11-21)

- [x] Document the two top-level input classes: Interactive (touch, physical mouse) and Selective (keyboard, Gamepad).
- [x] Document direct touch and physical mouse semantics separately from selective navigation/confirmation.
- [x] Specify keyboard/Gamepad selective-action mode versus context-limited virtual-mouse mode.
- [x] Specify eight-way virtual-pointer directions, diagonal combinations, and separate Enter/Confirm activation.
- [ ] Implement/verify context-scoped virtual-mouse activation only on mouse-required game/screen areas.
- [ ] Implement/verify consistent eight-way movement, hold-repeat and no-double-dispatch behavior for keyboard and Gamepad.
- [ ] Add Settings → Games Options → Controllers.
- [ ] Add supported/connected controller list and active-mode/mapping presentation.
- [ ] Add hotkey guide with defaults and current user mappings.
- [ ] Add explicit hotkey-configuration mode with remapping, conflict detection, apply/save, cancel and reset-to-default.
- [ ] Add focused tests for direct touch/mouse, keyboard, Gamepad, diagonals, repeat, confirmation, duplicate-action prevention and Gateway ownership/freeze.
- [ ] Complete physical-device QA; documentation does not count as runtime implementation or acceptance.

**Normative specification:** [USER-INPUT-MODES-AND-CONTROLLER-SETTINGS-2026-11-21.md](./USER-INPUT-MODES-AND-CONTROLLER-SETTINGS-2026-11-21.md)

---

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
- [x] Bubble spawn / stable object ID / position.
- [x] Pointer hover or touch target / hit test.
- [x] Click/pop / miss / despawn.
- [ ] Score, XP and wallet outcome correlation.

### Mana Collector
- [x] Mana particle/orb spawn / stable object ID / position.
- [x] Pointer or touch targeting / collection attempt.
- [x] Collection success / miss / despawn.
- [ ] Mana delta, capsule/charge and round outcome correlation.

### Chaos Attack
- [x] Chaos mass/cluster spawn / stable object ID / position.
- [x] Targeting / overlap / collision / split or merge where supported.
- [x] Damage/effect / hit or miss / despawn.
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

## Historical implementation and evidence records

The prior implementation records, test runs, deployment details, recovery checkpoints, known process deviations, and human-QA boundaries are preserved in the preceding history of this file. They remain historical evidence for their exact SHAs and are not promoted to acceptance of the newly documented input modes or controller-settings requirements.

## Protected input contract
See [INTERACTION-GAME-OBJECT-PRODUCERS-CHANGE-RECORD-2026-11-19.md](./INTERACTION-GAME-OBJECT-PRODUCERS-CHANGE-RECORD-2026-11-19.md). Do not remove or override the gameplay input CSS rules without an explicit focused change request, a regression test and verification of direct touch, physical mouse/click and simulated mouse.
