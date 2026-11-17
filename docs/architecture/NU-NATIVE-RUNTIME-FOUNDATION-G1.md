# N.U native runtime foundation — Generation 1

**Date:** 2026-11-17  
**Status:** candidate architecture; owner acceptance pending  
**Scope:** isolated native runtime foundation; existing browser demo is unchanged.

## Decision

N.U will not embed or depend on a general-purpose browser. A platform host creates the application window and exposes a narrow host-services ABI. N.U Core owns package lifecycle, sessions, scheduling and VM lifecycle. N.U Translator converts a versioned Generation 1 module contract into validated NUVM bytecode. NUVM executes that bytecode under deterministic instruction and memory limits. Platform hosts do not define game semantics.

## Layer boundaries

1. **Native platform host:** window, input, filesystem, clock, audio/video presentation and OS integration. It must not define game/module rules.
2. **N.U Core:** lifecycle, module registry, session state, dependency graph, scheduling and policy.
3. **N.U Translator:** validates a generation contract and emits NUVM/1 bytecode. Arbitrary native code is not accepted.
4. **NUVM/1:** portable deterministic instruction semantics, explicit ABI, bounded stack and instruction budget.
5. **N.U Adaptive Engine:** samples host capabilities and selects budgets. Enforcement belongs to each host adapter; browser hints are not hardware guarantees.
6. **N.U Package Manager:** manifest parsing, hashes/signatures, dependency resolution, staging, atomic activation and rollback.

## Generation 1 VM scope

The first VM supports a small stack machine: 32-bit integer constants, addition, subtraction, multiplication, division, duplicate, drop and halt. This proves a versioned interpreter and bounded execution boundary; it does not yet execute existing console binaries or full games.

## CPU-first scheduling rule

Module work is queued and processed in deterministic order by one scheduler. Modules declare required capabilities and resource estimates. Unknown or unvalidated instructions fail closed and are removed from the current session. Repeated validated operations may reuse cached translation artifacts only when translator version, module hash, ABI and target profile match.

## Resource policy correction

A 50% ceiling is a product policy target, not something a VM can guarantee by itself. CPU instruction budgets, memory quotas and GPU frame budgets are different controls. The native host must enforce each through platform facilities and report unavailable controls. Calibration selects a stable operating budget below the configured ceiling; it must not stress-test the machine or claim an exact hardware percentage from browser hints.

## XP and legacy support

The Win32 shell uses ANSI APIs and a basic GDI window. The build requests PE subsystem version 5.01. This is a compatibility intention only. Actual Windows XP support requires a verified XP-compatible compiler/runtime, API/import audit, and manual tests on XP SP3 x86. Do not publish an XP installer or compatibility badge before those gates pass.

## Acceptance criteria

- Portable C99 VM compiles with strict warnings.
- Tests cover valid execution, malformed opcodes, truncated instructions, stack under/overflow, divide-by-zero and budget exhaustion.
- Win32 host compiles as a 32-bit GUI executable without browser/WebView libraries.
- Existing public demo and protected LV/XP/Mana HUD remain untouched.
- No claim of a finished installer, full game execution, GPU rendering, adaptive hardware cap or verified XP compatibility.
