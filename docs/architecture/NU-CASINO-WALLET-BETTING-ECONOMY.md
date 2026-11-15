# N.U Casino — Wallet Betting & Double-Up Ladder

**Status:** Generation 1 public-demo candidate  
**Date:** 2026-11-15  
**Scope:** Browser-local virtual assets only; no real-money gambling, deposits, cash prizes or cash-out.

## 1. Wallet source of truth

N.U Casino does not maintain a separate casino-only balance. It reads spendable positive balances from the shared N.U Wallet. The selector includes eligible asset groups (progression, resources, currency and games), such as XP, Mana, X Credits, N Credits and the existing Casino Credits balance. HP and consumable inventory are excluded.

The player selects:
- one available wallet asset;
- a base wager from 1 unit up to the spendable balance;
- one of the three existing casino games.

The effective wager equals the selected base wager multiplied by the current ladder step. The available base-wager maximum is reduced as needed so the effective wager never exceeds the selected asset balance.

## 2. Existing game rules retained

| Game | Existing outcome | Gross payout |
|---|---|---:|
| Coin Flip | Correct Heads/Tails call | 2× wager |
| Lucky Dice | Exact match on one of six faces | 5× wager |
| Mini Slots | Three matching symbols | 8× wager |
| Mini Slots | Any pair | 2× wager |
| Any game | Losing outcome | 0 |

Payout multipliers are gross returns and include the stake. Net result is gross payout minus the wager.

Mana has a finite capsule-storage capacity. If a casino payout would exceed that capacity, only the amount that fits is credited and the round is visibly marked as capped. Other wallet balances are bounded by safe integer limits.

## 3. Double-up ladder

The four steps are relative to the player's selected base wager:

1. 1×
2. 2×
3. 4×
4. 8×

Candidate behavior:
- A net loss advances one step.
- A win or break-even result resets to 1×.
- A loss at 8× completes the ladder and resets to 1×.
- Changing the selected currency resets the ladder to 1×.
- Leaving/navigating away from the casino or closing the page resets the ladder. Ladder progress is intentionally not persisted across page reloads or visits.

The player must be able to see the current step and effective wager before starting a round.

## 4. Transaction model

A casino round is a standalone betting operation, **not a core-game Wave**. Each round receives a unique round ID and idempotency keys.

- Wager: one OUTGOING / Spent transaction with a negative signed amount.
- Payout: one INCOMING / Received transaction with a positive signed amount, only when a non-zero payout is credited.
- Both rows share the same round ID, selected asset, game, timestamp and settlement status.
- A loss creates no zero-value incoming row.
- Duplicate round settlement is rejected.
- The resulting wallet balance is updated once and is visible to the main N.U Wallet and any game-scoped projections.

## 5. Feedback and safety

- Each round has short start, execution and result feedback.
- Reduced-motion preference disables the pulsing animation.
- The interface labels the selected balance and all results as local virtual wallet activity.
- No real-money deposit, withdrawal, payment provider, cash-out, transferable value or server account exists.

## 6. Implementation boundary

The public demo candidate uses the same browser-local `nu-world-save-v1` localStorage record as the N.U Wallet. Client-side round IDs and idempotency guards are test protections, not a tamper-resistant or production ledger. Cross-device sync, server authority, authenticated ownership, audit-grade persistence and any real-money feature are explicitly out of scope.

Manual browser/device QA remains required. This document records the current candidate behavior; it does not certify deployment or human acceptance.
