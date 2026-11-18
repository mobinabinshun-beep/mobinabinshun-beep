# N.U Gateway & simulated-mouse controller contract — 2026-11-17

**Status:** PRIOR BASELINE IMPLEMENTED · OWNER-REOPENED FOR SCOPED 2026-11-18 CANDIDATE · NEW CANDIDATE MACHINE-QA-PENDING · HUMAN-QA-PENDING  
**Scope:** Gateway behavior and the shared launcher-core controller pointer adapter  
**Supersedes:** conflicting earlier descriptions of nested Back history or direct Gamepad option execution  
**Protected boundary:** Classic LV / XP / Mana HUD is untouched and remains locked.

## 1. Development speed is a binding requirement

- No avoidable process, duplicate approval, exhaustive repository census, repeated research, or documentation ceremony may block an authorized scoped task.
- Contributors inspect the affected files and demonstrated dependencies first. Broader repository search is required only when the change crosses repository boundaries, shared interfaces/data, security/privacy, or there is evidence of an existing parallel implementation.
- A gap that does not affect safe correctness is recorded and work proceeds. A material unknown is isolated; independent work continues.
- No contributor may use process wording as a reason to stall a task when a smaller sufficient check exists.
- Preserve tests, safety, security, backups and owner acceptance; optimize how they are achieved, not whether they exist.

## 2. No unilateral return to an older version

- Newer explicit owner decisions and accepted behavior take precedence over older notes and historical implementations.
- No self-directed rollback, downgrade, removal of newer behavior, or silent restoration of a previous version.
- Prefer a forward correction. Rollback is an emergency containment action only for a demonstrated critical regression, against a verified checkpoint, with exact scope/reason/evidence recorded and the owner notified.
- Historical behavior is retained as history/reference, not silently reactivated.

## 3. Gateway control model

### Selective actions
- Menu / List
- Back / Home / Main page
- Profile

### Operational action
- Pause is applied immediately when Gateway opens. The active game round and background renderers freeze before Gateway options can be used.
- Pause exists only as a Gateway-owned operation; there is no independent/manual pause control or player-overlay pause owner.
- Opening Gateway freezes the active round and background rendering before its options can be used.
- Closing Gateway does **not** resume gameplay. The round and ambient renderers remain frozen until the first real gameplay-space interaction (mouse/touch press, gameplay keyboard input, or a fresh controller direction/confirm transition). The first controller state observed after close is only a baseline; an input held through Gateway closure cannot release the hold. That first fresh input releases the Gateway-return hold; ordinary interaction then proceeds.
- Gateway is the exclusive surface for the actions it provides; redundant page-level controls for those same actions are removed only on pages where Gateway is mounted.
- Reload is not a Gateway action and is never automatic on page entry. A future module-specific exception requires an explicit owner decision.

### Exit semantics
- Exit = Back = Home = main/home page.
- Do not route Gateway Back through a nested page-history stack. Utility-page Exit navigates to the main page.
- This does not remove distinct page tabs, destinations, or actions that Gateway does not provide.

### Placement
- Home and Library remain outside the Gateway mount scope.
- In game views, Gateway exposes Back/Home, Menu and Profile.
- Do not add Reload.

## 4. Input classification

Classify by the mechanism that moves/activates the pointer, not by cursor artwork:

| Input | Classification | Behavior |
|---|---|---|
| Physical mouse movement | Direct mouse | Native hover/click behavior |
| Touch | Direct touch | Native touch action; suppress synthetic duplicate click |
| Controller D-pad / directional stick | Simulated mouse | Moves a virtual pointer in discrete steps; movement only highlights |
| Controller confirm / Enter | Simulated mouse confirmation | Separate click at the virtual pointer location |
| Controller cancel / B | Gateway cancel | Escape-equivalent close/cancel while Gateway is open |

## 5. Shared launcher-core adapter

