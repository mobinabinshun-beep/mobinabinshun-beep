# N.U Launcher — Adaptive Runtime & Economic Intelligence Core

**Date:** 2026-11-15  
**Status:** Target architecture and staged delivery plan  
**Packaging:** Mandatory independent core service in the standard N.U Launcher package  
**Operating model:** Offline-first; local game packages installed from downloaded files.

## 1. Architectural decision

N.U Launcher is a modular game runtime coordinated by a central kernel. The Adaptive Runtime & Economic Intelligence Core (AREIC) is an independent subsystem mounted on that kernel and included in the standard launcher package. It provides two coordinated but isolated domains:

- **Adaptive Runtime Governor:** capability detection, CPU/GPU/RAM/cache/storage budgets, frame-time observation and graceful quality adaptation.
- **Economic Intelligence & Exchange Engine:** game/asset discovery, validation, economic profiling, benchmark matching, quote calculation and approved exchange integration.

Economic analysis must never execute in the render/input hot path. Each domain has bounded queues, independent lifecycle and observable health.

## 2. Launcher inventory

The package architecture covers:
- Generation 1 trilogy: Bubble Hunt, Chaos Attack and Mana Collector (one shared economic profile).
- Independent Painting/Creative Studio (no dedicated mini-game economy loop).
- Casino (virtual-credit economy, isolated unless a future mapping is approved).
- Wallet and player profile.
- Central kernel and analyzer.
- Graphics/rendering engine and visual modules, including game backgrounds.
- CPU scheduling/governor services.
- RAM, memory-pressure, cache quality and cache-protection services.
- Runtime memory, package installation, sandbox and lifecycle services.
- N.U Exchange and economic modules, progressively enabled after audit and approval.

The kernel owns module lifecycle, capability discovery, permissions, global budgets and service contracts. A game cannot directly control another game's memory, wallet or lifecycle.

## 3. Local installation and module lifecycle

A player installs a game from a downloaded local package. The launcher validates package structure, manifest schema, compatibility, declared capabilities, permissions, dependencies, hashes/signatures when available and resource hints. It then installs into an isolated module directory, stages the module under restricted permissions, and registers it only after validation.

The module lifecycle supports install, validate, activate, suspend, resume, deactivate, update, rollback and uninstall. Disabling/uninstalling a game releases its resources and suspends its exchange routes, but does not delete the shared player profile or historical ledger records. Offline launch and play must not depend on an account, network installer or always-online service. Optional online features are separately declared and opt-in.

Unknown/unsigned packages are not silently trusted. Show provenance and risk; use restricted permissions and explicit confirmation. Never execute arbitrary package code just to discover its economy.

## 4. Adaptive runtime governor

### 4.1 Capability profile

At startup and on material power/device changes, collect bounded signals: logical CPU count and conservative performance class, available memory and pressure, graphics API/features and observed frame time, display resolution/refresh target, storage availability, platform constraints and thermal/power hints where exposed. These are estimates, not a universal hardware benchmark. Use safe fallbacks where capabilities are absent.

### 4.2 Resource budgets and priorities

The kernel sets global ceilings and per-module budgets. Priority order:
1. Input, simulation correctness, audio timing and foreground gameplay.
2. Essential rendering and accessibility.
3. Visible UI and wallet/profile interaction.
4. Background save, package indexing and economic analytics.
5. Prefetching, cosmetic effects and optional background work.

Under pressure, pause analytics and prefetch first; reduce background refresh and cache; lower optional effects, render resolution or visual quality; pause inactive modules. Never skip game rules, input, wallet integrity or save consistency to preserve frame rate.

### 4.3 Frame-time and background-work policy

Use frame-time budgets, not an FPS guarantee. At 60 Hz the nominal budget is 16.67 ms; at 30 Hz it is 33.33 ms. Observe rolling percentiles, missed-frame rate, memory and thermal pressure. Use hysteresis to avoid quality oscillation. Full economy scans, package hashing, large file I/O and blocking maintenance must never run in the render loop.

