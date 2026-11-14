# N.U Launcher Exchange — Generation 1 Base Economy & Benchmark Catalog

**Date:** 2026-11-14  
**Status:** Owner-directed pricing baseline / source-audited draft; no live exchange rates activated  
**Applies to:** Bubble Hunt, Chaos Attack, Mana Collector, Creative Studio and future N.U game adapters

## 1. Purpose and governing model

This catalog defines the first reference economy used by the N.U Launcher Exchange to compare future game assets. It is a **benchmark and price-discovery profile**, not a permission to convert every item and not a real-money market.

Bubble Hunt, Chaos Attack and Mana Collector belong to one Generation 1 shared economic profile. They read and write a common browser-local wallet/save, while the current UI presents filtered game-specific views of that shared inventory. A game-specific view is not a separate wallet.

The exchange should preserve this shared Generation 1 profile as the initial reference family, then onboard new games through versioned manifests. Each new game may have different labels, asset types, coin names, earning rates, costs and progression ladders. Matching is based on economic mechanics and measured effort/utility, not names.

## 2. Source-audited Generation 1 shared profile

### 2.1 Current reward and spend mechanics

| Event / asset | Source-audited behavior | Reference meaning |
|---|---|---|
| Bubble Hunt XP | One successful bubble target interaction calls the shared XP grant for +1 XP | Base interaction-earned XP reference: 1 unit per valid successful interaction |
| Chaos Attack XP | One successful N-BI shot grants +3 shared XP | 3 shared XP per successful shot; this is a different earning event from a Bubble Hunt interaction |
| Mana Collector | One successful Mana target interaction adds +1 Mana | Base Mana earning event: 1 Mana per valid successful collection |
| Chaos Attack Mana sink | Each successful N-BI shot consumes 10 Mana; shot is blocked below 10 Mana | Known Mana cost anchor: 10 Mana per successful shot |
| Round completion | A 10-successful-interaction round restores up to 1 HP | HP reward/sink behavior is game-state utility, not a transferable market currency |
| Legacy XP level | `nu-wallet.js` increments level for every 100 cumulative shared XP | Existing code behavior; must be reconciled with the owner's newer Studio 50-XP level rule and Bubble Hunt capsule rule |
| HP Capsule purchase | One Golden HP Capsule costs 10 legacy shared XP and restores up to 10 missing HP on use | Existing wallet sink: 10 legacy XP per HP Capsule; not the Bubble Hunt Capsule |
| Mana storage | One Mana Capsule stores 10 Mana; wallet starts with 1 and currently caps at 10 capsules | Capacity/storage unit, not an implemented purchase price or conversion rate |
| Casino Credits | Casino save starts at 100 virtual credits; wager/payout changes local credit balance | Separate casino-only virtual unit; not XP/Mana, not cash, no deposits or cash-out |
| X Credits / N Credits | Legacy save schema contains fields, but they are not exposed in current asset rows or backed by an implemented earn/spend ladder in the inspected code | Dormant/unpriced; do not list as exchangeable assets yet |

### 2.2 Creative Studio XP source

Studio exports can award a local XP reward, based on the following provisional formula:

`score = floor(paintedPixels/256) + floor(regions/8) + floor(pathCount/24) + floor(colors/8)`

`Studio XP = clamp(score, 1, 25)`

- Artwork below 16 painted pixels receives no reward.
- One artwork fingerprint can claim the reward once across export formats.
- The reward is triggered when export/download is initiated, not after proof of a successful disk save.
- The current code writes this reward into the same legacy shared XP field used by the three Generation 1 games.
- This is browser-local and not server-authoritative or anti-cheat resistant.

**Owner policy anchor:** 50 XP_Studio = 1 Studio level. This differs from the current legacy wallet code's 100-XP level increment. The owner-directed 50-XP Studio progression must be treated as the target Studio rule; do not silently change the current wallet behavior as part of documentation or infer that the legacy shared XP already follows it.

### 2.3 Owner-provided Bubble Hunt ladder anchors

- XP_Bubble Hunt: 1 unit per valid, intentional, game-recognized interaction.
- 100 XP_Bubble Hunt = 1 Bubble Hunt Capsule.
- Later rungs (capsules-to-next-tier, coin/credit rewards, upgrades and terminal steps) are **not yet confirmed from inspected source code**. Preserve as `UNVERIFIED / SOURCE REQUIRED` until the authoritative Bubble Hunt economy rules are located.
- The Bubble Hunt Capsule is distinct from the Golden HP Capsule and Mana Capsule.

These are owner-provided target economy anchors. The currently inspected prototype code grants +1 XP per successful Bubble Hunt interaction but does not implement the 100-XP Bubble Hunt Capsule mint/redemption ladder. The current local Store instead implements the separate 10-XP Golden HP Capsule purchase.

