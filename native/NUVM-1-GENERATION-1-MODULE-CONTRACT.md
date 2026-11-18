# N.U Generation 1 module and translator contract

- Version: 1.0-draft
- Date: 2026-11-18
- Status: IMPLEMENTED-CORE-SUBSET / PACKAGE-CATALOG-AND-GAME-PORTS-PENDING
- Runtime ABI: NUVM/1
- Scope: stable extension boundary for Generation 1; future generations add translators/adapters without changing the core ABI.

## 1. Layer ownership

1. **N.U Core** owns lifecycle, resource ceilings, module registry, sessions and scheduler admission.
2. **N.U Translator** converts a generation-specific neutral instruction representation into the core VM instruction set. A translator may reject unsupported operations; it must never silently approximate game rules.
3. **N.U Runtime Host** supplies the window, input, clock, file and presentation adapters for the current OS. Host APIs are capabilities, not game policy.
4. **N.U Adaptive Engine** samples bounded system capabilities once at startup or on explicit recalibration and derives a conservative app-owned budget. It cannot promise a hard global CPU/GPU quota.
5. **N.U Package Manager** validates metadata, ABI, generation, hashes/signatures, dependencies, permissions and rollback before activation.
6. **Disk Cache** stages bounded data chunks; only one chunk is admitted to the caller's RAM buffer at a time. Cache data is disposable and never replaces save data.

## 2. NUVM/1 binary envelope

The current 16-byte header is little-endian:

| Offset | Size | Meaning |
|---:|---:|---|
| 0 | 4 | ASCII NUVM |
| 4 | 1 | ABI major = 1 |
| 5 | 1 | ABI minor = 0 |
| 6 | 1 | generation = 1 |
| 7 | 1 | flags = 0 |
| 8 | 4 | bytecode payload length |
| 12 | 4 | CRC-32 of payload |
| 16 | N | bytecode |

The current envelope limits bytecode to 1 MiB. CRC-32 detects accidental corruption only. It is not publisher authentication, a signature, or a trust decision.

## 3. Generation-1 neutral IR

The C90 translator currently supports these operations:

- LOAD_IMM dst, u32
- MOVE dst, src
- ADD/SUB/XOR dst, src
- STORE8 src, address and LOAD8 dst, address
- JUMP bytecode_offset and JUMP_ZERO register, bytecode_offset
- HALT

Register indices are 0..7; VM private memory is 4096 bytes. Invalid register, memory or output-capacity operands are rejected. The translator emits only VM bytecode; it does not emit native machine code and does not load arbitrary native DLLs.

## 4. Execution and resource policy

- CPU admission alternates one N.U scheduler slot per two host scheduler slots. The Win32 host uses a timer-driven bounded slice (up to 64 VM instructions) so the UI message loop can process exit and window messages between slices.
- GPU admission is reserved as an alternating policy primitive; no native game renderer currently consumes it.
- The initial app-owned RAM budget is min(physical/2, available/2, 250 MiB).
- The 250 MiB shared pool is divided into 125 MiB short-term and 125 MiB repeated-pattern partitions at the maximum budget; these are partitions, not extra allocations.
- Disk staging ceiling is 1 GiB. The cache API stores length/CRC/payload records and yields one chunk up to 64 KiB into a caller buffer. It deletes the temporary spool file when drained.
- The 640×480 / 30 FPS ceiling is a target for future render adapters, not evidence that a GPU quota is enforced.

## 5. Module manifest target (not yet parsed by native code)

Each installable module must provide:
- stable reverse-domain or owner-scoped module ID;
- semantic version and generation range;
- minimum/maximum NUVM ABI;
- module kind and translator ID/version;
- entry package path and content digest;
- declared capabilities/permissions;
- dependencies with version ranges and digests;
- resource hints and maximum working-set request;
- publisher identity and detached signature;
- rollback compatibility metadata.

Unknown capabilities, ABI-major mismatch, unsupported generation, invalid signature, digest mismatch, dependency cycle or resource request above Core policy must fail closed.

## 6. Install and lifecycle state machine (target)

DISCOVERED → VALIDATED → STAGED → VERIFIED → READY → ACTIVE → STOPPED

Any failure transitions to REJECTED without replacing the last-known-good active version. Activation must be atomic. Uninstall removes only package-owned files and preserves player saves/assets unless the player explicitly chooses a separate save deletion action.

## 7. Current implementation status

- Implemented: C90 VM, CRC package envelope, Gen-1 IR translator subset, bounded disk FIFO cache, cooperative CPU scheduling, minimal Win32 window.
- Not implemented: signed package trust, manifest parser, dependency resolver, atomic install/rollback, persistent cache recovery, per-game translators, native game ports, GPU rendering, platform adapters beyond Win32.
- The three original Generation-1 games remain browser implementations until individually ported and behaviorally tested. The translator must preserve their rules, economy and save semantics; no game is declared native-playable by this contract alone.