Use cooperative task queues, bounded work slices, cancellation, priorities, back-pressure, event coalescing, incremental indexing and idle-time scheduling. Avoid busy polling. Cache repeated calculations with versioned keys, bounded size, TTL/eviction and integrity checks. Cache is disposable; canonical saves and ledgers are not. Use atomic writes/recovery patterns where supported.

The goal is to remove redundant work and keep runtime overhead stable. Rendering and active simulation still consume real resources; zero-cost execution and universal fixed FPS are not promised.

## 5. Economic Intelligence & Exchange Engine

### 5.1 Discovery pipeline

For every installed game:
1. Read and validate its declared economic manifest.
2. Inspect only supported save schemas and event adapters; do not run arbitrary code.
3. Identify namespaced assets, units, earn events, sinks and progression rungs.
4. Validate provenance, units, ranges, caps, reset rules, duplicate events and balance consistency.
5. Observe verified yield, time-to-earn, action counts, failure rates, sinks, supply and progression thresholds.
6. Classify assets: experience, soft currency, virtual credit, consumable, capacity item, progression token, gameplay state or non-transferable utility.
7. Compare each asset/rung to the Generation 1 benchmark using earning, effort, progression, sink, scarcity/supply and integrity indices.
8. Produce an explainable, versioned quote with confidence, adjustment factors, fees, limits, rounding and expiry.
9. Allow settlement only through a separately approved, ledger-backed and idempotent service.

### 5.2 Trust states and missing manifests

Each detected asset is classified:
- DECLARED: valid versioned manifest and supported evidence.
- INFERRED: candidate found through conservative supported heuristics; confidence and evidence are shown.
- UNVERIFIED: insufficient, malformed or conflicting evidence.

If no manifest exists, the engine may infer candidates from supported metadata and observed events. Such rates are previews only. Conversion requires explicit review and approval. Conflicting evidence blocks quotes or settlement; never guess based on asset names.

### 5.3 Modular equivalence

Equivalence is evaluated independently for every asset and every ladder rung. Compare earning action and verified yield; time, skill, difficulty, risk and ease of farming; progression role and thresholds; sinks, cost and redemption utility; capacity, caps, supply and scarcity; integrity and anti-automation quality.

Matching one rung does not match an entire ladder. A new game's coin may be comparable to the Bubble Hunt earning index while its 1,000-coin capsule remains unmatched to a Bubble Hunt Capsule. A game without XP can still be benchmarked through its coins/credits and sinks. Different names can map if mechanisms and utility match; identical names do not prove equivalence. Easier farming must reduce the benchmark valuation through a measured adjustment.

### 5.4 Generation 1 reference profile

Bubble Hunt, Chaos Attack and Mana Collector use the shared profile family nu.g1.shared-economy and one wallet/save in the current prototype. Their per-game asset panels are filtered views, not separate wallets. Preserve source/game provenance in all new events. Historical legacy XP with unknown origin remains unattributed.

Creative Studio has a separate earning mechanism and target progression rule, even though current prototype rewards enter the legacy shared XP field. Casino credits remain isolated virtual credits unless separately reviewed. HP, Mana, Bubble Hunt Capsules, Mana Capsules and Golden HP Capsules are distinct asset classes. No convertibility is implied.

The initial benchmark is documented in docs/economy/NU-GENERATION-1-BASE-ECONOMY-REFERENCE-CATALOG-2026-11-14.md. It is a comparison baseline, not a universal fixed price list.

## 6. Economic Profile Manifest — illustrative target contract

A local game package should include a versioned JSON manifest declaring gameId, gameVersion, profileFamily, offline capability, namespaced assets, labels, units, asset classes, precision, transferability candidacy, validated earn events, sinks, progression thresholds, dependencies, permissions and advisory resource hints.