The shared adapter file is `nu-controller-pointer.js`. It exposes `window.NUControllerPointer.create()` and a capability declaration. The Gateway enables it only while Gateway is open; it is not a second per-game controller implementation.

- D-pad buttons 12–15 and left-stick axes move the virtual pointer.
- Directional movement updates the highlighted target only. It must never activate a target.
- Button A performs the separate click. Enter remains the keyboard confirmation equivalent.
- Button B closes/cancels Gateway.
- Physical mouse and touch remain native and are not reclassified.
- Future controller types/modules should integrate by consuming the shared adapter/capabilities rather than copying polling, cursor and confirmation logic.
- The adapter is extensible; future module integrations must document their controller mapping and avoid competing polling loops.

## 6. Acceptance checks

1. Opening Gateway freezes an active round and all designated background renderers before options are actionable.
2. Closing Gateway keeps the round frozen until the first real gameplay-space input; that input resumes the round.
3. Gateway does not expose Reload and does not auto-reload on entry.
4. Duplicate Back/Pause controls are absent only where Gateway provides the equivalent action.
5. Gateway Exit from game and utility views reaches the main/home page.
6. Physical mouse hover and touch activation remain direct.
7. Controller directional input moves the virtual cursor and highlights only; no action fires from movement.
8. Controller A / keyboard Enter fires one click; controller B / Escape cancels Gateway.
9. The adapter is loaded before Gateway on both the main demo and launcher page.
10. The locked classic resource HUD and unrelated gameplay/economy behavior remain unchanged.

## 7. Release evidence

This file is the normative owner-directed contract. The following implementation evidence is recorded:

