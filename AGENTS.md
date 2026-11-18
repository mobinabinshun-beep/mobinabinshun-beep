# N.U contributor operating rules — fast, safe, owner-directed

## Authority and delivery
- The project owner defines intent, scope and final human acceptance. Contributors/agents execute implementation, debugging, machine tests, backup, demo deployment, verification and documentation.
- **Speed is a binding engineering requirement.** No avoidable ceremony, duplicate approval, repeated inventory, speculative research, or process-only gate may stall an authorized task. Replace friction with the smallest useful check or automation.
- Start from the directly relevant files, interfaces, tests, current owner decisions and locks. Expand repository/cross-repository discovery only when evidence shows a shared dependency, duplicate implementation, data contract, security boundary, or cross-repository impact. Do not require reading every tracked file in every repository for a scoped change.
- If an information gap does not affect safe implementation, record it as a limitation and proceed. If it does affect correctness/safety, isolate the smallest unknown and continue independent work.
- Never create a parallel module before checking the relevant existing interface and likely reusable implementation. No broad repository census as a prerequisite for ordinary scoped work.

## Protected areas
- The classic LV / XP / Mana HUD remains locked. Do not modify, refactor, restyle, reposition, rename, remove, replace, or incidentally touch its markup, styles, labels, values, visibility, layout, responsive rules or related tests.
- Only a direct, explicit owner instruction naming the protected HUD change grants a narrow exception. Preserve all unrequested behavior and reinstate the lock after the change.
- Do not weaken security, privacy, repository permissions, branch protections, or destructive-data safeguards in the name of speed.

## No unilateral rollback / no silent regression
- Never revert, downgrade, restore an older product version, or discard newer accepted behavior on your own initiative.
- A rollback is permitted only to contain a demonstrated critical regression, using a verified checkpoint, with the incident, exact affected scope, reason, recovery evidence and owner notification recorded. Prefer a forward fix when safe.
- Do not remove, bypass or reinterpret a previously accepted requirement merely because it is inconvenient. If requirements conflict, preserve the newer explicit owner directive and document the compatibility adjustment.
- A lock applies only to the exact accepted scope. Do not silently widen, narrow, or remove it.

## Fast execution path
1. Identify the exact user intent, relevant owner decisions, locked areas, dependencies and acceptance criteria.
2. Inspect only the directly affected code/docs/tests plus dependencies demonstrated by that inspection.
3. Use the existing authorized working line by default; before the first write, record the baseline and create/reuse a verified PRE-CHANGE recovery ref/tag for code/data/schema/shared-contract/structural changes. Create a candidate branch only when isolation is materially required. Implement the smallest scoped change and preserve unrelated features.
4. Run focused tests first, then relevant regression/build checks. Automate repetitive checks where practical.
5. Create and verify a recoverable checkpoint after machine checks pass.
6. For authorized demo-eligible work, deploy to the public demo without redundant pre-approval; verify the actual live build where evidence is available.
7. Report exact implementation, tests, checkpoint, deployment state, limitations and a concise human QA checklist.
8. Human acceptance is separate from machine approval. A machine-passed candidate is immediately recorded as MACHINE-APPROVED-LOCKED / HUMAN-QA-PENDING; final product acceptance and permanent scope lock still require the owner.

## Gateway and controller invariants
- Gateway is the exclusive surface for actions it provides; remove redundant duplicate controls only where Gateway is mounted.
- Gateway is the sole gameplay-pause authority; no independent/manual or player-overlay pause owner may pause or resume gameplay.
- Opening Gateway freezes active gameplay and background rendering before its options become actionable. Closing Gateway does not resume gameplay; keep the round and ambient renderers frozen until the first real gameplay-space input (mouse/touch press, gameplay keyboard input, or controller direction/confirm with a fresh input transition after return; a controller input held through Gateway closure must not release the hold).
- Reload is not a Gateway action and never runs automatically on page entry unless a future explicit module-specific owner directive says otherwise.
- Gateway Exit = Back = Home = the main/home page; do not silently restore an unrelated nested-history destination.
- Direct physical mouse and direct touch remain direct input. Stepwise cursor movement through controller buttons is simulated mouse, irrespective of cursor artwork.
- Simulated mouse outside Gateway: four directions move the virtual pointer and only highlight targets; separate confirm clicks. The shared adapter starts when a gamepad is connected.
- Simulated mouse inside Gateway: vertical directions navigate the ordered Gateway options; a further Down after the final option closes Gateway without selecting anything. A/Enter confirms the highlighted option; B/Escape remains a cancel path.
- Direct physical mouse and touch enter Gateway after a 500 ms dwell; simulated-pointer entry uses 1000 ms. Opening dispatches the pause event before options become visible/actionable.
- After directional exit, the virtual pointer remains at the Gateway trigger. It must leave the trigger hit-zone and re-enter before Gateway can open again.
- Implement controller input as a shared launcher-core adapter. Gateway and future modules consume the adapter; do not fork controller-specific logic per page.
- Keep adapters extensible for future controller types through stable interfaces and documented capability references.

