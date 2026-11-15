# N.U Health Module — implementation record

**Date:** 2026-11-15  
**Status:** IMPLEMENTED IN CANDIDATE · CI PENDING · HUMAN-QA-PENDING  
**Repository:** `mobinabinshun-beep/mobinabinshun-beep`  
**Base commit:** `3a0de39d2b99f99264e2a08c3da7db2c79887511`  
**Backup:** `backup/pre-wallet-health-module-2026-11-15-1707`  
**Candidate:** `feat/wallet-health-module-2026-11-15`

## Owner request
Add a Health tab accessible from Wallet, with game-fed medicine/item use, HP damage, healing, and deaths. Keep wallet and health data independent. Keep the latest five events per category. Darken wallet drawers and slightly enlarge the transparent field-guide frame.

## Data boundary
- Health uses only `nu-health-records-v1` in localStorage.
- Wallet remains on its existing `nu-world-save-v1` store and its financial transaction ledger.
- The Health renderer reads only `window.NUHealth`; it does not inspect or render wallet balances or transactions.
- `nu-wallet.js` and the wallet save schema are intentionally unchanged.
- Each Health category is capped independently at five newest events.

## Integration
The game adapter records Golden HP Capsule use, HP restoration, Chaos Attack damage, and Chaos Attack deaths. New games can call the public `window.NUHealth.recordMedicationUse`, `recordDamage`, `recordHealing`, and `recordDeath` methods with their own `gameId`.

## Files
- `index.html`: Health tab/panel and module script.
- `nu-health.js`: independent storage/API.
- `nu-games.js`: event producer integration.
- `nu-player-ui.js`: Health-only renderer.
- `nu-world.css`: darker wallet panels, Health history styling, larger guide frame.
- `tests/nu-health.test.js` and `tests/nu-wallet.test.js`: isolation and retention tests.
- `docs/operations/2026-11-15-wallet-health-module.md`: this record.

## Verification
- Automated tests are added but have not yet been executed in a repository runner.
- Browser/device acceptance remains pending; do not mark approved from source review or CI alone.
- Confirm four category lists, independent retention, event recording across games, and no health fields in wallet transactions.

## Rollback
Close/revert the scoped PR or restore the exact base from `backup/pre-wallet-health-module-2026-11-15-1707`. Never force-push the public default branch.
