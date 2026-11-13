# Conversation Archive — 2026-11-13 — Minimal Restore & Freeze

## Owner correction
The owner clarified that the previous changes were too broad and requested restoration to the previous state, followed by small, focused changes only.

## Requirements now in force
- Restore the prior layout and behavior; avoid unrelated redesign or broad visual changes.
- If the player does not own/have a shield, do not show a shield meter or shield status. Do not invent a default 100% shield.
- Keep the Gateway icon absent from the main menu, game/tool views, Creative Studio/drawing and Casino. Freeze this behavior until the owner explicitly asks to unfreeze it.
- Before changing a frozen Gateway feature in the future, ask the owner to confirm unfreezing and exact target scope.
- Record a mandatory minimal-change, backup, test, calibration, debug, archive and rollback protocol in the repository.

## Implementation decision
- Restore the pre-Generation-1.33 source baseline for the affected pages, styles and runtime scripts.
- The N-BI meter is not retained because the current game model does not expose a real shield ownership/active-state source.
- Add one global CSS freeze rule for the shared Gateway and its scrim, ensuring they are not visible or keyboard reachable on any linked page.
- Keep existing game mechanics, wallet/save contracts, HP pill behavior, Mana/XP and unrelated UI unchanged.

## Refs
- Backup: `backup/pre-focused-restore-gateway-freeze-2026-11-13`
- Baseline snapshot: `backup/pre-hud-layout-protocol-2026-11-13`
- Candidate: `fix/restore-baseline-gateway-freeze-2026-11-13`
- Prior broad change: `1b873dcee5169354900a63362f793e03f085cd8f`
- Protocol: `docs/operations/NU-OPS-IMPLEMENT-01.md`
- Human test template: `docs/operations/HUMAN-TEST-REPORT-TEMPLATE.md`

## Acceptance state
Automated CI and human browser/device acceptance are pending. No production-readiness claim is made.
