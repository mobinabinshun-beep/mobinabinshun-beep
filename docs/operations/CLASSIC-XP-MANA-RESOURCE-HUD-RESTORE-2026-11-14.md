# Classic XP / Mana resource HUD restoration

**Date:** 2026-11-14  
**Baseline:** `a59a07d7f20d5598c7f238d90f124c517de79ead`  
**Backup:** `backup/pre-classic-resource-bars-restore-2026-11-14`  
**Candidate:** `fix/classic-xp-mana-bars-under-lv-2026-11-14`  
**Status:** Candidate; automated CI and human QA pending

## Source review
- Reviewed the default branch and the exact pre-layout snapshot `backup/pre-hud-capsule-layout-2026-11-14`.
- Reviewed merged PR #78, its implementation record, and conversation archive.
- The classic reference keeps the original XP/Mana bar rails, labels above the bars, and values inside the rails; LV is the leading level indicator.
- The current merged HUD had changed this to a compressed horizontal three-column lower rail with labels and values embedded inside the bars.

## Applied change
- Restore a vertical lower-left resource stack: LV first, XP bar below it, Mana bar below XP.
- Restore classic labels above each bar and values centered within each rail.
- Keep the classic bar fill gradients and state-driven values.
- Preserve mana capsule count display.
- Keep the stack responsive on narrow screens.
- Bump only the `nu-world.css` cache key in `index.html`.

## Explicit preservation
- No changes to `nu-games.js`, `nu-engine.js`, renderers, game rules, XP/Mana calculations, wallet, save data, HP capsule behavior, or shield state.
- No changes to Gateway, Home, Library, Casino, Launcher, Studio, or other routes.
- No N-BI meter is introduced; absent shield state remains absent.

## Files changed
- `nu-world.css`
- `index.html` (stylesheet cache key only)
- `tests/nu-hud-layout.test.js`
- this operations record

## Validation
- Regression assertions updated for the classic stacked layout.
- Dedicated HUD layout regression: PASS on PR head `dded29eb1b1e3c5264adb85cc5551c8813b1a037`.
- Graphics integrity: PASS.
- Graphics preview smoke: PASS.
- Wallet/profile and Studio export gates: FAIL in existing wallet/profile and Lore-asset assertions; no wallet or Studio files were changed by this candidate.
- Human desktop/mobile browser review: PENDING.
- Not merged and not deployed.

## Rollback
Restore `backup/pre-classic-resource-bars-restore-2026-11-14` or revert this scoped PR. Do not reset the default branch or force-push.
