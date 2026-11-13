# N.U Hex Gateway — implementation & QA record (2026-11-13)

## Change control
- Work branch: `feat/gen1-hex-gateway-navigation-2026-11-13`
- Preservation branch: `preservation/pre-hex-gateway-2026-11-13`
- Baseline commit preserved before edits: `1443ef2c581201a083558612a046924da18994c8`
- Public default branch and deployed Pages site were not modified.
- `nu-engine.js`, `nu-games.js`, `nu-wallet.js`, game rules, save schema and economy were not edited.

## Files added/changed
- Added `nu-hex-gateway.css`: fixed responsive hexagonal trigger, orbiting transparent options, ice-glass scrim, reduced-motion handling.
- Added `nu-hex-gateway.js`: independent event controller, 10px outside boundary, pause/resume bridge through existing pause control, hover dwell, two-step click/touch confirmation, keyboard Escape/Enter support.
- Updated `index.html`, `launcher.html` and `pixel-art-studio.html`: mount the same persistent N.U hex control in every current internal page; cross-page routes can reopen Store, Wallet and Profile from the main index.
- Added `tests/nu-hex-gateway.test.js`: static contract tests for mounting, destinations, interactions, pause/freeze integration and module isolation.
- Updated `.github/workflows/graphics-preview-check.yml`: syntax and regression checks for the feature branch.

## Interaction contract
- Fixed position near upper-right; trigger grows 20% while active.
- Seven options: Back/Home, Game Library, Store, Wallet, Player Profile, Launcher Settings, Creative Studio.
- Options emerge on a radial arc and remain visually borderless/transparent.
- Opening the gateway pauses an active round and overlays a low-contrast blurred ice-glass layer.
- Mouse hover selects and activates after a short dwell; pointer exit cancels pending activation.
- Click/touch uses first activation to illuminate/select and a second activation to confirm; Enter confirms a selected option.
- Escape, scrim click, or pointer movement beyond the 10px tolerance closes the gateway.
- Navigation from gameplay first returns to the home view before opening other views, so wallet/profile back navigation does not restore a running game.

## QA status
- Static source contract tests added.
- GitHub Actions workflow configured to run `node --check` and `node --test tests/nu-hex-gateway.test.js`.
- A separate existing Studio regression workflow completed successfully on the feature branch; it does not validate browser-level gateway behavior.
- The first graphics workflow invocation failed before job creation because the workflow edit contained literal newline escape sequences. The workflow text was corrected in a subsequent commit; a fresh run/PR check is still required.
- No real-browser, physical-touch, reduced-motion, or cross-device human QA has been completed in this change.
- Do not merge or describe this as production-validated until the fresh CI run and human QA pass.

## Human QA checklist
- [ ] Desktop mouse: open on hover, radial layout stays within reach, hover action works, leaving the expanded bounds closes.
- [ ] Mouse click: first click highlights, second click confirms; clicking once does not navigate.
- [ ] Keyboard: trigger opens; Tab reaches every destination; Enter confirms; Escape closes.
- [ ] Touch: first tap opens; first destination tap highlights; second tap confirms; tap on scrim closes.
- [ ] Active game pauses while gateway is open and resumes only when dismissed without navigation.
- [ ] Every destination exits gameplay; wallet/profile back returns to home, not a stale active game.
- [ ] Mobile portrait/landscape and safe-area placement; no clipping or overlap with HP/HUD controls.
- [ ] Reduced-motion mode removes pulse/transition animation.
- [ ] Existing game inputs, save state, economy, engine calibration and Studio remain unchanged.

## Current state
Candidate implementation is committed only to the feature branch. The preservation branch points to the exact pre-change baseline. The feature has not been merged or deployed.
