# Change Record — Generation 1 game-object interaction producers and cache-safe deployment

- Date: 2026-11-19
- Related issue: [#210 — Unified input translators and interaction core](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/210)
- Scope: additive diagnostics for Bubble Hunt, Mana Collector and Chaos Attack; browser cache-key correction for the changed game runtime.
- Status: IMPLEMENTATION_MERGED · AUTOMATED_TESTS_PASS · PAGES_BUILD_ID_CONFIRMED · DIRECT_HTTP_READBACK_NOT_TESTED · HUMAN_QA_PENDING · OWNER_ACCEPTANCE_NOT_GRANTED

## 1. Before state / reproduction

The shared `NUInteractionCore` and input translators existed, but canvas game objects were internal JavaScript objects rather than DOM nodes. The game loop already performed canvas hit-testing, yet the object-level lifecycle and result path did not publish stable, correlated interaction records. This left a gap between platform pointer observation and game-domain outcomes.

The original Issue #210 report remains authoritative: «هنوز اینترکشن صورت نمی‌گیرد.» This change does not rewrite or invalidate that failed human observation.

## 2. Root cause

- DOM-level observers can identify the canvas but cannot infer which Bubble, Mana orb or Chaos mass was targeted.
- The game-specific `interact` handler and Chaos resolution functions owned the actual action, but did not emit object-specific identity/action/outcome records.
- The `nu-games.js` asset URL in `index.html` retained the prior cache key after the runtime source changed. A successful Pages build alone therefore did not guarantee browsers would request the new script.

## 3. Implementation

### PR #219 — object-level producers

- PR: https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/219
- Candidate SHA: `e8d207edd73083be578d7d301e07cbc1e474671a`
- Merge SHA: `4665e11f2a3a34eaef0a9fba2b252b1689f43ad1`
- Files: `nu-games.js`, `tests/nu-interaction-core.test.js`
- Added a fail-safe `recordGameObjectEvent` producer with `gameId`, `waveId`, `objectType`, `objectId`, `action`, `source` and `outcome`.
- Preserved source distinction for keyboard, direct touch, physical mouse and simulated mouse.
- Added spawn/replacement, hover/target, hit/miss, activation, Bubble pop/XP result, Mana collection/delta, N-BI fire, Chaos collision/resolution and despawn records.
- Diagnostic failures are caught and cannot block the game action.
- The protected classic LV/XP/Mana HUD, wallet arithmetic, Gateway ownership and Generation 2 scope were not changed.

### PR #220 — cache-safe runtime delivery

- PR: https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/220
- Candidate SHA: `d1da424e707b44a370b6e42567766ddfac414f2b`
- Merge SHA: `a814cf20e28e0a1f4455c4e9fd094a9948f74f86`
- Files: `index.html`, `tests/nu-controller-pointer.test.js`
- Updated the game runtime URL to `nu-games.js?v=20261119-game-object-events-r1`.
- Added an assertion for the exact cache-busted asset reference.

## 4. Automated tests

- Candidate Gateway/main-game regression: **71/71 PASS**, 0 failures — [run 44427546540](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427546540).
- Final deployed-SHA Gateway/main-game regression: **71/71 PASS**, 0 failures — [run 44427652450](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652450).
- Final deployed-SHA full Generation 1 suite: **341/341 PASS**, 0 failures — [run 44427652536](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652536).
- Studio export regression: PASS — [run 44427652401](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652401).
- Graphics preview/static validation: PASS — [run 44427652390](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652390).
- Graphics integrity: PASS — [run 44427652309](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652309).

## 5. Backup and restore

### PR #219
- PRE-CHANGE baseline: `9440dc05676e81516466c13b49f3d43a1e5f4a1b`.
- Verified ref: `backup/pre-game-object-instrumentation-2026-11-19`.
- Post-test candidate checkpoint: `checkpoint/machine-approved-game-object-instrumentation-2026-11-19` → `e8d207edd73083be578d7d301e07cbc1e474671a`. The ref name is historical; this checkpoint alone does not imply deployment or human acceptance.

### PR #220
- PRE-CHANGE baseline: `4665e11f2a3a34eaef0a9fba2b252b1689f43ad1`.
- Verified ref: `backup/pre-game-object-cache-bust-2026-11-19`.
- Post-test checkpoint: `checkpoint/post-test-game-object-cache-bust-2026-11-19` → `d1da424e707b44a370b6e42567766ddfac414f2b`.
- Pre-release checkpoint: `checkpoint/pre-release-game-object-cache-bust-2026-11-19` → `a814cf20e28e0a1f4455c4e9fd094a9948f74f86`.

## 6. Deployment and live identity

- Pages run: [44427652015](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652015) — SUCCESS.
- Deployment log explicitly records `pages_build_version=a814cf20e28e0a1f4455c4e9fd094a9948f74f86`, exactly matching the final merge commit.
- Public environment URL: https://mobinabinshun-beep.github.io/mobinabinshun-beep/
- Direct HTTP/browser read-back of the public page was unavailable in this session. Therefore deployment identity is CONFIRMED by the Pages payload; independent live-response/cache-delivery smoke is NOT_TESTED.

## 7. Human QA / owner acceptance

- Human QA: PENDING.
- Original failed report: preserved in Issue #210.
- Required next check: owner retests this exact deployed build on physical touch, physical mouse, keyboard-emulated controller and Gamepad, and verifies target preview versus activation, one input/one execution, Gateway pause/re-entry and game-object action outcomes.
- If any behavior fails, keep Issue #210 open, attach `nu-interaction-debug/v1` JSON and reproduction steps, and create a scoped successor correction without overwriting this record.
- Owner acceptance: NOT GRANTED.

## 8. Remaining work

- Full simulated pointer coordinates → hit-test → dispatched event → game handler → outcome trace.
- Gateway open/pause/focus/confirm/exit/re-entry correlated trace.
- Platform lifecycle producers for tabs, links, dialogs, focus, drag/drop and scroll controls.
- Full XP/score/wallet transaction, Mana capsule/charge and round-outcome correlation.
- Real-device human QA and independent live-page smoke.
- The 25-repository content audit remains PARTIAL; the 918-entry tree snapshot is not evidence that every file has been read.


## 9. 2026-11-19 — Object hit-test, preview and touch-target correction

### Confirmed source-level defects
- The online build constrained target generation to the left/right 22% lanes even when the article/reading column was not active.
- Mana objects had a 12–14 CSS-pixel hit radius, unsuitable for reliable touch selection.
- Hover preview and activation each implemented their own hit-test; the pointer path did not render an object-level preview ring.
- Event coordinates were converted by subtracting the canvas rectangle origin but did not account for CSS scaling.

### Implementation
- Source: `nu-games.js`; public cache reference: `index.html`; contracts: `tests/nu-interaction-core.test.js`, `tests/nu-bubble-round.test.js`, `tests/nu-controller-pointer.test.js`.
- Target generation now uses the full canvas unless a real reading-column rectangle overlaps it; that rectangle is translated into canvas-local coordinates.
- Added `gamePointFromEvent` for CSS-pixel coordinate normalization and `hitTestGameTarget` as the shared resolver for preview and activation.
- Added a 22 CSS-pixel minimum hit radius (existing per-game padding remains).
- Added pointer-target highlight rendering, independent from keyboard-target rendering.
- Cache key: `nu-games.js?v=20261119-object-hit-test-r1`.
- Final commit: `316682f021c05e40cbba1cd21d6f85916838e941`.

### Machine validation / deployment
- Gateway/main-game: **73/73 PASS** — [run 44431199376](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44431199376).
- Mana focused: **83/83 PASS**; Generation 1 full suite: **343/343 PASS** — [run 44431199348](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44431199348).
- Studio export: **343/343 PASS** — [run 44431199378](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44431199378).
- Graphics preview: PASS — [run 44431199365](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44431199365).
- Pages deployment: SUCCESS — [run 44431198875](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44431198875), with `pages_build_version` equal to the final commit.

### Recovery and acceptance
- Pre-change backup: `backup/pre-object-hit-test-touch-targets-2026-11-19` → `3558144e8aacaa7348d9944af04bb224030b1150`.
- Initial test runs failed only on outdated assertions for the previous hit-radius expression/cache key; test contracts were updated and final runs passed.
- Direct live-page read-back: **NOT TESTED** in this session.
- Human QA: **PENDING**; Issue #210 remains open; owner acceptance: **NOT GRANTED**.


## 10. 2026-11-19 — Gameplay input surface restored after owner report

### Confirmed root cause
- The active full-screen game layer and its canvas were both assigned `pointer-events:none` by later CSS overrides. The game runtime listens for pointer events whose target is inside `#game-canvas`; with pointer events disabled, the events targeted elements behind the game and the runtime's `closest("#game-canvas")` / `canvas.contains(event.target)` guards rejected them. This explains why the previous hit-radius and hit-test changes did not restore actual play.

### Forward correction
- `nu-world.css`: explicitly restore `pointer-events:auto` on the active game stage and canvas; set `touch-action:none` on the canvas so touch taps are not converted into page scrolling.
- `index.html`: cache-bust stylesheet to `nu-world.css?v=20261119-gameplay-input-r2`.
- `tests/nu-interaction-core.test.js`: add a regression contract that verifies the active game surface receives pointer/touch input and the new stylesheet cache key is loaded.
- Protected HUD layout and markup were not changed.

### Exact commits and machine checks
- CSS fix: `11ee406faceb10206a1e40d6def98baabc98c9c2`.
- Cache reference: `40d076ff2b7da9901682f6423c054ebdeaef2e2d`.
- Regression test and final candidate: `912034e18fb5137baa6b25c755eb30696e68e16f`.
- Gateway/main-game: **74/74 PASS** — [run 44432348286](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44432348286).
- Focused Mana: **83/83 PASS**; full Generation 1: **344/344 PASS** — [run 44432348258](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44432348258).
- Studio export: **344/344 PASS** — [run 44432348256](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44432348256).
- Graphics preview: PASS — [run 44432348101](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44432348101).
- Pages deployment: SUCCESS — [run 44432347903](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44432347903).

### Acceptance boundary
- This correction addresses the confirmed input-routing blocker; it is not evidence of a physical-device play test.
- Direct public-page browser read-back and physical mouse/touch/gamepad QA remain **PENDING**. Issue #210 remains open and owner acceptance is not granted.


## 2026-11-19 — Owner-directed rollback and gameplay input recovery

- Owner reported that physical touch, physical mouse/click and simulated mouse still did not interact with game objects, and explicitly instructed rollback of the previous hit-test attempt.
- Restored nu-games.js, the game script cache reference, and the three directly related test files to their exact blobs on backup/pre-object-hit-test-touch-targets-2026-11-19 (3558144e8aacaa7348d9944af04bb224030b1150). The pointer-target preview, shared 22px hit-test and full-canvas target-generation attempt are no longer present in nu-games.js.
- Compared the default line against the pre-change checkpoint. The only remaining functional code delta is the six-line nu-world.css input-surface correction: the active game stage and canvas receive pointer events. This is retained because it fixes the actual event-routing failure: with pointer-events:none, browser pointer/touch events never reach the canvas handlers. The CSS cache key is explicitly bumped to 20261119-gameplay-input-r3.
- Added a focused regression assertion for the active canvas pointer-event rules and cache key.
- Added mandatory repository-wide explicit-scope rules to AGENTS.md and the detailed anti-destruction protocol at docs/operations/ANTI-DESTRUCTION-EXPLICIT-SCOPE-PROTOCOL-2026-11-19.md.
- Verified by reading back the restored file blobs and comparing the default line with the checkpoint. Automated workflow status for the final rollback/protocol commit is not yet available in this record; physical-device QA remains pending.
- Scope boundary: no other games, wallet, HUD, controller adapter, launcher, studio, account, storage or unrelated features were changed by this rollback.

## 2026-11-19 — Owner-confirmed gameplay interaction acceptance and protected input contract

### Human acceptance
- The owner explicitly confirmed in chat: "عمل کرد تعاملی و اینترکشن درست شد" (it worked; interaction/gameplay is fixed).
- This supersedes the earlier PENDING / NOT GRANTED statements above for the reported gameplay interaction defect. Those earlier statements remain as historical status at the time they were written.
- Owner confirmation covers the previously reported working interaction path: direct touch, physical mouse/click and simulated mouse. No separate Gamepad acceptance is implied.

### Protected implementation contract — do not casually modify
- nu-world.css must retain #game-view.active .game-stage{pointer-events:auto}.
- nu-world.css must retain #game-view.active .game-stage canvas{pointer-events:auto;touch-action:none}.
- index.html must load nu-world.css?v=20261119-gameplay-input-r3 (or a newer key only when the CSS asset itself is intentionally changed).
- The CSS rule is not cosmetic: it routes browser pointer/touch events to the active game canvas. Removing or overriding it makes the runtime's canvas-target checks reject the events and breaks play.
- The HUD remains independently non-interactive where designed. Do not "fix" gameplay by globally enabling pointer events or changing HUD layers.
- Any proposed change to these exact selectors, canvas touch-action, game-stage stacking/pointer routing, or the stylesheet cache key must first reproduce the intended behavior in a focused test and be reviewed as an explicit gameplay-input change. Preserve direct mouse, touch, click and simulated-mouse paths.
- No broad CSS cleanup, z-index rewrite, pointer-event normalization, controller refactor or unrelated game changes are authorized by this record.

### Evidence and state
- The owner performed the real-world retest and confirmed interaction works. This is human acceptance for the reported input defect, not merely a machine-test claim.
- The focused regression guard is in tests/nu-interaction-core.test.js.
- This acceptance record does not claim separate Gamepad QA or acceptance of unrelated interaction subsystems.