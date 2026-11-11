# N.U Niroo City — Visual Bible / Generation 1.6

## Source-grounded identity

This visual direction is informed by the following published N.U materials:

- *N.U — Niroo Universe* (The World of Niroo, Medium): Niroo / Chaos (N/C), Mana, Niroo City (NC), and the Binam Binshun founders are named in the setting. The city is described as a safe haven and a decentralized network of cells.
- *Nirooنامه* (Binam Binshun, Medium): describes Niroo City through green energy, cultivated plants, clean air, engineered infrastructure, agriculture, and a community with varied roles including teachers, growers, craftsmen and engineers.
- *Another Earth: Scientific and Theoretical Foundations of the World of Niroo*: frames Niroo as a possible alternative future of Earth and explicitly identifies urbanism, ecology, climate, agriculture and technology as foundational research areas. It also states that a definitive Niroo City system and its details remain to be developed.

## Canon vs visual proposal

**Source-confirmed concepts:** Niroo City; Binam Binshun as founders; sustainable / green urban aspirations; engineered city; plants and agriculture; clean energy; diverse communities; Mana and Chaos as setting concepts.

**Not source-confirmed:** the exact city map, skyline silhouette, architecture style, biome order, river path, traffic types, aircraft routes, color palette, and exact day/night lighting behavior.

All current pixel-art geography is therefore an art-direction proposal for the playable prototype, not a canonical map.

## Layer order

1. Sky gradient and sun / moon.
2. Clouds and night-only stars.
3. Far terrain: dry ridges, forest edge, tropical coast.
4. Atmospheric particles expanding from the center depth point.
5. City silhouettes: smallest and lowest-detail in the distance, larger in the foreground.
6. River, water channels and cultivated terraces.
7. Upper-altitude aircraft and ground-level road traffic.
8. Ambient haze and camera parallax.
9. Interactive gameplay objects, kept out of article reading columns.

## Biome composition

The current composition reads left-to-right as forest edge, central dry ridges / open terrain, and tropical coast. The city sits across the valley between these environmental zones. A river and cultivated terraces provide a visual connection between terrain and city.

## Motion rules

- Day: stars and firefly-like night glows are absent; city lights remain subdued.
- Night: stars appear and building lights become more visible.
- Dawn / dusk: transitional sky and window-light intensity.
- Sleep: almost-static atmospheric drift.
- Study: slow, circular, low-amplitude drift.
- Game: radial particles emerge near the central depth point, enlarge as they approach the viewer, then fade toward the edges.
- Mouse: camera follows pointer.
- Touch: inverse drag, as if the viewer turns their head by dragging the scene in the opposite direction.

## Separation of concerns

- `nu-engine.js`: adaptive capability sampler and base runtime; frozen.
- `nu-pixel-world.js`: independent environment renderer.
- `nu-games.js`: gameplay rules, interaction and economy prototype.
- `nu-world.css`: presentation and HUD layout.

Changing the city renderer must not change game economy. Changing the HUD must not change target generation. Changing game rules must not alter the adaptive runtime.

## Known visual limitations

- The city is still a stylized 2D pixel panorama with parallax, not a true 3D spherical world.
- Aircraft and vehicles are minimal silhouettes; their altitude bands are separated but route collision/pathfinding is not implemented.
- Biome boundaries and water/field geometry are illustrative.
- A definitive Niroo City architectural reference pack is still needed before calling the skyline canonical.


## 2026-11-12 image-first scene direction (Generation 1 preview)

The owner-supplied Celestial City artwork is now the intended invariant visual base for the browser preview. It is an art-direction reference and playable scene backdrop, not a declaration that the exact skyline, map, orbital diagrams, architecture or celestial geography are established N.U Canon.

The original source image remains unchanged at every quality tier. Optional atmosphere, parallax, lighting and particles are independent layers that may be reduced or paused on low-capability devices. The former procedural pixel panorama remains available as a compatibility fallback if the source asset cannot load. The game stage and gameplay objects remain separate foreground surfaces.

The four scene modes are Ambient, Focus, Game and Sleep. Focus reduces visual motion and contrast behind reading content; Game permits a richer but budget-bounded atmosphere; Sleep approaches a static scene. This implementation is a Generation 1 browser preview and does not imply native Android/iOS renderers or a true 3D world.
