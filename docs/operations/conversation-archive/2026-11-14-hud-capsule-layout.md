# Conversation archive — Generation 1 HUD capsule layout — 2026-11-14

Owner requested a focused, minimal HUD calibration after the Gateway work. Only the main Generation 1 gameplay HUD is in scope.

## Before state
- LV was in the upper HUD row.
- XP CAPSULE and MANA CAPSULE labels were positioned above their progress rails; values were inside the rails.
- HP bar was centered with a state-driven capsule dock animation already implemented in nu-games.js and CSS.
- No N-BI shield meter was present. This remains the correct state without a real shield item/state.

## Implemented candidate
- Moved LV to the left of the lower resource rail.
- Kept N.U · GEN 01 and 10 ACTIONS in the upper HUD.
- Moved XP/Mana labels and values into the respective capsule rails.
- Added responsive grid calibration for narrow mobile widths.
- Preserved HP capsule state logic and did not add shield UI.

## Source refs
- Base: 47b963af2cbea9f5fb6e9c3ad1b392be7f2f7d78
- Backup: backup/pre-hud-capsule-layout-2026-11-14
- Candidate: fix/gen1-hud-capsule-layout-2026-11-14

## Validation
- Dedicated HUD layout and HP capsule tests passed.
- Gateway regression and graphics integrity passed.
- Full PR workflow and human browser QA must be complete before demo deployment.
- This is a candidate, not a deployed or human-accepted change.
