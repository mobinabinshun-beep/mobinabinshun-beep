# Temporary lock — Classic LV / XP / Mana resource HUD

**Status:** LOCKED — temporary, in force from 2026-11-15  
**Canonical implementation:** `nu-world.css` and the resource HUD markup in `index.html`  
**Last restoration:** PR #97, merge commit `f09c4f8e31e59f2f746b717438654293cb4e64fa`  
**Archive snapshot:** [`docs/archive/2026-11-15/classic-resource-hud/nu-world.css.snapshot`](../archive/2026-11-15/classic-resource-hud/nu-world.css.snapshot)

## Protected behavior and presentation
- Keep **LV** at the lower-left.
- Keep the **XP** rail directly beneath LV and the **Mana** rail beneath XP.
- Keep the classic labels above their rails and current values centered inside the rails.
- Preserve state-driven fill/value behavior and the Mana capsule count display.
- Preserve responsive sizing and reduced-motion behavior.
- This lock protects the resource HUD presentation and its wiring; it does not authorize changes to game rules or data.

## Explicitly prohibited without a fresh, direct user instruction
- No moving, hiding, removing, renaming, replacing, redesigning, compacting, recoloring, or restyling these bars.
- No changing their DOM structure, order, labels, values, fill presentation, CSS selectors, responsive behavior, or related tests.
- No opportunistic cleanup, refactor, optimization, migration, or broad HUD redesign that touches this area.
- No changes to XP/Mana calculations, level progression, game engine, HP, shield/N-BI state, wallet, saves, or game rules under the pretext of this visual lock.
- No other screen or subsystem may be changed merely to accommodate an unrelated task by altering this protected HUD.

## Authorization rule
Only a new, explicit instruction from the user that specifically requests a change to the classic LV / XP / Mana bars grants a narrow exception. A vague request to improve the UI or clean up styles is not sufficient. When authorized:
1. Confirm the exact requested bar change from the instruction; do not expand scope.
2. Make the smallest compatible patch.
3. Keep LV, XP, Mana order and all unrequested behavior intact.
4. Run the focused HUD regression test and relevant build/CI checks.
5. Record the change in this document and archive the resulting snapshot.
6. Reinstate this temporary lock immediately after the authorized change.

## Instructions for future chats and agents
The repository root `AGENTS.md` points every coding agent to this lock. Any contributor or assistant starting work must read this document before editing. Treat this record as the source of truth even when a prior conversation is unavailable.

## Unlocking
This lock remains active until the user explicitly asks to unlock this specific HUD area. Do not set an expiry date or automatically unlock it. An explicit request for one scoped change does not permanently unlock the area.

## Enforcement boundary
This is a repository-level workflow instruction and audit record, not a GitHub branch-protection rule. It reduces accidental edits by future agents and contributors, but cannot technically prevent a repository administrator from bypassing it. Where GitHub branch rules or CODEOWNERS approvals are configured, keep them intact; do not invent an owner or weaken existing protections.

## Archive integrity
The archived CSS snapshot is a point-in-time copy of the full stylesheet at the lock commit. The canonical live file remains `nu-world.css`; the archive is read-only reference material and must not be loaded by the application.


---

# Owner lock — Gateway & simulated-mouse controller contract

**Status:** LOCKED — owner-directed, effective 2026-11-17  
**Canonical contract:** [Gateway & simulated-mouse controller contract](./GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md)  
**Implementation:** PR [#180](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/180), merge commit `45803b784f7b10bacc1081644fe0895fc8c382af)  
**Verified recovery point:** `backup/pre-gateway-simulated-mouse-2026-11-17`

## Locked behavior

- Gateway's selective actions are Menu/List, Back/Home/Main page, and Profile.
- Gateway opening freezes the active round and background rendering before its options can be used. Closing it releases only Gateway-owned pause; a pre-existing manual pause remains active and its renderers remain frozen.
- Reload is not a Gateway action and does not run automatically on page entry.
- Exit = Back = Home = main/home page. Do not silently restore nested page history as Gateway Back.
- Remove redundant controls only for actions Gateway actually provides and only on Gateway-mounted views.
- Physical mouse and touch remain direct input. Controller directional input is simulated mouse: D-pad/stick moves a virtual pointer and highlights only; A/Enter performs the separate click; B/Escape cancels Gateway.
- The shared launcher-core adapter remains the canonical input layer. Future controller families/modules extend it through documented capabilities; they do not fork or replace its semantics.
- No contributor may self-direct a rollback, downgrade, or restoration of an older Gateway/controller behavior.

## Change boundary

This lock does not prohibit additive, backward-compatible support for future controller types or modules. Such extensions must preserve the locked base behavior, pass focused and relevant regression tests, and be documented against the canonical contract.

Do not modify, weaken, bypass, or revert this locked contract unless the owner gives a new, direct instruction explicitly naming the Gateway/controller scope to be changed. If another approved feature appears to require a conflict, propose a forward-compatible extension; do not independently restore an older implementation.
