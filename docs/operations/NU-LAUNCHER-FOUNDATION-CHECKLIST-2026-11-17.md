# N.U Launcher foundation — execution checklist

**Date:** 2026-11-17  
**Candidate:** work/nu-launcher-foundation-g1  
**Pull request:** #174 (draft)  
**Base checkpoint:** ebed1065b7154a502a3304a223e8e053305d8cd3  
**Pre-change backup ref:** backup/nu-launcher-pre-foundation-2026-11-17

## Scope actually implemented

- [x] Create isolated candidate branch; do not develop on the public default branch.
- [x] Create a pre-change backup branch pointing to the exact inspected base commit.
- [x] Add portable C99 NUVM/1 interpreter with explicit ABI version.
- [x] Bound instruction count and operand stack; reject malformed/unknown instructions.
- [x] Add minimal ANSI Win32/GDI window host with no browser/WebView dependency.
- [x] Add portable VM regression tests.
- [x] Add architecture and build notes with honest compatibility boundaries.
- [x] Add CI workflow for strict C99 tests and 32-bit Win32 cross-build.
- [x] Open draft PR #174 for isolated review.
- [ ] Machine CI result: pending / not yet observable from the connected GitHub actions interface.
- [ ] Candidate backup branch after passing tests: not created; protocol requires successful machine checks first.
- [ ] Public demo deployment: not applicable to this native executable candidate; no installer exists yet.
- [ ] Windows runtime smoke test: pending.
- [ ] Windows XP SP3 x86 test: pending; no XP compatibility claim.
- [ ] Owner human acceptance: pending.

## Not implemented yet

- [ ] N.U Core lifecycle/session scheduler.
- [ ] Translator API and Generation 1 module contract.
- [ ] Package manifest parser, integrity/signature validation and rollback.
- [ ] Adaptive CPU/RAM/GPU measurement and enforceable host quotas.
- [ ] Graphics, input and audio host services.
- [ ] A real playable Generation 1 module running inside NUVM.
- [ ] Multi-platform native host adapters (Linux/macOS/Android).
- [ ] Installer, uninstaller, portable package and download release.
- [ ] Verified clean-machine and legacy OS compatibility matrix.

## Critical engineering boundaries

The VM instruction budget is not a percentage CPU limiter. RAM quotas and GPU scheduling need independent host enforcement. The current Win32 executable is a native engineering shell and VM smoke test, not a launcher capable of installing or launching games.

The Win32 linker is asked for PE subsystem version 5.01. That is not proof of Windows XP compatibility. XP support requires API/import inspection, compatible runtime dependencies and a manual Windows XP SP3 x86 test.

The public hub repository was used for this isolated candidate. The separately supplied mobinabinshun-beep/Repository archive returned 404 to the connected GitHub integration and could not be inspected or modified. No claim of archive-wide documentation consolidation is made.

## Rollback

The pre-change base is preserved at backup/nu-launcher-pre-foundation-2026-11-17, commit ebed1065b7154a502a3304a223e8e053305d8cd3. Close PR #174 and delete the candidate branch to discard the isolated work; do not move or force-push the public default branch.
