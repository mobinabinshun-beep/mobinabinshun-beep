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
- [ ] Run the new focused test and full Gateway regression in GitHub Actions; record exact run URL and result.
- [ ] Verify the exact deployed demo build and cache version.
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
- Source changes: committed to existing default line; no new branch created.
- Machine test result: **PENDING / NOT VERIFIED**.
- Demo deployment and exact live build: **NOT VERIFIED**.
- Human QA: **OPEN**.
- Owner acceptance: **NOT GRANTED**.