Example:

    {
      "schemaVersion": "1.0",
      "gameId": "studio.example.game-x",
      "gameVersion": "1.2.0",
      "profileFamily": "studio.example.economy",
      "offlineCapable": true,
      "assets": [{
        "assetId": "xcoin",
        "label": "X Coin",
        "unit": "coin",
        "class": "soft_currency",
        "precision": 0,
        "transferability": "candidate",
        "earnEvents": [{
          "eventId": "valid_target",
          "amount": 2,
          "validation": "successful_authoritative_action"
        }],
        "sinks": [{
          "sinkId": "capsule_mint",
          "amount": 1000,
          "outputAssetId": "xcapsule"
        }]
      }]
    }

This is an illustrative contract, not an implemented API. Unknown fields are handled by explicit schema policy. Resource hints are advisory; the governor measures and enforces actual usage.

## 7. Module lifecycle and isolation

Each module provides lifecycle, health, permission, resource and economic-adapter declarations. It may request a quality tier and graceful-degradation level, but cannot override kernel budgets. The kernel can suspend or deactivate one module without affecting unrelated modules. Game removal suspends its routes while preserving player history and profile integrity.

## 8. Offline-first guarantees and limits

Core runtime, manifest validation, local catalog, analysis and quote preview work offline. Games install from local downloaded packages. Optional distribution, updates and team telemetry are separate services. Local-only storage cannot guarantee secure cross-device balances or multiplayer settlement; those require a trusted authoritative backend.

## 9. Security and player trust

Sandbox modules; restrict filesystem, network and inter-module access; treat manifests, saves and telemetry as untrusted input; validate schema and ranges; verify provenance; separate analysis from settlement; show quote evidence, benchmark, adjustment, confidence, fees and policy version. Never execute package code during untrusted discovery. Preserve balances and history on module removal. XP_Bubble Hunt to Mana remains prohibited.

## 10. Packaging

AREIC ships as a versioned independent core service in the standard N.U Launcher package; it is not an optional game download. Game-specific adapters are independently installable modules. Core and adapter versions are tracked separately with compatibility checks and rollback. Removing a game never removes the core or the shared profile.

## 11. Acceptance criteria

- Offline launch and local package installation work without network dependency.
- A module can be installed, disabled, updated, rolled back and removed independently.
- Unknown packages are inspected without executing arbitrary code and remain restricted until trusted.
- Manifest-backed and inferred assets are visibly distinguished.
- Every asset/rung receives an independent equivalence decision.
- No inferred or unapproved mapping can settle.
- Background analysis does not block input/rendering and respects time/memory budgets.
- Under resource pressure, nonessential tasks and visual quality degrade before gameplay correctness.
- Diagnostics expose budget overruns without unnecessary personal data collection.
- Platform support is capability-based and tested; universal compatibility is not assumed.

## 12. Staged implementation

1. Approve package boundaries, lifecycle contracts, manifest schema and trust states.
2. Inventory current launcher modules and baseline startup/frame/memory/storage metrics.
3. Implement capability profile, runtime budgets, cooperative queues, cache and graceful degradation.
4. Implement economic manifest registry and safe heuristic discovery; no settlement.
5. Implement Generation 1 benchmark mapping and explainable quote previews.
6. Implement authoritative ledger, idempotency, reconciliation and abuse controls before any settlement.
7. Test in the public demo build and collect human/team/player reports.
8. Add platform-specific adapters and expand supported systems through measured testing.

## 13. Hard constraints

No promise of unlimited hardware compatibility, zero resource use or fixed FPS on every device. No automatic deletion or relabeling of legacy balances. No conversion inferred only from names or guessed rates. No network requirement for offline installation/play. No weakening of save integrity or security for frame rate. No live settlement before authoritative ledger and owner approval.

## 14. Change boundary

This is architecture documentation only. No runtime code, manifest validator, governor, wallet, ledger, Gateway lock, merge, deployment or release was changed.
