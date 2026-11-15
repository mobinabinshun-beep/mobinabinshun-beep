# N.U Wave & Wallet Transaction Economy
**Status:** Canonical archived economy specification / future implementation reference  
**Date:** 2026-11-15  
**Scope:** Generation 1 game modules, HP economy, Global N.U Wallet, transaction history and store spending  
**Authority:** This document fixes the meaning of *Wave* in two separate economic contexts. It documents intended product rules; it does not claim that every rule is already implemented in the current prototype.

## 1. Core rule: Wave has two distinct economic meanings

The word **Wave** is intentionally used in two related but different ways. Implementations and documentation MUST keep these meanings separate.

### 1.1 HP-economy Wave: completed mission unit

An HP Wave is the successful completion of the full mission for one game interaction page/round.

- In the three core Generation 1 random games, one full mission consists of **10 successful interactions**.
- These 10 interactions are positive/successful interactions. There are no negative interactions in the core trio's interaction counter.
- A missed click or unsuccessful attempt does not count toward the 10 successful interactions.
- Completing all 10 successful interactions completes the HP Wave.
- The current Generation 1 prototype awards **+1 HP** on round completion, capped at the maximum HP of 10. This is the existing prototype rule and must not be confused with wallet transaction aggregation.
- Leaving, closing or abandoning a round before the full mission is complete does not complete an HP Wave and does not earn the completion HP.
- A new launch/restart creates a new round/Wave identity; progress from separate rounds must not be combined to complete one HP Wave.

This definition is about mission completion and HP eligibility, not the number of wallet ledger rows.

### 1.2 Wallet-income Wave: aggregate receipts by asset/reward category

For incoming wallet transactions, a Wave is the aggregation boundary for all successfully earned units in each reward/asset category during that game run.

- Count every successful earning interaction during that Wave.
- On Wave settlement/exit, aggregate the earned amount for each asset/reward category into one incoming transaction row per category.
- Do not create a separate wallet-history row for every click, tap, bubble, shot or other low-level interaction.
- The player may leave at any time. Successfully earned amounts up to that point are retained and settled; incomplete/unsuccessful interactions earn nothing.
- An abandoned/incomplete HP Wave can still have incoming wallet receipts for successful interactions. HP completion eligibility and wallet-income settlement are independent.
- A Wave with no successful earning interaction produces no zero-value income row.
- Each aggregate is settled once only, using a stable idempotency key based on the player, game, Wave ID and asset/category.

Examples:
- Bubble Hunt: 5 successful bubbles = one incoming row of **+5 XP** for that Wave.
- Mana Collector: 7 successful Mana collections = one incoming row of **+7 Mana**.
- Chaos Attack: 4 successful shots = one incoming row of **+12 XP** (4 × 3 XP). Its Mana cost is recorded separately as an outgoing expense (see section 3).

A Wave can therefore produce more than one aggregate row if it affects more than one asset/category (for example, XP earned and Mana consumed). The aggregation key is the Wave plus the asset and transaction direction/category, not the raw interaction.

## 2. Core Generation 1 game reward rules

| Game | Successful interaction | Incoming reward |
|---|---|---:|
| Bubble Hunt | One bubble successfully hunted | +1 XP |
| Mana Collector | One Mana successfully collected | +1 Mana |
| Chaos Attack | One Chaos mass successfully neutralized by an N-BI shot | +3 XP |

- Each core round has a maximum of 10 successful target interactions.
- Missed/unsuccessful interactions do not advance the successful-interaction count and do not earn rewards.
- The Chaos Attack N-BI cost in the current prototype is **10 Mana per successful shot**. This is an outgoing cost, not a negative interaction. Any future upgrade-based cost reduction must be represented by an explicit economy rule/configuration; do not silently assume it is already active.
- For a Wave with (n) successful Chaos shots, the current prototype economics are +(3n) XP and -(10n) Mana, represented as separate incoming and outgoing aggregates.

## 3. The wallet has two transaction directions / models

The Global N.U Wallet transaction history MUST distinguish these two directions:

### 3.1 Incoming / received (positive)

Money-like or game assets credited to the player:
- XP earned from eligible game interactions;
- Mana collected;
- HP granted for completing an HP-economy Wave, where HP is represented in the wallet ledger;
- other explicitly configured game rewards, grants, refunds or incoming transfers.

Incoming records use a positive signed amount and a clear **Received / Incoming** classification.

### 3.2 Outgoing / spent (negative)

Assets deducted from the player:
- XP spent to buy a Golden HP Capsule or another Store item;
- Mana consumed by N-BI shots or other explicitly priced game actions;
- assets spent in purchases, exchanges, fees or other authorized costs.

Outgoing records use a negative signed amount and a clear **Spent / Outgoing** classification.

Example: purchasing one Golden HP Capsule at the current prototype price creates one outgoing XP transaction of **-10 XP**. The purchased capsule is a separate credited inventory item if the wallet ledger tracks item inventory; do not mislabel the XP deduction as an incoming reward.

