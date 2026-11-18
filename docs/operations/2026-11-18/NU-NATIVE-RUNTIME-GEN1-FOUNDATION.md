# N.U Native Runtime — Generation 1 foundation

- Date: 2026-11-18
- Status: IMPLEMENTED-CANDIDATE / AUTOMATED-QA-PENDING / XP-VERIFICATION-PENDING / HUMAN-QA-PENDING
- Branch: feat/nu-native-runtime-gen1-foundation
- Scope: isolated native runtime foundation; no existing game, HUD, adaptive baseline or public demo changed.

## Owner request operationalized

Start a browser-independent, modular N.U execution substrate, prioritize low-capability hardware, preserve Generation 1 as the active line, and formalize the shared 250 MiB / 1 GiB disk / alternating CPU-GPU profile.

## Existing constraints inspected

- AGENTS.md: candidate branch required; do not touch locked classic LV/XP/Mana HUD; preserve newer Gateway/controller contract.
- ENGINE-LOCK.md: nu-engine.js is a frozen baseline; no edits made.
- NU-LAUNCHER-ARCHITECTURE.md and NU-LAUNCHER-MANIFEST.json: existing browser preview is not a native installer or enforceable resource controller.
- Existing Generation 1 games remain browser modules; no game logic was rewritten in this candidate.

## Implemented

- native/nu_runtime.h and native/nu_runtime.c: portable C90 resource policy, scheduler admission, CRC32 package validation and NUVM/1 interpreter.
- native/win32_host.c: minimal native Win32 GUI host, legacy API surface, package-open dialog, below-normal process priority.
- native/tests/test_runtime.c: deterministic unit tests.
- native/CMakeLists.txt and .github/workflows/nu-native-runtime.yml: portable build/test path.
- native/README.md: architecture, binary format, resource model and limitations.

## Initial profile

- Shared working/RAM ceiling: min(50% physical RAM, 50% currently available RAM, 250 MiB).
- Shared cache: split evenly between short-term and repeated-pattern cache; 125 MiB each at the full 250 MiB profile.
- Disk package/cache ceiling: 1 GiB.
- CPU work admission: one N.U cooperative slot per two scheduler slots.
- GPU work admission: alternating N.U render admission; app-side renderer ceiling 640×480 / 30 FPS.
- The scheduler is cooperative and does not claim a kernel-enforced 50% CPU/GPU quota.

## NUVM/1 package contract

16-byte header: magic NUVM, ABI major/minor, generation, flags, little-endian payload length, CRC32; followed by bounded bytecode. ABI major 1, Generation 1, flags zero. Bytecode executes only in the interpreter, with 8 registers, 4 KiB VM memory and instruction budget. CRC32 is corruption detection, not cryptographic authentication.

## Explicitly not implemented

- Playable NUVM ports of Bubble Hunt, Mana Collector and Chaos Attack.
- Native XP binary build and actual Windows XP execution test.
- Disk-backed FIFO/pattern cache I/O and atomic package installation.
- Publisher signatures, SHA-256 trust chain, dependency resolver, permissions and rollback.
- Real GPU telemetry or OS-level hard quotas.
- Production installer, code signing and release artifacts.

## Automated validation

PENDING. The GitHub Actions workflow is configured to build the portable core in strict C90 mode and run the unit tests. Record the exact run and result here after CI completes. A successful Linux core test is not evidence of Windows XP compatibility.

## Recovery and release boundary

All changes are isolated on the candidate branch. The default branch and public Pages deployment were not modified. Do not merge or publish this candidate as a playable launcher until the three game modules, package manager, XP toolchain compatibility, and human QA gates are completed.

## Human QA checklist

- [ ] Build on an actual 32-bit Windows XP SP3 environment or a verified XP VM.
- [ ] Confirm application starts, opens/closes package dialog, and exits cleanly.
- [ ] Test valid package, bad CRC, unsupported generation, malformed opcode and instruction exhaustion.
- [ ] Confirm no module can exceed VM memory or instruction limits.
- [ ] Verify real CPU/RAM use with OS tools; do not infer a strict percentage from scheduler counters.
- [ ] Confirm existing Generation 1 browser games and public demo are unchanged.
