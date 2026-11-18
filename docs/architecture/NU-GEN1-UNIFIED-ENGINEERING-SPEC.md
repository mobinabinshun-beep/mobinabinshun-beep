# N.U Generation 1 — Unified Engineering Specification

- Revision: 1.2-candidate
- Date: 2026-11-18
- Status: engineering baseline; not a release specification
- Canonical implementation branch: `feat/nu-native-runtime-gen1-foundation`
- Tracking PR: #195
- Compatibility target: 32-bit Windows XP first; later Windows versions and additional hosts
- Core implementation baseline: portable C90; host APIs isolated behind adapters

## 1. Product definition

N.U is a browser-independent, modular runtime environment. The operating system starts and hosts the N.U window and supplies platform capabilities (windowing, input, files, clock, audio and graphics). It must not define game rules, module policy, generation translation or N.U lifecycle semantics.

The user installs the launcher and chooses which game modules occupy disk. The three intended first-pack modules are Bubble Hunt, Mana Collector and Chaos Attack. They are defaults, not mandatory system components. Removing a game must preserve its save and wallet data unless the user separately requests save deletion.

## 2. Layer ownership and boundaries

| Layer | Responsibility | Must not do |
|---|---|---|
| N.U Core | Lifecycle, sessions, resource policy, module registry and scheduler | Depend on game-specific rules |
| N.U Translator | Generation-specific IR/protocol translation to stable NUVM ABI | Silently approximate unsupported operations |
| N.U Runtime Host | Window, input, clock, file and presentation capabilities | Own game policy or require a general browser |
| N.U Adaptive Engine | Probe capabilities, calibrate conservative app-owned budgets, detect explicit hardware/driver changes | Claim exact global hardware quotas it cannot enforce |
| N.U Package Manager | Manifest, integrity, signatures, dependencies, staging, activation, rollback and uninstall | Delete player data during ordinary module uninstall |
| Native platform host | Bootstrap and adapt OS capabilities | Become the portable runtime or translator |

A module carries a manifest, generation identifier, translator contract/version, dependencies, capabilities, resource hints, content digests and publisher signature. Generation 1 is active. Future generations add translator/adapters without changing the Core ABI unless an explicit ABI-major migration is approved.

## 3. Hardware and resource baseline

Initial reference system: 1 GiB disk capacity allocated to N.U staging, 1 logical CPU, 1 GPU execution unit (vendor-specific and not a normalized measurement), and 1 GiB physical RAM.

- RAM ceiling: `min(physical RAM / 2, currently available RAM / 2, 250 MiB)`.
- Shared working/cache pool: at most 250 MiB, partitioned into 125 MiB short-term cache and 125 MiB repeated-pattern cache at full budget. These are partitions, not additional allocations.
- Disk staging ceiling: 1 GiB; actual use must also respect free disk space.
- CPU admission: one N.U cooperative slot per two scheduler slots, bounded VM slices and below-normal process priority on the current Win32 host.
- GPU admission: alternating admission primitive only; no native renderer currently consumes it.
- 640×480 at 30 FPS is a future app-side render target, not a verified GPU percentage limit.

These mechanisms bound N.U-owned work; they do not guarantee the OS, drivers or other processes leave exactly half of every resource to N.U. Windows XP does not expose a generic hard per-process CPU/GPU quota. The Adaptive Engine must report measured behavior and distinguish policy targets from enforceable controls.

## 4. Execution and translation

NUPK/1 uses a 20-byte little-endian package-container header and carries at most 1 MiB of NUVM/1 bytecode. Container version and VM ABI are separate fields. The VM has eight 32-bit registers, 4 KiB private memory, and a bounded instruction budget. Unknown opcodes, invalid operands, invalid package CRC, unsupported ABI major and unsupported generation fail closed.

The Generation-1 translator currently supports a small neutral IR subset: immediate load, move, add/subtract/XOR, byte load/store, jump, conditional jump and halt. This is not a translator for arbitrary console binaries and is not yet a port of any of the three games.

Translation pipeline:
1. Validate module manifest and ABI.
2. Read package into a disk-backed bounded queue in chunks no larger than 64 KiB.
3. Validate each chunk CRC and drain the selected module sequentially into a bounded module buffer.
4. Validate the NUVM envelope and bytecode.
5. Translate supported Generation-1 IR to NUVM/1.
6. Execute in bounded cooperative slices.
7. Cache only validated repeatable translation/protocol results; invalidate when module, translator, ABI or hardware profile changes.

The disk queue is disposable staging only. Save data, wallet state, user assets and persistent profile data are separate stores and must never be placed in the transient cache.

## 5. Package format and trust contract