## 3. Base index and valuation units

Use the following independent benchmark dimensions. Do not collapse them into one raw “price” number:

1. **Earning index (EI):** valid units earned per verified successful action and per measured minute.
2. **Effort index (FI):** time, precision, difficulty, risk and repetition needed to earn one unit.
3. **Progression index (PI):** utility of the asset inside its own ladder (level, capsule, upgrade, unlock, tier).
4. **Sink index (SI):** verified amount and frequency consumed by purchases, shots, upgrades, fees or other sinks.
5. **Scarcity/supply index (SSI):** caps, availability, reset cadence, drop limits and concentration.
6. **Integrity index (AI):** confidence in server-side validation, anti-automation, provenance and authoritative balance source.

The Bubble Hunt interaction is the first **earning-mechanism reference**: one valid target interaction awards one XP_Bubble Hunt. It is not a universal promise that every game's XP is worth 1:1. A new asset with the same name but easier/faster farming must be discounted according to measured effort and supply; a harder or riskier earning path may warrant a different factor.

A quote's benchmark value is expressed in a named reference unit (for example, `BHXP-index`) and carries the full method and policy version. The index is a comparison tool, not a claim that all currencies share the same utility.

## 4. Matching rules for future games

### 4.1 Match by mechanism, not label

A new game asset is a candidate match when its mechanics align with a Generation 1 reference:
- same validated earning action and comparable effort -> candidate match to the relevant earning index;
- same progression function and equivalent threshold/utility -> candidate match to that progression rung;
- same sink purpose and comparable cost/benefit -> candidate match to that sink class;
- different role, cap, risk, scarcity or utility -> separate class, even if the asset name is identical.

Names are aliases only. A “coin” in one game is not automatically equivalent to a “coin” in another.

### 4.2 Independent rungs

Matching one rung does not match the entire ladder. For example:
- If a new game awards one coin for an action comparable to one Bubble Hunt interaction, its coin may be evaluated against the **earning index**.
- If 1,000 of those coins create one game-specific capsule, that capsule is a separate progression rung. It is not equivalent to one Bubble Hunt Capsule merely because both are capsules.
- If another game reproduces the complete Bubble Hunt ladder with different names, each rung may be mapped independently after validating its function, threshold, costs, benefits and supply constraints.
- New coins/credits with no XP equivalent are priced against the base profile using their own earning action, sinks and progression utility. They do not need to invent an XP asset.

### 4.3 Illustrative ratio (not an approved live rate)

If a future game is measured and policy-approved at **2 units of its asset = 1 XP_Bubble Hunt benchmark unit**, the comparison rate is 0.5 BHXP-index per new-game unit. That example only demonstrates how a ratio is recorded. It is not a default rate for future games and cannot be used to create a quote without the evidence and approval fields below.

### 4.4 Ease-of-earning adjustment

If a new game's unit is easier to obtain than the Bubble Hunt reference, the same nominal action reward does not guarantee equal value. Compare:
- median and percentile time-to-earn;
- successful actions per minute and failure rate;
- input precision, skill and risk;
- available targets and supply limits;
- automation resistance and repeatability;
- the value and frequency of the asset's sinks.

A dynamic factor can then be applied to the base benchmark. The calculation and source observations must be visible to the player and recorded in the quote. No rate may be inferred from a chart line or raw balance alone.

## 5. Starter asset catalog

| Asset / family | Reference baseline | Known status | Default exchange policy |
|---|---|---|---|
| XP_Bubble Hunt | +1 per valid intentional Bubble Hunt interaction; owner anchor 100 XP = 1 BH Capsule | Earning confirmed in code; capsule mint ladder owner-specified but not implemented in inspected code | Benchmark asset; only allow-listed equivalence routes |
| XP_Studio | Provisional export formula, 1–25 per eligible unique artwork; owner anchor 50 XP = 1 Studio level | Formula confirmed; shared legacy wallet destination; level threshold conflicts with legacy code | Separate provenance/asset namespace in target model; ratio to BHXP requires policy |
| Shared legacy XP | Bubble Hunt +1, Chaos Attack +3/shot, Studio export 1–25 all currently credit same `xp` field | Confirmed in code | Preserve as legacy/unattributed until migration; do not relabel balances by guess |
| Mana | +1 per successful Mana Collector collection | Confirmed in code | Shared Generation 1 profile resource; no direct XP_Bubble Hunt conversion |
| Mana Capsule | 10 Mana storage capacity per capsule; one initial; max 10 | Capacity confirmed; no purchase ladder | Storage/capacity item; no cross-game conversion by default |
| Chaos N-BI shot | Consumes 10 Mana and awards +3 shared legacy XP | Confirmed in code | Action/sink benchmark, not a transferable asset |
| HP | Max 10; round completion restores up to 1; Chaos breach removes 1 | Confirmed in code | Gameplay state; non-convertible by default |
| Golden HP Capsule | Costs 10 legacy shared XP; restores up to 10 missing HP | Confirmed in code | Native Generation 1 consumable; distinct from BH and Mana capsules |
| Casino Credits | Starts at 100; wager/payout in Casino only | Confirmed in code; virtual, no cash-out | Isolated casino class; non-convertible by default |
| X Credits / N Credits | Fields exist in save schema only | No current earning, spending or valuation implementation found | Dormant; not exchange-listed |
| New-game coins/credits | No universal rate | Evaluated against earning, effort, sinks, utility, scarcity and integrity indices | Register as new asset; map each rung separately |

