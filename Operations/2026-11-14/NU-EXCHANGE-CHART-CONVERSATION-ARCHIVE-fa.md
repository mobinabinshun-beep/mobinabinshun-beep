# Conversation Archive — N.U Universal Exchange & Chart Follow-up

**Date:** 2026-11-14  
**Project:** N.U / Niroo Universe  
**Branch:** `feature/nu-exchange-studio-launcher-spec`  
**Related PR:** #77 (draft; not merged)

## Owner request (faithful summary)

The owner cannot find the chart indicator and reports that the exchange chart still does not visibly show candles and bars/“میل”. They want the module designed to exchange player profiles and assets between games, using current game economies such as XP in Painting and Bubble Hunt as examples, while remaining extensible to all assets in future N.U games. They also request that this conversation be archived for future work.

## Findings recorded from source inspection

- Current local wallet fields include XP, Mana, HP, HP capsules, Mana capsules and casino credits; transaction history is local and capped.
- Current game profile selection is hard-coded in `nu-wallet.js`; it is not yet a universal player-profile bridge.
- The exchange core has a basic in-memory game registry, but no canonical asset valuation or profile bridge.
- Cross-game settlement is intentionally disabled (`SETTLEMENT_NOT_IMPLEMENTED` / `CROSS_GAME_SETTLEMENT_DISABLED`).
- Candles, high/low wicks, close/index line and volume bars are drawn only when recorded local player activity exists. With no activity, the market chart is hidden and an empty-state message appears.
- No moving-average overlay is present. The current “Index line” is the close/index polyline, not a moving average.
- Current data is browser-local; it is not a server-authoritative shared player ledger.

## Agreed implementation direction

1. Build a versioned, namespaced game/asset manifest contract for current and future N.U games.
2. Add a common N.U player identity/profile bridge, initially read-only and explicitly marked local/device-bound until authoritative identity sync exists.
3. Give every asset explicit unit, ownership/source-of-truth, valuation class, conversion eligibility, limits and policy version.
4. Distinguish shared assets from game-scoped assets. Do not assume Painting XP and Bubble Hunt XP are interchangeable until the owner/economy policy defines the mapping and ratio.
5. Add transparent quote preview (source, destination, ratio, fee, rounding, caps and expiry) before any settlement.
6. Keep actual transfer disabled until an authoritative ledger, atomic/idempotent settlement, reconciliation, audit trail and owner approval exist.
7. Make chart controls discoverable and explicitly label candles, wicks, volume bars, close/index line and SMA. Show an honest empty state when no actual activity exists; synthetic sample preview, if later added, must be opt-in and isolated from wallet/ledger.
8. Archive the source findings, decisions, unresolved policy questions and public-demo QA requirements.

## Safety and release boundaries

- Do not alter real balances or ledger as part of chart work.
- Do not enable cross-game settlement on localStorage alone.
- Do not change Gateway lock.
- No merge, production release, deployment or deployment-configuration changes are authorized by this request.
- Human acceptance must occur on a verified public N.U demo build, not GitHub source, local file or localhost.

## Next implementation sequence

1. Inventory every actual game entry point, wallet schema, asset delta and current adapter registration.
2. Add tests for universal manifests and read-only profile aggregation.
3. Add chart discoverability/SMA and empty-state behavior.
4. Add quote-preview interface with settlement still disabled.
5. Run automated checks, update PR #77, verify the candidate on the public demo only after separately authorized demo deployment, then collect human QA reports.

## Source references

- `nu-wallet.js`
- `nu-exchange-core.js`
- `exchange.html`
- `nu-exchange.js`
- `nu-market-sim.js`
- `docs/operations/NU-OPS-IMPLEMENT-01.md`
- `docs/operations/HUMAN-TEST-REPORT-TEMPLATE.md`
