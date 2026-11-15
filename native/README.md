# N.U XP-first native launcher — first build candidate

This is the first native x86 shell candidate, not a certified XP release.

## Build contents
- Win32 x86 launcher executable.
- One canonical background image extracted from the existing SVG's embedded PNG.
- No dynamic layers, Canvas, WebGL, shaders, animation, or modern embedded browser.
- Automatic conservative local profile based on CPU count and physical/available RAM.
- Offline installer and uninstaller, installed per-user.
- "Open N.U Web Demo" opens the public project page in the user's default browser.

## Important compatibility boundary
The native shell is compiled for the Windows XP 5.1 subsystem and uses Win32 APIs intended for XP. However, the output is not certified until it has been installed and run on a real Windows XP SP3 x86 test machine. The browser-based game itself is a separate compatibility problem: opening the web demo does not guarantee that an XP-era browser can run the current JavaScript game.

## Reproducible build
The GitHub Actions workflow `.github/workflows/xp-launcher-build.yml` builds the x86 executable and NSIS installer, then uploads the setup executable and SHA-256 manifest as an Actions artifact. The artifact is a test candidate, not a signed production release.
