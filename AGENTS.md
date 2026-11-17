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
3. Implement the smallest isolated change on a candidate branch; preserve unrelated features.
4. Run focused tests first, then relevant regression/build checks. Automate repetitive checks where practical.
5. Create and verify a recoverable checkpoint after machine checks pass.
6. For authorized demo-eligible work, deploy to the public demo without redundant pre-approval; verify the actual live build where evidence is available.
7. Report exact implementation, tests, checkpoint, deployment state, limitations and a concise human QA checklist.
8. Human acceptance is separate from machine approval. Lock only after explicit owner acceptance.

## Gateway and controller invariants
- Gateway is the exclusive surface for actions it provides; remove redundant duplicate controls only where Gateway is mounted.
- Opening Gateway freezes active gameplay and background rendering before its options become actionable. Preserve any pause that existed before Gateway opened.
- Reload is not a Gateway action and never runs automatically on page entry unless a future explicit module-specific owner directive says otherwise.
- Gateway Exit = Back = Home = the main/home page; do not silently restore an unrelated nested-history destination.
- Direct physical mouse and direct touch remain direct input. Stepwise cursor movement through controller buttons is simulated mouse, irrespective of cursor artwork.
- Simulated mouse: four directions move a virtual pointer; Enter/controller-confirm performs a distinct click. Movement only highlights/selects; it must not activate.
- Implement controller input as a shared launcher-core adapter. Gateway and future modules consume the adapter; do not fork controller-specific logic per page.
- Keep adapters extensible for future controller types through stable interfaces and documented capability references.

## Documentation
- Keep one canonical implementation contract per subject; link secondary notes rather than creating competing rules.
- The current Gateway/controller contract is [GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md](./docs/operations/GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md). The older Gateway navigation report is historical only.
- Record decisions, affected files, focused tests, backup/recovery, demo status and remaining risks in the relevant change record.
- Do not claim tests, backup, deployment, human acceptance or locks that were not actually verified.
