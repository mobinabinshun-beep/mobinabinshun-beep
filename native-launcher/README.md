# N.U Native Launcher — Generation 1
- Version: 0.1.0-foundation
- Status: CI-built Win32 foundation; real-device QA pending

This directory is the executable-source home for the native N.U launcher. It is separate from the existing browser demo and does not replace or modify the Generation 1 game runtime.

Canonical architecture, checklist and engineering review are maintained in the private archive:
- https://github.com/mobinabinshun-beep/Repository/blob/main/Launcher/NU-LAUNCHER-UNIFIED-ARCHITECTURE-fa.md
- https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-17/NU-LAUNCHER-EXECUTION-CHECKLIST-fa.md
- https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-17/NU-LAUNCHER-ENGINEERING-REVIEW-fa.md

## Source
- src/nu_core.h and src/nu_core.c: portable C89-compatible core, calibration policy and serialized task scheduler.
- src/win32_host.c: native Win32 shell, no WebView or browser dependency.
- tests/core_smoke.c: portable core smoke test.
- NU-NATIVE-GEN1-MANIFEST.json: build and compatibility metadata.

## Build
CI cross-compiles a 32-bit Win32 GUI executable with PE subsystem 5.01. This is an XP-oriented target, not proof of execution on Windows XP SP3. Real XP x86 and newer Windows tests remain mandatory.

Local portable core test:
```sh
cc -std=c89 -pedantic -Wall -Wextra -I src tests/core_smoke.c src/nu_core.c -o nu-core-smoke
./nu-core-smoke
```

## Honest limits
No game package is connected yet. The Enter button reports the absence of an installed signed game package. No arbitrary native module loading, package installation, installer, CPU hard cap or GPU hard cap is implemented. RAM budget policy is defined but a full allocation-enforcing Resource Manager is still pending.
