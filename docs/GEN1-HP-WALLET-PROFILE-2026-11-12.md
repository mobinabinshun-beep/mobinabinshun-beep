# N.U Generation 1.11 — HP Capsule, Wallet & Player ID QA
Date: 2026-11-12
Branch: `feature/gen1-hp-wallet-player-id-2026-11-12`
Base: `0097056ace58df7b3b1e521b81acb79072d913af`
Scope: HP capsule use/purchase, local wallet, floating transaction feedback, player ID card.
Protected baseline: `nu-engine.js` SHA `cda4f4157628aefaaac9ab95c047e4ca818c5f02` (must remain unchanged).
Network diagnostics remain inside the same frozen file. Generation 2 remains quarantined.

## Implemented
- Added `nu-wallet.js`, a Generation 1-only local wallet adapter with explicit HP capsule purchase/use, Mana collection/spend, HP changes, XP progression and bounded transaction history.
- HP HUD action remains visible at all times. When unavailable, a tap explains either no capsule inventory or full HP.
- HP capsule purchase costs 10 XP and adds exactly one HP capsule. Use consumes one capsule and restores actual HP up to the 10 HP cap.
- Added floating gain/spend/warning notices.
- Added Wallet view with real Gen1 balances and recent local transactions. X/N Credits are marked inactive, not presented as balances.
- Replaced the temporary personal-data profile form with a local Player ID Card and optional fictional alias.
- No changes to the adaptive/network engine, shared graphics modules, Generation 2 code, public default branch, Pages settings or deployment.

## Automated tests
Run: `node --test tests/nu-wallet.test.js`
- Legacy save normalization
- Successful HP capsule use and partial heal clamp
- Full HP and empty inventory rejection without mutation
- 10 XP purchase and insufficient-XP rejection
- XP level boundary
- Mana cap and spend checks
- HP 0..10 clamping
- Bounded transaction history and local ID format
- Wallet asset list limited to implemented Generation 1 balances

## Manual browser acceptance still required
1. Buy one HP capsule with exactly 10 XP; verify XP becomes 0 and inventory becomes 1.
2. Reload; verify XP and capsule count persist.
3. Take damage to 9/10, tap the visible HP capsule control; verify HP becomes 10/10 and inventory decreases by exactly one.
4. Tap with 0 capsules; verify explanatory warning and no state change.
5. Tap at 10/10 with a capsule available; verify full-HP warning and no item consumption.
6. Double-tap / rapid-tap the capsule; verify no duplicate consumption.
7. Confirm floating `+10 HP`, `-10 XP`, `+1 CAPSULE` (or actual partial HP amount) feedback matches committed balances.
8. Verify wallet rows match the HUD and transaction history after reload.
9. Verify X/N Credits are explicitly inactive and no fabricated balances appear.
10. Save a fictional alias; reload; verify it persists only in this browser.
11. Test touch and mouse, portrait/landscape, reduced motion, and save failure/private-browsing behavior.

## Not claimed
Static/unit tests do not equal browser end-to-end QA. No real-device test, production deployment, merge, or public acceptance is claimed by this branch.
