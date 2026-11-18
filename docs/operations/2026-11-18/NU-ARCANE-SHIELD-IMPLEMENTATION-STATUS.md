# N.U Generation 1 — Arcane Shield & Mana Implementation Status

**Date:** 2026-11-18  
**PR:** [#185 — Mana containers and Arcane Shield](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/185)  
**Candidate SHA:** `ce4ea0e89f02862d5fbef9d5d032b536e2250e1c`  
**Status:** IMPLEMENTED IN CANDIDATE · AUTOMATED TESTS PASS · PUBLIC DEMO DEPLOYMENT NOT VERIFIED · HUMAN QA PENDING

## 1. Confirmed product contract

- One permanent Mana container stores exactly 10 Mana. Capacity levels 1–9 provide 10–90 total Mana; emptying a container never removes its permanent slot.
- Mana Collector grants +1 Mana per successful collection, capped at total capacity. Overflow is not a successful interaction.
- N-BI level 1 spends 10 Mana per successful shot, neutralizes one Chaos mass and grants +3 XP.
- Arcane Shield spends 10 Mana and immediately activates 10 defense. Each Chaos hit consumes one shield unit before HP damage. Shield absorption awards no N-BI XP.
- Remaining shield charge carries across gameplay Waves unchanged. No automatic refill, top-up or stacking.
- At most one successful shield activation is allowed per gameplay Wave ID at every shield level.
- Shield Level 1 charges only in Store before the Wave. Level 2 unlocks one manual in-game charge per Wave; it does not raise the one-charge limit.
- A capacity upgrade consumes 1 X Credit, adds one permanent container and grants +10 initial Mana as an upgrade grant. This is not a standalone Mana sale. Mana thereafter is earned through collection or betting wins.
- The HP-completion Wave (10 successful interactions) remains separate from the Wallet-income Wave (per-asset/category aggregation and idempotent settlement).

## 2. Implementation details

- Wallet remains the single source of truth for Mana, capacity, shield charge, Wave IDs and transaction history.
- Shield charge is a distinct outgoing Mana category: `ARCANE_SHIELD_CHARGE`.
- Capacity-upgrade entries separately record the X Credit debit, permanent container addition and `MANA_CAPACITY_UPGRADE_GRANT`.
- Remaining Chaos target IDs are persisted and resolved shield-first exactly once on exit/navigation/unload/recovery.
- The shield uses a separate purple UI surface. The locked classic LV/XP/Mana HUD, Generation 2 and adaptive/network engine are not modified.

## 3. Defects found and corrected during final review

1. **Unload settlement after failed save:** the previous unload handler settled the Wave even if saving the remaining Chaos damage failed. Settlement is now gated on successful remaining-mass resolution.
2. **Reload recovery guard:** recovery previously depended on the in-memory `state.game`, which is empty after a full page reload. It now uses the persisted active Wave's `gameId` and pending target IDs, so unresolved Chaos masses are recovered before a new round is started.
3. Regression assertions cover both cases.

## 4. Automated verification

- Exact candidate: `ce4ea0e89f02862d5fbef9d5d032b536e2250e1c`.
- Arcane Shield + adjacent + complete Generation 1 test suite: **309/309 PASS**, run [44269702063](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44269702063).
- Studio export regression on the same candidate: PASS, run [44269701676](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44269701676).
- An earlier intermediate run failed one newly added assertion (82/83); the assertion was corrected and the complete suite then passed. Do not report the intermediate failed run as the final result.
- The eight workflows that passed on earlier SHA `e83d600937227e4ae0cc0dcf19e9691b52c6afe8` are not represented as rerun on this later SHA.

## 5. Recovery and release state

- Pre-change checkpoint branch: `backup/pre-arcane-shield-public-demo-2026-11-18`.
- Checkpoint SHA / PR base: `34555b2b10a53ef4fe36f6ac48a99d3291de635b`.
- PR #185 remains open and unmerged.
- Exact candidate deployment to the public demo is **not verified**. Earlier PR comments contained conflicting deployment statements; the latest correction says the exact candidate was not deployed or verified. Do not claim the public URL serves this SHA.
- Public demo target: https://mobinabinshun-beep.github.io/mobinabinshun-beep/
- Human QA remains pending. Do not merge/promote until the exact candidate is deployed, its live build identity is verified, and desktop/mobile/touch testing is recorded.

## 6. Human demo checklist

- [ ] Desktop: levels 1, 2 and 9 capacity; Mana Collector +1 and overflow behavior.
- [ ] N-BI: exact -10 Mana, one target neutralized, +3 XP.
- [ ] Shield: -10 Mana, instant 10 defense, one shield unit per Chaos hit, HP only after depletion.
- [ ] Level 1 Store-only charging; Level 2 one manual in-game charge per Wave.
- [ ] Partial shield carry-over, no auto-refill/top-up, and no second charge in the same Wave.
- [ ] Exit, navigation and reload with live Chaos masses; residual damage applied once, with no duplicate ledger rows.
- [ ] Wallet history, HP Wave completion, reduced motion, narrow viewport and mobile touch.
- [ ] Record device, OS, browser, exact public build SHA, expected/actual behavior and evidence.

**Release state:** SOURCE-CANDIDATE · AUTOMATED-QA-PASSED · BACKUP-VERIFIED · DEMO-DEPLOYMENT-UNVERIFIED · HUMAN-QA-PENDING · NOT MERGED.


## 7. Verification refresh — 2026-11-18 (latest candidate)

- Latest candidate HEAD: `ab2f9ffe448b0001e7215b2e815e5faf7dd8f2d8`.
- Exact-HEAD workflow run [44269872127](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44269872127): **completed / success**; the run's head SHA matches the candidate above. The associated implementation report records 309/309 Generation 1 tests passing.
- PR #185 remains open and unmerged. GitHub currently reports `mergeable=false` and `mergeable_state=dirty`; mergeability/conflict resolution is outstanding.
- Public Pages deployment of this exact HEAD is **NOT VERIFIED**. A previous PR comment reports a successful deployment of older source SHA `e83d600937227e4ae0cc0dcf19e9691b52c6afe8`; a later comment explicitly corrects the status for the newer candidate. Do not treat the older deployment as proof that this HEAD is live.
- The shield panel currently renders its purple meter and charge control, but no dedicated shield artwork is wired into the panel. The archive `Material/` directory currently lists five Mana SVG variants and no separately named shield SVG. The supplied pixel-art ZIP has not been inspected internally; shield-icon integration remains **NOT VERIFIED / OPEN**.
- Human desktop/mobile/touch acceptance remains pending. Do not merge or promote until the current HEAD is deployed and its live identity is verified, the PR is mergeable, and human QA is recorded.

**Refreshed state:** IMPLEMENTED IN CANDIDATE · EXACT-HEAD AUTOMATED CHECK PASS · BACKUP VERIFIED · CURRENT-HEAD DEMO DEPLOYMENT NOT VERIFIED · SHIELD ARTWORK INTEGRATION NOT VERIFIED · HUMAN QA PENDING · NOT MERGED.
