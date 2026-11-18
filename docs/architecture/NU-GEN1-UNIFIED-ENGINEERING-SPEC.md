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

NUVM/1 currently uses a 16-byte little-endian package header followed by at most 1 MiB of bytecode. The VM has eight 32-bit registers, 4 KiB private memory, and a bounded instruction budget. Unknown opcodes, invalid operands, invalid package CRC, unsupported ABI major and unsupported generation fail closed.

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

The current `.nup` envelope has: magic `NUVM`, ABI major/minor, generation, flags, bytecode length and CRC32, then bytecode. CRC32 is corruption detection, not authentication.

A package publisher trust contract must use:
- canonical manifest encoding and SHA-256 content digests;
- detached asymmetric signatures over a canonical manifest + package digest;
- a pinned trust-root store, key identifiers, expiry/revocation and key-rotation policy;
- explicit signature algorithm/version identifiers;
- fail-closed behavior for missing/unknown keys, invalid signatures, digest mismatch, unsupported generation, dependency cycles, undeclared capabilities and ABI-major mismatch.

No production signing key or trust root is embedded in the source tree. No unsigned package may be represented as publisher-authenticated. The current package builder emits unsigned development packages only. Signature verification, trust-root lifecycle and production Package Manager remain release blockers.

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
- portable C90 VM, CRC-protected NUVM/1 envelope validation and cooperative scheduler;
- Generation-1 neutral IR translator subset;
- disk-backed FIFO queue with per-chunk CRC, 64 KiB maximum chunk and caller-owned RAM buffer;
- file-to-cache staging and sequential drain into one selected module buffer;
- `NU_PackageBuild` and `nu_pack input.bytecode output.nup` development package builder;
- minimal Win32 GUI host, XP subsystem target metadata, timer-driven VM slices;
- portable unit tests and Win32 cross-build workflow;\n- N.U-owned RAM reservation ledger with over-budget rejection and saturating release.

Not yet implemented:
- manifest dependency-field parsing and Package Manager integration;
- SHA-256 publisher digest/signature verification and managed trust roots;
- atomic install/update/rollback, uninstall UI and crash-recovery journal;
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

1. Implement and test a real SHA-256 + asymmetric-signature provider, pinned trust roots and key lifecycle; then add dependency resolution and a transactional Package Manager.
2. Integrate cache staging, translator and scheduler; keep one selected module in RAM at a time.
3. Package builder and deterministic test fixtures.
4. Native Bubble Hunt port and end-to-end proof.
5. Mana Collector and Chaos Attack ports, preserving wallet/save semantics.
6. Native renderer and measured resource adapters.
7. XP-compatible toolchain/import audit, signed setup, repair/uninstall, and actual XP/low-end hardware validation.

## 12. Release policy

This branch is a development candidate. It is not a playable launcher release and must not be merged or advertised as such until game ports, package trust, transactional installation, signed setup, actual XP testing and human acceptance pass.


## 11. Dependency graph primitive — candidate increment

`native/nu_dependency.c/.h` provides a bounded resolver for up to 64 Generation-1 modules. A row-major adjacency matrix expresses module-to-required-module edges. The resolver validates generation 1 and ABI 1.0 for every node, rejects self-edges and malformed matrix values, and returns dependency-first order. Cycles and unsupported contracts fail closed. Tests cover a three-node chain, a cycle, and an unsupported generation.

This is not yet a complete dependency manager: manifest dependency declarations, installed-package lookup, download, signature verification and transactional activation remain unimplemented.