- Pull request: [#180](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/180) — merged by squash.
- Merge commit: `45803b784f7b10bacc1081644fe0895fc8c382af`.
- Tested candidate: `42237a379e37b923697f056eaac58d9b04d5295a`.
- Verified recovery branch: `backup/pre-gateway-simulated-mouse-2026-11-17`, identical to the tested candidate (0 ahead / 0 behind).
- GitHub Actions: Gateway main-game regression #351 PASS; Studio export regression #1034 PASS; Generation 1 HUD layout #372 PASS; graphics preview smoke #1089 PASS; graphics integrity #655 PASS; Exchange regression #231 PASS; Wallet/Profile regression #382 PASS.
- Public demo deployment and live build identity: **UNVERIFIED**. The repository source is merged and the public URL is available, but the live site could not be independently fetched/identified in this session.
- Follow-up owner directive and implementation: [PR #181](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/181), merged as `49e354472227d3b3d65148c012614d9545a20e96`.
- Controller edge safeguard and regression coverage: [PR #182](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/182), merged as `a72ca06ae166d95d35d80064f609f136c11a5ab8`; runtime edge fix is in `110162fd2f107931e8ef1837ae9e4bc457cf5ff0`.
- Verified recovery branches: `backup/pre-gateway-exclusive-pause-2026-11-17` (initial candidate) and `backup/gateway-exclusive-pause-final-2026-11-17` (final merged state `a72ca06ae166d95d35d80064f609f136c11a5ab8`).
- Follow-up CI on candidate `072b9e9`: Gateway main-game regression PASS; Studio export regression PASS; Exchange feature regression PASS; Generation 1 HUD layout PASS; graphics preview smoke PASS.
- PR #182 final edge-coverage CI: Gateway main-game regression PASS; Studio export regression PASS; graphics preview smoke PASS.
- Public Pages deployment/live browser build identity: **UNVERIFIED** in this session; the default branch now points to the merge commit, but the public URL could not be independently loaded.
- Human desktop/mobile QA: pending. The owner directly updated and reaffirmed this Gateway/controller scope; the resulting behavior is locked again in [LOCKED-AREAS.md](./LOCKED-AREAS.md).

The exact prior version is not to be restored unilaterally; future corrections must preserve this contract unless the owner explicitly changes it.


## 8. Owner amendment — directional simulated-mouse Gateway and two-stage approval (2026-11-18)

This section is the newer owner instruction and supersedes conflicting input/exit behavior above only for the 2026-11-18 candidate. Historical PR #180–#182 evidence remains unchanged.

### Gateway entry and pause ordering
- Direct physical mouse and touch enter after a 500 ms dwell/tolerance.
- Simulated mouse entry uses a 1000 ms dwell.
- The Gateway-open event is dispatched before the Gateway becomes visible/actionable, so active gameplay and designated background renderers freeze first.
- Pause remains Gateway-exclusive. Reload is absent and never automatic on page entry unless a future explicit module-specific owner instruction changes that rule.
- Closing Gateway does not resume gameplay. The round and renderers remain frozen until the first real gameplay-space interaction, using the existing fresh-input safeguards.

### Simulated mouse while Gateway is open
- A connected controller activates the shared virtual pointer adapter. The virtual pointer moves normally outside Gateway.
- When the virtual pointer enters the Gateway trigger zone, the 1000 ms dwell opens Gateway.
- While Gateway is open, the virtual pointer is visually behind the Gateway and remains at its trigger location. Up/Down input navigates the ordered options; movement does not activate an option.
- One additional Down after the final option exits Gateway without selecting an option. Holding Down repeats the same progression and can exit without a separate confirmation.
- A/Enter confirms the highlighted option. B/Escape remains a cancel/close route.
- On directional exit, the virtual pointer remains enabled at the trigger. It must first leave the trigger hit-zone and then re-enter before the next Gateway opening can occur.
- The physical pointer and touch remain native direct inputs. Physical mouse and touch do not become simulated-mouse input.

### Approval lifecycle
- The prior Gateway/controller scope is explicitly reopened only for this owner-directed amendment.
- Candidate branch: `feat/gateway-directional-exit-human-qa-lock-2026-11-18`.
- Candidate files: `nu-hex-gateway.js`, `nu-controller-pointer.js`, `nu-hex-gateway.css`, `tests/nu-gateway-controller-input.test.js`, `.github/workflows/gateway-main-game.yml`, and this contract.
- Current status at document authoring: implementation exists on candidate branch; automated workflow has not yet reported; backup, deployment, and live build verification are not yet claimed.
- After automated checks pass, freeze the exact candidate commit as `MACHINE-APPROVED-LOCKED` and place it in `HUMAN-QA-PENDING`. No automated edits may alter that frozen commit or its locked scope.
- Only a human test report or explicit owner reopening may generate a successor candidate. Every correction repeats machine tests and creates a new exact machine-approval lock.
- Machine approval never implies human acceptance or production promotion.

### Acceptance checks for this amendment
1. Direct mouse and touch dwell thresholds are 500 ms; simulated-pointer threshold is 1000 ms.
2. Gateway-open pause event runs before Gateway options are exposed.
3. Connected gamepad activates the shared simulated pointer without per-page polling forks.
4. Simulated pointer enters Gateway and opens it after the 1000 ms threshold.
5. In Gateway, Up/Down navigates options and A/Enter confirms the selected option.
6. One additional Down after the final option closes Gateway without activation; held Down can perform the repeated traversal.
7. After directional exit, the pointer remains active at the trigger; leaving and re-entering is required to reopen.
8. Gameplay remains frozen after Gateway closes until the first real gameplay-space interaction.
9. Existing duplicate-control removal, Home/Back equivalence, Reload exclusion, and classic HUD lock remain intact.
10. No unrelated game, wallet, economy, or protected HUD behavior changes.

### Machine and human status
- Automated QA: `PENDING` — workflow is configured to include `nu-controller-pointer.js` syntax and Gateway regression tests.
- Backup: `PENDING`.
- Public demo deployment / exact live build: `PENDING`.
- Human QA: `PENDING`.
- Owner acceptance / final scope lock: `PENDING`.

