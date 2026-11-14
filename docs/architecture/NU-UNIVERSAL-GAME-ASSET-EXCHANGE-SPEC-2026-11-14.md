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

XP in Painting/Studio and Bubble Hunt are separate game-scoped resources (`nu.studio.xp` and `nu.bubble_hunt.xp`). Their progression ladders are independent; conversion is possible only through explicitly approved equivalent-asset routes. See Section 12.

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
- Keep XP_Studio and XP_Bubble Hunt game-scoped, preserve provenance, and approve any equivalence ratio before enabling a route.
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

- What owner-approved equivalence ratio, if any, should govern XP_Bubble Hunt ↔ XP_Studio?
- Which Generation 1 assets are transferable, and which remain game-bound?
- What is the approved valuation model and who owns/version-controls the rates?
- Is the intended profile identity local-only for the first release or backed by a central account service?

Until those policy decisions and the authoritative ledger exist, deliver registry, inventory, profile read-only view and quote preview only; do not activate settlement.


## 12. Game-scoped XP and independent economy ladders (owner direction, 2026-11-14)

### 12.1 Canonical asset identities

XP must be namespaced by its issuing game; the shared legacy wallet field named `xp` is not proof that game XP units are economically identical. Target asset IDs:

- `nu.bubble_hunt.xp` — **XP_Bubble Hunt**; earned at exactly **1 XP per valid, intentional, game-recognized interaction**. The interaction must pass the owning game's success/anti-automation validation; passive clicks, repeated invalid events and UI-only events do not mint XP.
- `nu.studio.xp` — **XP_Studio**; earned under Studio's own award formula and progression rules. Owner-stated progression anchor: **50 XP_Studio = 1 Studio level**.
- `nu.bubble_hunt.capsule` (and separately typed capsule variants if the game defines them) — Bubble Hunt progression item. Owner-stated anchor: **100 XP_Bubble Hunt = 1 capsule**. The remaining capsule ladder (capsules-to-next-tier, rewards and terminal steps) must be imported from Bubble Hunt's authoritative rules; do not invent missing ratios.

The two XP assets are separate units even if their UI labels both contain “XP”. Analytics and charting must preserve asset ID and source game; never aggregate them as one XP series without an explicit normalized index and visible methodology.

### 12.2 Independent progression ladders are not exchange rates

Each game owns its own ladder: XP thresholds, levels, capsules, upgrade tiers, rewards, sinks, caps, reset/season behavior and award validation. A level-up threshold or capsule cost describes progression utility inside that game; it does **not**, by itself, establish a cross-game exchange price. Thus 50 XP_Studio per level and 100 XP_Bubble Hunt per capsule are recorded as distinct in-game anchors, not as a claim that one Studio level equals one Bubble Hunt capsule.

Bubble Hunt's full ladder must be read from its game rules/source before implementation. Preserve every rung and its exact quantity; flag absent or conflicting values as `UNVERIFIED` rather than filling gaps.

### 12.3 Equivalence-only exchange policy

The exchange may quote a conversion only between assets that the economy policy has explicitly classified as equivalent or economically comparable. A route is an allow-listed directed pair (or symmetric pair where explicitly approved), with a versioned ratio, effective date, fee, rounding, limits and owner. No route is inferred merely because assets are both earned through play or both have “XP” in their names.

- `XP_Bubble Hunt -> XP_Studio`: **not enabled by default**. It may be enabled only after the owner/economy policy defines a documented equivalence ratio and the Studio and Bubble Hunt adapters both authorize the route.
- `XP_Bubble Hunt -> Mana`: **prohibited** under the current policy; no direct conversion route. The same prohibition applies to other unrelated currencies unless a specific approved equivalence path is added.
- XP must not be silently converted into levels, capsules, HP or other progression objects. A capsule purchase/redemption remains a Bubble Hunt-native ladder operation unless a separately governed route is approved.
- Every non-allow-listed pair returns `PAIR_NOT_EQUIVALENT` (or an equivalent explicit denial); the UI must explain why rather than showing a misleading quote.

