# N.U background asset inventory and static-image decision
Date: 2026-11-15

## Canonical artwork

- Source repository: `mobinabinshun-beep/Repository`
- Source path: `Material/Background.svg`
- Source Git blob SHA-1: `63dd85a479354406cc5739f4603ccc1d0989e5b0`
- Artwork canvas: 1536 × 1024
- Public runtime copy: `assets/backgrounds/niroo-universe-background.svg`
- The public runtime file is byte-identical to the canonical source. Do not duplicate, crop, blur, recolour, or re-encode it.

## Active runtime decision — single image only

| Path | Role | Runtime decision |
|---|---|---|
| `nu-background-engine.js` | Loads the canonical SVG | Active; one static image only |
| `assets/backgrounds/niroo-universe-background.svg` | Canonical public runtime artwork | Active; `object-fit: contain` |
| `nu-graphics-runtime.js` | Coordinates startup and game resource profile | Active; does not start decorative renderers |
| `nu-world.css` | Foreground and background layout | Active; hides every decorative world layer |
| `nu-dynamic-layers.js` | Historical atmospheric compositor | Not loaded; preserved in `archive/visual-layers/` |
| `nu-pixel-world.js` | Historical procedural world renderer | Not loaded; preserved in `archive/visual-layers/` |
| `Material/Background.svg` | Canonical source asset in private material repository | Preserve as source of truth |

The static-image candidate uses one image, no animation, no Canvas compositor, no parallax, no particles, no glow, no blur, no shaders and no procedural fallback. If the image fails to load, the launcher retains a neutral solid fallback rather than starting a different visual engine.

## Source wiring

- `index.html` loads `nu-background-engine.js`.
- `index.html` does not load `nu-dynamic-layers.js` or `nu-pixel-world.js`.
- `nu-background-engine.js` references `./assets/backgrounds/niroo-universe-background.svg`.
- The image host is pointer-transparent and hidden from the accessibility tree.
- The foreground shell retains its independent, higher stacking level.

## Test and acceptance

1. Verify the SVG Git blob SHA against the canonical source.
2. Verify the active page loads only the static image engine.
3. Verify no decorative renderer is started by the graphics runtime.
4. Verify image load, image failure, resize, keyboard focus, pointer and touch behavior.
5. Verify foreground controls remain visible and interactive.
6. Run the graphics CI source checks.
7. Perform human visual acceptance on desktop and mobile before locking the renderer.

## Separate native-launcher status

This browser background decision does not create a Windows executable. The XP-first native launcher specification is in the private archive at `Launcher/2026-11-15-XP-FIRST-IMPLEMENTATION-SPEC-fa.md`. Native x86 build, XP SP3 installation, and installer verification remain outstanding.