## Machine approval lock and human QA queue
- Every scoped candidate that passes its declared automated checks is frozen at its exact commit and recorded as `MACHINE-APPROVED-LOCKED` + `HUMAN-QA-PENDING`.
- Do not amend, rebase, regenerate, or otherwise write to that frozen candidate. Do not allow unrelated automated work to modify its locked files/scope while it is queued for human review.
- Human QA findings or a new direct owner instruction are the only normal reasons to reopen the affected scope. Preserve the prior frozen candidate as evidence. A correction uses a new successor commit on the authorized working line; create a separate branch only when isolation is materially required by a protected lock, parallel release, destructive risk or security boundary. Rerun tests and create a new exact machine-approval checkpoint before returning to human QA.
- Machine approval is not human approval, owner acceptance, production promotion, or proof of live deployment.
- The repository workflow lock is an agent/process rule unless GitHub branch protection is separately configured. Never claim technical branch protection unless verified.
- Canonical workflow record: https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-18/NU-UNIFIED-OPERATING-PROTOCOL-fa.md (section 9: Machine approval lock and human QA queue).

## Documentation
- Keep one canonical implementation contract per subject; link secondary notes rather than creating competing rules.
- The current Gateway/controller contract is [GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md](./docs/operations/GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md). The older Gateway navigation report is historical only.
- The shared input-translator architecture and durable debug evidence protocol is [INTERACTION-CORE-AND-DEBUG-PROTOCOL-2026-11-19.md](./docs/operations/INTERACTION-CORE-AND-DEBUG-PROTOCOL-2026-11-19.md); the live coverage checklist is [INTERACTION-DEBUG-BACKLOG-2026-11-19.md](./docs/operations/INTERACTION-DEBUG-BACKLOG-2026-11-19.md). `nu-interaction-core.js` is loaded before the controller/Gateway adapters on the main game, launcher, casino and studio pages.
- Record decisions, affected files, focused tests, backup/recovery, demo status and remaining risks in the relevant change record.
- Do not claim tests, backup, deployment, human acceptance or locks that were not actually verified.

## Unified operating protocol
- Canonical execution lifecycle and checklists: [NU-UNIFIED-OPERATING-PROTOCOL-fa.md](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-18/NU-UNIFIED-OPERATING-PROTOCOL-fa.md).
- Apply its scope-aware discovery, reuse-first, change-record, test, verified backup/restore, deployment, human-QA and handoff requirements to every task.
- This guide supplements these repository-specific rules; protected areas, owner decisions and exact candidate locks remain in force. For scoped work, inspect the directly affected files and demonstrated dependencies; use full cross-repository discovery for architecture, shared contracts, data, security or multi-repository changes.


## Branch discipline and failed human QA
- Prefer improving the existing default/development line and existing issue/PR record. Do not create a new branch for every defect; branch proliferation is prohibited as a routine workflow.
- Create a branch only when isolation is materially required by an existing protected lock, parallel release, or destructive-risk boundary. Explain why and reuse an existing candidate branch whenever safe.
- A human report that interaction still fails overrides a prior machine-pass label for the affected behavior: reopen the defect, preserve the machine evidence as historical, and do not claim human acceptance.
- Machine approval means automated checks passed and the exact build was deployed to the demo for human testing. It is not final acceptance.
- The exact machine-approved candidate is immutable to unrelated automation. A correction to a failed candidate must be made as a scoped forward fix on the existing working line; after re-testing, record a new exact machine-approved checkpoint and keep the human QA state open until the owner reports acceptance.
- Simulated pointer movement must deliver pointermove and mousemove to the hit-tested target in addition to updating the visible cursor and highlight. Keyboard-emulated direction repeats must continue moving; Gateway exclusively owns directional input while open.


## Shared interaction core and debug retention
- Keep direct touch, direct physical mouse, selective/action translation and simulated mouse as independent translators feeding the shared `NUInteractionCore` semantic event stream.
- Never conflate pointer movement/highlight with select, confirm, activate or execute. Gateway owns its hierarchy while open.
- Instrument system/platform controls and game objects (Bubble Hunt bubbles, Mana particles/orbs, Chaos masses/clusters) with stable object/game/action/source/outcome identifiers. Diagnostic failures must never block gameplay.
- Preserve original human findings and debug exports as linked issue/change-record evidence. A failed human report reopens the affected behavior; do not overwrite it with a later pass.