The current `.nup` envelope uses the NUPK/1 container: magic `NUPK`, container major/minor, generation, flags, 16-bit NUVM ABI major/minor, bytecode length and CRC32, then bytecode. The VM instruction-set identifier remains NUVM/1. CRC32 is corruption detection, not authentication. CRC32 is corruption detection, not authentication.

A package publisher trust contract must use:
- canonical manifest encoding and SHA-256 content digests;
- detached asymmetric signatures over a canonical manifest + package digest;
- a pinned trust-root store, key identifiers, expiry/revocation and key-rotation policy;
- explicit signature algorithm/version identifiers;
- fail-closed behavior for missing/unknown keys, invalid signatures, digest mismatch, unsupported generation, dependency cycles, undeclared capabilities and ABI-major mismatch.

No production signing key or trust root is embedded in the source tree. No unsigned package may be represented as publisher-authenticated. The current package builder emits unsigned NUPK/1 development packages only. Signature verification, trust-root lifecycle and production Package Manager remain release blockers.

## 6. Canonical manifest and trust-provider boundary

The Generation-1 development parser accepts one canonical ASCII representation with fixed field order: format marker, module id, generation, ABI, package basename, package size, lowercase SHA-256 digest, key id and detached signature token. It rejects duplicate/reordered/unknown fields, CRLF, embedded NUL/non-ASCII bytes, path traversal, unsupported ABI/generation, oversized values and malformed digest/signature syntax.

Parsing is structural validation only. SHA-256 calculation and asymmetric signature verification are deliberately delegated to a platform crypto provider through `NU_ManifestVerifyProvider`. The runtime fails closed when no provider is configured, when the package size differs, or when the manifest is unsigned. No production trust root or cryptographic implementation is shipped in this increment. A successful callback is only as trustworthy as the provider implementation and its key-management policy; the current CI only tests parser behavior and fail-closed rejection.

## 7. Install, update, rollback and uninstall state machine

Target state machine:
`DISCOVERED → MANIFEST_VALIDATED → SIGNATURE_VERIFIED → DEPENDENCIES_RESOLVED → STAGED → CONTENT_VERIFIED → READY → ACTIVE`.

Failure at any pre-activation state must leave the last-known-good active version unchanged. Activation uses same-volume atomic rename/swap where supported, with a recovery journal. Rollback restores the previous verified package. Uninstall removes only package-owned files; saves, wallet, user assets and profile records remain unless explicitly deleted by the user.

Current implementation has package-envelope creation/validation and disk staging primitives only. Manifest parsing, cryptographic verification, dependency solving, transactional activation and recovery journal are not complete.

## 8. First game-pack requirements

First pack: Bubble Hunt, Mana Collector and Chaos Attack. Each is a separately installable module with its own Generation-1 game adapter and protocol declaration. The port must preserve gameplay rules, economy, wallet and save semantics. Each game gets independent save slots. The user may uninstall any game and later reinstall it without losing its save or wallet.

Port order: Bubble Hunt first. Do not start the next game until Bubble Hunt passes deterministic behavior tests, save round-trip tests, resource budget tests and a full native-host launch cycle.

## 9. Current implementation inventory

Implemented candidate:
- portable C90 VM, CRC-protected NUPK/1 container validation carrying NUVM/1 bytecode, and cooperative scheduler;
- Generation-1 neutral IR translator subset;
- disk-backed FIFO queue with per-chunk CRC, 64 KiB maximum chunk and caller-owned RAM buffer;
- file-to-cache staging and sequential drain into one selected module buffer;
- `NU_PackageBuild` and `nu_pack input.bytecode output.nup` development package builder;
- minimal Win32 GUI host, XP subsystem target metadata, timer-driven VM slices;
- portable unit tests and Win32 cross-build workflow;
- N.U-owned RAM reservation ledger with over-budget rejection and saturating release.

Not yet implemented:
- manifest dependency-field parsing and full Package Manager integration;
- SHA-256 publisher digest/signature verification and managed trust roots;
- durable filesystem install/update/rollback, three-stage uninstall UI and crash-recovery journal;
- previous-install discovery and portable identity-marked data export/import (component reconciliation planning is implemented);
- native game ports and game-specific translators;
- GPU renderer and platform graphics adapters;
- complete reservation-ledger integration across all N.U allocations and measured, OS-specific resource telemetry/enforcement;
- signed installer, repair/uninstall package and real Windows XP execution QA.

## 10. Automated and human acceptance gates

Automated:
- C90 strict build with warnings as errors;
- unit tests for package builder/validator, translator, VM limits and cache ordering/capacity;
- malformed package/opcode and unsupported generation rejection;
- Win32 XP-target cross-build and PE subsystem/import audit;
- repeatable package round-trip and save-format tests when game ports arrive.

