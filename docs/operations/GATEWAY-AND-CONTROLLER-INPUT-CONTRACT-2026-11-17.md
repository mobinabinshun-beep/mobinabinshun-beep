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



## 9. Human finding — keyboard-emulated click-controller pointer bridge (2026-11-18)

The 2026-11-18 human report states that the hierarchical Gateway options respond to directional input but the simulated pointer does not move. Inspection of the previous candidate showed that its runtime test dispatched synthetic custom events directly; it did not exercise a real keydown path. The shared adapter listened for custom directional events and Gamepad API polling, but ordinary arrow-key events were still consumed by the Generation 1 game-target keyboard handler.

The successor candidate adds a capture-phase keyboard bridge in `nu-controller-pointer.js`:
- Outside Gateway, ArrowUp/Down/Left/Right start the simulated pointer if needed and move it one discrete step.
- Enter, Space, and NumpadEnter perform the separate click at the virtual pointer.
- The bridge ignores modified/repeated key events.
- While Gateway navigation is active, the bridge yields all direction and confirmation keys to Gateway. The Gateway's hierarchical selection, extra-Down exit, and pause behavior are not rewritten.
- The bridge runs in the shared adapter, not as per-page controller code.

Regression coverage now includes actual keydown-shaped input without a connected Gamepad API device and verifies that Gateway retains exclusive ownership while open. This corrects the earlier test gap: synthetic custom-event coverage alone was insufficient evidence for keyboard-emulated click-controller behavior.

**Successor branch:** `fix/gateway-real-keyboard-pointer-bridge-2026-11-18`  
**Approval state at authoring:** implementation candidate; CI and exact-SHA machine approval pending. The previous frozen candidate `96b549d0f53fc0f69cc1ea2494250196cef6f87d` remains unchanged. Live-device human QA is still required after CI.


## 10. Owner amendment — utility-page exclusivity and Profile/Wallet navigation (2026-11-18)

- Wherever Gateway is mounted on a game or utility page, the independent Menu opener and duplicate Profile entry are suppressed; redundant Home/Back controls are removed when Gateway or the existing Bag destination shortcuts provide the route.
- Bag remains the parent of Wallet and Inventory. Wallet keeps its Bag/Inventory destination shortcuts and its own section tabs.
- Player Profile is reached through Wallet and remains a Wallet subview. The Profile view exposes persistent Wallet section tabs: Profile, Wallet/Balances, Transactions, Health and MHL. Choosing a Wallet section returns to Wallet without creating a duplicate history entry; closing Profile returns to the exact prior Wallet view.
- Do not create a parallel Profile page, wallet store, or identity record. The existing player identity and shared Wallet remain the single source of truth.
- The Profile page has no independent Home/Back button beside Gateway. Bag/Inventory/Wallet navigation uses explicit destination tabs, not duplicate Back controls.

### Acceptance checks
1. On every Gateway-mounted utility page, independent Menu/Profile/Home controls that duplicate Gateway are absent.
2. Bag → Wallet → Profile works; Profile exposes Wallet/Balances, Transactions, Health and MHL destinations.
3. Returning from Profile to Wallet preserves the selected Wallet section and the parent Bag return path.
4. Profile opened from Gateway can navigate to Wallet and close back to the originating game view without a broken history stack.
5. Wallet, Profile and Inventory continue to read the existing shared save; no parallel identity or balance store is created.
6. Keyboard focus, touch targets and responsive layouts remain usable.

**Successor candidate:** `fix/gateway-pointer-bridge-successor-2026-11-18` · **Status:** `MACHINE-QA-PENDING` · Human QA and public demo deployment remain pending.


## 2026-11-18 owner report — simulated pointer interaction remains unverified
**Human QA status: FAILED / REOPENED.** The owner reports that the simulated-mouse arrow still does not move/interact, while Gateway options do navigate selectively. The previous machine test pass is not evidence of real-device interaction.

### Forward correction
- The shared adapter now dispatches `pointermove` and `mousemove` to the element under the virtual pointer, so canvas aiming and pointer-aware game controls receive movement rather than only a CSS target outline.
- Keyboard-emulated direction keydown starts the adapter directly even when no Gamepad API device exists; Gateway keeps exclusive ownership of those keys while open. Physical mouse input remains direct and does not force-enable simulated mode.
- Repeated keydown direction events are accepted, allowing held directional input to continue moving the pointer.
- All four mounted pages use the new cache key `20261118-interaction-r7`.

