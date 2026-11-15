# N.U Four-Section Neutral Backdrop Operation

- Date: 2026-11-15
- Scope: Exchange, Wallet, Player Profile and Store section backgrounds only.
- Governing rule: N.U UI Layer Constitution v1.0 and extension-isolation protocol.
- Implementation branch: `feat/wallet-static-holographic-backdrop`
- Museum baseline: `archive/museum/2026-11-15-four-neutral-sections-v1/`

## Visual contract

Exchange remains the visual reference: a quiet `#071018` dark-navy surface with a restrained top radial gradient. Wallet, Profile and Store retain that base treatment but receive only a very faint, static functional tint: teal for Wallet, cool violet for Profile and muted amber for Store.

For Wallet, Player Profile and Store, the shared `nu-neutral-view-open` body state:
- Hides the world image, sky, horizon, world canvases and dynamic ambient layer.
- Uses only a static CSS background matching the Exchange surface.
- Does not mount a new renderer, canvas, particle system, timer, requestAnimationFrame loop, or parallax effect.
- Uses one finite 900 ms CSS opacity-only entry cue with three gentle light pulses; it ends automatically and does not loop. `prefers-reduced-motion` disables it.
- Leaves foreground content and interactive controls above the background layer.

## Lifecycle and isolation

- Wallet and Profile activate the neutral state through the existing player-view lifecycle.
- Store activates it in `showShop()` and clears it in `closeShop()` and `showHome()`.
- Leaving these views restores the normal world scene.
- Exchange already uses the same static CSS page background; its functional market and asset charts are foreground content, not background effects, and remain intact.

## Explicitly unchanged

Wallet balances and ledger, profile inputs and preview workshop, store inventory and purchase/use handlers, Exchange calculations and chart replay, game runtime, Gateway, player identifiers, save schema, and the classic LV/XP/Mana HUD.

## Museum archive and rollback

The pre-operation versions of `nu-world.css`, `nu-player-ui.js`, `nu-games.js`, `nu-wallet-tabs.test.js`, plus the Exchange CSS and HTML reference files are stored under `archive/museum/2026-11-15-four-neutral-sections-v1/`. The README in that folder records provenance and restore instructions. These snapshots are not imported by runtime.

To roll back, create a dedicated rollback branch and restore only the archived source files to their original paths. Do not restore the archived Exchange reference files unless an Exchange source change is intentionally being reversed.

## Verification

- Automated regression tests cover view lifecycle, section-specific static tints, the finite three-pulse entry cue and reduced-motion fallback, disabled world background layers, and preservation of Exchange chart markup.
- Browser/device visual acceptance remains a separate human check.

## CI result on the current branch head

- Wallet/Profile workflow: 34 passed, 2 failed. The two failures are the pre-existing profile-preview tests for local photo-input matching and eight photo-placement controls; the new four-section neutral-backdrop tests passed.
- Studio export workflow: 152 passed, 2 failed, the same two profile-preview tests.
- Graphics integrity: PASS.
- Generation 1 HUD layout regression: PASS.
- Graphics preview smoke checks: PASS.
- JavaScript syntax checks: PASS.
- No changes were made to `index.html` or `tests/nu-profile-preview.test.js` in this operation.
- Human browser/device visual acceptance is still pending.
