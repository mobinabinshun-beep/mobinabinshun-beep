# N.U Universal Game Asset Exchange — Architecture & Implementation Specification

**Date:** 2026-11-14  
**Status:** Design baseline; settlement remains disabled  
**Target:** N.U Exchange / Launcher game adapters  
**Scope:** Cross-game asset inventory, player identity/profile bridge, valuation and conversion policy, chart discoverability.

## 1. Product objective

Build one extensible exchange layer that can understand assets and player profiles from every current and future N.U game. Generation 1 examples include XP in the painting/creative game, Bubble Hunt resources, Mana, capsules and casino credits. Future games must register through the same contract rather than requiring a bespoke exchange rewrite.

The exchange is an internal N.U game-economy system. It is not a real-money exchange, external crypto market, or promise that every item is freely convertible.

## 2. Current code findings (inspected 2026-11-14)

- `nu-wallet.js` currently stores a browser-local save with XP, Mana, HP, HP capsules, Mana capsules and casino credits. Transaction history is capped at 40 entries.
- `NUWallet.gameAssetRows()` has hard-coded game profiles (`bubble`, `mana`, `chaos`) and a fallback. It does not yet provide a universal player profile or a discoverable game/asset manifest.
- `nu-exchange-core.js` has a minimal in-memory `registerGame()` registry, but asset metadata is limited to id/label/unit. It has no canonical valuation, conversion route, profile bridge, persistence, or settlement implementation.
- `transferAvailability()` deliberately returns `SETTLEMENT_NOT_IMPLEMENTED`; `transfer()` returns `CROSS_GAME_SETTLEMENT_DISABLED`. Keep this safety boundary until authoritative settlement exists.
- `exchange.html` currently labels the conversion panel “GAME-TO-GAME ASSET TRANSFER”; selectors depend on registered adapters and can remain empty.
- `nu-market-sim.js` creates candles only from recorded local wallet transactions (last 24). No player activity means no candles. The market canvas is hidden in that state.
- `nu-exchange.js` draws candle bodies, high/low wicks, a close/index line and volume bars when activity exists. The existing “Index line” is a close-price polyline, not a moving-average indicator. No moving-average overlay is implemented.
- The market is a fictional activity-derived visualization, not a real valuation source or forecast.

## 3. Universal registry contract

Each game adapter must register a versioned manifest with:
- `gameId`, `displayName`, `manifestVersion`, `adapterVersion`, `status`
- `playerProfile.read(playerId)` returning a stable player identity reference and game-specific progression metadata
- `assets[]` containing stable `assetId`, `label`, `kind`, `unit`, `precision`, `tradability`, `valuationModel`, `limits`, `sourceOfTruth`, `metadata`
- explicit read/quote/commit capabilities; registration alone must never grant settlement authority.

Asset IDs must be namespaced and immutable (for example `nu.core.xp`, `nu.bubble.catch_token`, `nu.painting.palette_credit`). Display labels may change; IDs must not.

## 4. Player identity and profile bridge

Use one N.U player identity key across games. Until a server-authoritative identity service exists, browser-local profiles must be marked **LOCAL / DEVICE-BOUND**, not presented as synchronized accounts.

The profile bridge should expose:
- stable N.U player ID (or explicit local profile ID)
- display name and callsign
- aggregate level/XP only where the owning game defines compatible semantics
- per-game progression and achievements as namespaced records
- per-game asset balances with source timestamps and provenance
- adapter/schema versions and sync status

Never merge two profiles based only on display name. Do not overwrite a game's source-of-truth balance with a stale exchange cache. Profile reads are separate from asset settlement.

## 5. Asset valuation and conversion

Every asset manifest must declare one of these valuation classes:
1. **Shared-unit:** same canonical asset ID and unit across games; 1:1 transfer may be quoted only if both adapters explicitly support it.
2. **Fixed-ratio:** a game-governed conversion ratio with version, effective period, min/max and rounding rules.
3. **Dynamic game-economy quote:** a deterministic quote returned by the authorized economy service, with quote ID, expiry, fee, limits and reason.
4. **Non-convertible:** visible in inventory/history but cannot be exchanged.

