# Build status

- Modern Win32 smoke build: GitHub Actions workflow added; result pending until the workflow executes.
- Windows XP SP3 x86 build: requires Visual Studio 2010 / Windows SDK 7.1 x86 toolchain and remains unverified.
- Runtime QA: pending.
- Installer: not yet produced.

The Windows 2022 CI executable is a modern-toolchain smoke artifact. It must not be represented as a Windows XP-compatible binary. The XP build script is separate and must be run with the legacy toolchain.
