# Contributing to N.U Native Launcher

- Keep the host free of browser dependencies.
- Preserve the XP-era Win32 API baseline unless a newer capability is explicitly optional.
- Do not claim XP compatibility from a modern CI build; require an XP SP3 x86 VM/device test.
- Keep untrusted package execution inside the allow-listed VM. Never add LoadLibrary or native package execution as a shortcut.
- Update specifications, fixtures and tests together when changing a contract.
- Avoid unbounded loops and allocations in the interpreter.
- Resource limits are best-effort/cooperative until independently measured and enforced by the OS.
- Run `python -m unittest discover -s tests -v` before submitting.
