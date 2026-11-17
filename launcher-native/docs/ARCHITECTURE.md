# N.U Native Architecture — Generation 1

## Stable boundaries

N.U is split into five contracts. The current executable implements only the Host + G1 VM path; the remaining boundaries are specified so future work can replace components without changing game packages.

1. **Host** — Win32 window, input, lifecycle, file selection and diagnostics. No browser runtime.
2. **Package** — immutable package metadata, entry point, generation and protocol declarations.
3. **Runtime** — deterministic, single-threaded instruction scheduler. G1 uses NUVM text bytecode.
4. **Translator** — versioned adapter boundary between a game's source protocol and a runtime generation. G1 sample has no translator yet.
5. **Services** — storage, assets, audio, input mapping and telemetry. Add services through versioned interfaces; never let a module call Win32 directly.

## Dependency direction

Host -> Runtime interfaces <- Translator interfaces. Package metadata describes requirements; it must not execute code. Runtime may call Host services through narrow interfaces. Game modules must not depend on concrete Win32 handles.

## Generation policy

- Generation is a compatibility family, not a marketing label.
- A host must reject unsupported major generations before loading executable content.
- Minor revisions may add optional metadata or opcodes only when capability-negotiated.
- Unknown required capabilities/opcodes fail closed. Unknown optional metadata is ignored.
- A generation must have a conformance suite and golden test packages before being declared stable.
- A future generation ships beside, not instead of, old generations until migration tests pass.

## Current implementation boundary

Implemented: Win32/GDI host, G1 manifest and NUVM instruction loading, sequential interpreter, three drawing opcodes, conservative telemetry and best-effort Job Object memory limit attempt.

Not implemented: dynamic translator loading, DLL/plugin ABI, asset archive, audio, networking, package signature verification, dependency solver, sandbox, rollback, hard CPU/GPU quota, installer or XP runtime certification. Do not infer these from this architecture document.
