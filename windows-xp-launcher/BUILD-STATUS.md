# Build status — 2026-11-15

**Source bootstrap only. No downloadable executable or installer has been produced.** The repository connector does not provide an XP-targeting Visual C++ 2010 build machine or Inno Setup compiler, so a binary must not be labelled built or tested.

The native shell is isolated under `windows-xp-launcher/`. It does not edit frozen `nu-engine.js`, the locked classic LV/XP/Mana HUD, game rules, saves, wallet, or browser game entry points.

Release gate: compile x86 with an XP-compatible toolchain, produce the Inno Setup package, verify PE subsystem/dependencies, and run the OS test matrix in README. Only then publish a downloadable release.