These code changes are a hypothesis-driven correction, not a claim of successful live interaction. The relevant runtime tests must pass and the updated demo must be exercised with the owner's actual controller before human acceptance.


## 11. Owner amendment — shared interaction core and independent translators (2026-11-19)

The shared translator architecture and debug retention rules are normative in [INTERACTION-CORE-AND-DEBUG-PROTOCOL-2026-11-19.md](./INTERACTION-CORE-AND-DEBUG-PROTOCOL-2026-11-19.md).

- Direct touch, direct physical mouse, selective/action translation and simulated mouse are independent source translators.
- All translators publish normalized semantic events through `NUInteractionCore`; existing page/game handlers remain action owners until separately migrated.
- Movement/highlight, hierarchy navigation, selection, confirmation, activation and execution are distinct stages.
- Gateway retains exclusive ownership of its option hierarchy and pause/return lifecycle.
- Debug scope includes all platform controls and game objects: bubbles, Mana particles/orbs, Chaos masses/clusters, their lifecycle, targeting, collision/effect and outcome.
- Human findings and exported debug reports must be retained as linked issue/change-record evidence; never overwrite a failed original report.

### Implementation record
- Core module: `nu-interaction-core.js`; loaded before the pointer and Gateway adapters on `index.html`, `launcher.html`, `casino.html` and `pixel-art-studio.html`.
- Focused regression test: `tests/nu-interaction-core.test.js`.
- Gateway workflow now includes core syntax and focused test execution.
- The first implementation provides independent translator declarations, normalized event observation and a bounded JSON debug export. Full object-level producer instrumentation and runtime/CI execution remain pending; this amendment does not claim machine approval or human acceptance.


## 12. Binding owner amendment — Gateway and virtual mouse are independent (2026-11-21)

**Authority:** explicit owner instruction dated 2026-11-21.  
**Precedence:** This amendment supersedes any conflicting earlier wording in sections 4–6 and 8–9 that makes the simulated mouse move through, own, or navigate Gateway options. Earlier implementation records remain historical evidence; they are not permission to preserve the conflicting behavior.  
**Scope:** Gateway input behavior and the activation boundary of the existing shared virtual-mouse adapter. This is a contract correction, not authorization for runtime changes in this documentation change.

### 12.1 Hard ownership boundary

- The simulated/virtual mouse is a controller-to-pointer translator for gameplay screens and games that require pointer/mouse interaction. It is not a Gateway controller and must not be repurposed as one.
- Enable/use the virtual mouse only while the user is in a game screen whose gameplay requires mouse interaction. Do not activate it globally, on ordinary pages, or merely because Gateway exists.
- Gateway must not start, stop, enable, disable, reposition, reset, or otherwise take ownership of the virtual-mouse adapter.
- The virtual mouse may enter the Gateway trigger zone to open Gateway. Once Gateway opens, the virtual pointer stays at its gameplay position and is frozen there; it does not travel over Gateway options or become a Gateway cursor.
- Gateway directional option navigation is a separate selective-action path. It consumes controller Up/Down and confirm/cancel input without moving the virtual pointer.
- Keep direct physical mouse, direct touch, selective Gateway actions, and simulated mouse as separate translators. Do not merge their state machines or infer one source from another.

### 12.2 Touch, physical mouse and Gateway opening

- While the active game interaction surface is in use, prevent page scrolling caused by touch; preserve direct touch delivery to the game and Gateway. Do not change the protected canvas routing or touch-action rules as an incidental part of Gateway work.
- Touch contact in the Gateway trigger zone opens Gateway. After it opens, the user may lift their finger and then selectively tap any Gateway option.
- Physical mouse movement into the Gateway trigger zone opens Gateway. While it is open, moving the physical pointer over an option activates that option directly; a physical click remains an additional direct activation path.
- Preserve the currently owner-approved trigger dwell/cancellation thresholds and synthetic-click suppression. Do not silently invent, remove, or alter timing thresholds as part of this ownership correction.
- Gateway opening must dispatch its pause/freeze event before its options become visible or actionable.

### 12.3 Gateway option behavior by input source

**Direct touch**
- After opening, the finger may be lifted; options remain available for separate, selective taps.
- A tap on an option selects/activates that option once. Do not require the opening touch to remain held.
- If the same touch remains down and moves out of the combined Gateway trigger/options interaction zone without entering an option, close Gateway.
- Alternatively, the user may lift the finger and tap outside the Gateway trigger/options interaction zone; close Gateway.
- Both exit paths leave gameplay and ambient rendering frozen. The game waits for the first fresh gameplay interaction before continuing.

