# N.U — Regression test contract repair

**Date:** 2026-11-15  
**Change ID:** TEST-CONTRACT-REPAIR-01  
**Repository:** `mobinabinshun-beep/mobinabinshun-beep`  
**Status:** MERGED · CI-PASSED · no runtime change

## Request and purpose
Repair stale automated assertions discovered while reviewing the public-demo candidate PR #145. Keep the change test-only and do not alter product behavior.

## Baseline and recovery
- Inspected default-branch commit: `3a0de39d2b99f99264e2a08c3da7db2c79887511`
- Backup branch: `backup/pre-test-contract-repair-2026-11-15`
- Candidate branch: `fix/test-contract-repair-2026-11-15`
- Pre-change archive: `archive/pre-change/2026-11-15-test-contract-repair-01/`
- Archive manifest records the original blob SHAs; all three archived copies were verified byte-identical by Git blob SHA.

## Exact files changed
1. `tests/nu-wallet.test.js` — assert the split XP and HP Capsule ledger entries returned by `result.transactions`, rather than expecting both deltas in the first transaction.
2. `tests/nu-hp-pill-interaction.test.js` — assert that the current game script remains cache-busted without pinning obsolete historical query strings.
3. `tests/nu-world-entry-calibration.test.js` — same version-agnostic cache-bust assertion.

## Protected files and behavior
No runtime source, wallet implementation, game rules, HUD markup/styles, Gateway, adaptive engine, background assets, saves, economy, or public deployment was changed.

## Evidence and verification
PR #145 at head `7578bcd6ef456814589b3a5fd5a152e3bf73884c` showed:
- HP Capsule purchase/use assertions failing because the test expected a combined delta while the current implementation returns separate ledger entries.
- HP HUD and world-entry tests failing because they required cache-bust values that are no longer the current script version.
- The relevant runtime files were unchanged from the inspected base commit.

The original test files were archived and hash-verified before edits. PR #146 merged into the default branch as commit `08b640c5e2d6b755466ef4bd4677cd3d2bb1e56f`. Wallet/profile regression, Graphics Preview smoke checks, and Studio export regression gates all passed. No local execution, browser QA, or user-facing runtime change is claimed.

## Rollback
Close/revert PR #146 and restore the exact test files from the archive folder or backup branch. No runtime rollback is required because runtime files were not changed.

## Next gate
The test-only repair is merged. Preserve the human-acceptance gate for all product-facing candidates; CI success does not constitute human acceptance.
