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
3. **Chaos Attack:** each successful N-BI shot neutralizes one Chaos mass and grants +3 XP. Unneutralized masses advance toward the defensive boundary; each one that breaches it removes 1 HP.

Each selected round has 10 successful target interactions. Missed clicks do not consume an interaction. The round remains on the selected game until completion or page reload. A fresh launch chooses a random game from the active pool.

## Prototype limitations — read before team testing
- XP and Mana are stored in this browser's localStorage. Clearing browser data or changing browser/device can remove or separate saves.
- N-BI consumes 10 Mana per successful Chaos shot in the current prototype; upgrade-based cost reduction and the complete economy are not wired yet.
- Level increases are based on each 100 cumulative XP.
- The visual world is a source-informed procedural pixel-art interpretation, not an approved canonical NirooCity map or definitive geography.
- The capability sampler is a conservative heuristic, not a CPU/GPU benchmark or hardware safety guarantee.
- Ten quality levels currently adjust the ambient particle renderer only; game-specific adaptive budgets remain future work.
- This prototype is browser-first. It does not yet provide a native Windows, Android, macOS, legacy Java, or downloadable offline launcher.
- Publication cards link to original Medium sources; original text is not copied.
- Accounts, cloud saves, comments, paid economy, store, upgrades and downloadable launcher are not included yet.

## Team test
Open the GitHub Pages site and choose **START A RANDOM GAME**. Click targets in the field. Test missed clicks (they should not consume one of the ten successful interactions), then use **NEW ROUND**. Reload to verify local save persistence and confirm that a new round selects a random game.

N.U — Niroo Universe


## Generation 1.1 — calibration and interaction repair

- Startup performs a short browser-render sampling pass before enabling the ENTER WORLD action; the world fades in after calibration.
- Four small same-origin requests estimate round-trip time to the hosted site and count failed probes. This is **not** a general Internet ping or true network packet-loss test.
- If available, `navigator.connection.downlink` is displayed as a browser-provided approximate link estimate, not a measured throughput test.
- Gameplay is rendered as a transparent overlay above the world/home content rather than as an opaque boxed minigame.
- Canvas dimensions and target positions are recalculated after the game overlay becomes visible to avoid zero-size hit testing.
- Target placement uses five shared procedural formations selected randomly.
- Pause now freezes the round and the same control resumes it.
- Pointer interactions are delegated at window level so the full-screen transparent game canvas does not block navigation controls; clicks on buttons and links are excluded.

### Calibration limitations
The runtime does not stress-test CPU/GPU, does not guarantee hardware safety, and does not claim to measure actual packet loss across the Internet. A proper throughput and packet-loss test requires a dedicated measurement endpoint and controlled test payloads. The current four-probe diagnostic measures reachability/response to the N.U site only.


## Generation 1.4 — pixel world and QA notes

- Added `nu-pixel-world.js`, a separate 320×180 low-resolution pixel-art city renderer. It does not modify the frozen adaptive runtime.
- Added a restrained procedural skyline, irregular window lights, sparse stars, parallax and local dawn/day/dusk/night palettes.
- Pixel rendering is capped at 12–24 FPS according to the calibrated quality tier and pauses while the document is hidden. Reduced-motion mode renders a static scene and only redraws when the local sky phase changes.
- The skyline is a visual placeholder, not a confirmed canonical depiction of Niroo City.
- Camera updates are throttled; hidden tabs pause the ambient runtime and game animation.

### Known limitations after source review

- The current game economy remains a prototype: Credits, upgrades, capsule filling and the full progression economy are not implemented in the current game module.
- Mana Collector stops accepting rewards when all configured Mana storage is full; a spend/upgrade interface is not yet available.
- Chaos consumes 10 Mana per successful shot in the current prototype. Upgrade-based cost reduction is not yet implemented.
- Chaos damage is a simple one-time boundary encounter per target, not a full collision or enemy-HP simulation.
- Saves remain browser-local. Cross-device synchronization and offline installation are not yet available.
- Real-device visual, touch and accessibility testing is still required; source review alone is not proof of runtime correctness.

### QA focus for team testing

1. Verify the world appears after calibration and the pixel skyline is visible behind the content.
2. Verify the home screen does not start a game automatically.
3. Open each of the three games; confirm only successful target clicks advance 1/10 through 10/10.
4. Pause and resume; verify target positions and round progress remain unchanged.
5. Test Mana storage at capacity and Chaos with fewer than 10 Mana.
6. In Chaos, allow several masses to cross the lower boundary in the same frame and confirm HP never resets unexpectedly.
7. Switch browser tabs; verify background animation pauses and resumes.
8. Enable reduced motion; verify the pixel scene becomes static.


