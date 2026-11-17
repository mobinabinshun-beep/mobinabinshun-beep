# Repository-wide agent instructions

Before proposing or editing code, read `docs/operations/LOCKED-AREAS.md`.
Also read the current owner directive, team governance and documentation protocol linked from the product README/archive, plus `CHANGE-AND-DEMO-PROTOCOL.md`. If repository-local wording conflicts with the dated owner directive, the latest explicit owner directive governs demo-eligible execution; do not override protected-area locks.

## Temporary protected area: classic resource HUD
- The classic LV / XP / Mana HUD is temporarily locked.
- Do not modify, refactor, restyle, reposition, rename, remove, replace, or otherwise touch its markup, styles, labels, values, visibility, layout, responsive rules, or related tests.
- Do not change it as a side effect of unrelated UI work. Keep all edits outside the protected selectors and markup.
- Only proceed when the user explicitly requests a change to the classic LV / XP / Mana bars themselves. General requests to improve the UI, clean up CSS, redesign the HUD, or optimize the game do not unlock this area.
- If an unrelated change appears to require touching this area, stop and ask for explicit authorization rather than making the change.
- If explicit authorization is given, make only the smallest requested change, preserve the rest, add/update a focused regression test, and update the lock/archive record. The lock remains in force afterward unless the user explicitly says to unlock it.
- Do not infer permission from a prior chat, an issue, a PR, a suggestion, or another agent's proposal. The current user instruction must explicitly name the protected HUD change.

This instruction applies to coding agents and future repository operations. It does not replace branch protection or GitHub permissions; maintain repository protections where available.


## Speed-first, risk-based project execution (owner directive — 2026-11-17)

Development speed is a project priority. Unnecessary friction, duplicate work, ceremonial approvals, repeated manual checks, stale parallel implementations, and process steps that do not materially protect quality, security, data integrity, compatibility, or owner authority are prohibited. Contributors must remove or automate such friction rather than normalize it.

This directive does NOT authorize careless changes, skipping relevant tests, weakening security/privacy, destructive data operations, touching locked areas, or silently reverting accepted behavior. Preserve the current approved baseline; never roll back to an earlier version merely because it is easier. A rollback requires a demonstrated critical regression, a verified recovery point, and a recorded reason. For ordinary defects, patch the current implementation with the smallest safe change.

### Proportionate discovery — replaces exhaustive inventory as a universal gate
Before work, read this file, `docs/operations/LOCKED-AREAS.md`, the change/demo protocol, and the canonical specification for the affected feature.
- **Existing isolated feature:** inspect its implementation, direct callers/dependencies, relevant tests, and canonical docs. Search other repositories only for named/shared dependencies or likely reuse.
- **Shared core, cross-module behavior, new module, data/schema/API change, or architecture change:** enumerate relevant repositories and inspect all directly connected implementations, interfaces, docs, tests, workflows and history. Expand to a full cross-repository inventory only when the dependency map cannot establish safety or reuse.
- **Unrelated repositories/files:** do not read or change them merely to satisfy a checklist. Record what was checked and why the scope is sufficient.
- **Tool/size limits:** state the exact unread dependency or uncertainty. Continue with a narrower, reversible, isolated change when safe; block only the specific risky operation that cannot be validated. Do not turn an unrelated unread file into a blanket project stop.
- Prefer reuse and extension over duplication. If a parallel implementation is necessary, explain why the existing one cannot serve the requirement.

### Execution defaults
1. Define a narrow scope and observable acceptance criteria.
2. Work on an isolated branch; preserve locked areas and unrelated behavior.
3. Automate focused tests, regression tests and build checks; avoid repeated manual ceremony where machine checks are reliable.
4. Create and verify a recovery checkpoint before demo deployment.
5. After machine checks and backup pass, deploy authorized demo-eligible work without waiting for an extra human pre-approval.
6. Report exact evidence and remaining human/device checks. Machine approval is not human approval.
7. Lock only the exact scope explicitly accepted by the owner.

### Anti-regression / no self-directed rollback
- A previously accepted or explicitly directed behavior must not be removed, weakened, or reverted by a collaborator acting on personal preference.
- If a new requirement conflicts with an earlier behavior, preserve both where possible and resolve the conflict through the smallest compatible extension. If impossible, document the concrete conflict and ask the owner only for that decision.
- Never restore an old branch, commit, UI, interaction model, or module as a shortcut without explicit owner direction or a verified critical-regression recovery.
- Keep a concise decision record linking the owner instruction, implementation, tests and affected modules.

This section is an explicit owner-level replacement of the former universal exhaustive-read gate. It does not override protected-area locks or the required machine-test, verified-backup, demo-verification and human-acceptance distinctions.
