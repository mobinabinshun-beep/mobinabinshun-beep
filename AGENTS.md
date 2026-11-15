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
