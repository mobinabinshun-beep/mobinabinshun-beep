# N.U Image-first Background — QA 2026-11-12

## Automated
- [ ] `node --check` for all loaded runtime/game modules.
- [ ] Manifest JSON valid.
- [ ] All local script references resolve.
- [ ] Public binary exists at `assets/nu-celestial-city.png` and matches the archived PNG (blob SHA `d73afd484ef8b459c908c1942ee0f47d27f93aa5`).
- [ ] `nu-engine.js` SHA matches ENGINE-LOCK.md.
- [ ] Pixel renderer pause/resume hook is present and original draw path remains available.

## Visual acceptance
- [ ] Exact public runtime copy of archive PNG fills the viewport as the visible base (not a small card or dim layer).
- [ ] Old procedural sky/city is hidden only after image load succeeds.
- [ ] Asset failure restores the original procedural Generation 1 background.
- [ ] Low/economy: full source image remains clear; optional compositor is minimal/off.
- [ ] Balanced/enhanced: atmospheric arcs, depth haze and particles are visible but restrained.
- [ ] Mouse/touch camera movement is subtle and does not distort the artwork.
- [ ] Focus mode dims motion and protects reading.
- [ ] Game mode keeps HUD/game canvas above the background.
- [ ] Intro/menu/profile/shop freeze and resume background effects correctly.
- [ ] Reduced Motion and hidden-tab states stop animation.

## Regression
- [ ] Bubble Hunt: 10 interactions and pause/return.
- [ ] Mana Collector: 10 interactions and wallet unchanged except normal awards.
- [ ] Chaos Attack: target interaction, Mana/HP and round completion.
- [ ] Refresh and local save persistence unchanged.
- [ ] Android low-end, Android mid/high, iOS Safari and desktop browser checks.

## Current status
Code is merged and Pages deployment succeeded. The public PNG copy is still pending; until it is uploaded the legacy procedural fallback will display. Human browser/device acceptance remains pending.
