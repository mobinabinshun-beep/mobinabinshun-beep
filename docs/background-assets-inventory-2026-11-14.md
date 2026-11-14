# N.U background asset inventory and demo integration audit
Date: 2026-11-14

## Canonical artwork

- Source repository: `mobinabinshun-beep/Repository` (private)
- Source path: `Material/Background.svg`
- Source Git blob SHA-1: `63dd85a479354406cc5739f4603ccc1d0989e5b0`
- Artwork canvas: 1536 × 1024
- Public runtime copy: `mobinabinshun-beep/mobinabinshun-beep/assets/backgrounds/niroo-universe-background.svg`
- Public asset URL: https://mobinabinshun-beep.github.io/mobinabinshun-beep/assets/backgrounds/niroo-universe-background.svg
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
| `Material/Background.svg` | Canonical source asset in the private material repository | Preserve as source of truth |

## Why the demo could appear to omit the background

Two separate defects have been identified in the history:

1. The first image-first integration used a private archive URL, which a public browser could not fetch. The runtime was changed to use the same-origin public asset path above. This is why copying an asset only into a private repository never made it available to the public demo.
2. A later public-demo test found that `.world { opacity: 0 }` was never released because no loaded script added `calibrated`. The current `nu-background-engine.js` adds `calibrated` during mount, revealing the scene. A regression assertion now checks this visibility gate.

The rendering contract is: the background image is at z-index -3 and the decorative `.sky` is behind it at z-index -4. The engine emits `nu:background-ready` or `nu:background-missing`; inspect these events and `NUBackgroundEngine.getStatus()` to distinguish a failed fetch from a visual stacking issue.

The first-visit guide is a full-screen translucent foreground overlay, not a background layer. Close it before visual acceptance.

## Testable candidate

**Candidate A — canonical SVG image-first scene** is the only approved test candidate at this stage:

- Asset: `assets/backgrounds/niroo-universe-background.svg`
- Engine: `nu-background-engine.js`
- Entry point: `index.html`
- Public test URL: https://mobinabinshun-beep.github.io/mobinabinshun-beep/
- Status: ready for public-demo visual acceptance; not approved for permanent engine lock.

The candidate gallery is not selected as an alternate runtime background because its intended final composition has not been independently approved. Keep the artwork unchanged until demo review is complete.

## CI/CD acceptance gates

1. Verify the public SVG Git blob hash against the canonical source.
2. Verify the demo loads `nu-background-engine.js` and the engine uses the local public asset path.
3. Verify CSS stacking places the sky behind the image.
4. Verify legacy procedural layers remain disabled and their source copies remain archived.
5. Run JavaScript syntax checks and `node --test tests/nu-background-engine.test.js`.
6. Perform a human visual check in the public Pages demo at desktop and mobile widths before locking the graphics core.

The workflow definition includes the background-engine regression test and asset-integrity checks. A successful workflow run must be recorded separately; the currently inspected commit did not expose a completed status/check result in the connected GitHub status response.

## Follow-up audit — 2026-11-14

- Backup ref: `backup/pre-background-demo-audit-2026-11-14`, created from inspected public default-branch HEAD `1cd05c8262f592f2849fed2e618e6320e486dc5f`.
- Candidate ref: `test/background-demo-candidate-a-2026-11-14`.
- The public asset path and engine path are already wired in the default branch; no second copy was created.
- The visibility-gate fix is present in the public source. This follow-up is documentation-only and does not alter runtime, artwork, game rules, wallet/save data, or protected adaptive runtime.
- CI workflow configuration is present; no passing run is claimed from this audit.
- Remaining acceptance: open the public demo, close the first-visit guide, verify the image on home and game views at desktop/mobile widths, and inspect `NUBackgroundEngine.getStatus()` if it is absent.
- Permanent graphics-core lock remains deferred until human visual acceptance.

## Scope

This audit preserves source history, does not delete original files, does not alter canonical artwork, and does not lock the graphics core. The public copy already matches the private source exactly.
