# N.U Native Launcher — internal runtime proof-of-concept

This branch replaces the previous “open in system browser” action with an N.U-owned native shell. The window provides internal Home / Library / Modules / Settings navigation and runs a tiny declarative Generation 1 module through the bundled N.U VM.

## Current deliverable
- 32-bit Win32 shell targeting the XP 5.1 subsystem.
- One canonical static background image only; no animated layers, WebGL, Canvas, shader, or browser dependency.
- Native foreground controls and internal `nu://` navigation.
- A bounded declarative module interpreter (`NUVM/1`) for a small Generation 1 instruction set.
- Automatic conservative local capability profile and system diagnostics.
- Ten persisted manual preferences. They cannot raise the automatic safety ceiling.
- Offline per-user NSIS installer with bundled sample module.

## Important limits
- This is a proof-of-concept host and VM, not a general game engine or cross-generation translator.
- Only the sample NUVM/1 display instructions are supported.
- The current process-level VM is instruction-restricted but is not an OS process sandbox.
- Current game HTML/JavaScript modules are not executed by this native host.
- Windows XP SP3 x86 remains unverified until a real XP VM/device install, launch, resize, module-run, close and uninstall test is recorded.
- The artifact is unsigned and intended for controlled testing only.
