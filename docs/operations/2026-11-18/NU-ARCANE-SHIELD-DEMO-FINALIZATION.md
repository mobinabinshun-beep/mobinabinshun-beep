# Arcane Shield / Mana — public demo finalization

**Date:** 2026-11-18  
**Base Pages-source commit:** `c854981cf0f5287b3ca67bff5f7b720def455dde`  
**Candidate branch:** `fix/arcane-shield-demo-persistence-2026-11-18`  
**Status:** implementation correction in review; demo SHA and human QA pending

## Scope
This is a narrow Generation 1 follow-up to the already-present Mana economy and Arcane Shield implementation on the Pages source branch. It does not change the approved economy, shield values, UI design, classic LV/XP/Mana HUD, Generation 2, or adaptive/network engine.

## Corrections
- Reload recovery resolves pending Chaos target IDs from the persisted active Chaos Wave even before the game view is re-entered; it no longer depends on transient in-memory `state.game`.
- Page-exit settlement now occurs only after remaining Chaos damage has resolved and persisted successfully. A failed save does not silently settle/erase the pending damage.
- Regression tests cover both cases.
- Arcane Shield and adjacent tests run first, followed by the complete Generation 1 test suite.

## Preserved product contract
- Mana containers are permanent 10-Mana capacity slots (1–9); an empty container remains owned.
- Mana is earned/collected or won through betting; Mana is not sold directly.
- One X Credit capacity upgrade adds one permanent container and grants 10 initial Mana.
- N-BI level 1: -10 Mana, neutralize one Chaos mass, +3 XP.
- Arcane Shield: -10 Mana, +10 defense, no XP; each Chaos mass consumes one defense before HP.
- Remaining shield charge carries between Waves without automatic refill.
- One activation per gameplay Wave ID. Level 1 Store charge; level 2 one manual in-game charge per Wave.
- Ten successful interactions complete the HP Wave; Wallet income/cost aggregation remains separately grouped by asset/category.
- Undefined X Credit issuance/acquisition price and Shield Level-2 unlock price remain unpriced.

## Verification and release gates
- Pre-change Pages-source checkpoint: `backup/pre-arcane-shield-final-demo-fix-2026-11-18` at `c854981cf0f5287b3ca67bff5f7b720def455dde`.
- The exact resulting PR head and CI run IDs will be recorded after the branch checks finish.
- Public demo target: https://mobinabinshun-beep.github.io/mobinabinshun-beep/
- Live served SHA/build must be checked independently; a source-branch commit alone is not proof of live propagation.
- Human desktop, mobile, touch, keyboard and gameplay QA remains pending until testers report results against the exact live build.
- No production promotion or owner acceptance is implied.

## Human QA focus
1. Confirm Store shield charge consumes exactly 10 Mana and displays 10/10 defense.
2. Confirm each Chaos mass consumes one shield point before HP; shield at zero allows HP damage.
3. Confirm unused shield defense carries to the next Wave without refill.
4. Confirm one activation per Wave; level-2 in-game charge is manual and cannot be repeated in the same Wave.
5. Confirm N-BI costs 10 Mana, neutralizes one mass and grants +3 XP; shield grants no XP.
6. Navigate away/reload with pending Chaos masses and verify damage is persisted exactly once.
7. Verify 10 successful interactions and Wallet asset/category totals remain distinct.
8. Repeat desktop, narrow mobile portrait/landscape and touch input.

## Recovery
The pre-change source remains available at the backup branch above. If a critical regression is confirmed, revert only the finalization PR merge commit; do not force-push the Pages source branch.