## Generation 1.5 — layered Niroo City horizon and input camera

- Reworked `nu-pixel-world.js` into a 480×270 renderer with sky, solar arc, moon, night-only stars, moving clouds, desert ridges, forest belt, tropical coast, river, terraced fields, layered skyline, green rooftops and distant traffic.
- Nearer buildings have slightly more detail; distant silhouettes remain low-detail to preserve performance.
- The three ambient movement profiles are Sleep (very slow orbit), Study (slow circular drift) and Game (radial particles accelerate near the center and slow toward the edges).
- Mouse camera follows the pointer after mouse input is detected. Touch camera activates on a touch gesture and moves opposite to the finger drag. UI controls are excluded from camera gestures; touch drags do not count as game interactions.
- XP capsule spans the lower edge of the game view. Mana is displayed in a smaller capsule above it. Fill boundary markers and +1 feedback are positioned at the current fill edge.
- HP keeps its heartbeat-like light pulse and now has a moving scanner sweep.
- Chaos masses advance toward the defensive boundary. Every mass not neutralized by N-BI causes one HP damage on crossing, then disappears. A successful shot neutralizes one mass.

### Source and canon boundary

The visual design uses the published Niroo City descriptions of integration between technology and nature, green terraces, suspended paths, markets, public spaces and distant/hovering traffic as references. The specific desert, forest, coast, river and farm arrangement in the renderer is a visual composition proposal, not confirmed map geography. The N.U overview describes Niroo City as a safe haven founded by Binam Binshun and frames Niroo/Chaos and Mana as central world concepts. See the source register in `NU-WORLD-VISUAL-BIBLE-G1.5.md`.

### Remaining QA

- Verify touch drag and target tap separately on at least one Android/iOS device.
- Verify local sunrise/noon/sunset/night transitions by temporarily changing device time or testing at different hours.
- Verify the Chaos damage boundary, simultaneous breaches and death reset.
- Verify the full-width capsule layout on portrait and landscape screens.
- Real-device performance and live Pages deployment remain unverified by source review alone.


### Generation 1.5 reference documents

- `NU-WORLD-VISUAL-BIBLE-G1.5.md` — source-grounded IP facts, visual proposals, canon boundaries and renderer architecture.
- `QA-GEN-1.5.md` — source review and manual team test checklist.


## Generation 1.6 — gameplay feedback and visual corrections

- Chaos approach speed now doubles across successive targets (1, 2, 4, 8; capped at 8). A mass neutralized by N-BI is removed; every remaining mass that reaches the defensive boundary causes 1 HP damage.
- A successful object interaction displays its exact round count (1/10 through 10/10) at the clicked object.
- Completing a full 10-interaction round restores 1 HP, capped at 10.
- XP capsule occupies the full bottom rail; Mana display is positioned on the left-side upper rail. The HP bar has a moving ECG-style scanner trace with intensity tied to remaining HP.
- Bubble targets are larger and Mana particles are smaller to make their relative search difficulty more intentional.
- Mouse camera listeners are attached only after the first mouse movement. Touch camera remains a separate inverse-drag path; drag gestures do not count as taps.
- Aircraft use a higher altitude band; ground traffic stays on the road band to reduce intersections with the city skyline.

### Economy not yet implemented

The nine Mana capsule upgrade levels, N-BI shot-cost reduction (down to one Mana per shot), HP capsule purchase/refill, X/N Credits, savings/investment and betting modes are not implemented. The current Chaos shot still costs one full 10-Mana capsule. This is intentionally disclosed rather than represented as complete.


## Generation 1 — demo profile clarification (2026-11-11)

- Added a menu entry for a **display-only player profile preview**.
- The square portrait area is a labelled placeholder only. There is no file input, image upload, image persistence, or account registration in the public demo.
- Profile text fields are optional and transient. Entering text displays a red warning that the public demo cannot protect personal data and advises against entering real/sensitive information.
- Closing the preview clears all entered demo text immediately. The explicit clear-and-close action does the same.
- This is not the downloadable local profile, password gate, save protection, parental-control flow, or online account system. Those remain future downloadable/online scope and are archived separately.
- The previously existing N.U Store navigation and first-visit two-choice guide remain present. Purchasable upgrades/economy are not yet implemented.
- The adaptive runtime, pixel-world renderer, and game mechanics were not changed in this profile-preview correction.
- Pre-change backups of `index.html`, `nu-world.css`, `nu-games.js`, and this README are stored under `BACKUPS/GEN1-PRE-PROFILE-CORRECTION-2026-11-11/`.
