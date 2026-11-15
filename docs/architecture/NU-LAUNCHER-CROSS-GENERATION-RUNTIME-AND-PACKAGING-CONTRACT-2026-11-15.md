# N.U Launcher — Cross-Generation Runtime, Packaging & Data Persistence Contract

**Date:** 2026-11-15  
**Status:** Normative architecture specification; current browser preview is not a production installer  
**Scope:** All N.U generations, games, creative tools, expansions and future delivery modes

## 1. Owner-approved product direction

N.U has one long-lived, cross-generation launcher intended to launch games and modules from every generation. It is not a Generation 1 launcher and must not be designed around today's catalogue alone.

The launcher should remain lightweight, simple, calm and stable. Major launcher-core updates are exceptional: required for security, platform compatibility, a necessary runtime capability, a critical defect or an explicitly approved architectural change. New games, generations, tools and content should normally arrive as independently installable packages using a stable, versioned launcher contract.

**The launcher hosts and manages modules; it is not their parent framework.** A game owns its gameplay, presentation, assets, module data and game-specific lifecycle. The launcher owns only cross-module and platform responsibilities. Adding a new generation or game must not require redesigning the launcher merely because the module has different content, rules, rendering, controls, data model or scale. If a genuine platform/runtime requirement makes a core change unavoidable, isolate it behind a versioned capability/adapter and preserve older supported packages where feasible.

## 2. Architecture layers and ownership

### 2.1 Stable launcher core

Keep the core limited to genuinely shared services:
- Application shell, navigation, catalogue and installed-module discovery.
- Package manifest parsing and schema validation. Discovery is metadata-only and must never execute package code.
- Platform/runtime capability detection and conservative resource-budget coordination.
- Install, verify, stage, activate, update, disable, uninstall and rollback orchestration.
- Permission consent, module isolation policy and trust state.
- Stable launcher-to-module API and capability negotiation.
- Shared storage location, backup/restore and migration coordination.
- Optional connectivity/sync orchestration only when an approved online service exists.
- Diagnostics and user-controlled export of non-identifying test reports.

Do not absorb game-specific mechanics, UI, economy, story, asset formats, generation assumptions or module workflows into the core.

### 2.2 Independently installable packages

Games, creative tools, expansions, content packs, optional extensions and shared runtime components are separate packages. Each has its own identity, version, dependencies, platform declarations, entry point and data ownership.

Installing or removing one game must not require reinstalling unrelated games, rewriting the launcher or deleting another module's data. Catalogue groupings such as generation, genre and role are discovery metadata, not a hard-coded runtime hierarchy.

A package may include executable payload, static content/assets/localization, manifest, module-owned schemas and migrations, permission declarations, resource hints, integrity metadata, signatures and rollback metadata. The manifest is descriptive; package code is never executed during discovery or dependency resolution.

### 2.3 Isolation and extension rules

- Namespaced module IDs, storage namespaces, events, routes, settings and assets are mandatory.
- Modules communicate through documented launcher APIs/events or explicitly approved inter-module APIs; no access to another module's private files/state.
- A module cannot raise the central resource ceiling, weaken another module's permissions or silently register itself as trusted.
- Permissions are declared before install/activation and granted by the user at the appropriate scope.
- Extensions use least privilege and platform-appropriate isolation. Native modules require stronger OS-level isolation and signing review than browser content.
- A faulty, incompatible or removed module must not prevent the launcher or unrelated modules from starting.
- Shared libraries are versioned dependencies, not hidden, unmanaged copies.
- Archived/museum packages are preserved but never auto-installed or auto-loaded.

## 3. Stable contract and forward compatibility

Every package declares:
- Stable namespaced package ID, semantic package version and package type.
- Generation compatibility range and platform/architecture targets.
- Entry point and required launcher API/runtime contract.
- Required and optional capabilities.
- Dependency IDs with pinned or bounded compatible versions.
- Content hashes and publisher signature/key identity.
- Permissions and data-access scope.
- Resource hints and hard package-level limits.
- Data schema versions and migration declarations.
- Rollback compatibility and minimum safe version.

Compatibility is capability-based, not generation-number-only. Generation labels are metadata and catalogue filters, not a hard-coded list of supported games. Unknown optional fields may be ignored safely; unknown required capabilities block activation with a clear explanation. Use additive API evolution, deprecation before removal and compatibility tests for supported API versions. Never silently run a package missing a required capability.

## 4. Install, update and uninstall lifecycle

Operational pipeline:
1. Resolve package ID, exact version, platform target and dependency graph.
2. Fetch metadata and payload from an approved source.
3. Verify publisher signature and every declared content hash.
4. Validate schema, compatibility, dependencies, permissions and resource limits.
5. Show package identity, size, permissions, dependencies and data impact to the user.
6. Download/extract to staging; never overwrite the active installation in place.
7. Validate payload completeness and module-specific preflight checks.
8. Prepare data migrations against a recoverable copy or journal.
9. Atomically activate the package and update the installed-package registry.
10. Retain the last-known-good package/recovery metadata until startup health checks pass.
11. On failure, roll back package activation and preserve user data.

