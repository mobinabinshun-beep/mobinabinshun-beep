# N.U Launcher — Modular Game and Creative Studio Packaging Plan

**Date:** 2026-11-13  
**Branch:** feat/nu-launcher-modular-game-studio-packages-2026-11-13  
**Status:** package-contract scaffolding; not a runnable installer or release

## User requirement

The public browser demo may use available device capacity to provide a responsive interactive experience. That demo-only opt-in must not become a permanent background service, a device-wide performance override, or a privilege inherited by installed packages.

The downloadable Launcher must install and run the game collection and Creative Studio as independent modules, offline where their local assets and APIs permit.

## What the repository actually contains

- `launcher.html`, `nu-launcher.css`, and `nu-launcher.js` implement a browser calibration preview.
- `NU-LAUNCHER-ARCHITECTURE.md` explicitly marks native installers, package catalog, signature verification, dependency resolution, sandboxing, rollback, and native hardware telemetry as not implemented.
- The Generation 1 game is currently loaded from `index.html` with shared runtime, background, wallet, game and player UI scripts.
- Creative Studio is a separate `pixel-art-studio.html` page loading the shared engine, wallet and graphics modules.
- `nu-engine.js` is frozen by `ENGINE-LOCK.md`; this work must not modify it.
- Generation 2 remains quarantined. No protected adaptive/network/game engines are changed by this package-contract commit.

## Package boundaries

### 1. N.U Game — Generation 1

Package id: `nu.game.generation-1`

Owns the Generation 1 game entry, game presentation, game assets, local game data and save namespace. It requests capabilities from the Launcher; it does not calibrate the device independently or raise the Launcher resource ceiling.

The game simulation, economy, rewards, saves and deterministic rules are invariant under quality changes. Only optional presentation quality may scale.

### 2. N.U Creative Studio

Package id: `nu.creative.studio`

Owns the Creative Studio entry page, raster/vector analysis, editing tools and export UX. It can run offline after package installation. File access remains user-initiated and project storage remains package-scoped.

The original imported file is immutable. Decode, allocation, processing, history or export failures must never overwrite or discard that source reference.

### 3. Shared Launcher host

Host API: `nu.launcher.host/v1`

Launcher owns:
- one device capability profile and resource coordinator;
- calibrated stable ceiling and explicit user-selected quality tier;
- memory pressure, visibility and thermal/power signals where native platform APIs provide them;
- worker-pool admission and cancellation;
- package-scoped storage, file chooser and export adapters;
- package permissions, verification, activation and rollback.

Packages receive a read-only capability snapshot and request bounded work. They cannot increase the central ceiling, enumerate unrelated files, or access another package's storage.

## Demo-only foreground compute policy

The public demo may offer an explicit “Use available device capacity for this demo” switch. It is opt-in, visible, revocable, and limited to that browser session.

- Run expensive work in workers or OffscreenCanvas where supported; retain a chunked main-thread fallback.
- Treat browser visibility as a hard lifecycle signal. On hidden/background transition, cancel or pause optional compute and release transient buffers. Do not depend on a hidden tab continuing to execute.
- Recalculate admission when the host reports memory pressure or a capability downgrade.
- The demo switch cannot override browser, OS, thermal, memory or Launcher safety limits.
- Do not run continuous stress tests, mining, idle work, hidden-tab compute, or device-wide background tasks.
- The demo boost is never persisted as a Launcher-wide preference and is not inherited by downloadable packages.

## Downloadable/offline execution

A production Launcher must run as a native desktop/mobile host or an approved installable runtime. It must not rely on a second browser tab remaining foregrounded.

Minimum install lifecycle:
1. Discover manifests without executing package code.
2. Verify publisher signature and every content hash.
3. Resolve pinned dependencies and declared permissions.
4. Stage the complete package in an isolated location.
5. Validate entry points, dependencies and runtime compatibility.
6. Atomically activate the package.
7. Preserve the last-known-good version for rollback.
8. Uninstall only the selected package and its package-owned data after explicit confirmation.

Offline mode means no network request is required to launch installed packages or edit locally stored projects. Updates, remote assets, cloud sync and future server compute are separate optional services.

## Graphics pipeline requirements

The existing Studio uses Canvas/ImageData and full-array snapshots. Before claiming unrestricted source dimensions or a production-ready offline package, implement and test:
- tiled decode and processing with bounded working sets;
- streaming import/export where the format permits;
- worker pool sized by the Launcher budget, with cancellation and back-pressure;
- incremental history or tile-delta snapshots instead of repeated full-image copies;
- progressive preview that never replaces the original source;
- behavioral tests for failure at every stage and exact source preservation.

Do not replace a fixed product-size ceiling with unbounded allocation. No arbitrary product pixel/file ceiling is introduced by this plan; actual work admission is derived from host capability, available memory, concurrency and safe working-set estimates.

## Online server compute boundary

Future server-side processing is an optional execution backend, not a requirement for local editing. It must use explicit user action, upload only the selected working copy, preserve the original locally, validate outputs, and support cancellation. The server must not silently receive source files or device telemetry.

The online demo and offline package must share the same deterministic operation definitions and output validation. Server availability must not block offline use.

## Acceptance gates before a downloadable build

- Package manifests validate and dependency graph is complete.
- Native Launcher exists for each claimed target platform.
- Package signature and content hashes are verified before activation.
- Sandbox and permission prompts are enforced.
- Atomic install, update, rollback and uninstall are tested.
- Offline cold-start works with network disabled.
- Game save compatibility and frozen engine hash are verified.
- Studio tile/streaming pipeline and original-source preservation tests pass.
- Foreground/background, cancellation, memory-pressure and worker-loss tests pass.
- Human QA passes on representative desktop and mobile hardware.
- Build artifacts are reproducible and release-signed.

## Honest current status

This commit adds package manifests and architecture boundaries only. It does not produce a ZIP installer, native Launcher binary, worker implementation, package manager, signed artifact, server processor, or public deployment. Those require implementation and test work in subsequent changes.