**Important:** “positive/negative” describes the direction of asset movement in the wallet. It does not describe positive or negative gameplay interactions. The three core games' successful-interaction counter remains positive-only.

## 4. Transaction record contract

Each aggregate wallet row should contain, at minimum:

- transaction ID;
- player/profile ID;
- game or service source;
- Wave/session ID when applicable;
- asset/currency code (XP, Mana, HP, Credits, etc.);
- direction: INCOMING or OUTGOING;
- signed amount;
- category/reason (GAME_REWARD, WAVE_HP_COMPLETION, GAMEPLAY_COST, STORE_PURCHASE, EXCHANGE, REFUND, etc.);
- successful interaction count and reward/cost rate when applicable;
- timestamp and resulting balance;
- settlement status and idempotency key.

A store purchase or exchange operation is its own completed economic operation, not a game-interaction Wave. It still creates the appropriate outgoing and/or incoming ledger entries.

## 5. Settlement lifecycle and integrity

1. Create a unique Wave ID when a game round starts.
2. Track successful interactions and earned/spent amounts by asset/category in the active Wave.
3. On player exit, round completion or other terminal event, freeze the Wave result.
4. Settle each non-zero asset/category aggregate exactly once.
5. Separately evaluate whether the HP-economy mission was completed (10 successful interactions in the core trio); if complete, apply the configured HP completion reward once.
6. Mark the Wave settled/closed. Repeated exit events, reload recovery or retry requests must not duplicate rewards, costs or HP.
7. A new launch creates a new Wave ID; it must never resume or merge a previously closed Wave unless an explicit recovery policy says so.

The wallet is the authoritative cross-game ledger. A game-scoped asset profile is only a projection of that game's assets and must not independently mint, duplicate or re-settle wallet balances.

## 6. Worked examples

| Scenario | HP Wave complete? | Incoming aggregate | Outgoing aggregate |
|---|---|---|---|
| Bubble Hunt: 1 successful hunt, then exit | No | +1 XP | — |
| Bubble Hunt: 5 successful hunts, then exit | No | +5 XP | — |
| Bubble Hunt: 10 successful hunts | Yes; +1 HP under current prototype rule | +10 XP | — |
| Mana Collector: 7 successful collections, then exit | No | +7 Mana | — |
| Chaos Attack: 4 successful shots, then exit | No | +12 XP | -40 Mana |
| Chaos Attack: 10 successful shots | Yes; +1 HP under current prototype rule | +30 XP | -100 Mana |
| Enter a game and exit without a successful interaction | No | No row | No row |
| Buy one Golden HP Capsule | Not a game Wave | Capsule inventory credit if tracked | -10 XP |

The HP reward shown above follows the current prototype's round-completion behavior. If the product owner changes the HP reward amount or eligibility, update this canonical specification and the game economy configuration together.

## 7. Implementation boundaries and current-state warning

This document is the **canonical specification**. The public demo candidate on branch `feat/public-demo-wave-wallet-human-test-2026-11-15` now implements a browser-local Wave settlement path for the three Generation 1 core games: each launch creates a Wave ID; successful rewards and N-BI Mana costs are aggregated by asset/category; exit, new round, ten-success completion, page unload and interrupted-session recovery close the Wave; and settlement rows carry direction, signed amount, interaction count, resulting balance and an idempotency key. The Wallet transaction view presents Incoming / Received and Outgoing / Spent records. Store purchase and capsule-use movements are represented as separate asset-direction rows.

This is a **local demo implementation only**, not production wallet infrastructure. It uses localStorage, a bounded local transaction history and client-side idempotency. It does not provide server authority, cross-device consistency, authenticated ownership, tamper resistance, cloud recovery or production-grade durable idempotency. Manual browser/device acceptance is pending. Do not claim operational financial or online-wallet compliance.

Do not:
- create one history row for every low-level click;
- combine HP mission completion with wallet income aggregation into one meaning;
- discard successfully earned rewards merely because the player exits before 10 interactions;
- grant HP for an incomplete HP Wave;
- treat a gameplay cost as a negative interaction;
- settle a Wave more than once;
- duplicate a game reward in both the game profile and the global wallet.

## 8. Canonical terminology

- **HP-economy Wave:** one completed 10-successful-interaction mission in a core Generation 1 game round.
- **Wallet-income Wave:** the per-game-run aggregation boundary for incoming earned assets, grouped by asset/reward category.
- **Incoming / Received:** positive asset movement into the player's wallet.
- **Outgoing / Spent:** negative asset movement out of the player's wallet.
- **Game Asset Profile:** game-specific projection of assets.
- **Global N.U Wallet:** authoritative cross-game asset balances and consolidated transaction ledger.

This document is the canonical reference whenever future design, implementation, QA, or code review asks what a Wave means or how positive and negative wallet transactions are recorded.