Updates are package-scoped. A game update must not force a launcher-core update unless it truly requires a host capability and the compatibility policy allows it. Core updates should be rare, signed, staged, recoverable and separately announced.

Uninstall removes only the selected package payload and registration. Ask separately whether the user also wants to delete module data. Default uninstall preserves saves and user-created content, or offers backup first. Removing a module never erases global player identity or another module's save.

## 5. Data ownership, installation and persistence

### 5.1 Installed content is not player data

"Data comes with installation" means approved application content, game definitions, assets, metadata, localization and required module resources are installed on the target system. It does not mean player saves, credentials, wallet history or personal data are bundled into a game package or overwritten during installation.

Keep distinct storage domains:
1. Launcher application data: preferences, installed-package registry, runtime profile, update channel and launcher diagnostics.
2. Shared player identity/profile: player-owned identity and cross-game preferences, with explicit privacy/export rules.
3. Per-game save data: each game owns its schema and namespace; the launcher supplies storage/backup services but does not reinterpret game rules.
4. Global wallet/economy data: only where the approved N.U wallet contract defines it; one canonical source of truth, never copied balances.
5. Module cache: rebuildable derived data only, never authoritative progress.
6. Installed package content: immutable/versioned payload, separate from mutable saves.
7. User-created content: projects, artwork, exports and user-selected media, owned by the creating tool/player and protected from package updates.

The launcher may provide a common player ID and storage APIs, but must not force every game into one universal internal save schema. Cross-game data exchange is explicit, versioned and permissioned.

### 5.2 Verified Generation 1 data facts

- Browser save provider: localStorage, key nu-world-save-v1.
- Exchange reads the canonical save through NU.load(), NUWallet.normalizeSave() and the wallet engine.
- Exchange display cache: nu_exchange_cache_v2; derived and rebuilt from the canonical save. Its chart/summary limits must never truncate the canonical wallet ledger.
- Exchange protocol metadata: nu.exchange.protocols.v1; metadata only, not wallet balance or settlement.
- Current integration hooks: nu:launcher:modules-changed and NUExchangeModuleLifecycle.discover / reconcile.
- Exchange wallet bridge is read-only; no shadow wallet or settlement is enabled.
- The Generation 1 manifest explicitly declares offlineLauncher: false. Native installers and a complete offline launcher are not delivered.

These are facts about the current browser prototype, not a final native storage design.

### 5.3 Save compatibility and migration

- Every mutable data domain has an explicit schema version and owner.
- Migrations are deterministic, ordered, testable and idempotent where possible.
- Never migrate the only save copy: create a backup or write-ahead journal, validate the result, then atomically switch.
- Keep rollback compatible with the previous package/schema, or retain a documented recovery/export path if reverse migration is unsafe.
- Preserve unknown fields when safe; do not discard data because an older launcher does not understand it.
- Package updates never reset saves by default.
- Imports validate package identity, schema, size, integrity and ownership boundaries.
- Exports are explicit and user-controlled. Credentials/secrets/private media are excluded unless a separately approved secure workflow exists.
- Browser storage is origin/profile scoped and may be evicted or cleared; it is neither a secure vault nor durable backup.

## 6. Runtime modes and delivery strategy

| Mode | Purpose and boundary | Status |
|---|---|---|
| Guest/public browser demo | Temporary local test experience; no operational account or sensitive personal data | Current demo class |
| Offline browser | Same browser client resumes only content whose assets remain cached/available; storage may be evicted | Partial, not guaranteed |
| Personal downloadable launcher | Native/local launcher installs and manages independent packages and local saves | Target, not delivered |
| LAN deployment | Local host serves approved packages/services to multiple clients without internet; strict per-player privacy | Future |
| Online launcher with local rendering | Authenticated services and optional sync; games execute/render locally | Future |
| High-capacity online mode | Richer synchronized services; workload split measured per feature | Future/research |
| Server-rendered/thin client | Execution/rendering mostly remote; depends on latency/bandwidth and strong session security | Research/future |

Offline browser and downloadable launcher are distinct products. A service worker or cached page is not a native launcher, package manager, durable backup, LAN deployment or full offline guarantee. Browser preview may cache static same-origin application assets after a successful online visit; it must not claim player-save backup or full offline installation. Native storage/package installation requires platform-specific implementation and OS permission review.

## 7. Cross-generation product strategy

- One launcher product serves all generations by default.
- Generations are package metadata/content groupings, not separate launcher shells.
- New games install independently and coexist when dependencies/resource budgets permit.
- A module may require a newer runtime API, but must declare the exact capability and reason.
- Avoid core changes for cosmetic, content, game-rule or single-module needs.
- If a core change is unavoidable, implement the smallest isolated capability/adapter, preserve older APIs and publish a compatibility/migration note.
- Do not freeze future generations to the current catalogue, browser storage model, renderer, wallet fields or asset taxonomy.
- "Universal" describes product direction and compatibility design, not a claim that every platform is already supported.

