# N.U Native Runtime — Generation 1 foundation

**Status:** CANDIDATE / NOT A RELEASE / HUMAN QA PENDING  
**Target:** small-footprint Windows host; Windows XP is the compatibility floor to validate.  
**Core language:** portable C90. Win32 host uses legacy Win32 APIs.

## Implemented in this candidate

- Platform-neutral resource budget model.
- Deterministic cooperative scheduler: one N.U CPU work slot per two scheduler slots; each admitted host slice runs at most 64 VM instructions and the alternate slot yields with Sleep(1); GPU work admission alternates across N.U slots.
- NUVM/1 bounded bytecode interpreter: eight 32-bit registers, 4 KiB private VM memory, instruction limits and fail-closed malformed-opcode handling.
- Generation 1 package envelope: NUVM magic, ABI, generation, payload length and CRC-32.
- Minimal native Win32 window; press O to open a .nup package and Esc to exit.
- C90 unit tests for budget calculations, scheduler alternation, package integrity and VM execution.

This is a native execution foundation, **not yet a playable port** of Bubble Hunt, Mana Collector or Chaos Attack. Those games remain browser modules until their Generation 1 gameplay contracts are ported into NUVM/1.

## Initial low-end resource profile

| Resource | Policy |
|---|---|
| Physical RAM | Query total and currently available RAM at startup |
| N.U RAM budget | min(50% physical, 50% currently available, 250 MiB) |
| Shared working/cache budget | Same bounded RAM budget; maximum 250 MiB |
| Short-term cache | 50% of shared budget (125 MiB at full profile) |
| Repeated-pattern cache | Remaining 50% (125 MiB at full profile) |
| Disk package/cache ceiling | 1 GiB |
| CPU | One N.U cooperative slot per two scheduler slots; process priority below normal |
| GPU | Alternating N.U render admission; app-side ceiling 640×480 at 30 FPS |

The 125 MiB partitions are subdivisions of the shared working/cache budget, not extra memory allocations. The 1 GiB disk ceiling is a storage policy, not a claim that the drive has that much free space.

## Engineering limits that must remain explicit

Windows XP has no generic reliable API to hard-cap an arbitrary process to exactly 50% CPU time and 50% of every GPU's execution capacity. This candidate limits N.U-owned work through cooperative admission, lower process priority, VM instruction limits, RAM budgeting and app-side render limits. These do not reserve or guarantee a hardware percentage against all other processes. A future native adapter may add stronger controls where available.

The Win32 shell uses GDI and does not depend on a system browser, WebView, DirectX, .NET or a JavaScript runtime. XP compatibility is **not yet verified**; toolchain/API-import inspection and real XP testing remain release gates.

## NUVM/1 instruction set

| Opcode | Encoding | Meaning |
|---|---|---|
| 00 | 00 | HALT |
| 01 | 01 reg imm32le | Load immediate |
| 02 | 02 dst src | Move register |
| 03 | 03 dst src | Add |
| 04 | 04 dst src | Subtract |
| 05 | 05 dst src | XOR |
| 06 | 06 reg addr16le | Store low byte to VM memory |
| 07 | 07 reg addr16le | Load byte from VM memory |
| 08 | 08 addr16le | Absolute jump |
| 09 | 09 reg addr16le | Jump if register is zero |

Packages contain interpreted bytecode, not native machine code. Modules cannot call OS APIs or raise the host resource ceiling. Package size, VM memory and instruction count are bounded.

## Package envelope

Fixed 16-byte header:
- bytes 0–3: ASCII NUVM
- byte 4: ABI major (1)
- byte 5: ABI minor (0 for this candidate)
- byte 6: generation (1)
- byte 7: flags (must be 0)
- bytes 8–11: bytecode length, unsigned little-endian
- bytes 12–15: CRC-32 of bytecode, unsigned little-endian
- bytes 16 onward: NUVM/1 bytecode

CRC-32 detects accidental corruption; it is not a publisher signature or security boundary. Signed manifests, SHA-256 hashes, key rotation, permission declarations, dependency resolution, staged activation and rollback are not implemented yet.

## Build and test

Portable core:
```sh
cmake -S native -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

Windows host requires a 32-bit XP-compatible toolchain/SDK, WINVER=0x0501 and _WIN32_WINNT=0x0501. Verify the PE subsystem version and imported APIs before claiming XP compatibility. The automated workflow compiles/tests the portable core on Linux; it does not establish XP compatibility.

## Next increments

1. Package builder and deterministic .nup fixtures.
2. Stable module contract for input, state, render commands and save data.
3. Port the three Generation 1 games separately, preserving wallet/save rules and the locked HUD.
4. Disk-backed bounded FIFO/pattern cache; never load the whole package set into RAM.
5. Platform resource adapters and measured enforcement evidence per OS/GPU.
6. Signed package manifests and transactional install/rollback before third-party distribution.

## Added candidate modules (2026-11-18 follow-up)

- `nu_translator.c/.h`: a Generation-1 neutral instruction-record to NUVM/1 bytecode translator. It validates register and memory operands and fails closed when output capacity is insufficient. This is a small compiler backend, not yet a translator for the three existing browser games or arbitrary historical console binaries.
- `nu_cache.c/.h`: a disk-backed FIFO spool for bounded binary chunks. It writes length + CRC32 + payload records, reads one chunk into a caller-owned buffer, validates integrity, and removes the temporary cache file when the queue drains. Chunk size is capped at 64 KiB; disk limit is supplied by the caller and defaults at integration time to the 1 GiB project policy.
- Tests cover translator output executed by the VM, insufficient output capacity, cache FIFO order, checksum validation path, disk-capacity rejection and deletion when drained.

The cache is a temporary work queue, not a persistent game-save store. The caller must not place user saves or wallet state in it. The queue currently uses standard C file I/O; crash recovery, multi-process locking, secure path creation and platform-specific durable flush semantics remain open work.

## Current implementation boundary after follow-up

- [x] Bounded Gen-1 IR translator backend to NUVM/1.
- [x] Disk-backed FIFO cache primitive with one-chunk-at-a-time reads and drain deletion.
- [ ] Full package manifest parser, dependency resolver and atomic install/rollback.
- [ ] Publisher authentication / digital signatures. CRC32 is corruption detection only.
- [ ] Native ports/adapters for Bubble Hunt, Mana Collector and Chaos Attack.
- [ ] XP toolchain/import-table audit and real Windows XP execution.
- [ ] Per-platform resource telemetry adapters and human QA.

 
## Package builder and cache-to-runtime path (follow-up candidate)

Build the package utility with the normal CMake build. It accepts raw NUVM/1 bytecode (not source code) and writes the deterministic 16-byte NUVM envelope:

```sh
./build/nu_pack game.nubc game.nup
```

The output is **unsigned**. CRC32 detects accidental corruption and does not authenticate a publisher. Do not distribute third-party packages as trusted until a cryptographic signature verifier and managed trust roots are implemented.

The cache API now provides `NU_CacheStageFile` and `NU_CacheLoadAll`: files are staged as CRC-protected chunks of at most 64 KiB on disk, then drained sequentially into one caller-owned module buffer. The package can then be passed to `NU_PackageValidate`. This avoids loading the entire installed library into RAM; only the selected module is assembled for execution. It remains a temporary queue, not persistent save storage. The current implementation is single-process and not crash-recoverable.
