# N.U Native Runtime — Generation 1 foundation

- Date: 2026-11-18
- Status: IMPLEMENTED-CANDIDATE / PORTABLE-CI-PASSED / XP-CROSS-COMPILE-PASSED / XP-EXECUTION-UNVERIFIED / HUMAN-QA-PENDING
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

- Portable C90 build and unit tests: PASSED, 1/1 test, GitHub Actions run [44228203925](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44228203925).
- 32-bit MinGW Win32 host cross-build with WINVER/_WIN32_WINNT 0x0501 and PE subsystem 5.01: PASSED in the same run.
- A second run adds explicit PE subsystem inspection and artifact upload: [44228295525](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44228295525), pending at the time of this record update.
- These checks prove source compilation and target metadata only; they do not prove the executable starts on a real Windows XP installation.

## Recovery and release boundary

All changes are isolated on the candidate branch. The default branch and public Pages deployment were not modified. Do not merge or publish this candidate as a playable launcher until the three game modules, package manager, XP toolchain compatibility, and human QA gates are completed.

## Pull request

Draft PR: [#195 — N.U native runtime Generation 1 foundation](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/195). The PR remains draft because game ports, installer/package manager, cryptographic signing and actual XP execution are not complete.

## Human QA checklist

- [ ] Build on an actual 32-bit Windows XP SP3 environment or a verified XP VM.
- [ ] Confirm application starts, opens/closes package dialog, and exits cleanly.
- [ ] Test valid package, bad CRC, unsupported generation, malformed opcode and instruction exhaustion.
- [ ] Confirm no module can exceed VM memory or instruction limits.
- [ ] Verify real CPU/RAM use with OS tools; do not infer a strict percentage from scheduler counters.
- [ ] Confirm existing Generation 1 browser games and public demo are unchanged.
