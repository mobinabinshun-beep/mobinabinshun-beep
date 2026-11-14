# N.U approved background artwork

## Canonical source and public runtime

- Canonical source repository: `mobinabinshun-beep/Repository`
- Canonical source path: `Material/Background.svg`
- Source Git blob SHA-1: `63dd85a479354406cc5739f4603ccc1d0989e5b0`
- Artwork canvas: 1536 × 1024
- Public runtime path: `assets/backgrounds/niroo-universe-background.svg`
- Public runtime Git blob SHA-1: `63dd85a479354406cc5739f4603ccc1d0989e5b0`

The public SVG is byte-identical to the canonical Material source. It embeds the original PNG artwork as a data URI, so the runtime has one self-contained same-origin asset and does not need to fetch anything from the private repository.

## Original PNG reference

The original reference PNG is also present in this public repository at:

`assets/Original reference image file for Niroo Universe (N.U).png`

Its Git blob SHA-1 is `d73afd484ef8b459c908c1942ee0f47d27f93aa5` (2,467,298 bytes). It is preserved as a reference/source file; it is not the active runtime URL. Do not create another binary copy at `assets/nu-celestial-city.png` unless a separately reviewed engine change explicitly selects that PNG as the runtime asset.

## Runtime contract

- Entry point: `index.html`
- Engine: `nu-background-engine.js`
- Asset URL: `./assets/backgrounds/niroo-universe-background.svg`
- Readiness: `nu:background-ready` / `nu:background-missing`
- Browser diagnostic: `window.NUBackgroundEngine.getStatus()`

Keep the canonical artwork unchanged. Change the runtime path only through a reviewed graphics change and preserve the source and public copy hashes in the regression test.
