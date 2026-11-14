# N.U background asset inventory and demo integration audit
Date: 2026-11-14

## Canonical artwork and public copy

| Role | Repository path | Git blob SHA-1 | Decision |
|---|---|---|---|
| Canonical Material artwork | `mobinabinshun-beep/Repository:Material/Background.svg` | `63dd85a479354406cc5739f4603ccc1d0989e5b0` | Source of truth; preserve unchanged |
| Public runtime artwork | `assets/backgrounds/niroo-universe-background.svg` | `63dd85a479354406cc5739f4603ccc1d0989e5b0` | Active; byte-identical to source |
| Original reference PNG | `assets/Original reference image file for Niroo Universe (N.U).png` | `d73afd484ef8b459c908c1942ee0f47d27f93aa5` | Preserved reference; not loaded by current runtime |
| Candidate preview document | `background-candidates.html` | See Git tree | Reference gallery only; not loaded by demo |

- SVG canvas: 1536 × 1024; approximately 2.7 MB.
- Original PNG: 2,467,298 bytes.
- The SVG embeds the original artwork in a data URI. Do not convert, re-encode, crop, blur, or create redundant public copies.
- The prior `assets/README.md` incorrectly claimed that `assets/nu-celestial-city.png` was missing and required upload. That instruction is superseded: the actual active runtime is the already-present SVG above.

## Runtime and layer inventory

| Path | Role | Current decision |
|---|---|---|
| `index.html` | Public demo entry point | Loads background engine before graphics runtime |
| `nu-background-engine.js` | Image-first background loader | Active; loads same-origin SVG and exposes readiness/status |
| `nu-world.css` | World composition and stacking | Active; final `.sky` rule uses z-index -4, image node uses -3 |
| `nu-graphics-runtime.js` | Startup and mode/freeze coordination | Active; stops procedural dynamic layers and disables pixel renderer |
| `nu-dynamic-layers.js` | Legacy atmospheric compositor | Retained for rollback/reference; runtime calls stop; CSS also hides its canvas |
| `nu-pixel-world.js` | Legacy procedural world renderer | Archived at `archive/visual-layers/nu-pixel-world.js`; not loaded by `index.html` |
| `archive/visual-layers/nu-dynamic-layers.js` | Archived legacy compositor source | Preserved |
| `archive/visual-layers/nu-pixel-world.js` | Archived legacy pixel renderer source | Preserved |

The visible first-visit field guide is foreground UI, not a background renderer. Close it for visual acceptance. Do not remove navigation, game HUD, or onboarding UI as part of a background-only change.

## Why a successful file copy is not visual acceptance

The SVG is already public and the active engine requests its local path. A successful Git blob check proves the asset is present, not that the browser paints it. Browser acceptance must separately confirm:
1. `window.NUBackgroundEngine.getStatus().loaded === true`
2. The `nu:background-ready` event fires (or `nu:background-missing` is captured on failure)
3. The background image is visible after closing the first-visit guide
4. No canvas, overlay, stacking context, or stale cache hides the artwork
5. Desktop and mobile layouts both show the intended composition

## Pixel-faithful review framing (human approval pending)

- Review framing uses `object-fit: contain`; no source corners are cropped.
- The artwork is centered over the neutral scene background. With differing screen/image aspect ratios, letterboxing is intentional: filling every screen pixel and showing every source pixel simultaneously is geometrically impossible without distortion or cropping.
- Camera exploration is opt-in through `NUBackgroundEngine.setCamera(x, y, zoom)`. Zoom is bounded from 1× to 3×, and pan is constrained to the zoomed viewport so the camera does not reveal empty margins.
- Default zoom is 1×, so the complete original image is visible for first-pass review. No blur, color filter, gradient vignette, or extra dark overlay is applied to the artwork.
- The canonical SVG and embedded PNG bytes remain unchanged. This is a framing/camera presentation change, not a repaint or pixel edit.

## Only approved test candidate

**Candidate A — canonical SVG image-first scene**
- Asset: `assets/backgrounds/niroo-universe-background.svg`
- Engine: `nu-background-engine.js`
- Entry point: `index.html`
- Status: full-frame review candidate; waiting for human visual approval; not approved for permanent engine lock.

Do not promote or lock the graphics core until human visual testing is recorded and explicitly approved.

## CI/CD gates

1. Compare the public SVG Git blob SHA against the canonical Material source.
2. Verify the entry page loads the background engine and the engine requests the local public SVG.
3. Verify the CSS stacking contract keeps `.sky` behind the image.
4. Verify legacy procedural layers remain stopped/disabled and archived.
5. Run JavaScript syntax checks and `node --test tests/nu-background-engine.test.js`.
6. Run the graphics integrity and preview smoke workflows.
7. Perform human visual checks on the deployed Pages demo at desktop and mobile sizes before engine lock.

## Change scope

This audit reconciles the contradictory PNG/SVG documentation. It does not alter the canonical artwork, create a redundant binary copy, remove archived sources, merge a pull request, or lock the graphics core. Human browser acceptance remains a separate required gate.
