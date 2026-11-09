# N.U — Niroo Universe

**Public information hub and N.U Interactive World — Generation 1 prototype**

The root GitHub Pages site contains an experimental browser-first game hub.

## Generation 1 prototype files
- `index.html` — game hub, library, publications and browser interface
- `nu-world.css` — independently editable visual layer
- `nu-engine.js` — lightweight adaptive browser runtime and local save helper
- `nu-games.js` — three Generation 1 interaction prototypes
- `NU-GENERATION-1-MANIFEST.json` — package/runtime manifest
- `404.html` — themed not-found page

## Playable prototypes
1. **Bubble Hunt:** each successful bubble interaction grants +1 XP.
2. **Mana Collector:** each successful Mana interaction grants +1 Mana.
3. **Chaos Attack:** target masses have 5 integrity; each click triggers a simulated N-BI shot; destroying a mass grants +3 XP.

Each selected round has 10 successful target interactions. Missed clicks do not consume an interaction. The round remains on the selected game until completion or page reload. A fresh launch chooses a random game from the active pool.

## Prototype limitations — read before team testing
- XP and Mana are stored in this browser's localStorage. Clearing browser data or changing browser/device can remove or separate saves.
- Chaos training shots are currently free; final N-BI Mana costs and upgrade economy are not wired yet.
- Level increases are based on each 100 cumulative XP.
- The visual world is a procedural lightweight placeholder, not an approved canonical NirooCity illustration.
- The capability sampler is a conservative heuristic, not a CPU/GPU benchmark or hardware safety guarantee.
- Ten quality levels currently adjust the ambient particle renderer only; game-specific adaptive budgets remain future work.
- This prototype is browser-first. It does not yet provide a native Windows, Android, macOS, legacy Java, or downloadable offline launcher.
- Publication cards link to original Medium sources; original text is not copied.
- Accounts, cloud saves, comments, paid economy, store, upgrades and downloadable launcher are not included yet.

## Team test
Open the GitHub Pages site and choose **START A RANDOM GAME**. Click targets in the field. Test missed clicks (they should not consume one of the ten successful interactions), then use **NEW ROUND**. Reload to verify local save persistence and confirm that a new round selects a random game.

N.U — Niroo Universe
