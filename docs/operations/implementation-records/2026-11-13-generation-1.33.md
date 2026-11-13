# Implementation Record — 2026-11-13 — Minimal Restore & Gateway Freeze

## Owner correction
The previous Generation 1.33 HUD/navigation pass changed too much. Restore the pre-1.33 visual and interaction baseline, then make only the requested focused correction.

## Exact scope
- Restore the pre-1.33 versions of index.html, nu-world.css, nu-games.js, nu-hex-gateway.js, nu-hex-gateway.css, casino.html, launcher.html and pixel-art-studio.html.
- Keep the prior HUD, game title, LV, XP, Mana and HP presentation. Remove the newly added N-BI meter because no authoritative shield inventory/state exists; never show a fabricated full shield.
- Freeze the shared Gateway icon and scrim globally with a CSS visibility lock. This keeps it absent from the main menu, game/tool views, Creative Studio/drawing, Casino and Launcher until the owner explicitly approves unfreezing.
- Restore the prior Generation 1 manifest and README content; retain only links to the operational protocol and human-test template.
- Add a regression assertion for the Gateway freeze and absence of the unsupported shield meter.

## Backup and candidate
- Exact pre-change backup: `backup/pre-focused-restore-gateway-freeze-2026-11-13`
- Exact pre-1.33 baseline commit: `d4905e6880367c5d67674300a95e404c0fab06d4`
- Candidate: `fix/restore-baseline-gateway-freeze-2026-11-13`
- Previous broad merge being corrected: `1b873dcee5169354900a63362f793e03f085cd8f`

## Validation
- **CI-PASSED:** static validation run 43495945494; Studio export regression run 43495945477; graphics integrity run 43495945491.
- Human browser/device QA: pending.
- Public deployment: pending PR #65 merge and Pages workflow.

## Acceptance
Only the pre-1.33 baseline restoration, the global Gateway freeze, the no-shield/no-meter rule and the documentation updates are in scope. No other HUD, menu, visual or game-rule redesign is authorized.
