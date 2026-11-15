# N.U Launcher — architecture and acceptance boundary

## Purpose
A cross-generation launcher shell that discovers installed game packages, resolves compatible extensions, calibrates device capability before game execution, and applies a shared resource budget. The current branch adds a browser-only human-test preview, not a production installer.

## Startup gate
1. Start in a lightweight shell/loading state. Do not import game entry points or extension code.
2. Read browser capability hints and run bounded probes only.
3. Normalize each subsystem result to a capability score plus confidence and availability.
4. The central coordinator selects the conservative stable ceiling (the minimum supported score after safety caps).
5. Present ten levels. Level 10 is the calibrated stable ceiling; levels 1–9 apply progressively lower budgets.
6. Persist the profile only after the player applies it. Keep the game paused until the player explicitly enters the demo/game.
7. On refresh/reset, rerun calibration in the background and atomically replace the saved profile when complete.

## Calibration adapters

| Adapter | Available browser signal | Limitation |
|---|---|---|
| Online | Same-origin reachability/round-trip and Network Information API hints | Not an Internet-wide speed test, packet-loss test, or reliable throughput benchmark |
| Graphics | WebGL availability, texture limits, optional renderer string | Renderer string may be hidden; limits are capability hints, not a GPU benchmark |
| Memory | navigator.deviceMemory when exposed | Coarse privacy-preserving memory class, not free/available RAM |
| CPU | hardwareConcurrency plus a tiny bounded JavaScript sample | Logical core count and short sample are heuristics, not native CPU benchmark |

The coordinator must never treat an unavailable signal as proof of high capability. It should lower confidence and use conservative fallback budgets. No continuous benchmark loop is permitted. Calibration should be cancelled or skipped when the page is hidden, the browser is under pressure, or the user has enabled data-saving/reduced-motion preferences.

## Ten-level budget
Level 10 means the highest stable limit estimated for the current session, not unrestricted maximum hardware output. Levels 1–9 reduce optional effects, canvas pixel count, particle count, and target frame budgets in bounded steps. The game simulation must remain deterministic and separate from visual quality. A renderer may lower visual fidelity; it must not silently change game rules, economy, rewards, physics, or network authority.

## Preferences
- Remember choice / hide chooser: reuse the stored behavior and retain a visible route back to Launcher → Settings → Calibration.
- Per-game calibration: intended to freeze each game before its own profile is selected. The preference UI is present, but integration with the existing game entry points is pending.
- Ask every launcher start: rerun calibration and show the ten-level chooser.
- Reuse saved profile: no new calibration; quickest path.
- Silent calibration: rerun the bounded check at launcher start and apply the stable ceiling without a chooser.
- Automatic adaptive mode: intended to apply the stable ceiling at launcher and game start without interruption; game-start adapter is pending.

All preferences are stored locally and update automatically. Refresh calibration reruns the check. Reset calibration clears the saved profile and starts a fresh check. The close-settings action requires explicit Yes/No confirmation before applying and returning.

## Package and extension model (target contract)
A production package registry should describe, but never execute, package code during discovery:
- package id, semantic version, generation compatibility range, platform targets
- entry point and required runtime API version
- dependency graph with pinned versions
- content hashes and publisher signature
- declared permissions (network domains, local file access, storage, input, graphics)
- resource hints (memory ceiling, worker count, GPU feature requirements)
- rollback metadata and integrity status

Install/update pipeline: resolve manifest → verify signature and hashes → check compatibility and permissions → download to staging → validate dependencies → activate atomically → retain last-known-good rollback. Extensions must be sandboxed and least-privilege. A game or extension must not be allowed to raise the central resource ceiling. Native platform adapters are required for reliable OS-level CPU/GPU/RAM telemetry and native package management.

## Privacy and telemetry
The preview stores calibration locally and exports a JSON human-test report. There is no server-side report collector in this branch. Do not collect hardware fingerprints, account identifiers, or personal data by default. A future report endpoint must be opt-in, documented, rate-limited, and strip identifying data.

## Current implementation boundary
Implemented in this preview:
- separate launcher page and calm loading/calibration UI
- four browser capability adapters with bounded work
- ten selectable levels and persisted local profile
- remembered behavior preferences
- refresh/reset controls and Yes/No exit confirmation
- local JSON export for human test reports
- links from the existing public demo to the launcher preview

Not yet implemented:
- native Windows/macOS/Linux/Android/iOS launcher packages
- true OS-level free RAM/CPU/GPU telemetry
- trustworthy throughput/packet-loss service endpoint
- package catalog, signed downloads, extension sandbox, dependency resolver and rollback
- per-game calibration hook into all game entry points
- server-side feedback intake and analytics
- production CDN/offline installer and release signing

## Human acceptance gates
Do not describe this as production-ready until real-device tests verify startup gate, no premature game execution, CPU/GPU/memory/network fallbacks, ten-level budget behavior, reduced motion, touch, keyboard accessibility, refresh/reset, saved preferences, extension isolation, package integrity, rollback, and actual public deployment.


## Cross-generation launcher law — 2026-11-15

The launcher is one long-lived product for all N.U generations, not a Generation 1 shell. Keep its core lightweight, stable and limited to shared host/platform services. Games, creative tools, expansions and extensions are independently installable packages; they own their gameplay, presentation, assets, module data and module-specific lifecycle. New modules must not be forced to adopt launcher internals or require a launcher redesign merely because their content or technology differs.

Package discovery is metadata-only and must never execute package code. Use a versioned, capability-based host API; explicit permissions; namespaced storage/events/routes; least privilege; integrity/signature checks; staged atomic activation; and last-known-good rollback for the future operational installer. A module may lower its resource request but cannot raise the central launcher ceiling. Package updates must not overwrite player saves. Uninstall must preserve saves by default and ask separately before deleting module data.

Keep installed package content separate from mutable player data, shared identity, per-game saves, canonical wallet state, derived caches and user-created content. Current Generation 1 facts remain: nu-world-save-v1 is the browser-local save; nu_exchange_cache_v2 is derived only; nu.exchange.protocols.v1 is protocol metadata; the Exchange bridge is read-only; offlineLauncher is false. Browser offline cache is not a native launcher, durable backup or guaranteed offline install.

Offline Browser, Personal Downloadable Launcher, LAN, Online Launcher and Server-rendered modes remain distinct. One launcher serves all generations by default; generation labels are catalogue metadata, not separate launcher shells. Core updates should be rare and justified by security, platform/runtime necessity or owner-approved architecture changes.

Normative full contract: [N.U Launcher — Cross-Generation Runtime, Packaging & Data Persistence Contract](./docs/architecture/NU-LAUNCHER-CROSS-GENERATION-RUNTIME-AND-PACKAGING-CONTRACT-2026-11-15.md).