“Equivalent” means policy-approved economic equivalence, not equal numeric quantities. For each approved pair, record the reference anchor, conversion ratio, who approved it, policy version, validity window and impact on both games' sinks/progression.

### 12.4 Price discovery and game-to-game balance

The exchange's purpose is to make unlike game economies comparable through transparent, governed quotes—not to erase their independent economies. Each game may have different earning difficulty and reward cadence. Rate design must therefore consider at minimum:

- validated earning rate and effort/time distribution (not raw click count alone);
- progression utility and scarcity across the full ladder;
- sinks, redemption value, caps, season resets and supply concentration;
- exploit/automation resistance and adapter/source reliability;
- impact of conversion on both source and destination game balance.

A game where an item is easier to earn must not automatically receive a higher or lower price without evidence and policy review. Dynamic quotes, if later adopted, must come from an authoritative economy service and include a transparent reason/rate version. The chart is analytics only and never sets or executes exchange prices.

### 12.5 Generation 1 asset catalog and current implementation boundary

| Asset | Game / owner | Unit or known anchor | Exchange status |
|---|---|---|---|
| XP_Bubble Hunt | Bubble Hunt | 1 valid intentional interaction = 1 XP; 100 XP = 1 capsule | Game-scoped; only approved equivalent routes; no Mana route |
| XP_Studio | Painting / Studio | 50 XP = 1 Studio level | Game-scoped; cross-game ratio still requires explicit approval |
| Bubble Hunt capsule | Bubble Hunt | 100 XP_Bubble Hunt per capsule; later ladder rungs pending source verification | Native progression item; no assumed cross-game conversion |
| Mana | Mana Collector / N.U wallet | Mana resource; current code awards 1 Mana per successful Mana Collector interaction | Separate currency; no XP_Bubble Hunt route |
| HP | N.U wallet / gameplay | Current wallet field; value/transfer semantics not approved | Non-convertible by default |
| HP Capsule | N.U wallet | Existing wallet purchase anchor: 10 legacy shared XP per capsule in current code; this legacy rule must be reconciled before mapping to either scoped XP | Do not treat as Bubble Hunt capsule; non-convertible pending policy |
| Mana Capsule | N.U wallet | Present in wallet; authoritative redemption ladder needs verification | Game-bound pending policy |
| Casino Credits | N.U wallet / casino module | Present in wallet; rate and sinks require source verification | Game-bound pending policy |

Important migration note: current `nu-wallet.js` has one legacy `xp` field and existing XP grants from multiple games. The implementation must not relabel the entire historical balance as XP_Bubble Hunt or XP_Studio. It needs source provenance for new awards and an owner-approved migration rule for historical, unattributed XP. Until then, legacy XP is a distinct `nu.legacy.unattributed_xp` bucket and is not exchangeable into scoped XP.

### 12.6 Analytics and chart contract

All event records and chart series must carry `gameId`, `assetId`, `unit`, `sourceEvent`, `timestamp`, `amount`, adapter version and provenance. Default charts are per-asset/per-game. Cross-game comparison is allowed only through a published normalized index with its base period, formula and policy version displayed. Raw XP quantities from different ladders must never be plotted as directly comparable prices.

### 12.7 Implementation gates and unresolved inputs

1. Inspect Bubble Hunt's complete capsule ladder and Studio's XP award/level rules from their authoritative game source.
2. Split new XP grants by game provenance; preserve the legacy unattributed balance without guessing its origin.
3. Publish the full asset catalog and mark unverified values explicitly.
4. Define and approve any XP_Bubble Hunt / XP_Studio equivalence ratio before enabling that pair.
5. Keep XP_Bubble Hunt / Mana disabled and test that all disallowed pairs are rejected.
6. Keep settlement disabled until the authoritative ledger and all safety requirements in Sections 6 and 9 pass.
