# N.U Platform Independence, Driver Strategy and Launcher Stack

- Document ID: NU-PLATFORM-INDEPENDENCE-DRIVER-LAUNCHER
- Date: 2026-11-20
- Status: **PROPOSED ARCHITECTURE / NOT IMPLEMENTED**
- Applies to: Generation 1 planning and later platform evolution
- Related: [Unified Engineering Specification](./NU-GEN1-UNIFIED-ENGINEERING-SPEC.md), [NUHTL, Rendering and Sound Architecture](./NU-HTL-RENDER-SOUND-ARCHITECTURE.md)

> This document records an architectural direction, not a claim that N.U drivers, a native renderer, a complete launcher, or a standalone operating system have been implemented.

## 1. Product principle

**N.U — A World for Everyone.**

The engineering interpretation is broad access: support a wide range of hardware and operating environments, keep module interfaces stable, minimize mandatory third-party dependencies, preserve offline operation where practical, and provide graceful fallbacks for low-capability devices.

Independence is incremental, measurable and capability-specific. It does not mean that one application can universally replace every operating system, device driver, firmware interface or hardware vendor stack.

## 2. Correct execution hierarchy

The launcher is the user-facing entry point, not a layer that runs directly on a device driver. The intended hierarchy is:

`N.U Launcher → N.U Core / Runtime → N.U services and module ABI → NUHTL / platform adapters → OS services and device drivers → hardware`

- **N.U Launcher:** user interface, module discovery, installation/update requests, settings and session start/exit.
- **N.U Core / Runtime:** lifecycle, module registry, scheduler, package policy, capability services and resource admission.
- **NUVM / translators:** bounded execution and translation of supported neutral module representations.
- **N.U service APIs:** rendering, audio, input, storage and language/capability services.
- **NUHTL:** capability discovery, normalized commands, backend selection, validation, translation, fallback and diagnostics.
- **Platform adapters:** narrow implementations that call an available OS service, standard API or a supported N.U driver.
- **OS and drivers:** device enumeration, privileged operations, interrupts, DMA, memory mapping, power management and hardware-specific execution as applicable.

The launcher must use documented Runtime/Core contracts; it must not bypass the runtime to call device registers or vendor APIs.

## 3. DirectX is optional, not a mandatory foundation

DirectX is one possible Windows graphics/multimedia backend, not a universal prerequisite for N.U.

Generation-1 baseline:
1. Keep the existing minimal Win32 host and GDI-compatible presentation path as the initial fallback.
2. Design NURender around N.U-owned surfaces, pixel formats, sprites, commands and frame lifecycle.
3. Add optional accelerated backends only when their OS/API availability, driver compatibility, build dependencies and real hardware behavior are verified.
4. Do not expose DirectX, GDI, WinMM or vendor API types in the module ABI.
5. Maintain a software fallback for systems without a supported accelerated backend.

GDI is an OS drawing API and does not establish GPU acceleration. DirectX is not a driver replacement; it normally operates through the Windows graphics/driver stack.

## 4. Driver strategy: three support tiers

### Tier 1 — Existing OS/vendor drivers (Generation-1 starting point)

N.U calls documented OS services through its own adapters. The installed OS/vendor driver performs device-specific work. This minimizes development risk and maximizes initial hardware coverage.

### Tier 2 — N.U-owned drivers for selected devices

N.U may develop and maintain drivers for explicitly selected hardware and operating-system versions. Each driver requires:
- exact device IDs/revisions and supported OS/kernel versions;
- documented hardware programming information or a lawful, technically reliable specification;
- a defined kernel/driver model and privileged interface;
- safe initialization, resource ownership, concurrency and device removal behavior;
- interrupt/DMA/MMIO/port-I/O handling only where required and supported by the platform;
- signing, installation, recovery and rollback requirements for the target OS;
- security review, fault containment and real-device QA;
- a user-mode N.U adapter with a narrow, versioned IOCTL or equivalent contract.

A driver must never be treated as a generic plugin or loaded from an untrusted package. Kernel-mode bugs can crash or compromise the entire machine. Driver support is device- and OS-specific; it cannot be promised universally.

### Tier 3 — N.U-controlled boot/runtime environment

