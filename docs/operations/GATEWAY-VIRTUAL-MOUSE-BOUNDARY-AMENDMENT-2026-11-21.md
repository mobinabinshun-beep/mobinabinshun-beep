# Gateway / virtual-mouse ownership correction — 2026-11-21

**Type:** OWNER-DIRECTED DOCUMENTATION / CONTRACT CORRECTION  
**Status:** DOCUMENTED · RUNTIME NOT CHANGED · RUNTIME QA NOT CLAIMED  
**Authority:** Explicit owner instruction received 2026-11-21  
**Baseline:** `aacb211c7282439bbca1cab256aa30859909951a`  
**Candidate branch:** `docs/owner-gateway-independent-virtual-mouse-contract-2026-11-21`

## Owner-reported failure and correction

The prior implementation/contract conflated Gateway navigation with the simulated mouse. The owner clarified that the simulated mouse is only a controller-driven pointer for gameplay screens that require mouse interaction. Gateway is independent: it may be opened by touch, physical mouse, or by the virtual pointer entering its trigger zone, but once open the virtual pointer remains frozen at its game-space position and does not move over Gateway options.

## Binding behavior captured

- Touch scrolling is prevented on the active game interaction surface without breaking direct touch gameplay/canvas routing.
- Touch can open Gateway; the opening finger can be lifted; options can then be tapped selectively.
- A continuing touch that leaves the Gateway trigger/options zone closes Gateway. Lifting and tapping outside that zone also closes it.
- Physical mouse movement over options activates them directly; click remains available. Leaving the interaction zone or clicking outside closes Gateway.
- Virtual mouse is only enabled on game screens requiring mouse interaction. It is never globally enabled or owned by Gateway.
- When Gateway opens, the virtual pointer stays at its exact game-space coordinates and is frozen. Gateway Up/Down option navigation is a separate selective-action path.
- One discrete Up/Down press advances one option. A sustained hold repeats traversal. Direction selects/highlights; the existing separate confirm activates. Down beyond the final option closes Gateway without selecting another.
- Every exit leaves gameplay frozen until a fresh gameplay-area interaction. Input held through closure cannot resume the game.

## Files changed

1. `docs/operations/GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md` — canonical section 12 added; explicitly supersedes earlier conflicting simulated-pointer/Gateway wording.
2. `AGENTS.md` — contributor invariants corrected to preserve separate ownership.
3. `docs/operations/LOCKED-AREAS.md` — owner lock amendment added, linking the canonical contract.
4. This change record.

## Explicit exclusions

No runtime JavaScript, CSS, HTML, gameplay, pointer adapter, Gateway implementation, game rules, HUD, Wallet, economy, save data, touch/canvas routing selectors, or cache keys were changed. The prior PR #232 runtime candidate is not part of this documentation change and must not be treated as accepted implementation of the new contract.

## Validation boundary

- Documentation-only diff; no runtime tests were run because runtime files were not changed.
- Verify exact changed-file list and PR diff before merge.
- Runtime implementation requires a separately scoped change and the section 12 regression matrix: gameplay-only virtual-mouse activation; pointer position frozen while Gateway is open; independent direct touch/mouse behavior; touch and mouse exits; one-step and held controller navigation; down-past-last exit; and fresh-input-only gameplay resume.
- No CI pass, backup, deployment, live verification, human QA, or final acceptance is claimed by this record.