## 8. Performance and resource governance

The launcher runs bounded startup checks before launching a game. Browser WebGL limits, deviceMemory, hardwareConcurrency, same-origin response time and Save-Data are hints, not native benchmarks.
- Missing/hidden signals lower confidence and use conservative fallback budgets.
- No continuous benchmark loop; pause/skip probes when hidden, under pressure or when accessibility/data-saving preferences require it.
- The launcher selects the conservative shared resource ceiling.
- A game may request a lower budget or declare requirements, but cannot raise the host ceiling.
- Visual quality may adapt; deterministic game rules, physics, rewards, wallet authority and network authority must not silently change with graphics quality.
- Native adapters are required for trustworthy OS-level telemetry and native package operations.

The current ten-level chooser is a preview. Per-game calibration integration remains pending.

## 9. Security, privacy and online boundaries

- Package discovery is metadata-only; never execute untrusted code to inspect it.
- Verify signatures and hashes before activation.
- New packages/protocols remain unverified until trust checks/review pass.
- Least privilege, explicit permissions, isolation, secure update channels and rollback are required operationally.
- LAN administrators do not automatically gain access to private player data.
- Approved online sync requires encrypted authenticated transport, authorization, versioned atomic writes, conflict handling, audit and tested recovery.
- Do not collect hardware fingerprints or identifying telemetry by default.
- Human-test reports remain local exports unless an opt-in, documented, rate-limited submission service is approved.
- Public demo must not collect real passwords, credentials, payment data or sensitive personal records.
- Simulated market activity remains visibly simulated and must never modify wallet balances, inventory, player transactions, orders or settlement.

## 10. Current-version implementation boundary (2026-11-15)

### Safe to apply now
- Keep the launcher preview separate from game entry points and its startup/calibration gate lightweight.
- Preserve a metadata-only package model; do not pretend signed installation exists.
- Preserve existing manifest discovery and read-only Exchange adapter lifecycle.
- Keep module identifiers and wallet ownership mapping explicit.
- Keep static offline cache separate from player saves and canonical wallet data.
- Clearly label browser cache, local save, package content and future native installation.
- Keep human QA export local and free of personal identifiers.

### Not to implement or claim in this version
- Native installers or OS-level package management.
- Signed production catalogue, trust root, sandbox, dependency resolver or transactional installer without a separately built and security-reviewed implementation.
- Durable cross-device backup, account authentication, cloud sync or online settlement.
- Full LAN server, thin client or high-capacity online infrastructure.
- A complete universal launcher for every OS merely because a browser preview exists.

## 11. Development and acceptance gates

**Design:** New modules follow package identity, ownership, API, permissions and data-isolation rules. Every proposed core change explains why a module-level adapter is insufficient. Future requirements are labelled target/future/research, never current implementation.

**Automated:** Test manifest schema/compatibility; prove discovery does not execute entry points; safely reject unknown required capabilities; tolerate unknown optional fields; prevent namespace collisions; prove install/update/uninstall preserves unrelated data; test save migration backup/rollback; prove modules cannot raise resource ceiling; retain existing wallet/game/graphics/Gateway/Exchange regressions; prove offline cache does not masquerade as save backup.

**Human:** Test supported desktop/mobile browsers and later each native platform separately. Install, launch, update, disable and remove one game while confirming another game and its save remain unchanged. Test failed-update rollback, startup gate, permissions, accessibility, reduced motion, keyboard/touch, resource fallback, offline cached assets, local save/export/backup boundaries. Record browser/OS/package versions without personal identifiers.

**Release authority:** Automated-green approved changes may be merged to the public demo for human QA under repository workflow. Human QA is not production approval. Production packaging/release remains separate and requires owner acceptance of the human QA report plus security/platform gates.

## 12. Source-of-truth documents

This contract consolidates and extends, but does not silently replace:
- NU-LAUNCHER-ARCHITECTURE.md — startup, calibration and package target model.
- docs/architecture/NU-PLAYER-IDENTITY-ASSETS-AND-EXECUTION-MODES.md — identity, assets and distinct execution modes.
- NU-GENERATION-1-MANIFEST.json — current Generation 1 package/runtime facts and offlineLauncher: false boundary.
- docs/operations/NU-EXCHANGE-MODULAR-RUNTIME-2026-11-14.md — Exchange derived cache and wallet boundaries.
- docs/operations/EXCHANGE-WALLET-BRIDGE-LIFECYCLE-2026-11-15.md — module discovery and read-only wallet bridge.
- docs/operations/NU-VIRTUAL-MARKET-SIMULATOR.md — simulation-only economy boundary.
- NU-LAUNCHER-HUMAN-QA.md — current launcher preview human-test checklist.

If documents conflict, preserve the narrower verified implementation boundary and raise the conflict for explicit resolution. Never infer that a future target has shipped.
