# N.U Public Demo — Wave Wallet Human QA

**Candidate:** Public browser demo, Generation 1  
**Date:** 2026-11-15  
**Status:** Manual acceptance pending  
**Canonical economy:** [Wave and Wallet Transaction Economy](../architecture/NU-WAVE-AND-WALLET-TRANSACTION-ECONOMY.md)

## Scope and safety

This checklist verifies the browser-local demo only. Use a disposable browser profile and test data. Do not enter personal information, passwords, payment data or secrets. The local wallet is not real money, an online account, a cloud ledger or a transferable balance. The downloaded report is a local snapshot and is not automatically submitted.

## Expected game economy

| Game | Successful action | Incoming | Outgoing |
|---|---|---:|---:|
| Bubble Hunt | One successful bubble hunt | +1 XP | — |
| Mana Collector | One successful Mana collection | +1 Mana | — |
| Chaos Attack | One successful N-BI shot | +3 XP | -10 Mana |
| Any core game | Complete 10 successful interactions | +1 HP, capped at 10 | — |

Missed clicks do not advance the ten-success counter. Leaving early settles all earned/spent amounts accumulated so far but does not grant the 10-interaction HP completion reward. Each non-zero asset/category aggregate is one ledger row per Wave.

## Manual acceptance

### 1. Baseline and isolation
- [ ] Open the public demo in a fresh browser profile.
- [ ] Confirm the intro identifies the experience as an experimental browser demo.
- [ ] Open N.U Wallet and note initial local balances.
- [ ] Confirm no real account, payment or cloud-sync claim is presented.

### 2. Bubble Hunt
- [ ] Launch Bubble Hunt.
- [ ] Click empty space; confirm the successful-action counter does not advance.
- [ ] Complete five successful hunts, then leave the game.
- [ ] Open Wallet → Transactions; expect exactly one aggregate Bubble Hunt incoming XP row for +5 XP, with one Wave ID and successful-interaction count 5.
- [ ] Launch Bubble Hunt again, complete ten successful hunts; expect +10 XP in one aggregate row and, if HP was below 10, one +1 HP completion row.
- [ ] Confirm a new launch uses a different Wave ID.

### 3. Mana Collector
- [ ] Launch Mana Collector with available Mana capacity.
- [ ] Collect seven successful particles, then leave.
- [ ] Expect one incoming Mana row for +7 Mana, not seven click rows.
- [ ] Fill Mana storage and confirm further collections do not count as successful interactions.

### 4. Chaos Attack
- [ ] Ensure at least 40 Mana is available; launch Chaos Attack.
- [ ] Complete four successful N-BI shots, then leave.
- [ ] Expect one incoming XP row for +12 XP and one outgoing Mana row for -40 Mana, both linked to the same Wave ID.
- [ ] Confirm the Mana balance and XP balance match the displayed ledger.

### 5. Wave completion and interruption
- [ ] Exit a round before ten successful interactions; confirm earned rewards remain and no completion HP is granted.
- [ ] Complete ten successful interactions; confirm the completion HP reward is applied at most once and capped at 10.
- [ ] Reload or close a tab during an active round; reopen the demo and confirm the interrupted Wave is recovered/settled without duplicate ledger rows.
- [ ] Trigger repeated exit/navigation actions; confirm the same Wave is never settled twice.

### 6. Store operations
- [ ] With at least 10 XP, purchase one Golden HP Capsule.
- [ ] Expect one outgoing XP row (-10 XP) and one incoming capsule inventory row (+1 capsule), both marked as Store purchase operations, not game Waves.
- [ ] Use one capsule while HP is below 10; expect incoming HP restoration and outgoing capsule consumption rows.
- [ ] Confirm a capsule cannot be used when HP is full or inventory is empty.

### 7. Human report
- [ ] Open Wallet → Transactions.
- [ ] Select **Download Human Test Report**.
- [ ] Open the downloaded TXT file and verify it includes the generation time, local-mode warning, balances, recent transaction details, Wave IDs, idempotency keys and checklist.
- [ ] Confirm the report does not claim independent verification or automatic submission.

### 8. Device, accessibility and release checks
- [ ] Test mouse and touch input on desktop and at least one phone/tablet.
- [ ] Test keyboard focus and screen-reader labels for Wallet tabs and report action.
- [ ] Test reduced-motion preference and narrow portrait layout.
- [ ] Confirm the public Pages URL serves the candidate assets after deployment.
- [ ] Record browser, OS, device, viewport, test date, observed result and screenshots (with no personal data) in the human review.

## Defect report template

For each failure, record:
- Test section and step:
- Expected result:
- Actual result:
- Browser / version:
- OS / device:
- Viewport:
- Reproduction steps:
- Console error (if any):
- Severity: blocker / major / minor / cosmetic:

## Acceptance gate

Do not mark the candidate as human-accepted until the manual checklist has been run on supported devices, the public Pages deployment has been confirmed, and all blocker/major defects have been resolved or explicitly accepted by the project owner.
