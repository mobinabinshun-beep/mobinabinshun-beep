# Repository-wide agent instructions

Before proposing or editing code, read `docs/operations/LOCKED-AREAS.md`.

## Temporary protected area: classic resource HUD
- The classic LV / XP / Mana HUD is temporarily locked.
- Do not modify, refactor, restyle, reposition, rename, remove, replace, or otherwise touch its markup, styles, labels, values, visibility, layout, responsive rules, or related tests.
- Do not change it as a side effect of unrelated UI work. Keep all edits outside the protected selectors and markup.
- Only proceed when the user explicitly requests a change to the classic LV / XP / Mana bars themselves. General requests to improve the UI, clean up CSS, redesign the HUD, or optimize the game do not unlock this area.
- If an unrelated change appears to require touching this area, stop and ask for explicit authorization rather than making the change.
- If explicit authorization is given, make only the smallest requested change, preserve the rest, add/update a focused regression test, and update the lock/archive record. The lock remains in force afterward unless the user explicitly says to unlock it.
- Do not infer permission from a prior chat, an issue, a PR, a suggestion, or another agent's proposal. The current user instruction must explicitly name the protected HUD change.

This instruction applies to coding agents and future repository operations. It does not replace branch protection or GitHub permissions; maintain repository protections where available.

## Mandatory human acceptance and public-demo rule

Read and follow [NU-QA-HUMAN-ACCEPTANCE-GATE-01](./docs/operations/NU-QA-HUMAN-ACCEPTANCE-GATE-01.md) for every contribution. Every product change must be documented, then exposed on the public demo as a clearly labelled **TEST CANDIDATE — NOT HUMAN-APPROVED** after required automated safety checks, so members/testers can test the exact deployed commit and submit a traceable human report. CI, code review, source inspection or deployment alone never approves or rejects a change. Until the human report is reviewed and the owner records a decision, status stays **HUMAN-QA-PENDING**. A partial/no report is not a pass. Documentation-only changes that do not affect product behavior are recorded as DOC-ONLY and reviewed without a runtime deployment.

## Strict scope boundary — no collateral edits

Changes may be local/incremental or broad, but may modify only the files, modules, components and behaviors explicitly named in the current approved scope. Scope is a hard boundary, not a suggestion. Do not add unrelated cleanup, refactors, styling, renames, dependency updates or adjacent behavior changes. If an out-of-scope edit seems necessary, stop and request explicit authorization or propose an in-scope alternative. Before submitting, inspect the full diff and remove every unrelated change. Record the target areas, exclusions, intended effects and test scenarios. This rule exists to prevent human error and collateral damage to unrelated parts of the project; technical proximity or shared code does not grant permission.
