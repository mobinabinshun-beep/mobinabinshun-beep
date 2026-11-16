# Public demo deployment record — Bag / Inventory / Wallet / Health / MHL

**Date:** 2026-11-16  
**Change:** NU-BAG-WALLET-01  
**Status:** MERGED TO PAGES SOURCE · LIVE HTTP VERIFICATION PENDING · HUMAN-QA-PENDING

## Deployment and source evidence

- Pull request: [#136](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/136)
- Merge result: success
- Merge commit: `2f7af5fd8b5efafd6213fb6f15be9cb66193cb3c`
- Candidate branch: `feat/wallet-health-module-2026-11-15`
- Exact candidate SHA before merge: `6ee831248efb2f3558916b9bbd31ea95ce404c67`
- Candidate backup: `backup/pre-public-demo-candidate-2026-11-16` — verified identical to the candidate SHA (compare status: identical; 0 ahead / 0 behind).
- Pre-deployment default-branch backup: `backup/pre-public-demo-default-2026-11-16` — verified identical to the inspected prior default SHA `3a0de39d2b99f99264e2a08c3da7db2c79887511`.
- Existing pre-feature backup remains: `backup/pre-bag-wallet-history-2026-11-16` at `9aeac1936a2f163856c31c5782726e5508c1cbd6`.
- The default branch is the GitHub Pages publication source. The merged `index.html` contains the Bag/Wallet changes and its canonical URL is `https://mobinabinshun-beep.github.io/mobinabinshun-beep/`.

## Machine verification evidence

The updated candidate head `6ee831248efb2f3558916b9bbd31ea95ce404c67` had successful completed workflow runs:

| Workflow | Run ID | Result |
|---|---:|---|
| N.U wallet and profile regression | 43838237461 | PASS |
| N.U Studio export regression gates | 43838237530 | PASS |
| N.U graphics preview smoke checks | 43838237714 | PASS |
| N.U graphics integrity | 43838237561 | PASS |
| N.U Generation 1 HUD layout regression | 43838237526 | PASS |
| N.U Exchange feature regression | 43838237525 | PASS |
| N.U Gateway main-game regression | 43838237730 | PASS |

The functional code commit `746a1ced1142b0309b124ec373f0f0982eac3202` previously passed all 8 relevant CI checks, including Wallet 50/50, Gateway 12/12 and Studio/export 219/219. The candidate documentation head above has the seven listed successful workflow runs.

## Publication verification status

- Merge to the Pages source branch is confirmed.
- The canonical public URL is read from the merged `index.html` canonical link.
- A direct external HTTP/browser fetch of the public URL could not be completed by the available verification interface during this run. Therefore live reachability, Pages propagation timestamp and the exact served commit are **not independently confirmed here**.
- Do not represent this source merge as a completed live-site smoke test. The deployment state is **MERGED TO PAGES SOURCE / LIVE HTTP VERIFICATION PENDING** until the URL is reachable and the served build is confirmed.
- No branch preview is being substituted for the public demo.

## Human QA and scope

- Human QA: **PENDING**.
- Owner approval: **NOT RECORDED**.
- Feature lock: **NOT RECORDED**.
- Known human QA focus includes Bag navigation, owned Inventory, Wallet balances, signed Transactions, Health and per-Wave totals, MHL, Gateway return routes, HP Capsule affordance, keyboard/focus, touch and portrait/landscape behavior.
- The known keyboard/focus concern and real-device behavior must not be marked passed by CI.

## Rollback

- Revert merge commit `2f7af5fd8b5efafd6213fb6f15be9cb66193cb3c` to remove the candidate from the Pages source branch, or restore the verified pre-deployment default checkpoint `backup/pre-public-demo-default-2026-11-16`.
- Candidate source remains preserved at `backup/pre-public-demo-candidate-2026-11-16`.
- Do not force-push the public branch.
