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


## Mandatory cross-repository discovery before every change
Before creating, editing, refactoring, renaming, cloning, or adding any feature/module/document:
1. Read the canonical [Cross-repository inventory-first and reuse-first protocol](https://github.com/mobinabinshun-beep/Repository/blob/main/Governance/NU-CROSS-REPOSITORY-INVENTORY-AND-REUSE-FIRST-PROTOCOL-fa.md).
2. Re-enumerate all repositories accessible to the project owner; do not rely on a prior chat, cached list, or repository name guess.
3. Inspect each repository's full tree and relevant branches, open PRs, history, docs, tests, assets, manifests, workflows, interfaces, and configuration. For cross-cutting/architecture work, expand reading to all tracked files in every non-empty repository. If tool or size limits prevent complete coverage, record the unread scope and do not begin implementation.
4. Search exact names plus Persian/English synonyms, acronyms, former names, technical names, and behavior-equivalent terms across all repositories and relevant branches.
5. Map existing implementations as canonical/active/legacy/experimental/incomplete/conflicting/superseded. Prefer reuse, extension, modular refactoring, and integration in that order. A new clone or parallel implementation requires documented evidence that reuse is unsuitable or absent.
6. Consolidate goals, accepted decisions, architecture, dependencies, and future vision before proposing a new design. Keep one canonical document per subject and link to it elsewhere; do not create divergent copies.
7. Record repository inventory, read coverage, synonym searches, existing assets, duplicate/conflict map, reuse decision, vision alignment, tests, backup, and approval gates in the dated change record.

If discovery is incomplete, mark the task BLOCKED — REPOSITORY DISCOVERY INCOMPLETE. Continue read-only research only; do not make implementation changes. This rule supplements the existing locked-area and owner-directive requirements and never overrides them.
