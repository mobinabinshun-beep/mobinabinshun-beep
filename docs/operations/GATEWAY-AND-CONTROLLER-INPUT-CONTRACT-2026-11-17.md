# N.U Gateway & simulated-mouse controller contract — 2026-11-17

**Status:** OWNER-DIRECTED IMPLEMENTATION CANDIDATE — machine validation and human QA pending  
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
- Gateway releases only the pause it owns. A manual pause that existed before opening remains paused.
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
2. A pre-existing manual pause remains in force after Gateway closes.
3. Gateway does not expose Reload and does not auto-reload on entry.
4. Duplicate Back/Pause controls are absent only where Gateway provides the equivalent action.
5. Gateway Exit from game and utility views reaches the main/home page.
6. Physical mouse hover and touch activation remain direct.
7. Controller directional input moves the virtual cursor and highlights only; no action fires from movement.
8. Controller A / keyboard Enter fires one click; controller B / Escape cancels Gateway.
9. The adapter is loaded before Gateway on both the main demo and launcher page.
10. The locked classic resource HUD and unrelated gameplay/economy behavior remain unchanged.

## 7. Release evidence

This file records the normative owner-directed contract. It does not itself imply test pass, backup verification, deployment, human acceptance or a lock. Record those states separately in the dated implementation report. The exact prior version is not to be restored unilaterally; future corrections must preserve this contract unless the owner explicitly changes it.
