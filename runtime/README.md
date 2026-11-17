# N.U native runtime foundation — Generation 1

**Status: engineering prototype; not a distributable launcher yet.**

## Included in this candidate

- Host-neutral C99 bytecode interpreter (NUVM/1).
- Versioned ABI marker, bounded instruction budget and bounded operand stack.
- Deterministic integer operations with explicit error results.
- ANSI Win32/GDI window host with no browser, WebView, Electron or .NET dependency.
- Portable C test program covering success and malformed/over-budget programs.

The Windows host opens a desktop window and executes a bytecode smoke program. It explicitly reports that game packages and translators are not yet connected.

## Execution model

package -> generation translator -> validated NUVM bytecode -> bounded NUVM interpreter -> host services

The host owns window creation, input, filesystem and presentation. The VM owns instruction semantics. Translators are separately versioned and must not emit arbitrary native code into the VM.

Generation 1 is a small integer VM. It is not a CPU emulator, GPU driver, shader compiler, or binary translator for arbitrary legacy console ROMs.

## Resource policy

The VM enforces a deterministic instruction-count budget and stack ceiling. It does **not** yet enforce a measured 50% CPU/RAM/GPU cap. OS scheduling, memory accounting and GPU isolation differ by platform; a truthful cap needs per-host telemetry and OS controls. Never claim an instruction budget is a hardware percentage.

## Build and test

Portable VM tests:

    cc -std=c99 -Wall -Wextra -Werror -pedantic runtime/nu-core/nuvm.c runtime/tests/nuvm_test.c -o nuvm-test
    ./nuvm-test

Win32 host (32-bit MinGW-w64):

    i686-w64-mingw32-gcc -std=c99 -Os -Wall -Wextra -Werror -Wl,--subsystem,windows:5.01 -static-libgcc runtime/nu-core/nuvm.c runtime/win32/nu_launcher_win32.c -o NULauncher-G1.exe -lgdi32 -luser32

The PE subsystem version is requested as Windows XP (5.01), but this does not prove XP compatibility. A real XP SP3 x86 test and toolchain/API dependency audit are mandatory before any XP support claim or installer release.

## Next gates

1. Package format plus hash/signature verification.
2. Translator interface and Generation 1 contract.
3. Native host file/module lifecycle and safe package installation.
4. Adaptive telemetry and per-host resource enforcement.
5. Graphics/input/audio APIs and one real playable module.
6. Windows installer, rollback/uninstall and clean-machine testing.
7. XP and other legacy OS acceptance on real target VMs/devices.
