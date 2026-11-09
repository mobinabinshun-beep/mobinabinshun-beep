# N.U World Visual Bible — Generation 1.5

**Project:** N.U Interactive World  
**Renderer:** N.U World Renderer v0.2  
**Status:** Visual prototype / source-informed interpretation  
**Date:** 2026-11-09

## 1. Canon and evidence register

### Confirmed by published N.U sources

1. **N.U / Niroo Universe:** the N.U overview identifies the IP as Niroo Universe and links the Niroo and Chaos concepts. It describes a world split between the Niroo and Chaos realms, with boundaries that remain dynamic.
2. **Niroo City:** the overview describes Niroo City (NC) as a safe haven founded by Binam Binshun for beings seeking shelter from Chaos.
3. **Mana:** the overview says that Mana, described as magic, becomes part of everyday life after changes in the world's material/ethereal boundary.
4. **Diverse life:** the overview describes a wide range of sentient and non-sentient beings, with different needs and manifestations.
5. **Urban/nature integration:** the 2023 Niroo City article describes a futuristic metropolis combining technology and nature, including skyscrapers, green terraces, suspended paths, hover vehicles, public green spaces, markets, creative public life and environmental preservation.
6. **City life and infrastructure:** Niroo نامه describes trees, flowers, illuminated roads, shopping and service areas, automated agriculture, terraced gardens, green energy, education and research facilities, residential communities and public spaces.
7. **Canon discipline:** Another Earth explicitly advises against treating every older or newer narrative as final canon automatically; materials can remain classified as source, lore, branch, philosophy, canon candidate or canon.

### Not confirmed / not adopted as canon

- The exact geographical position of Niroo City.
- The exact arrangement of desert, forest, tropical coast, river, farms and mountain ranges around the city.
- A canonical skyline silhouette, building heights, architectural plan or official city map.
- Exact local weather patterns, seasons, solar calendar or astronomical parameters.
- Exact designs of vehicles, public transport, towers, bridges or energy facilities.
- The visual renderer's palette and pixel-art proportions.

These are visual-development proposals only.

## 2. Source register

- N.U — The World of Niroo: https://medium.com/@The.World.of.Niroo.TWoN.N.C/n-u-bea66efc81e0
- Niroo City — Binam Binshun: https://medium.com/@Niroo.Universe.NU/niroo-city-03bdf641f616
- Niroo نامه — Land of Power / Niroo City: https://medium.com/@Niroo.Universe.NU/niroo%D9%86%D8%A7%D9%85%D9%87-b7bf79aab5c6
- Another Earth — Scientific and Theoretical Foundations: https://medium.com/@The.World.of.Niroo.TWoN.N.C/another-earth-25ad15466acd
- P.M.S.E.S.M.C.N.U — Protocol / Method / System / Engine: https://medium.com/@The.World.of.Niroo.TWoN.N.C/p-m-s-e-s-m-c-n-u-bfab94a536de
- Black Fox Writes — Driving in the struggle of life: https://medium.com/@Black.Fox.writes/driving-in-the-struggle-of-life-2b3b5e8f89e4
- JanitorAI N.U character reference supplied by project owner: https://janitorai.com/characters/bb8c08e4-aa23-41cd-a16a-405a41df3676_character-niroo-universe-n-u

## 3. Publishing identity caution

The N.U overview associates Binam Binshun, Xbinshun and Black Fox Writes with the publishing network. This does not mean every story published by Black Fox Writes is set inside N.U. For example, the introduction to “Driving in the struggle of life” explicitly says the story is unrelated to the Niroo world, while it may exist as a book available within the wider setting. Keep publication identity separate from story canon.

The supplied JanitorAI character page could not be retrieved during this review. Its content, character definition, visual identity and canon status remain unverified; no character traits have been copied into the renderer.

## 4. Renderer composition

The 480×270 canvas is intentionally low resolution and scaled with crisp pixel rendering.

1. **Sky:** four local-time palettes — dawn, day, dusk and night.
2. **Celestial motion:** sun travels along a simplified daily arc; moon is shown at night; stars are shown only at night.
3. **Sky motion:** restrained cloud bands move slowly.
4. **Land silhouette:** distant ridges, forest belt and tropical coast. This is an illustrative composite, not a canonical map.
5. **Atmosphere:** particles originate near the center and expand outward in Game mode; Sleep and Study use gentle orbital motion.
6. **City silhouette:** varied building widths/heights with low detail at distance and restrained green rooftop/terrace hints nearer the viewer.
7. **Nature/infrastructure:** a river, cultivated terrace rows and a minimal road/path network.
8. **City life:** tiny distant traffic and occasional airborne silhouettes.
9. **Lighting:** building windows are dim in daytime and more visible at dusk/night; no permanent neon blanket.

## 5. Ambient profiles

- **Sleep:** near-static, slow orbital drift.
- **Study:** slow circular movement, low contrast and calm speed.
- **Game:** radial motion from the center, fast near the center and progressively slower toward the outer edge.

Reduced-motion preference freezes moving visual elements. Hidden browser tabs suspend the renderer.

## 6. Input camera

- **Mouse:** first mouse movement activates the mouse-follow camera; parallax follows pointer position.
- **Touch:** first touch on the world activates inverse drag; dragging the finger left makes the view shift right, and vice versa.
- UI buttons and links do not start touch-camera drags.
- Touch drags are not counted as game interactions.
- Camera offsets are clamped to a small range and are applied through CSS variables plus renderer parallax.

## 7. Gameplay feedback

- A successful click on a Bubble adds 1 XP.
- A successful Mana collection adds 1 Mana.
- A successful N-BI shot neutralizes exactly one Chaos mass, consumes 10 Mana in the current prototype and grants 3 XP.
- Every Chaos mass not neutralized advances to the defensive boundary. Each mass crossing the boundary removes 1 HP, then disappears.
- HP has a heartbeat-like light pulse plus a scanner sweep.
- The XP capsule stretches across the lower edge of the game view. The Mana capsule sits above it.
- A small +1 marker appears at the active fill boundary. The round counter displays successful interactions from 1/10 to 10/10.

## 8. Next visual-development steps

1. Replace placeholder terrain composition with a reviewed Niroo City panoramic reference approved by the IP owner.
2. Add building clusters, green terraces and suspended pedestrian routes with a clearer sense of scale.
3. Add distinct foreground/midground/background parallax.
4. Add more accurate coast, river and agricultural silhouettes only after the owner approves their geography.
5. Add time-based light transitions and moving vehicles without increasing the baseline frame budget.
6. Validate on low-end Android, desktop browsers and reduced-motion mode.
