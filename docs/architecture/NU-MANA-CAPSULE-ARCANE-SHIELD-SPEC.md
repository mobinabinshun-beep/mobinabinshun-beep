# N.U Generation 1 — Mana Containers, N-BI Cannon, Arcane Shield & Wave Rules
**Status:** Owner-confirmed product rules, 2026-11-18  
**Scope:** Generation 1 only. This document supersedes older provisional wording where it conflicts with the owner-confirmed rules below. It does not authorize changes to Generation 2, the adaptive/network engine, or locked classic HUD regions.

## 1. Terminology and resource model
- A **Mana container / capsule** is one independently refillable storage unit with a fixed capacity of **10 Mana**.
- A **container-capacity upgrade level** determines the number of 10-Mana containers, not the capacity of an individual container.
- Levels run from 1 through 9: level 1 = 1 container = 10 Mana; level 9 = 9 containers = 90 Mana.
- Mana Collector fills available container capacity. Each successful collection adds 1 Mana; filling one container does not change the fixed 10-Mana capacity of any other container.
- Emptying a container does not destroy the permanent container slot and does not require buying a replacement empty capsule. It becomes available to be refilled by future Mana collection.
- Total stored Mana must never exceed (container level × 10). Overflow collections at full capacity are not successful collections and must not advance successful-interaction counts or rewards.
- Container-capacity upgrades and N-BI cannon upgrades are separate upgrade tracks. Do not infer one from the other.

| Container level | Number of containers | Total Mana capacity | Level-1 N-BI shots available if all Mana is spent on shots | Full shield charges available if all Mana is spent on shield |
|---:|---:|---:|---:|---:|
| 1 | 1 | 10 | 1 | 1 |
| 2 | 2 | 20 | 2 | 2 |
| 3 | 3 | 30 | 3 | 3 |
| 4 | 4 | 40 | 4 | 4 |
| 5 | 5 | 50 | 5 | 5 |
| 6 | 6 | 60 | 6 | 6 |
| 7 | 7 | 70 | 7 | 7 |
| 8 | 8 | 80 | 8 | 8 |
| 9 | 9 | 90 | 9 | 9 |

The final two columns are alternative uses of the same Mana balance, not cumulative entitlements. Mana spent on a shot cannot also be spent on a shield charge.

## 2. N-BI cannon consumption
- At **N-BI cannon level 1**, one successful shot costs exactly 10 Mana (one full 10-Mana container).
- The 10 Mana is consumed atomically for the shot. The UI plays a short, lightweight, smooth Mana-drain animation from the relevant container/balance to zero; the animation is presentation only and must not delay or duplicate the underlying transaction.
- A shot is not fired and no shot cost is recorded unless a full required cost is available.
- A successful N-BI shot neutralizes one Chaos mass and awards **+3 XP**, consistent with the existing Generation 1 economy specification. Failed/missed input does not spend Mana or award XP.
- Existing historical worklog text describes a separate cannon-upgrade progression in which levels 0–9 reduce the Mana cost by one per level. Keep cannon level/cost configuration separate from container-capacity level. The confirmed 10-Mana price in this document is specifically cannon level 1; do not silently apply the level-1 cost to higher cannon levels or rewrite the historical cost curve without a separate owner decision.

## 3. Arcane Shield charging and operation
- Arcane Shield is a real gameplay defense, not a decorative overlay. It is purple, has its own charge indicator, and is visible/active only during Chaos Attack.
- One full 10-Mana container is transferred/attached to the shield charging interface. On successful application, that container's Mana balance becomes zero and the shield immediately activates at **10 defense/charge units**.
- The consumed Mana is not also available to the cannon. A single 10-Mana container funds either one level-1 shot or one full shield charge.
- Each incoming Chaos hit consumes one shield charge unit. Shield charge cannot fall below zero. Once depleted, subsequent Chaos damage passes to HP using the configured Chaos damage amount; do not invent or change the HP damage value in this feature.
- Shield does not automatically refill. A partially charged shield carries its exact remaining charge into the next Wave. No automatic refill and no stacking/top-up over an existing non-zero shield charge.
- If the shield reaches zero, later hits in that same Wave damage HP. The player cannot activate a second shield charge in the same Wave, even if the first charge is depleted.
- **Shield charge limit:** one successful shield activation per gameplay Wave ID. This limit remains in force at every shield upgrade level.
- **Shield level 1:** charging is Store-only/pre-round. No in-game recharge control is available. If the shield depletes during the Wave, remaining hits damage HP.
- **Shield level 2:** unlocks one in-game manual charge action per gameplay Wave, using the floating/holographic shield control near the Mana bar. It still consumes one full 10-Mana container, activates immediately, and cannot be used a second time in that Wave. The control must be disabled when a shield charge already exists, the per-Wave activation has been used, or a full container is unavailable.
- Shield upgrade levels beyond level 2, shield-upgrade prices, and any further defensive effects are not specified here; keep unavailable tiers hidden and do not invent values.

