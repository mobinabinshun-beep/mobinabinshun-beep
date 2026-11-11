# N.U Image-first Background — QA 2026-11-12

## Automated
- [ ] `node --check` for all loaded runtime/game modules.
- [ ] Manifest JSON valid.
- [ ] All local script references resolve.
- [ ] Image asset path and archive blob SHA match the archive tree.
- [ ] `nu-engine.js` SHA matches ENGINE-LOCK.md.
- [ ] Pixel renderer pause/resume hook is present and original draw path remains available.

## Visual acceptance
- [ ] Exact archive PNG fills the viewport as the visible base (not a small card or dim layer).
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
Source integration candidate only. Automated workflow, Pages publication and human browser/device acceptance must be verified before announcing a finished release.
