# N.U Windows Launcher — 0.1 candidate

This is the first native Windows delivery candidate, not a claim of universal Windows compatibility.

## What it does

- 32-bit Win32 desktop shell; built with a statically linked MinGW toolchain.
- Targets the Windows XP-era Win32 API surface (subsystem 5.1); Windows XP execution still requires a real XP/SP3 test.
- Reads physical RAM and logical processor count using Windows APIs, selects a conservative level, and passes that ceiling to the browser demo as `nuNativeLevel`.
- Uses one still background image only. It deliberately does not start the browser scene compositor, parallax, particle or ambient background layers inside the native shell.
- Opens the existing public N.U browser demo in the user's default browser. The game remains a browser application.

## Important compatibility boundary

The native launcher and the web demo have different compatibility requirements. A Windows XP computer can potentially run this small launcher while its default browser cannot negotiate modern HTTPS or execute the current web application's JavaScript/CSS. The launcher will show a browser-required warning in that case. This candidate does not bundle an obsolete Chromium/IE runtime and does not claim the N.U game itself is XP-compatible.

The browser graphics engine combines this native ceiling with its own browser capability checks. It never raises the ceiling above the value supplied by the native launcher.

## Build

GitHub Actions builds the 32-bit executable, extracts the embedded PNG from the repository's canonical background SVG into a single BMP, packages it with NSIS, and uploads a short-lived CI artifact. No private archive files are copied.

## Install and test

1. Download `N.U-Launcher-Setup-0.1.exe` from the successful GitHub Actions run artifact.
2. Install and launch it.
3. Verify the detected Windows family, RAM/CPU hints and selected level.
4. Click **OPEN N.U**. It opens the hosted demo in the default browser.
5. Report the exact Windows edition/service pack, browser and error text if the website does not open.

## Not yet done

- No code-signing certificate or signed installer.
- No XP physical/VM acceptance test has been performed by this commit.
- No offline browser runtime, self-updater, package manager, or automatic graphics driver installation.
- Hardware detection is a conservative ceiling heuristic, not a full CPU/GPU benchmark.
