# N.U Exchange Dual-Engine Core — Implementation & Handoff Protocol

**Date:** 2026-11-15  
**Status:** Engine contracts implemented on feature branch; settlement intentionally disabled  
**Owner:** N.U Launcher / Exchange team  
**Audience:** Implementers, QA, future ChatGPT sessions and module authors

## 1. Non-negotiable architecture

The Exchange is a calculation/orchestration core, not a wallet and not a place where balances are stored. The canonical wallet/save remains the only balance source of truth. The Exchange must never create shadow balances, duplicate a wallet, silently migrate assets, or treat chart data as a price oracle.

The Exchange contains two engines and a small orchestration/UI core:

1. **Wallet Reader & Live View Engine** — reads the canonical N.U save through `NU` and `NUWallet`, normalizes a read-only snapshot, and feeds it to the Exchange core/UI. On entry to the Exchange, refresh immediately; redraw balance cards, profile, activity and derived visualizations from the latest snapshot. Refresh on same-tab save events, cross-tab storage events, and page re-entry. The engine does not write wallet data.
2. **Module Manifest & Economic Protocol Engine** — receives a declarative manifest when a game/module is installed or registered; validates and filters its asset/coin definitions; assigns a trust state; persists a compact protocol record; and exposes quote previews only when an approved valuation rule exists. It does not execute module code or grant settlement authority.

The UI/core orchestrates both. Wallet owns balances; module owns its own gameplay rules; Exchange owns protocol metadata, matching and explainable calculations only.

## 2. Engine 1 — Wallet Reader & Live View

Current implementation: `nu-exchange-engines.js` → `NUExchangeEngines.walletEngine`.

Contract:
- `read()` returns source `nu-world-save-v1`, local player identity, profile level, supported wallet asset rows, transaction history, read timestamp, and explicitly unpriced X/N credit fields.
- `refresh()` emits `nu:exchange:wallet-refresh` with the latest snapshot.
- Existing page controller calls `read()` when it refreshes the view. Existing `nu:save-updated`, `storage`, `pageshow` listeners remain the refresh triggers.
- Any future chart/animation is derived from the current wallet snapshot and transaction history. No synthetic balance mutation is permitted to animate the UI.
- Local browser storage is device-bound, not server-authoritative and not cross-device synchronized.

Animation policy: enter Exchange → read once immediately → update profile and balances → derive chart series → animate only the visual transition. A chart must not create transactions or modify a balance. Respect reduced-motion settings and avoid polling the wallet every animation frame.

## 3. Engine 2 — Module Manifest & Economic Protocol

Current implementation: `nu-exchange-engines.js` → `NUExchangeEngines.protocolEngine`.

Public API:
- `discover(manifest, {installed:true|false})`: validate and store a declaration. Call on module installation/registration and whenever its manifest version changes.
- `list()`: return stored protocol records.
- `quotePreview({gameId, assetId, amount})`: return an explainable preview only for a recognized, positive, ratio-priced asset. It always returns `settlement:false`; it never debits or credits a wallet.
- `reconcile({installedGameIds:[...]})`: call after a launcher install/uninstall inventory change, passing the complete current installed-game ID list. It preserves protocol records while a module is installed or a declared wallet asset has a positive balance. When neither condition holds, it marks the record DORMANT and starts a 30-day retention period. At expiry, it removes the stale protocol record. If the player still owns an associated asset, the protocol is retained.
- Storage key: `nu.exchange.protocols.v1`. This stores metadata only, never balances.

Manifest fields:
```json
{
  "schemaVersion": 1,
  "gameId": "sample-game",
  "displayName": "Sample Game",
  "manifestVersion": "1.0.0",
  "assets": [
    {
      "assetId": "sample.coin",
      "label": "Sample Coin",
      "walletKey": "sampleCoin",
      "kind": "coin",
      "unit": "coin",
      "valuationClass": "fixed-ratio",
      "ratio": 0.5,
      "source": "sample-game-manifest"
    }
  ]
}
```

The example ratio is illustrative only, not an approved N.U rate. Module manifests are declarative data. Never eval/import/execute scripts supplied by a manifest. Bound sizes and lengths; reject malformed IDs and assets. The current implementation caps a manifest at 200 assets and normalizes stable IDs.

## 4. Trust and conversion policy

Trust states:
- `DECLARED_UNVERIFIED`: supplied by a module manifest, not yet reviewed. It may be displayed as declared metadata but cannot be priced or exchanged.
- `INFERRED`: future discovery from observed game behavior or save schema. Preview-only and requires human review before becoming eligible.
- `VERIFIED`: reviewed and approved by N.U economy owners with a versioned policy. Only this state may eventually be considered for a conversion route.
- `REVOKED`: invalidated or incompatible; no quotes or routes.

Valuation classes:
- Shared-unit: same canonical asset identity and unit; never infer equivalence from similar names.
- Fixed-ratio: explicit versioned ratio and rounding/limits; ratio must be owner-approved.
- Dynamic quote: must come from an authorized deterministic economy service, with quote ID, expiry, fees, limits and policy version.
- Non-convertible / unverified: inventory and protocol visibility only.

Current implementation conservatively marks new declarations `DECLARED_UNVERIFIED`; even if a ratio is present, `quotePreview` rejects it until a future verified-state workflow is implemented. Do not loosen this guard by changing the client manifest.

