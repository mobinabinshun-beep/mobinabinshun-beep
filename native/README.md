# N.U Native Runtime — Generation 1 foundation

**Status:** CANDIDATE / NOT A RELEASE / HUMAN QA PENDING  
**Target:** small-footprint Windows host; Windows XP is the compatibility floor to validate.  
**Core language:** portable C90. Win32 host uses legacy Win32 APIs.

## Implemented in this candidate

- Platform-neutral resource budget model.
- Deterministic cooperative scheduler: one N.U work slot per two slots.
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
| Disk package/cache ceiling | 1 GiB |
| Short-term disk cache | 125 MiB |
| Repeated-pattern cache | 125 MiB |
| CPU | One N.U cooperative slot per two scheduler slots; process priority below normal |
| Graphics | App-side ceiling 640×480 at 30 FPS; no GPU stress benchmark |

The two 125 MiB cache partitions are disk-cache targets, not RAM preallocations. The 1 GiB disk ceiling is a policy, not a claim that the drive has that much free space.

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
