# N.U Gateway — gameplay visual declutter

**Date:** 2026-11-14  
**Baseline:** `25f3e4454f1bef90f27b63bead10cd932359211b`  
**Backup:** `backup/pre-gateway-gameplay-declutter-2026-11-14`  
**Candidate:** `feature/gateway-gameplay-declutter-2026-11-14`  
**Status:** Candidate implementation; automated CI and human QA pending

## Owner intent
Gateway exists to reduce permanent navigation clutter and reclaim visual space during active gameplay. It is the compact, on-demand navigation entry point, not a second permanent menu alongside the classic header.

## Changes in this candidate
- Hide the shared topbar only while `#game-view` is active; the classic `⌘ MENU` is therefore no longer visible during gameplay.
- Keep Gateway hidden on Home/Library and all non-game pages, preserving the existing wallet-specific behavior.
- Move the Gateway trigger to the upper-right edge and reduce its footprint from 58px to 48px (46px on narrow screens).
- Reduce the radial action spread from 100/112px to 82/94px.
- Replace the full-screen backdrop blur and world blur with a lightweight translucent scrim.
- Bump only the main page Gateway asset query version.

## Locked / unchanged
- `nu-engine.js`, graphics/runtime modules, game render adapter, world and pixel renderers.
- Game rules, target generation, input, collision, HP/XP/Mana, wallet, save data and economy.
- HUD placement and contents; PAUSE/RESUME and round controls.
- Home, Library, Casino, Launcher, Creative Studio and other routes/pages.
- Existing Gateway actions and touch/mouse/keyboard behavior.

## Verification
- Updated `tests/nu-hex-gateway.test.js` to assert gameplay header removal, compact placement, reduced orbit and lightweight scrim.
- Gateway-specific regression: PASS (Node syntax check + `tests/nu-hex-gateway.test.js`).
- HUD layout and graphics-integrity checks: PASS.
- Wallet regression, Studio export regression and static validation report failures in unchanged wallet-tab / Lore-asset assertions. No wallet, Studio or game-runtime files are part of this candidate; those failures are recorded as unrelated and are not being modified here.
- Human desktop/mobile acceptance remains pending; no claim of visual acceptance is made.
- Human desktop/mobile acceptance remains pending; no claim of visual acceptance is made.

## Rollback
Revert the PR/commit or restore the exact pre-change branch `backup/pre-gateway-gameplay-declutter-2026-11-14`. Do not force-push the default branch.
