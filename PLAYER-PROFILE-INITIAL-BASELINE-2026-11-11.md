# N.U Generation 1 — Initial Player Profile Baseline

- Historical source branch: `feature/gen1-cleanup-2026-11-11`
- Source file revision: `eacda8b14264cd06a350b512684d6507943cb3e1`
- Original profile introduced in commit: `504ccd7d6da7d9df0cf50f38f7fe10873ab4a924`
- Status: merged into the public demo default branch on 2026-11-14; human browser acceptance pending.

## Original structure

- A display-only profile card with a 150px image placeholder.
- Four optional fields: Name, Callsign, Family Name and Age.
- Two-column form layout on desktop; single-column responsive layout on small screens.
- The original image area is a placeholder only: no image upload or persistence was implemented.
- Values are temporary, cleared when the profile closes, and not saved.
- A privacy warning appears when a field is edited.

## Explicitly not part of this historical baseline

- Player ID generation and persistent identity.
- Level, XP, HP and Mana statistics.
- Public/owner profile modes.
- Personal rank palette or theme controls.
- Persistent profile save or launcher-level profile locking.

This is the earliest profile implementation found in the repository history. It is a demo mock-up, not an authenticated player account.


## 2026-11-14 — scoped appearance-control preview

- Preserved the historical profile card and its four optional fields.
- Added a separate appearance panel immediately below the profile card with three independent controls: hue spectrum, neutral white/dark overlay, and selected-color lightness.
- Controls update only the visible demo card preview. They are not persisted and reset to the neutral defaults when the profile closes.
- Appearance adjustments do not trigger the personal-data warning; editing profile text fields still does.
- This is a demo interaction only. No image upload, account identity, server sync, profile save, or operational player-card lock is introduced.
- Human QA remains required for visual balance, mobile layout, keyboard/touch behavior and reset behavior.
