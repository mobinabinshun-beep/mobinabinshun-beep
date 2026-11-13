# Conversation Archive — 2026-11-13

**Project:** N.U Interactive World  
**Request class:** HUD redesign, navigation simplification, animation calibration, operational workflow  
**Target:** public interactive-world repository; candidate branch only

## Owner requirements (condensed)

- Remove the hex gateway icon from the home screen.
- In gameplay show the selected game name; keep N.U / NIROO UNIVERSE as a quiet upper-left background mark.
- Move LV to the lower-left beside the two resource capsules.
- Display Mana and XP text inside their own capsule bars.
- HP frame stays centered; when the HP capsule appears, reserve a right-side dock and slide the capsule out from beneath the HP frame. On use/restoration it returns and the frame contracts.
- Add the N-BI Arcane Shield meter under HP with the requested collapse/reposition/recharge visual.
- Gateway actions: Back, Menu (list), and Settings / Options.
- Establish a repeatable implementation, backup, documentation, archive, calibration, optimization, debugging and fix protocol, including public demo and human-test reporting.

## Implementation decisions

- Gateway is hidden on the main-world home screen and remains available on active gameplay and other internal Generation 1 pages.
- Back returns to the home/library view; Menu opens the game library; Settings / Options opens Launcher Calibration.
- Existing HP capsule state and reversible animation are reused; HP frame gets compact/expanded layout state.
- N-BI charge meter is explicitly visual-only in this candidate; it does not absorb Chaos damage or change HP rules.
- XP and Mana labels/values are rendered inside their capsule rails.
- Existing wallet/save schema is not changed.

## Candidate record

- Candidate branch: feat/nu-game-hud-layout-capsule-shield-2026-11-13
- Pre-change backup branch: backup/pre-hud-layout-protocol-2026-11-13
- Base commit: d4905e6880367c5d67674300a95e404c0fab06d4
- Human browser/device acceptance: pending.
- Deployment: pending PR review and merge.

## Required human report

Record tester, date/time, device, OS, browser/version, viewport, input mode, reduced-motion setting, scenario, expected result, actual result, pass/fail, reproducibility, and evidence. Never include personal account data or credentials.