**Physical mouse**
- Moving the pointer out of the Gateway trigger/options interaction zone closes Gateway; gameplay remains frozen pending the first fresh gameplay interaction.
- Clicking/selecting outside that interaction zone also closes Gateway with the same frozen-until-next-input behavior.
- Pointer movement over an option activates it directly; click remains available. Do not require a separate selection stage for physical mouse hover activation.

**Simulated/virtual mouse (controller)**
- On entry to Gateway, leave the virtual pointer at its current game-space position and freeze its coordinates. Do not route its cursor, hit-test target, pointermove, or mousemove across Gateway options.
- Gateway options are traversed through the controller's separate Up/Down selection controls. Each discrete press advances exactly one option (selective/step mode).
- A sustained Up/Down hold repeats traversal continuously through options (continuous/hold mode). Repetition must be deterministic and must not create accidental duplicate confirms.
- Selection/highlight and confirmation/activation remain distinct: directional traversal selects; the existing confirm action activates the selected option. Do not turn pointer movement into a click.
- Moving Down past the final option closes Gateway without selecting an extra item. This exit works both by repeated one-step presses and by continuous hold through the options.
- After Gateway closes, keep gameplay frozen until the first fresh gameplay-space interaction. A direction/confirm input held through closure must not count as that fresh interaction.

### 12.4 Return-to-game invariant

Every Gateway exit path above returns to the same game context and preserves its state. Closing Gateway is not itself a gameplay input and must not resume the round. The game and ambient renderers remain frozen until the first new, intentional interaction in the gameplay area. Existing pause ownership and held-input safeguards remain in force.

### 12.5 Explicit non-goals and forbidden cross-effects

- Do not change the virtual mouse's in-game movement, pointer hit-testing, target highlight, pointer/mouse event delivery, confirm behavior, activation, or per-game availability while implementing Gateway behavior.
- Do not let Gateway consume the virtual pointer's movement events or move the virtual cursor into the Gateway DOM.
- Do not let the virtual mouse own Gateway option navigation, trigger a global pointer mode, or become active on non-game screens.
- Do not alter game rules, object interaction, HUD, economy, Wallet, save data, page navigation outside Gateway, or unrelated input translators.
- Do not change the approved touch/canvas routing selectors or cache keys unless a separate explicit owner instruction names that exact gameplay-input scope.

### 12.6 Required regression matrix before any runtime implementation

1. Virtual mouse is enabled only on a mouse-required game screen; it is not enabled on unrelated pages.
2. In gameplay, controller directions move the virtual pointer and highlight targets; separate confirm activates the target.
3. Entering the Gateway trigger opens it without transferring virtual-pointer ownership to Gateway.
4. While Gateway is open, the virtual pointer remains at the exact game-space coordinates and emits no movement across Gateway options.
5. Gateway Up/Down one-press mode advances one option per press; held mode repeats through options without duplicate activation.
6. Down beyond the last option closes Gateway without selecting another item.
7. Touch opens Gateway; the opening finger can be lifted; each later option tap works selectively.
8. A continuing touch that exits the Gateway interaction zone closes Gateway; a later outside tap also closes it.
9. Physical mouse movement over options activates them; leaving the interaction zone or clicking outside closes Gateway.
10. Every exit leaves the game frozen until a fresh gameplay-area input; held controller input cannot resume it.
11. Page scrolling is prevented for the active game touch surface without breaking direct touch gameplay.
12. All three input sources remain independent; no Gateway test is allowed to require virtual-pointer movement through Gateway options.

A test that only checks source strings or dispatches synthetic custom events is insufficient for runtime behavior. Include behavior-level tests for pointer coordinates, event delivery, one-step/held navigation, touch exit, mouse exit, and fresh-input resume.

### 12.7 Current implementation status

This amendment records the owner's required behavior only. It does not claim that the current runtime implements it, that CI has passed it, that the live demo has been updated, or that human QA has passed. Any implementation must be a separately scoped successor candidate, with exact-head tests, verified backup, demo deployment and human QA under the repository lifecycle. Change record: [GATEWAY-VIRTUAL-MOUSE-BOUNDARY-AMENDMENT-2026-11-21.md](./GATEWAY-VIRTUAL-MOUSE-BOUNDARY-AMENDMENT-2026-11-21.md).
