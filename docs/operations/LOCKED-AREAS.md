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
**Verified recovery points:** `backup/pre-gateway-simulated-mouse-2026-11-17`; `backup/pre-gateway-exclusive-pause-2026-11-17` (candidate `072b9e94235c689b4c493fff348c9b7ef5fa2945`); `backup/gateway-exclusive-pause-final-2026-11-17` (final merged state `a72ca06ae166d95d35d80064f609f136c11a5ab8`)

## Locked behavior

- Gateway's selective actions are Menu/List, Back/Home/Main page, and Profile.
- Gateway is the sole gameplay pause authority; there is no independent/manual or player-overlay pause owner. Opening Gateway freezes the active round and background rendering before its options can be used. Closing Gateway keeps the round and ambient renderers frozen until the first real gameplay-space input. For controllers, a fresh direction/confirm transition is required; an input held through Gateway closure cannot release the hold.
- Reload is not a Gateway action and does not run automatically on page entry.
- Exit = Back = Home = main/home page. Do not silently restore nested page history as Gateway Back.
- Remove redundant controls only for actions Gateway actually provides and only on Gateway-mounted views.
- Physical mouse and touch remain direct input. Controller directional input is simulated mouse: D-pad/stick moves a virtual pointer and highlights only; A/Enter performs the separate click; B/Escape cancels Gateway.
- The shared launcher-core adapter remains the canonical input layer. Future controller families/modules extend it through documented capabilities; they do not fork or replace its semantics.
- No contributor may self-direct a rollback, downgrade, or restoration of an older Gateway/controller behavior.

## Change boundary

This lock does not prohibit additive, backward-compatible support for future controller types or modules. Such extensions must preserve the locked base behavior, pass focused and relevant regression tests, and be documented against the canonical contract.

Do not modify, weaken, bypass, or revert this locked contract unless the owner gives a new, direct instruction explicitly naming the Gateway/controller scope to be changed. If another approved feature appears to require a conflict, propose a forward-compatible extension; do not independently restore an older implementation.


---

# Owner reopening — Gateway directional simulated-mouse amendment (2026-11-18)

**Status:** PRIOR 2026-11-17 BASELINE RETAINED AS HISTORY; SCOPED REOPENING AUTHORIZED FOR CANDIDATE `feat/gateway-directional-exit-human-qa-lock-2026-11-18`.

The owner explicitly reopens only Gateway/controller behavior for the 2026-11-18 amendment. The prior accepted baseline and its recovery points remain preserved; no unrelated locked area is reopened.

The candidate implements 500 ms direct mouse/touch entry, 1000 ms simulated-pointer entry, pause-before-options ordering, directional option navigation, one-extra-Down exit, virtual-pointer persistence after exit, and leave/re-enter gating. The classic LV/XP/Mana HUD remains locked and untouched.

After the exact candidate passes automated QA and a verified backup is created:
1. Record its exact commit as `MACHINE-APPROVED-LOCKED`.
2. Move it to `HUMAN-QA-PENDING` with exact public-demo URL/build identity if deployment is verified.
3. Do not permit further automated writes to the frozen commit or locked scope.
4. Reopen only the affected scope after a human QA finding or explicit new owner instruction.
5. Corrections use a successor branch and repeat machine validation, backup, deployment verification and human QA.

**Enforcement boundary:** the current GitHub connector exposes repository content, branches, commits, pull requests and Actions evidence, but no branch-protection/ruleset mutation capability. This lock is therefore enforced by the documented agent workflow and exact immutable commit reference; it is not represented as a GitHub server-side branch protection rule. Existing GitHub protections must not be weakened.


## Owner amendment — Profile/Wallet navigation and Gateway utility controls (2026-11-18)

- Gateway remains the only top-level Menu/Home/Profile control on mounted game and utility pages. Hide duplicate utility-page Menu and Profile entry points and redundant Home/Back buttons.
- Keep the Bag → Wallet → Profile hierarchy. Profile exposes Wallet section tabs and returns to the selected Wallet page; Wallet destination shortcuts preserve Bag/Inventory navigation.
- This is a forward-compatible amendment to the existing Gateway lock, not a rollback. The classic LV/XP/Mana HUD remains untouched.
- Successor candidate: `fix/gateway-pointer-bridge-successor-2026-11-18`. Machine QA, backup of the final candidate, public demo deployment and human QA are pending until the exact candidate checks complete.


---

## Owner-authorized scoped restoration — XP rail and icon feedback (2026-11-17; implementation candidate 2026-11-18)

The owner explicitly authorized Issue #179 to extract and restore only the historical Generation 1 full-width XP rail and to verify/reuse the existing accessible transaction toast for interactive game icons/actions.

- Authorized visual exception: the XP rail spans the bottom edge; the Mana rail remains compact at the lower-left; LV remains above the rails; the current XP/Mana state and calculation logic are unchanged.
- Icon feedback uses the existing `#transaction-toast`, `announceTransaction`, and `showFloatingChange` mechanisms. The current HP Capsule icon, Store purchase and Arcane Shield interaction paths already call the shared feedback functions; this candidate adds focused regression coverage rather than a parallel notification system.
- No change is authorized to XP/Mana arithmetic, persistence, Wallet, game rules, HP, Arcane Shield/N-BI mechanics, Gateway, or unrelated HUD elements.
- Candidate branch: `fix/gen1-xp-rail-icon-feedback-2026-11-18`.
- Pre-change recovery ref: `backup/pre-gen1-xp-rail-icon-feedback-2026-11-18` at `705b5f99a7bf2b32c4156c5d647a5e678985d76a`.
- After the authorized correction is reviewed and accepted, the classic HUD lock is reinstated for the exact restored layout. No further styling/layout edits are permitted without another direct owner instruction.

This record documents a one-time narrow exception; it does not permanently unlock the protected HUD.


## Owner-authorized scoped Gateway touch-dwell correction — 2026-11-20

The owner explicitly reopened only the direct-touch activation behavior in two approval stages. The authorized change requires a 500 ms dwell on the Gateway trigger; early pointer release or cancellation cancels opening, and synthetic click suppression remains. The one-time scope and evidence are recorded in [GATEWAY-TOUCH-DWELL-CHANGE-RECORD-2026-11-20.md](./GATEWAY-TOUCH-DWELL-CHANGE-RECORD-2026-11-20.md). This does not unlock any other Gateway behavior or adjacent subsystem. Re-lock remains active after this scoped correction.


## Owner-reported multi-input Gateway dwell investigation — 2026-11-20

A scoped candidate branch addresses physical mouse item dwell, touch drag/scroll hit-testing, and simulated-pointer/controller dwell activation while preserving click and keyboard confirmation. Scope, baseline, recovery ref, files and QA gates are recorded in [GATEWAY-MULTI-INPUT-DWELL-CHANGE-RECORD-2026-11-20.md](./GATEWAY-MULTI-INPUT-DWELL-CHANGE-RECORD-2026-11-20.md). This is a candidate only: no merge, public deployment or ACCEPT is authorized until exact-head CI passes and the owner completes human QA on the demo.