## 4. Chaos Attack resolution and player navigation
- Each Chaos mass is one independently resolved target/attack event under the existing Chaos Attack round.
- A successful N-BI shot neutralizes one mass and grants +3 XP.
- Arcane Shield absorbs incoming Chaos hits by consuming charge; shield absorption itself does not award N-BI XP.
- All remaining/live Chaos masses must still be resolved when the player leaves the visible game canvas/view or navigates away from the game surface. Leaving the view must not silently cancel their damage calculation. Resolve and persist the remaining hit/damage consequences exactly once before closing/settling the active Wave.
- The shield is applied before HP damage. For each hit, consume shield capacity first; only the unabsorbed damage reaches HP.
- Duplicate close, navigation, reload-recovery, and settlement events must not apply the same Chaos hit or damage twice. Use stable per-Wave/per-target idempotency identifiers.

## 5. Wave: preserve the existing dual meaning
The existing canonical Wave document defines two separate meanings; this feature preserves both:
1. **HP-economy Wave:** one gameplay round/mission, completed by 10 successful target interactions in a core Generation 1 game. Current prototype completion reward remains +1 HP, capped at 10.
2. **Wallet-income Wave:** the aggregation boundary for successful incoming/outgoing asset movements during one game run. Rewards/costs are aggregated by asset/category and settled once using idempotency keys.

For Arcane Shield, the per-Wave activation limit is keyed to the **gameplay Wave ID created when the Chaos Attack round starts**, not to the number of wallet ledger rows, page views, or transaction aggregates. A new launch/restart creates a new gameplay Wave ID and a new one-activation allowance. A Wave may still be incomplete for HP completion while its earned/spent wallet movements are settled normally.

## 6. Store, wallet, and transaction accounting
- Mana collected is an incoming Mana movement in the active Wallet-income Wave.
- N-BI shot cost is an outgoing Mana movement; shield charge cost is also an outgoing Mana movement, with a distinct category such as `ARCANE_SHIELD_CHARGE`.
- Mana container count/capacity is an upgrade attribute, not a consumable inventory count. Do not decrement the number of permanent containers when a shot or shield charge consumes Mana.
- Each actual Mana spend is recorded exactly once. Failed shots, failed shield activation, insufficient Mana, and missed interactions create no spend row.
- The Mana Collector, Wallet balance, container display, and Store upgrade display must all derive from one normalized wallet state; no separate shadow Mana balance.
- Historical Store prices and upgrade-credit curves must be recovered from archived project records before implementation. Do not fabricate prices.

## 7. UI and protected surfaces
- Use a separate shield-specific UI surface/overlay for the purple shield meter and holographic control. Do not alter the locked classic LV/XP/Mana HUD markup/styles or protected selectors without explicit authorization.
- Keep the Mana-drain animation short, low-cost, reduced-motion aware, and non-blocking. State/ledger mutation is authoritative; animation must never be the source of truth.
- Keep Generation 2 and the adaptive/network engine untouched.

## 8. Automated acceptance requirements
1. Container levels 1–9 normalize to 10–90 Mana capacity in 10-Mana increments; invalid levels clamp/reject safely.
2. One Mana collection adds exactly 1 Mana until capacity; overflow does not count as a successful interaction.
3. A level-1 N-BI shot requires and spends exactly 10 Mana once, empties one full container, neutralizes one mass, and awards +3 XP once.
4. A shield charge requires one full 10-Mana container, spends it once, activates 10 charge immediately, and produces no cannon XP.
5. One Chaos hit consumes one shield unit; after zero, damage passes to HP.
6. Partial shield charge carries across gameplay Wave IDs unchanged; no auto-refill or top-up.
7. At most one shield activation is accepted per gameplay Wave ID at all shield levels.
8. Level 1 cannot charge in-game; level 2 can charge once in-game through the holographic control.
9. A second charge attempt in the same Wave, an attempt with no full container, or an attempt while shield charge is non-zero is rejected without a wallet spend.
10. Leaving the visible game view resolves all remaining Chaos hits once; repeated exit/reload events cannot duplicate damage.
11. Wallet settlement remains idempotent and keeps HP completion eligibility separate from wallet aggregation.
12. No regression to HP capsules, casino transactions, existing Wave settlement, accessibility, mobile touch, or protected HUD/engine areas.

## 9. Human demo acceptance
Test on the public demo candidate on desktop and mobile/touch:
- levels 1, 2, and 9 container capacity and Mana Collector fill behavior;
- one-container N-BI shot drain animation and exact 10-Mana debit;
- shield attachment, instant activation, purple meter, hit-by-hit depletion and HP overflow;
- Store-only level 1 and once-per-Wave level 2 in-game charge;
- partial shield carry-over, no top-up, and one-charge-per-Wave gate;
- leaving the game view with live Chaos masses and verifying all residual damage is applied exactly once;
- Wave ID and Wallet ledger rows, no duplicate settlements;
- reduced-motion/accessibility and narrow mobile viewport.

A green CI run is not human acceptance. Do not publish/deploy the candidate until automated checks pass, a reviewer inspects the diff, and the human demo checklist is completed.