Human:
- boot and run on actual 32-bit Windows XP SP3 or verified XP VM;
- test at 1 GiB RAM and one logical CPU where possible;
- verify graceful exit, input focus and return to Windows;
- measure real CPU/RAM/GPU behavior with OS/vendor tools;
- install, launch, uninstall and reinstall each game while preserving saves/wallet;
- inspect installer trust/signature and recovery behavior.

A PE subsystem value of 5.01 or a successful cross-build is not proof of Windows XP execution.

## 11. Engineering sequence

1. Complete the transactional Package Manager: parse manifest dependencies, validate package inventories, discover compatible existing hosts, persist the journal, stage files and implement atomic activation/rollback. The component keep/add/update reconciliation planner and in-memory journal transition model are implemented.
2. Complete three-stage install/uninstall UI, safe inventory-constrained deletion, separate installer archive management, and portable identity-marked save/wallet/profile export/import.
3. Integrate RAM reservations into every N.U allocation/cache path; add on-demand asset loading, release-on-exit and measured low-end resource telemetry.
4. Complete native Runtime Host input and low-cost renderer; define the stable module presentation/input API.
5. Port Bubble Hunt as the first complete Generation-1 module and prove install → launch → play → save → exit → uninstall → reinstall.
6. Port Mana Collector and Chaos Attack as independent add-on modules using the same host contracts.
7. Implement production SHA-256/signature verification and managed trust roots, then signed complete-pack installer and repair flow.
8. Complete XP toolchain/import audit, actual XP and low-end hardware testing, resource measurements and human acceptance.

## 12. Release policy

This branch is a development candidate. It is not a playable launcher release and must not be merged or advertised as such until game ports, package trust, transactional installation, signed setup, actual XP testing and human acceptance pass.


## 13. Dependency graph primitive — candidate increment

`native/nu_dependency.c/.h` provides a bounded resolver for up to 64 Generation-1 modules. A row-major adjacency matrix expresses module-to-required-module edges. The resolver validates generation 1 and ABI 1.0 for every node, rejects self-edges and malformed matrix values, and returns dependency-first order. Cycles and unsupported contracts fail closed. Tests cover a three-node chain, a cycle, and an unsupported generation.

This is not yet a complete dependency manager: manifest dependency declarations, installed-package lookup, download, signature verification and transactional activation remain unimplemented.


## 14. Pack installation, upgrades and user-controlled cleanup — candidate increment

The initial public demo is planned as a complete offline pack. Future releases remain complete packs for clean installation, but a compatible existing host must be discovered through a verified N.U installation identity. Setup then reconciles component IDs and versions and stages only missing/changed modules while retaining the complete downloaded pack as the user's independent installer archive.

The user-facing lifecycle is defined in docs/architecture/NU-PACK-1-USER-LIFECYCLE.md. Install and uninstall both use three understandable stages: choose destination/action, choose components or data classes, then review and confirm. Uninstall defaults to preserving saves, wallet/profile, user assets and settings. Temporary cache and program-owned files are removable. The original downloaded installer archive is stored outside the managed install root and is never included in ordinary uninstall or “select all”; deleting it requires a separate explicit user action.

The native C90 cleanup planner classifies inventory entries as core, module, cache, save, wallet, user asset, profile/settings or installer. It calculates delete/preserve counts and bytes. Unit tests verify that ordinary cleanup preserves the installer and that a separate explicit flag is required to include it in a deletion plan. This planner does not yet perform filesystem operations.

Still required before promising this experience: safe inventory discovery, previous-host detection, full-pack component reconciliation, staged atomic activation, durable recovery journal, filesystem deletion constrained to verified N.U roots, portable identity-marked data bundle export/import, a simple three-stage Win32 UI, and real uninstall/reinstall QA. The installer archive must remain outside the uninstall root. Unknown files must never be treated as cache.

 
## 15. Full-pack reconciliation and transaction-state model — candidate increment

`native/nu_install_plan.c/.h` now provides a bounded (64-component) full-pack reconciliation planner. It matches stable component IDs and versions, classifies components as keep/add/update, and deliberately leaves installed components not present in the incoming full pack untouched. It rejects duplicate IDs, invalid IDs/versions, malformed required flags and insufficient plan capacity. Unit tests cover keep/add/update, preservation of unrelated installed add-ons and invalid IDs.

The same module models the legal transaction states (prepared, staging, verified, activated, rollback-required and rolled-back), rejects skipped transitions, enforces complete staging before verification, and allows rollback after activation. This is an in-memory state model only: it is not a durable on-disk journal and performs no file copying, signature checks, atomic rename or rollback I/O. Those remain mandatory before a public installer can be called transactional.


## 16. Repository consolidation and format compatibility gate

