# N.U Interaction Debug Backlog — 2026-11-19

**Owner:** N.U project owner  
**Canonical protocol:** [Interaction Core & Debug Data Protocol](./INTERACTION-CORE-AND-DEBUG-PROTOCOL-2026-11-19.md)  
**Active human-QA record:** [Issue #210](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/210)  
**Latest change record:** [Game-object producers and cache-safe deployment](./INTERACTION-GAME-OBJECT-PRODUCERS-CHANGE-RECORD-2026-11-19.md)  
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

## 2026-11-19 — Game-object instrumentation and cache-safe deployment

**Change record:** [INTERACTION-GAME-OBJECT-PRODUCERS-CHANGE-RECORD-2026-11-19.md](./INTERACTION-GAME-OBJECT-PRODUCERS-CHANGE-RECORD-2026-11-19.md)

### Code/test coverage now present
- [x] Bubble Hunt spawn identity/position, target/hit-test, activation/pop, miss and despawn producers.
- [x] Mana Collector spawn identity/position, target/collection attempt, success/failure, miss and despawn producers.
- [x] Chaos Attack spawn identity/position, target/hit-test, N-BI fire, collision/resolution, damage/absorption and despawn producers.
- [x] Stable `gameId`, `waveId`, `objectType`, `objectId`, source, action and outcome fields are attached to object events.
- [x] Focused producer contract tests and full Generation 1 regression run on the deployed merge SHA.
- [ ] Full XP/score/wallet transaction, Mana capsule/charge and round-outcome correlation for every game path.
- [ ] Browser/device proof that every producer fires correctly for physical touch, physical mouse, keyboard-emulated controller and Gamepad.
- [ ] Full simulated-pointer dispatch chain and Gateway correlated pause/re-entry trace.
- [ ] Human export attachment and exact-build retest.

### Latest machine/deployment evidence
- PR #219 merged at `4665e11f2a3a34eaef0a9fba2b252b1689f43ad1`; producer candidate `e8d207edd73083be578d7d301e07cbc1e474671a`.
- PR #220 merged at `a814cf20e28e0a1f4455c4e9fd094a9948f74f86`; final cache key: `nu-games.js?v=20261119-game-object-events-r1`.
- Final Gateway/main-game regression: **71/71 PASS** — [run 44427652450](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652450).
- Full Generation 1 regression: **341/341 PASS** — [run 44427652536](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652536).
- Studio export: PASS — [run 44427652401](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652401).
- Graphics preview/static validation: PASS — [run 44427652390](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652390).
- Graphics integrity: PASS — [run 44427652309](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652309).
- Pages deployment: SUCCESS — [run 44427652015](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652015); its deploy log records `pages_build_version=a814cf20e28e0a1f4455c4e9fd094a9948f74f86`.
- Pre-change backup `backup/pre-game-object-instrumentation-2026-11-19` → `9440dc05676e81516466c13b49f3d43a1e5f4a1b`; second pre-change backup `backup/pre-game-object-cache-bust-2026-11-19` → `4665e11f2a3a34eaef0a9fba2b252b1689f43ad1`.
- Post-test checkpoint `checkpoint/post-test-game-object-cache-bust-2026-11-19` → `d1da424e707b44a370b6e42567766ddfac414f2b`; pre-release checkpoint `checkpoint/pre-release-game-object-cache-bust-2026-11-19` → final merge SHA `a814cf20e28e0a1f4455c4e9fd094a9948f74f86`.

### Separate acceptance states
- Implementation: **MERGED**.
- Automated machine tests: **PASS** on the exact final merge SHA.
- Pages deployment identity: **CONFIRMED** by `pages_build_version` matching the final merge SHA.
- Direct HTTP/browser read-back: **NOT_TESTED** in this session.
- Human QA: **PENDING**; Issue #210 remains open and the original failed report remains authoritative.
- Owner acceptance: **NOT GRANTED**.

The checked object-level items mean source/test evidence exists; they do not establish that the public demo works on the owner's physical devices.


## 2026-11-19 — Object hit-test, preview and touch-target correction

### Source-level defects corrected
- Public online rounds previously excluded the central 56% of the canvas even when no article/reading column was active, forcing targets into narrow side lanes.
- Mana's effective hit radius was only 12–14 CSS pixels, too small for reliable touch selection.
- Pointer hover and activation duplicated the distance check, and the pointer path did not draw an object-level preview ring.
- Raw viewport-rectangle offsets were used as canvas-local coordinates without scaling for a CSS-scaled canvas.

### Applied on the existing default line
- Target generation now uses the full playable canvas and excludes only the actual visible reading-column rectangle, converted into canvas-local coordinates.
- Added one shared CSS-pixel coordinate mapper and one hit-test resolver for both pointer preview and activation.
- Added a 22 CSS-pixel minimum hit radius while preserving the existing game-specific padding.
- Pointer hover now selects and visibly outlines the actual Bubble/Mana/Chaos object; keyboard preview remains separate.
- Updated the game script cache key to `nu-games.js?v=20261119-object-hit-test-r1`.

### Machine evidence
- Final source/test commit: `316682f021c05e40cbba1cd21d6f85916838e941`.
- Gateway/main-game: **73/73 PASS** — [run 44431199376](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44431199376).
- Focused Mana: **83/83 PASS**; full Generation 1: **343/343 PASS** — [run 44431199348](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44431199348).
- Studio export: **343/343 PASS** — [run 44431199378](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44431199378).
- Graphics preview: PASS — [run 44431199365](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44431199365).
- Pages deployment: SUCCESS — [run 44431198875](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44431198875); deploy payload records `pages_build_version=316682f021c05e40cbba1cd21d6f85916838e941`.

### Recovery and acceptance boundary
- PRE-CHANGE backup: `backup/pre-object-hit-test-touch-targets-2026-11-19` → `3558144e8aacaa7348d9944af04bb224030b1150`.
- Initial CI attempts exposed stale contract assertions for the old cache key and old hit-radius expression; those tests were updated to the new contract. Final exact-SHA runs above are green.
- Independent live-page HTTP/browser read-back was unavailable in this session: **NOT TESTED**.
- Physical-device QA: **PENDING**. Issue #210 remains open; owner acceptance is **NOT GRANTED**.

## 2026-11-19 — Owner confirmation: gameplay input restored

- [x] Owner-confirmed interaction recovery for the reported direct touch, physical mouse/click and simulated-mouse paths.
- [x] Preserve the active game-stage and canvas pointer-event rules in nu-world.css.
- [x] Preserve touch-action:none on the active game canvas so touch is handled by the game rather than page scrolling.
- [x] Preserve the CSS cache-bust reference in index.html and the focused regression assertion.
- [ ] Gamepad and keyboard-emulated controller remain separate QA items; owner confirmation above does not imply they were tested.
- [ ] Other unrelated interaction routes remain governed by their own test/acceptance records.

**Protected contract:** see the owner-confirmed acceptance and protected input contract in INTERACTION-GAME-OBJECT-PRODUCERS-CHANGE-RECORD-2026-11-19.md. Do not remove or override the gameplay input CSS rules without an explicit focused change request, a regression test and verification of direct touch, physical mouse/click and simulated mouse.