## 5. Protocol retention lifecycle

- Installed module: retain protocol.
- Uninstalled module + any positive owned balance for an asset whose `walletKey` maps to a canonical wallet asset: retain protocol.
- Uninstalled module + zero/no mapped balances: set DORMANT and retain for 30 days.
- Reinstalled during retention: reactivate and clear expiry.
- Retention elapsed and no ownership: delete metadata record.
- Wallet assets must never be deleted by protocol cleanup.
- Historical transactions must never be deleted by protocol cleanup.
- Unknown/unmapped assets are not proof of zero ownership. Until a module provides a trustworthy walletKey mapping, preserve its protocol rather than garbage-collect it. (Current implementation only protects positive mapped balances; integration owners must ensure manifests supply correct walletKey values and should extend conservative retention for unmapped balances before production.)

Launcher integration requirement: the launcher must call `discover` on install/manifest update and `reconcile` after every install/uninstall inventory change, with the full installed ID list. Until launcher lifecycle hooks exist, protocol retention is an API contract, not an automatically enforced install service.

## 6. Generation 1 economy and profile mapping

Bubble Hunt, Chaos Attack and Mana Collector share the Generation 1 economic profile `nu.g1.shared-economy`; their views are filtered projections of one common wallet, not separate balances. Keep provenance/game attribution when source data is available. Do not split or multiply the shared balance.

Creative Studio/Painting has a distinct progression ladder: 50 Studio XP per level. Bubble Hunt uses 100 XP per capsule as its game-specific ladder; the agreed reference index is one purposeful Bubble Hunt interaction = one BH XP unit. These ladders are not interchangeable by label. Cross-game conversion requires an explicit, reviewed benchmark ratio and route. XP must not be converted to Mana by default.

Casino Credits remain a separate virtual economy. HP, Mana, capsules, XP, Casino Credits and future game-specific coins each require their own unit, earning/sink mechanism and approved mapping. X Credits and N Credits remain unpriced until their mechanics and economic sinks are documented.

A new game may have no XP and use one or more new coins. The manifest describes mechanics and wallet mapping; the economic protocol compares earning effort, sinks, caps and progression ladders against the Generation 1 reference catalog. A matching name is never enough to establish equivalence. A different capsule/stack ladder does not become equivalent just because its underlying XP benchmark is similar.

## 7. Explicit boundaries / safety

- Exchange core stores no player asset balances.
- Engine 1 is read-only.
- Engine 2 stores only module protocol metadata and derived preview rules.
- `transfer()` remains disabled; no commit adapter or atomic ledger exists.
- Browser localStorage is not authoritative for competitive/multi-device settlement.
- No real-money or external crypto exchange.
- Never alter Gateway, engine lock, frozen `nu-engine.js`, game rules or wallet save schema without a separately reviewed change.
- Do not represent a preview as a completed conversion.
- No merge or public demo deployment is implied by this document or branch commits.

## 8. Acceptance and QA checklist

- [ ] Enter Exchange: latest wallet profile and balances are read immediately.
- [ ] Save an asset in a game, return to Exchange: displayed amount updates without reload.
- [ ] Cross-tab wallet save updates the view.
- [ ] Wallet balances and transaction ledger are byte-for-byte unchanged by Exchange read/animation.
- [ ] Manifest with valid ID/label is stored as DECLARED_UNVERIFIED.
- [ ] Malformed manifest is rejected; manifest code is never executed.
- [ ] Unverified manifest cannot generate a priced quote or settle.
- [ ] Install → protocol retained; uninstall with owned balance → retained.
- [ ] Uninstall with zero mapped balance → dormant for 30 days, then eligible for metadata deletion.
- [ ] Reinstall during retention → active again.
- [ ] Deleting protocol metadata never deletes wallet assets or transactions.
- [ ] Test public demo first; gather human reports from team and players; record device/browser, game/module, steps, expected/actual, screenshots and severity.
- [ ] Verify performance: no wallet polling per animation frame; no manifest scan in render/input hot path.

## 9. Handoff / continue in a new chat

Start from this document and branch `feature/nu-wallet-exchange-bridge`. Read the current base/default branch and PR #106 before further changes. PR #106 was previously found to diverge from the default branch; reconcile history before merge. Verify current files and CI status rather than trusting this note blindly.

Next engineering steps:
1. Add a launcher-owned module lifecycle adapter that supplies complete installed module IDs to `reconcile`.
2. Add wallet-key mapping for every real game asset; do not infer balances from display names.
3. Add review workflow for manifest trust promotion and signed/versioned valuation policy.
4. Add deterministic quote engine with precision, rounding, fees, caps, expiry and reason codes.
5. Implement atomic authoritative ledger only after backend/security design and explicit approval.
6. Add automated tests for lifecycle retention, malformed manifests, wallet immutability, storage refresh and preview-only quote boundaries.
7. Deploy to public demo only through the established public-demo-first process, then collect human QA before merge/release.

## 10. Change history

- 2026-11-15: read-only wallet bridge added in PR #106.
- 2026-11-15: dual-engine module added: wallet reader + module manifest/protocol discovery and retention API. Runtime tests and public demo verification remain pending.