Each quote must show source amount, source asset, destination amount, destination asset, ratio, fee, rounding, daily/transaction caps, expiry, policy version and any irreversible loss. No implied market price may be inferred from the chart.

Do not assume XP in Painting equals XP in Bubble Hunt merely because both are named XP. First decide whether they are one canonical shared resource or separate game-scoped resources (for example `nu.painting.xp` and `nu.bubble.xp`). The owning game economy must explicitly approve the mapping and ratio. Same rule for Mana, capsules, collectibles and future assets.

## 6. Safe settlement workflow

1. Read authoritative source balance from the owning game adapter.
2. Validate player identity, asset ownership, adapter versions and policy.
3. Request a signed/authoritative quote; show the full result to the player.
4. Require explicit player confirmation.
5. Execute an atomic debit/credit through the authoritative ledger or a two-phase idempotent settlement service.
6. Persist a unique transaction ID, source/destination deltas, quote, policy version and audit event.
7. Re-read both balances and reconcile. On partial failure, use a defined compensating transaction; never silently lose or duplicate value.

Browser localStorage is not authoritative and is not safe for cross-device, multi-user or competitive settlement. Until a trusted ledger/service and adapter commit contract exist, keep the transfer button disabled and label the module as a preview/registry, not a functioning exchange.

## 7. Generation 1 rollout

- Inventory all existing games and their actual save schemas before mapping assets. Do not infer missing values.
- Register each current game with a manifest; mark unsupported items non-convertible.
- Decide explicitly whether Painting XP and Bubble Hunt XP are shared or game-scoped.
- Publish an asset catalog with current balance, unit, owning game, valuation class and conversion eligibility.
- Implement profile bridge in read-only mode first.
- Implement quote preview with no ledger mutation.
- Enable settlement only after authoritative ledger, idempotency, reconciliation, policy tests and owner approval are present.

## 8. Chart and indicator acceptance

The chart must be discoverable without guessing:
- Use visible controls with plain labels: **Candles**, **High/low wicks**, **Volume bars**, **Close/index line**, **Moving average (SMA)** and **Reduced motion**.
- Clearly distinguish the close/index line from an SMA indicator. SMA period must be visible (default 5 data points) and only render when enough recorded candles exist.
- Keep volume bars in a separately labelled lower plot region so they cannot be mistaken for price candles.
- If no player activity exists, show an explicit empty-state explanation and a clearly separate optional sample-preview control. Sample data must be labelled DEMO/SYNTHETIC and must never be written to the wallet, ledger or actual player history.
- Keep the current fictional-market disclaimer visible.
- Add accessible legend, keyboard-operable controls, responsive layout and tests for empty, 1–4 point, 5+ point, toggles and reduced-motion cases.

## 9. Security and economy invariants

- No real-money, external-crypto or fiat conversion.
- No transfer based on client-side balances alone.
- No implicit conversion across unrelated game currencies.
- No HP conversion by default; health is a gameplay state/resource, not a market token.
- No XP/Mana minting, burning or balance changes during chart rendering or profile reads.
- Enforce ownership, caps, idempotency, replay protection and audit trail server-side before settlement.
- Keep cross-game settlement disabled until the above gates pass.

## 10. Required tests and public-demo acceptance

Automated coverage must include manifest validation, unknown/duplicate IDs, adapter version mismatch, profile identity isolation, stale balance rejection, non-convertible assets, quote expiry, fee/rounding/caps, duplicate settlement IDs, partial failure/reconciliation, ledger invariance on chart controls, and future adapter registration without core changes.

Human acceptance must follow `docs/operations/NU-OPS-IMPLEMENT-01.md`: verify the exact candidate build on the public N.U demo first; then test on real browsers/devices and record the build identifier. Source pages, local files and localhost are not acceptance environments.

## 11. Open decisions requiring owner/economy policy

- Are Painting XP and Bubble Hunt XP one shared canonical asset or two game-scoped assets?
- Which Generation 1 assets are transferable, and which remain game-bound?
- What is the approved valuation model and who owns/version-controls the rates?
- Is the intended profile identity local-only for the first release or backed by a central account service?

Until those policy decisions and the authoritative ledger exist, deliver registry, inventory, profile read-only view and quote preview only; do not activate settlement.