The canonical cross-repository map and document precedence are now defined in [NU-MASTER-ENGINEERING-INDEX-fa.md](NU-MASTER-ENGINEERING-INDEX-fa.md). Pack manifest, translator/resource contract and machine acceptance checklist from the parallel Generation-1 specification branch have been copied into this implementation branch so the runtime PR has one coherent documentation surface.

A source audit found incompatible candidate formats all labelled `NUVM/1`: the older shell's line-oriented declarative module, the C++ host's `.numod + .nuvm` text instruction format, and this branch's binary envelope with `NUVM` magic and bytecode. They are not ABI-compatible and must not be merged as though they were one format. Before shell/game integration, split package-container, module-manifest, pack-manifest and VM-ISA version identifiers; add golden fixtures and explicit legacy rejection/migration tests. No existing released format is silently reinterpreted.

The master index also records that the three approved game IDs are currently manifest-only: their native payloads are not bound to this runtime or installer. The public browser prototypes in the product default branch are not native Generation-1 ports.


## 17. NUPK/1 container separation — candidate implementation

The package-container/VM-ISA naming collision in the binary runtime path has been corrected in this pre-release branch. The binary envelope now uses NUPK magic and a 20-byte versioned header. Container major/minor, generation, flags and 16-bit NUVM ABI major/minor are independently validated; payload length and CRC32 follow. The payload begins at offset 20 and remains NUVM/1 bytecode.

The validator rejects the previous pre-release binary envelope with NUVM container magic, unsupported container version, unsupported ABI minor, nonzero flags, bad length and payload CRC mismatch. The legacy text-based NUVM samples in the older shell branches remain separate incompatible formats and are not silently imported.

This is a breaking pre-release format correction; no public user data or published package compatibility is claimed. Golden fixtures and cross-host interoperability tests are still required before release.


## 18. XP-first static image host presentation

The Win32 host now loads the one canonical still image from `background.bmp` beside the executable and draws it with GDI StretchBlt while preserving its aspect ratio. The build extracts the embedded PNG payload from the canonical SVG into a 24-bit BMP and validates the expected 1536×1024 dimensions. No dynamic background layer, particle system, Canvas, WebGL, shader, browser or animation is loaded by the native host. Foreground OS-native buttons remain separate controls. This is a low-cost image presentation path, not a native game renderer or GPU quota.

The CI artifact is a loose test payload (EXE + BMP + README + SHA-256 manifest), not an installer. XP API cross-build and PE subsystem inspection do not replace an actual XP SP3 execution test.


## 19. Host allocation accounting increment

The Win32 host now routes its known large allocations through the N.U RAM reservation ledger:
- reserves the bounded 1 MiB + NUPK header package buffer;
- reserves the active VM state;
- checks and reserves the BMP file-size estimate before GDI bitmap loading, releasing it if loading fails;
- releases reservations and frees the package buffer at host shutdown;
- displays the current N.U reservation total in the host window.

This is real host-path accounting, not a complete memory sandbox. GDI/driver internal allocations are only approximated by the file-size reservation; C runtime, cache, future renderer and all module allocations still need to use a central allocator/budget broker. No claim of system-wide RAM enforcement is made.

 
## 20. NUDb/1 portable user-data bundle

The portable C90 module `nu_data_bundle.c/.h` defines the non-executable NUDb/1 user-data container.

### Container header (20 bytes, little-endian)
- bytes 0–3: ASCII `NUDB`
- byte 4: format major = 1
- byte 5: format minor = 0
- byte 6: entry count (1–32)
- byte 7: reserved = 0
- bytes 8–11: payload length after the 20-byte header
- bytes 12–15: CRC32 of the complete entry payload
- bytes 16–19: product tag `N.U.`

### Entry record (12-byte header + ID + data)
- byte 0: data class (1 Save, 2 Wallet, 3 Profile, 4 User Asset, 5 Settings)
- byte 1: ID length (1–63)
- byte 2: schema major (must be nonzero)
- byte 3: schema minor
- bytes 4–7: data length (maximum 16 MiB per entry)
- bytes 8–11: CRC32 of entry data
- followed by stable ASCII ID and raw data bytes.

The complete bundle is limited to 64 MiB and 32 entries. IDs allow lowercase ASCII letters, digits, dot, dash and underscore; IDs must be globally unique. The parser validates the entire container and all entry CRCs before publishing pointers into the input buffer. No executable/module, cache or installer class is allowed. CRC32 detects accidental corruption only and does not authenticate the owner or prevent deliberate modification.

### Integration boundary

The builder/parser and portable unit tests are implemented. The host does not yet write bundle files, perform atomic export, preview imports, merge/replace profiles, or migrate the browser localStorage save. Browser key `nu-world-save-v1` requires an explicit browser export/import bridge; the Native process cannot read a browser profile's localStorage directly. Do not advertise backup/migration UI until filesystem and user-flow integration passes.