## 6. Quote and policy record

Every approved equivalence pair must store:
- source and destination game IDs and asset IDs;
- reference profile and benchmark unit;
- ratio and direction (one-way or two-way);
- earning/effort observations and valuation formula;
- progression/sink/scarcity/integrity adjustments;
- fee, rounding, minimum/maximum, daily caps and quote expiry;
- policy version, approver, effective time and review date;
- evidence links and reason for approval.

A route can be approved at one rung while another rung remains unmatched. Non-matching pairs return an explicit denial such as `PAIR_NOT_EQUIVALENT`; no “fallback” conversion is allowed.

Current owner constraints:
- XP_Bubble Hunt -> Mana: prohibited.
- XP_Bubble Hunt <-> XP_Studio: no rate until a documented ratio is approved.
- HP and Casino Credits: non-convertible by default.
- Bubble Hunt Capsule, Mana Capsule and Golden HP Capsule are three distinct asset types.

## 7. Shared Generation 1 profile and future adapter contract

The three Generation 1 games must register under a common profile family, for example `nu.g1.shared-economy`. The profile bridge reads one common wallet balance set and shows per-game contribution/provenance, rather than creating three duplicate balances.

Every future game adapter must declare:
- stable `gameId`, `profileFamily`, manifest and adapter versions;
- namespaced asset IDs and display labels;
- earning events, validation conditions and rate/effort observations;
- progression ladder rungs and exact thresholds;
- sinks, capacity, caps, reset behavior and redemption outcomes;
- source of truth, provenance and whether the asset is transferable;
- candidate benchmark mappings, each independently approved or rejected.

The registry must accept a game with XP, coins, credits, multiple currencies or no XP at all. A game may share the Generation 1 earning benchmark without sharing its capsule ladder.

## 8. Analytics and chart index

- Keep a separate time series per game and asset.
- Every event includes `gameId`, `profileFamily`, `assetId`, `amount`, `unit`, `sourceEvent`, timestamp, adapter version and provenance.
- Display earning index, effort index, sink index and normalized benchmark value as separate series/indicators.
- A cross-game normalized index must show its reference asset, base period, formula, difficulty adjustment and policy version.
- Raw XP, coins, capsules and credits must never be plotted as if they were one directly comparable price series.
- Candles and volume describe recorded, real in-game activity only; synthetic previews remain separately labelled and cannot mutate balances.
- Chart analytics never determines or executes a settlement quote.

## 9. Source audit and unresolved implementation work

Inspected files on `feature/nu-exchange-studio-launcher-spec`:
- `nu-games.js`: Bubble Hunt +1 XP/valid interaction; Mana Collector +1 Mana/valid interaction; Chaos Attack consumes 10 Mana and grants +3 XP per successful shot; round has 10 successful interactions.
- `nu-wallet.js`: one legacy XP field, one shared local wallet, 100-XP level increment, 10-XP Golden HP Capsule purchase, 10-Mana-per-capsule capacity, Casino Credits and dormant X/N Credit fields.
- `nu-pixel-art-studio.js`: provisional 1–25 XP formula and one reward per artwork fingerprint, credited to the shared legacy XP field.
- `README.md`: documents the three games, local-only shared wallet, Studio reward formula, and Casino's separate virtual-credit system.

Before implementation:
1. Locate/verify the complete Bubble Hunt capsule/coin/credit ladder from its authoritative source; current inspected game code does not implement it.
2. Reconcile the owner's Studio 50-XP level and Bubble Hunt 100-XP capsule anchors with the existing legacy 100-XP shared level behavior.
3. Add provenance to new XP and Mana events without guessing the origin of historical legacy XP.
4. Create the shared Generation 1 profile-family manifest and per-game contribution records.
5. Build the benchmark/rate review service and quote preview; do not activate settlement until authoritative ledger, idempotency, reconciliation and owner approval exist.

## 10. Safety and implementation boundary

This document records the requested model and source findings only. No code behavior, wallet balance, ledger, Gateway lock, merge, deployment or release was changed. Cross-game settlement remains disabled. The current wallet is browser-local and cannot serve as an authoritative multi-player ledger.
