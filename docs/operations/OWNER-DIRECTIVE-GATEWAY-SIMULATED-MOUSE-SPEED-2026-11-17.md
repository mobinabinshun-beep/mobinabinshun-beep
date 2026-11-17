# Owner directive — Gateway contract, simulated mouse and speed-first development

**Date:** 2026-11-17  
**Authority:** Explicit owner instruction in the active project conversation  
**Status:** OWNER-DIRECTED SPECIFICATION — implementation and machine verification tracked separately  
**Scope:** Gateway behavior and Launcher Controller Core input abstraction. The classic LV/XP/Mana HUD remains locked and excluded.

## 1. Speed-first execution is mandatory

The project must not be slowed by unnecessary process, duplicated controls, parallel implementations, repetitive manual checks, stale conventions, or blanket repository-reading requirements unrelated to the risk of the change.

Contributors MUST:
- remove or automate friction that does not materially protect quality, security, compatibility, data integrity or owner authority;
- prefer the smallest safe extension of the current implementation;
- use focused automated tests and relevant regression checks instead of repeated ceremonial reviews;
- keep decisions and implementation evidence concise and discoverable;
- preserve the current approved baseline and all accepted behavior.

Contributors MUST NOT:
- invent process gates or demand unrelated approvals;
- clone an existing capability without demonstrating why reuse is unsuitable;
- revert to an older implementation, branch, interaction model or UI merely because it is easier;
- silently weaken or remove an owner-directed behavior;
- bypass relevant tests, backup, security, privacy, data-integrity protections or explicit scope locks in the name of speed.

If a requested change conflicts with an existing accepted behavior, first seek a compatible extension. Ask the owner only when a real, irreconcilable product decision remains. Rollback is reserved for a demonstrated critical regression and must use a verified recovery point with a recorded reason.

## 2. Gateway is the single control surface

On every mounted page/module where Gateway provides a function, Gateway is the exclusive UI control for that function. Remove duplicate or distracting page-level controls that perform the same action. Do not remove distinct destinations, tabs or actions Gateway does not provide.

### 2.1 Selective actions
- **Menu/List:** open the navigation menu/list.
- **Back/Home/Exit:** one semantic action and one destination — the main/home page. These labels are aliases, not separate navigation histories.
- **Profile:** open the player profile.

The Gateway Back/Home action must not silently restore an arbitrary nested previous page. If the owner later defines a module-specific exception, record it explicitly for that module; do not infer one.

### 2.2 Operational action — Pause
- Opening Gateway MUST synchronously request the freeze/pause of the active game and mounted background modules before Gateway options are made available for interaction or painted.
- Freeze includes game progression, game animation/render loops and nonessential background rendering. Gateway UI, foreground controls and accessibility feedback remain responsive.
- Gateway owns only the pause it creates. Closing Gateway may release only that owned pause. A game already paused/inactive before opening must remain paused/inactive.
- Closing Gateway must not create a click-through or accidental activation in the underlying page.
- Where the existing player-input contract requires resume-on-first-deliberate-input, preserve that contract; do not resume merely because a transient pointer event or Gateway dismissal occurred.

### 2.3 Reload
Reload is NOT a Gateway action and MUST NOT run automatically on entering a page or opening Gateway. A future module may define a specific exception only through an explicit, documented owner decision.

### 2.4 Placement and visibility
- Gateway replaces duplicate Pause and duplicate Back/Home controls wherever those actions are represented by Gateway.
- Home and Library remain outside Gateway scope unless explicitly added by a future owner directive.
- In gameplay, expose only the Gateway actions applicable to the game context (Back/Home, Menu/List and Profile); do not introduce unrelated reload or duplicate pause controls.

## 3. Input modality contract

Input modality is determined by the mechanism that moves/selects, not by the visual shape of a cursor.

- **Physical mouse:** native pointer movement and hover remain direct pointer input. Existing direct behavior is preserved.
- **Touch:** direct touch remains direct touch input. Existing direct behavior is preserved.
- **Gamepad navigation:** directional input moves selection/highlight; a separate confirm input activates.
- **Simulated mouse:** when a pointer/cursor is moved in discrete steps by directional button/key presses, it is simulated mouse input even if the UI draws a conventional mouse arrow.

## 4. Simulated mouse — Launcher Controller Core

Initial implementation scope is the **Launcher Controller Core / controller module**, not a broad rewrite of every page or every game.

### Required behavior
1. Four directional inputs (ArrowUp, ArrowDown, ArrowLeft, ArrowRight or equivalent mapped D-pad controls) move the simulated pointer in bounded, configurable steps.
2. The simulated pointer position is represented independently of the physical mouse pointer and can be rendered by the consuming module.
3. Movement changes pointer position or the current highlighted target only. It MUST NOT activate, click, select, submit, or execute the target.
4. A distinct confirm input — Enter by default, with a controller confirm button mapped through the same abstraction — activates the current target exactly once.
5. Cancel/Back returns from the selectable Gateway list to the game/input context without accidental activation.
6. While the Gateway selectable list is active, directional input changes only the highlighted Gateway option; confirmation is required to execute it.
7. When the selectable list is exited, simulated pointer/game input is restored to the active module.
8. Physical mouse and touch paths remain unchanged and must not be misclassified as simulated mouse.
9. The core exposes a stable, documented input-mode/adapter contract so future pads/controllers can be integrated through mappings/references or a console adapter without rewriting the Gateway or game modules.
10. Prevent key-repeat floods, duplicate confirmation, focus leakage, click-through and stale held-button state when switching modes or closing Gateway.

### Suggested adapter contract
- `mode`: `physical-mouse` | `touch` | `gamepad` | `simulated-mouse` | `keyboard`
- `move`: normalized directional step, with configurable repeat/rate and bounds
- `confirm`: one-shot activation edge
- `cancel`: return/close edge
- `pointerState`: current logical coordinates and active target/highlight
- `registerAdapter` / mapping registry: future controller-specific input mappings

The adapter names are a contract, not a mandate to create a second controller stack. Extend the existing Launcher Controller Core if present.

## 5. Acceptance criteria

### Gateway
- Opening Gateway freezes the active game/background synchronously before options can be interacted with.
- Gateway remains responsive while background work is frozen.
- No duplicate Pause or Back/Home control remains on Gateway-managed pages.
- Back/Home/Exit resolve to the same main/home destination.
- Reload is absent and never auto-runs.
- A pre-existing manual pause remains after Gateway closes.
- Closing Gateway cannot trigger an underlying action accidentally.

### Simulated mouse
- Four arrows move the logical pointer in steps.
- Directional movement never activates a target.
- Enter/confirm activates the highlighted target once.
- Cancel exits the list and restores game input.
- Physical mouse hover and direct touch behavior remain intact.
- Gamepad adapters can map to the same core without modifying Gateway semantics.

### Regression boundaries
- Do not modify the locked classic LV/XP/Mana HUD.
- Do not change wallet, save schema, game economy, game rules, unrelated navigation destinations or unrelated modules.
- Do not roll back prior Gateway/controller behavior. Extend it compatibly.

## 6. Verification and release record

Record implementation and evidence in the change PR:
- exact files and adapter integration point;
- focused unit tests for movement, bounds, confirm edge, cancel, mode switching and held-input reset;
- Gateway pause/order, duplicate-control, home-route and click-through regressions;
- relevant full test suite/build result;
- verified backup/recovery reference;
- public demo URL and actual deployed revision evidence;
- human/device QA status separately from machine checks.

**This specification records the owner requirement; it does not falsely claim that implementation, tests, deployment or human acceptance have already passed.**
