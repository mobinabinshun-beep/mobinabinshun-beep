# N.U background asset inventory and demo integration audit
Date: 2026-11-14

## Canonical artwork

- Source repository: `mobinabinshun-beep/Repository`
- Source path: `Material/Background.svg`
- Source Git blob SHA-1: `63dd85a479354406cc5739f4603ccc1d0989e5b0`
- Artwork canvas: 1536 × 1024
- Public runtime copy: `mobinabinshun-beep/mobinabinshun-beep/assets/backgrounds/niroo-universe-background.svg`
- The public runtime file has the same Git blob SHA-1 as the source, so it is byte-identical. Do not duplicate or re-encode the 2.7 MB SVG.

## Other discovered background-related files

| Path | Role | Runtime decision |
|---|---|---|
| `background-candidates.html` | 2.79 MB candidate/preview document in the public repository | Discovery/reference only; not loaded by the demo |
| `nu-background-engine.js` | Image-first loader for the canonical SVG | Active; uses the public local path |
| `nu-world.css` | World composition and stacking | Active; sky gradient is placed behind the image |
| `nu-graphics-runtime.js` | Graphics startup and mode/freeze coordination | Active; disables procedural overlays |
| `nu-pixel-world.js` | Legacy procedural world renderer | Archived at `archive/visual-layers/nu-pixel-world.js` |
| `nu-dynamic-layers.js` | Legacy atmospheric compositor | Archived at `archive/visual-layers/nu-dynamic-layers.js`; runtime copy is stopped |
| `Material/Background.svg` | Canonical source asset in private material repository | Preserve as source of truth |

## Why the demo could appear to omit the background

The canonical asset was already copied correctly. The runtime is wired in `index.html`, and the engine requests the local asset rather than a private-repository URL. The important rendering contract is the stacking order: the background image is at z-index -3 and the decorative `.sky` must remain behind it at z-index -4. The engine also emits `nu:background-ready` or `nu:background-missing`; use those events and `NUBackgroundEngine.getStatus()` to distinguish a failed fetch from a visual stacking problem.

The first-visit guide is a full-screen translucent overlay. It is foreground UI, not part of the background engine. For visual acceptance, close the guide and inspect the home screen and a game screen at desktop and mobile sizes.

## Testable candidate

**Candidate A — canonical SVG image-first scene** is the only approved test candidate at this stage:
- Asset: `assets/backgrounds/niroo-universe-background.svg`
- Engine: `nu-background-engine.js`
- Entry point: `index.html`
- Status: ready for public-demo visual acceptance; not yet approved for permanent engine lock.

The candidate gallery is not selected as an alternate runtime background because its intended final composition has not been independently approved. Keep the artwork unchanged until the demo review is complete.

## CI/CD acceptance gates

1. Verify the public SVG Git blob hash against the canonical source.
2. Verify the demo loads `nu-background-engine.js` and the engine uses the local SVG path.
3. Verify CSS stacking places the sky behind the image.
4. Verify legacy procedural layers remain disabled and their source copies remain archived.
5. Run the JavaScript syntax checks and `node --test tests/nu-background-engine.test.js`.
6. Perform a human visual check in the public Pages demo at desktop and mobile widths before locking the graphics core.

## Scope of this change

This audit does not delete source files, alter the canonical artwork, merge a pull request, or lock the graphics core. The public copy already matches the private source exactly. The change adds regression checks and removes a stale CI warning that referred to an unrelated legacy PNG filename.


## Full-frame visual review candidate

- Initial rendering uses `object-fit: contain` so the entire 1536 × 1024 source artwork remains visible without cropping or stretching.
- Neutral side/top margins may appear when the viewport aspect ratio differs from the artwork; this is necessary to preserve the complete image.
- Camera zoom is bounded to 1×–3× and pan is clamped to the fitted artwork bounds.
- The SVG source remains byte-identical; this candidate is for visual review only and is not a permanent locked core layer.
- Human visual approval is required before any final pixel-lock/core integration.