A future N.U-controlled OS, hypervisor, or bare-metal environment could own more of the hardware stack. This is a separate, much larger product and research program involving boot, memory management, scheduler, interrupt controllers, bus enumeration, firmware/ACPI, storage, networking, graphics, audio, security and a driver ecosystem. It is not a Generation-1 launcher task.

## 5. Hardware access boundary

Normal user-mode applications generally cannot safely or portably access arbitrary device registers, physical memory, DMA engines or interrupts. Those operations are privileged and mediated by the OS and its driver framework. Direct hardware access is therefore not a universal shortcut around drivers.

NUHTL should own:
- vendor-neutral capability descriptors;
- normalized N.U commands and resource descriptors;
- backend selection and translation policy;
- bounds checking, quotas and diagnostics;
- fallback selection and capability reporting.

Drivers/OS adapters own privileged device interaction and device-specific details. Module code owns neither.

## 6. Launcher and runtime relationship

The launcher is installed/started by the host operating system in the initial product model. It discovers or starts the N.U Runtime, then asks the Runtime to install, activate and launch a module. The Runtime validates package identity, ABI, required capabilities and resource policy before execution.

The launcher is not the kernel, not a device driver and not the hardware abstraction layer. A future bootable N.U environment could change the bootstrap relationship, but that is outside the current implementation baseline.

## 7. Compatibility and fallback policy

- Preserve the current 32-bit Windows XP first-host target as a candidate compatibility target; actual XP execution still requires real-device or verified-VM acceptance.
- Windows 98 compatibility is unproven and must not be advertised as supported without separate engineering and QA.
- Use GDI/CPU-side rendering as the first conservative presentation path.
- Keep DirectX as an optional backend, not a mandatory dependency.
- Add N.U-owned drivers only for a carefully selected device matrix with a clear user benefit.
- Unsupported devices must degrade gracefully or report a structured unsupported capability; never claim hardware acceleration or driver support without evidence.
- Historical devices (e.g. GeForce2/Radeon 7500 class) require dedicated compatibility testing; their presence in a target discussion is not proof of support.

## 8. Security and update boundaries

- N.U user-mode packages and kernel drivers are different trust classes.
- A language pack, translator, protocol pack or ordinary module must never gain kernel privileges.
- Driver installation requires explicit authorization, trusted publisher verification, exact hardware/OS matching and a recoverable installation path.
- Signed packages, digest verification, trust-root management and rollback are prerequisites for automatic update of privileged components.
- No silent driver replacement or unverified online driver download.
- Online discovery may identify candidate updates; installation of a driver must pass a stricter policy gate than ordinary language/content packs.

## 9. Implementation sequence

1. Freeze module-facing service contracts and NUHTL capability model.
2. Keep the current Win32/GDI host as the measured Gen-1 fallback.
3. Implement user-mode adapters and test doubles before privileged drivers.
4. Build NURender and NUSound behind stable N.U APIs.
5. Implement Launcher → Runtime lifecycle and package/capability negotiation.
6. Select one low-risk, well-documented device family only if an N.U driver provides a measurable advantage that OS adapters cannot.
7. Prototype a driver only on a dedicated test machine/VM with recovery access; never make it a prerequisite for baseline launch.
8. Consider a bootable N.U-controlled environment only as a separately approved future program.

## 10. Acceptance evidence and non-claims

Required evidence before claiming support:
- exact hardware identifiers and OS build;
- driver/backend version and installation source;
- build/import/signature audit;
- successful boot, device initialization, normal operation and shutdown;
- stress, malformed-input, resource-exhaustion and recovery tests;
- real hardware performance measurements;
- fallback behavior when the device/driver is absent or fails.

Current status:
- Minimal Win32 host and GDI path: candidate implementation exists.
- NUHTL, NURender and NUSound: proposed architecture; not implemented as complete services.
- DirectX backend: not established as a dependency or completed backend.
- N.U-owned kernel/device drivers: not implemented.
- Launcher-to-native-runtime integration: must be tracked against the current engineering baseline; this document does not claim completion.
- Windows XP real execution and Windows 98 support: not established by this proposal.

## 11. Design invariant

**Modules target N.U contracts, not platform APIs. N.U targets capability portability, not an unsupported promise of universal driver replacement.**

This is the practical route toward “N.U — A World for Everyone”: broad compatibility first, selective N.U-owned drivers where justified, and deeper platform ownership only when separately engineered and validated.
