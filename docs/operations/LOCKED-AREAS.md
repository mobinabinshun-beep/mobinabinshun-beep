# Temporary lock — Classic LV / XP / Mana resource HUD

**Status:** LOCKED — temporary, in force from 2026-11-15  
**Canonical implementation:** `nu-world.css` and the resource HUD markup in `index.html`  
**Last restoration:** PR #97, merge commit `f09c4f8e31e59f2f746b717438654293cb4e64fa`  
**Archive snapshot:** [`docs/archive/2026-11-15/xp-full-width-bottom-rail/nu-world.css.snapshot`](../archive/2026-11-15/xp-full-width-bottom-rail/nu-world.css.snapshot)

## Protected behavior and presentation
- Keep **LV** above the lower resource rails, aligned to the left.
- Keep the **Mana** rail and its capsule count above the XP rail at the lower-left.
- Keep the **XP** rail flush with and spanning the full bottom edge of the game viewport in all three Generation 1 games.
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

## Latest owner-authorized exception — 2026-11-15
- The owner explicitly requested restoration of the XP rail across the entire bottom edge in all three core games.
- The authorized patch changes CSS presentation only: XP is full-viewport width and flush with the bottom edge; LV and Mana remain above it; Mana capsule count remains visible.
- XP/Mana calculations, level progression, game logic, DOM markup, wallet, save data and HP behavior remain unchanged.
- Regression coverage was updated and the lock is reinstated immediately after this one scoped change.
- Candidate branch: `fix/gen1-xp-full-width-bottom-rail-2026-11-15`.

## Instructions for future chats and agents
The repository root `AGENTS.md` points every coding agent to this lock. Any contributor or assistant starting work must read this document before editing. Treat this record as the source of truth even when a prior conversation is unavailable.

## Unlocking
This lock remains active until the user explicitly asks to unlock this specific HUD area. Do not set an expiry date or automatically unlock it. An explicit request for one scoped change does not permanently unlock the area.

## Enforcement boundary
This is a repository-level workflow instruction and audit record, not a GitHub branch-protection rule. It reduces accidental edits by future agents and contributors, but cannot technically prevent a repository administrator from bypassing it. Where GitHub branch rules or CODEOWNERS approvals are configured, keep them intact; do not invent an owner or weaken existing protections.

## Archive integrity
The archived CSS snapshot is a point-in-time copy of the full stylesheet at the lock commit. The canonical live file remains `nu-world.css`; the archive is read-only reference material and must not be loaded by the application.
