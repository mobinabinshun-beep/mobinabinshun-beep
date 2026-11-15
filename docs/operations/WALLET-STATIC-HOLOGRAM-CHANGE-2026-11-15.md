# Wallet static holographic backdrop change

- Date: 2026-11-15
- Repository: mobinabinshun-beep/mobinabinshun-beep
- Base branch: Official-public-information-and-discovery-hub-for-N.U-(Niroo-Universe),-its-publishing-network,-projects,-publications-and-related-creative-works
- Base commit: c72d6705faf037bf21a0a570fa9a5f0c5c09565c
- Working branch: feat/wallet-static-holographic-backdrop
- Request: disable the expensive world/background rendering while the Wallet view is active; retain a blank, fixed, low-cost futuristic holographic light behind the wallet content; isolate the change from every other view and subsystem.
- Acceptance criteria:
  1. The canonical world image, sky and world-effects renderers are not displayed while Wallet is active.
  2. The Wallet panel itself has no opaque glass/background image, backdrop blur, animated background, canvas, particles or continuously updated effect.
  3. A single static CSS radial-gradient glow remains behind the wallet foreground. It is pointer-transparent and cannot cover or alter controls.
  4. Opening another view or closing Wallet restores the normal world background.
  5. Wallet balances, ledger, save schema, Player ID, navigation routes, game logic, Gateway and protected LV/XP/Mana HUD remain unchanged.
- Museum baseline: `archive/museum/2026-11-15-wallet-backdrop-v1/`
  - `nu-world.css___.museum` (original stylesheet)
  - `nu-player-ui.js___.museum` (original wallet view lifecycle)
  - `tests__nu-wallet-tabs.test.js___.museum` (original focused regression tests)
- Museum artifact status: immutable pre-change source snapshots; not imported by runtime. Restore by copying the archived file content back to its original path on a dedicated rollback branch.
- Planned implementation files: `nu-world.css`, `nu-player-ui.js`, `tests/nu-wallet-tabs.test.js`.
- Verification: GitHub Actions wallet regression workflow on the pull request; browser/device visual acceptance remains pending.
- Release boundary: draft PR only; no merge or production promotion performed.
