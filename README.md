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
- No online accounts, cloud saves, comments, paid economy, multiplayer economy or downloadable launcher is included. The experimental local Store currently supports the HP Capsule transaction only; other upgrades remain unimplemented.

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

The nine Mana capsule upgrade levels, N-BI shot-cost reduction (down to one Mana per shot), X/N Credits, savings/investment and betting modes are not implemented. The later Generation 1.11 human-test candidate adds only a local HP Capsule purchase/use transaction; it does not complete the wider economy. The current Chaos shot still costs one full 10-Mana capsule.


## Generation 1 — demo profile clarification (2026-11-11)

- Added a menu entry for a **display-only player profile preview**.
- The square portrait area is a labelled placeholder only. There is no file input, image upload, image persistence, or account registration in the public demo.
- Profile text fields are optional and transient. Entering text displays a red warning that the public demo cannot protect personal data and advises against entering real/sensitive information.
- Closing the preview clears all entered demo text immediately. The explicit clear-and-close action does the same.
- This is not the downloadable local profile, password gate, save protection, parental-control flow, or online account system. Those remain future downloadable/online scope and are archived separately.
- The previously existing N.U Store navigation and first-visit two-choice guide remain present. Purchasable upgrades/economy are not yet implemented.
- The adaptive runtime, pixel-world renderer, and game mechanics were not changed in this profile-preview correction.
- Pre-change backups of `index.html`, `nu-world.css`, `nu-games.js`, and this README are stored under `BACKUPS/GEN1-PRE-PROFILE-CORRECTION-2026-11-11/`.


## Generation 1 demo profile interaction refinement (2026-11-11)
- The display-only profile can now be dismissed by clicking the empty profile backdrop or pressing Enter while the profile is open.
- Every close route clears all temporary profile text fields and hides the privacy warning.
- No image upload, file picker, profile persistence, or account creation was added.
- `nu-games.js` syntax was validated after the change. Browser/device QA and Pages deployment remain pending.
- Pre-change backup: `BACKUPS/GEN1-PROFILE-BACKDROP-ENTER-2026-11-11/nu-games.js.bak`.
- Runtime `nu-engine.js` and `nu-pixel-world.js` remain unchanged.


## Generation 1.9 — modular graphics preview (2026-11-12)

- Added a separate capability/budget core, image-first background engine, independent atmospheric layer, game presentation adapter and runtime orchestrator.
- The background engine loads the existing N.U Celestial City reference image directly from the public NU-INGEST-ARCHIVE asset; the archive remains the canonical source and no duplicate binary is required.
- The existing calibration result is passed to the graphics core so the device is sampled only once during startup. Quality is locked for the session; no continuous benchmark loop is run.
- The core applies conservative memory/core/Save-Data caps. These are browser hints and heuristics, not a hardware benchmark.
- The existing pixel-world renderer receives the same selected quality level through its public setQuality API. Its source and animation loop are not modified.
- The dynamic atmosphere layer pauses while the tab is hidden and disables itself for reduced-motion/economy profiles.
- The existing game simulation and interaction code are preserved. The game adapter publishes visual-budget metadata; it does not yet enforce a new game-loop FPS limiter.
- Native Android/iOS applications, offline packaging, reconstructed high-resolution textures and GPU-specific renderers are not included in this browser preview.
- This is a public test candidate. Device-level performance, touch, contrast and interaction acceptance still require human testing.


## Image-first celestial background preview — 2026-11-12

The public test candidate now has a separately versioned image-first scene direction. The exact archived Celestial City PNG is the invariant base; optional Canvas 2D atmosphere and camera parallax are layered above it. Low-capability profiles keep the original artwork and reduce optional effects rather than replacing or degrading the image. The previous procedural Generation 1 world is paused/hidden only after successful image load and restored on asset failure.

This is still a browser-rendered preview. Native Android/iOS engines, offline launcher packaging and server-backed online play are separate future adapters, not capabilities of this release. See `NU-MODULAR-GRAPHICS-ARCHITECTURE-2026-11-11.md` and the image-first QA checklist for acceptance gates.

## Generation 1 creative tool

**N.U Pixel Art Studio** is listed separately from the three-game random pool at [pixel-art-studio.html](./pixel-art-studio.html).
- Imports local PNG/JPEG/WebP/GIF image files in the browser; files are not uploaded to a server.
- Converts the source into a selectable 16–64 pixel square grid using a local reduced palette.
- Provides pencil, eraser, flood fill, color picker, undo/redo and palette extraction.
- Exports clean SVG vector rectangles with transparent background, plus a PNG preview.
- It is a creative tool, not a fourth random gameplay prototype.


## Generation 1.10 — adaptive Pixel Art workspace

N.U Pixel Art Studio now uses the existing `nu-graphics-core.js` capability profile without changing the shared graphics engine:
- The editing workspace frame can be resized independently from the artwork; width, height and zoom controls are provided.
- Artwork dimensions can be rectangular and resized independently, with an optional aspect-ratio lock and nearest-neighbor sampling for crisp pixel edges.
- The selected capability tier sets a conservative editable-pixel budget; oversized operations are refused with a clear explanation rather than risking a browser freeze.
- The original imported file is never overwritten. Resizing affects only the in-memory working copy; SVG/PNG exports use the current working dimensions.
- The existing core games, random game pool, adaptive/network runtime and shared graphics modules are not modified by this editor enhancement.
- This remains a browser-only editor; device-specific interaction and large-image QA are still required.


## Generation 1.12 — professional local SVG vectorization

N.U Pixel Art Studio now includes a separate vectorization engine for imported artwork:
- Import detail can be selected from 64 to 256 pixels on the longest edge; the source aspect ratio is preserved and a device pixel budget prevents oversized work.
- A weighted median-cut palette reducer builds a selectable 2–32 color palette from the source image.
- An alpha cutoff controls which semi-transparent source pixels become transparent in the working image.
- **Contour paths** traces same-color boundaries into compact closed SVG paths; transparent holes are preserved with even-odd fill rules. **Pixel runs** provides a fast block-oriented alternative.
- SVG output is editable vector geometry grouped by color, not an embedded raster image. PNG export remains available.
- The vectorizer is a local browser module; source images are not uploaded and no remote conversion service is used.

The editor still uses a color-reduced raster working grid as its input. This is best suited to logos, icons, flat illustrations and pixel art; it is not yet a Bézier curve reconstruction engine for photographic imagery, and fine photographic detail is limited by the selected import resolution and palette size.
- CI includes geometry regression tests for solid shapes, disconnected regions, transparent holes, compact runs and input validation.
- Browser/device acceptance and visual comparison against a professional tracing package remain pending.


## Generation 1.13 — human-test candidate: Creative Studio, GFX-IR and game asset profiles

This section supersedes the earlier Pixel Art Studio descriptions above where they describe square-only 16–64 grids, fixed-size workspaces, or rectangle-only SVG export.

### Creative Studio
- The workspace now fits the complete image to the available viewport first. Zoom is relative to that fit; overflow scrollbars stay inside one workspace frame instead of creating nested page/canvas scroll regions.
- The transparent-art checkerboard is rendered at the logical pixel grid, one cell per artwork pixel. Grid lines can be toggled separately.
- Familiar tools include pencil, eraser, fill, eyedropper, line, rectangle and ellipse, with adjustable brush size, undo and redo.
- Import keeps the source aspect ratio, defaults to a 256-pixel longest edge, and offers a 2–32 color median-cut palette and alpha threshold. Source files remain local and unchanged.
- SVG uses actual editable contour paths with transparent-hole handling. It remains a palette-reduced raster-to-contour workflow, not Bézier reconstruction of arbitrary photographs.
- NU-GFX-IR/1 export contains palette indices, row runs, 8×8 tile runs, edge map, connected-region bounds and explicit render instructions. It is inspectable structured graphics data; it is **not** GPU driver machine code, shader binary, or a claim of recovering the original GPU pipeline.

### Studio XP and Generation 1 games
- A successful PNG, SVG or Graphic IR download can grant a local XP reward based on painted pixels, connected regions, vector complexity and palette size.
- Current provisional reward formula: clamp(1, 25, floor(paintedPixels/256) + floor(regions/8) + floor(complexityUnits/24) + floor(colors/8)); artwork below 16 painted pixels earns no XP. complexityUnits uses traced SVG path count for SVG export and connected-region count for PNG/Graphic IR export.
- The same artwork fingerprint can claim the Studio reward only once in the local save, across formats. The reward is triggered when the browser download is initiated; the browser does not expose a reliable signal that the file was ultimately saved to disk. The reward is written to the existing shared Generation 1 XP balance, so it is available in Bubble Hunt, Mana Collector and Chaos Attack without a separate currency exchange.
- This is local browser progression, not server-authoritative or cheat-resistant economy. The reward formula is provisional and should be tuned from human test feedback.

### Game-specific asset profiles and HP capsule use
- Hovering or keyboard-focusing the XP, Mana or HP bars opens a game-scoped asset profile.
- The profile is a filtered view of the global wallet, not a second set of balances: each game displays only its relevant assets, while Wallet continues to show the full supported Generation 1 inventory.
- The HP Capsule can be purchased and consumed from the Store; the in-game HP icon remains a direct use action. Full HP and empty inventory are explained without consuming an item.
- Only implemented assets backed by the local save are displayed.

### Acceptance boundary
- Automated checks cover JavaScript syntax, wallet rules, SVG contour geometry, GFX-IR structure, manifest JSON and local script references.
- Browser/device, download, persistence, visual-fidelity and touch acceptance remain human-test tasks. This branch is a public-demo test candidate, not a final product release.


## N.U Launcher — calibration preview

A separate browser-only launcher preview is available at [launcher.html](./launcher.html). It performs bounded browser capability checks before the player enters the demo, offers ten performance levels, saves a local profile, and provides refresh/reset settings plus local JSON export for human-test notes.

This is not yet a native multi-platform installer. Browser CPU/GPU/RAM signals are approximate; the network check measures same-origin reachability/round-trip only. The selected budget is currently stored as a local profile but is not yet consumed by the Generation 1 render/game loops; per-game calibration hooks, native installers, signed extension packages, sandboxing, dependency resolution and rollback remain future work. Human-test reports can be exported locally or submitted through the GitHub issue form. See the `NU-LAUNCHER-*` documents for architecture and acceptance boundaries.

## Generation 1.14 — Studio viewport and import repair candidate (2026-11-12)

This isolated candidate responds to owner-reported human-test defects in the public Creative Studio:
- Image jumps/clips or appears outside the workspace after import.
- Raster-to-pixel conversion is hard to inspect or appears not to match the source.
- The checkerboard/pixel guide is not clearly aligned to the logical artwork pixels.
- Initial view and scrolling behavior are confusing.
- Tool controls do not yet communicate familiar editor affordances.

Candidate changes:
- Replace implicit grid/percentage sizing dependency with deterministic fit-to-view geometry and a ResizeObserver that recalculates the canvas when the actual workspace changes size. The workspace uses one contained scroll frame; the outer stage clips overflow.
- Use one shared pointer-to-pixel coordinate mapper so brush input follows the displayed pixel grid at every zoom and aspect ratio.
- Show an original-source preview and source-to-working dimensions while preserving the original file; edits remain on a separate local working copy.
- Offer smooth resampling for photographs and nearest-neighbor resampling for existing pixel art.
- Extract raster-to-palette mapping into a tested module and add optional Floyd–Steinberg dithering for gradient-heavy inputs. Transparency cutoff and 2–32 color palette controls remain available.
- Add visible keyboard shortcut hints for Pencil (B), Eraser (E), Fill (G), Eyedropper (I), Line (L), Rectangle (R), and Ellipse (O). Ctrl/Cmd+Z and Ctrl/Cmd+Y handle undo/redo; F fits the image to view.
- Resource-bar asset-profile pointer/touch events are stopped before reaching global gameplay handlers; tapping a HUD bar must not count as a game interaction. The profile is positioned beside the selected bar.

New regression suites cover fit-to-view, portrait/landscape aspect ratio, overflow containment, collapsed workspace recovery, pointer-to-pixel mapping, palette mapping, transparency cutoff and optional dithering. Passing Node tests do not prove browser layout correctness; real browser/device acceptance remains pending.

The checkerboard remains a per-logical-pixel transparency visualization, while optional grid lines are a separate guide. At extreme custom dimensions the grid may be disabled for readability/performance; the underlying transparent-pixel pattern is still per image pixel.

### Explicit remaining limits
- This is still a browser-based pixel/raster editor with palette-reduced contour vectorization. It does not yet provide layers, masks, selections, transforms, text, gradient tools, pressure-sensitive brushes, project-file save/open or non-destructive operation history.
- NU-GFX-IR/1 is a portable, inspectable intermediate representation (palette/tile/run/edge/region data and render instructions), not GPU machine code or a recovered proprietary driver command stream.
- True vector tracing infers paths from visible raster boundaries. It cannot recover original hidden layers, source Bézier curves or detail absent from the source image. Bézier fitting, segmentation confidence, layer inference and photo-specific reconstruction remain future stages.
- Studio XP is local-browser prototype progression. A download initiation can award once per local fingerprint; it is not proof that a file was saved, and localStorage reward controls are not server-authoritative anti-cheat.

The repair was developed on feature/gen1-studio-viewport-input-repair-v2-2026-11-12 and merged to the public default through PR #18 (squash commit 9f64a0138e79fc77636f5305eb2fce26c02c965d). Exact-head CI run #134 passed all validation steps. The source merge is confirmed; Pages deployment/live URL verification and owner browser/device acceptance remain pending.


### Generation 1.14 status — public human-test handoff

- Public Studio URL: https://mobinabinshun-beep.github.io/mobinabinshun-beep/pixel-art-studio.html
- The Studio report form is available through the REPORT STUDIO TEST link or .github/ISSUE_TEMPLATE/studio-human-test.yml.
- The merged repair uses versioned local script/style URLs to avoid stale static assets on subsequent loads. It does not clear browser caches or local player saves.
- Owner browser/device acceptance is the next gate. Report the image class/dimensions, browser and general device class, selected import detail, palette, resampling and dithering settings, and steps to reproduce. Do not upload private or copyrighted source artwork.
- The public runtime still has no server-side report collector; the GitHub issue form is the explicit feedback intake path.


## Generation 1.15 — human image report and composite export repair (2026-11-13)

The Creative Studio now exports a readable image report alongside PNG, SVG and Graphic IR downloads:
- The report includes dimensions, painted/transparent pixel counts, colors, connected regions, palette values, largest-region bounds and plain-language notes in English and Persian.
- SVG files embed the report as metadata; Graphic IR JSON includes a `humanReport` field.
- PNG, SVG and Graphic IR downloads also initiate a companion `.human-report.md` download. The report can be downloaded directly from the EXPORT panel or the advanced Files dock.
- Analysis and PNG/SVG export now use the visible four-layer composite rather than only the active layer. Hidden layers are excluded and visible layer opacity is respected.
- The human report is generated locally in the browser; no image is uploaded.
- Regression tests cover report content, Markdown formatting, report attachment and composite export paths.

Package version: `0.5.2-gen1-human-image-report`. The previously working Studio import/edit baseline is preserved at `freeze/studio-known-good-2026-11-13`; see `STUDIO-KNOWN-GOOD-LOCK.md`.


## Generation 1.16 — Mana material interaction preview (2026-11-13)

- Published the five original 32×32 SVG Mana material assets from the private N.U Material archive under `assets/material/`; source SVG geometry is preserved unchanged.
- The Mana Collector now layers the source pixel-art glints around each interactive Mana target. Successful collection emits a short material-based particle burst.
- The new `nu-materials.js` module loads the five local SVGs, preserves crisp pixel edges, and degrades safely if an asset cannot load. Bubble Hunt, Chaos Attack, wallet rules, XP/Mana values, and the adaptive runtime are unchanged.
- Human acceptance is still required for desktop/mobile rendering, tap accuracy, scaling, reduced-motion expectations and visual clarity. Submit findings with the **Mana Material Human Test** issue form.
- Public test URL: https://mobinabinshun-beep.github.io/mobinabinshun-beep/


## Generation 1.17 — Bubble Hunt circular targets (2026-11-13)

- Bubble Hunt targets are now true circles, not vertically stretched ellipses. The glass highlight follows a circular arc.
- Bubble hit-testing remains radial and uses a 10px touch margin, so the interaction region stays centered and predictable.
- The five original N.U Mana material SVGs remain in use for Mana Collector interactive targets; they are not repurposed as bubble textures because the archived set is Mana-specific.
- Human QA should verify circle shape, visual/touch alignment, and rendering on desktop and mobile.


## Generation 1.18 — HP Capsule HUD interaction (2026-11-13)

- The Golden HP Capsule icon in the in-game HP rail is activated through a standard click/tap action, with pointer propagation isolated from the game field and HUD profile.
- Successful use displays a short `+N HP` interaction pop anchored to the capsule icon, alongside the existing HP bar restoration and wallet transaction feedback.
- Empty inventory and full HP continue to show a warning without consuming a capsule. Existing wallet rules and restore amounts are unchanged.
- Automated regression checks cover click binding, event propagation isolation, successful-use feedback, and unchanged wallet consumption rules. Desktop/mobile browser acceptance remains a human-test task.


## Generation 1.19 — HP capsule HUD event/overlay debug repair (2026-11-13)

- Replaced the button-local event path with capture-phase document delegation for pointer/touch release and keyboard-generated clicks, so parent HUD profile handlers cannot swallow activation.
- Raised the capsule hit target above HUD layers and explicitly enabled pointer events on the button.
- Fixed the prior feedback coordinate bug: the HP bar is viewport-fixed while the game stage clips overflow, so the old stage-relative notification could be positioned outside the clipped stage. Feedback now renders in viewport coordinates on `document.body`.
- Captures the capsule button rectangle before wallet persistence/rerender can hide the button after the final capsule is consumed.
- Wallet rules remain unchanged; regression tests cover event delegation, pre-rerender anchoring, unclipped feedback and one-capsule consumption.


## Generation 1.20 — HP Capsule direct-click repair (2026-11-13)

- Replaced document-level pointer-up delegation (and keyboard-only click fallback) with a direct native `click` listener on the actual HP Capsule button. Native click covers mouse, touch-generated click, Enter and Space activation and avoids duplicate pointer/click consumption paths.
- The HP rail is explicitly pointer-enabled in gameplay, and the capsule button has an enlarged 42×42 CSS-pixel hit area; the button image/count are non-target descendants so clicks resolve to the button.
- Click propagation is stopped at the button so the HP asset-profile click handler cannot swallow or reinterpret capsule use.
- Existing wallet rules remain unchanged; successful use triggers the anchored `+N HP` viewport animation and HP bar feedback.
- Automated regression checks assert the direct listener and CSS hit target. Human device/browser retest remains required.


## Generation 1.22 — HP capsule interaction burst (2026-11-13)

- Upgraded successful HP capsule feedback from a single floating text pop to a short radial burst anchored precisely to the HP HUD icon: expanding green ring, eight outward particles, and a glowing `+N HP` label.
- The burst appears only after a capsule is successfully consumed; full-HP and empty-inventory warnings remain unchanged and do not emit a success burst.
- The animation uses viewport coordinates so it is not clipped by the game stage, and includes a reduced-motion fallback.
- Wallet consumption, healing cap, XP cost and capsule inventory rules are unchanged.

## Generation 1.23 — HP capsule arrival and return motion (2026-11-13)

- When HP first drops below full, a golden capsule visual travels from the left corner of the HP HUD rail to the capsule dock beside the HP bar.
- The docked capsule remains in its normal interactive position while HP is below 10. Further damage does not spawn duplicate travelling icons.
- When HP returns to 10/10, the visual travels back along the reverse path to the HUD rail corner and fades away.
- The travel animation is visual only: it never consumes or grants a capsule. Intentional capsule activation and all existing wallet/healing rules remain unchanged.
- Reduced-motion settings suppress the travel motion; the regular HUD control remains available.
- Automated regression coverage checks the full-to-damaged and damaged-to-full transitions, endpoints, animation hook and reduced-motion fallback. Human visual/device acceptance is still required.



## Generation 1.25 — HP capsule internal dock motion (2026-11-13)

- The HP HUD frame is widened to reserve an internal slot for the golden capsule; the live clickable icon is positioned inside the frame, not outside its right edge.
- At full HP the capsule icon and count are hidden. When HP drops below 10, a visual capsule fades in at the frame's right inner corner and travels into the reserved slot beside the HP rail; the real button becomes available only after arrival.
- When HP returns to 10/10, the icon is hidden immediately and the visual capsule travels back along the reverse path, fading out at the right inner corner. No capsule remains visible at full HP.
- Repeated damage does not duplicate the arrival animation. Travel is visual only and does not change inventory, healing, or wallet rules. Reduced-motion settings skip travel while preserving the correct conditional visibility.
- The human-test checklist covers frame fit, inside-edge docking, reverse exit, interaction, mobile layouts and reduced-motion behavior.


## Generation 1.26 — HP capsule dock motion precision (2026-11-13)

- The HP HUD frame is widened to 340px on desktop and remains viewport-responsive on narrow screens; the capsule has a dedicated 42px dock fully inside the frame.
- At full HP, neither the capsule icon nor its count is visible. When HP first falls below 10, one visual capsule enters from the inside-right edge and travels to the dock; the real button remains hidden until arrival.
- Repeated HP changes during travel no longer reveal a duplicate button. If HP changes direction mid-flight, the same animation reverses from its current position rather than restarting or jumping.
- When HP reaches 10/10, the capsule returns along the same path and fades out at the right corner. Lowering HP during the exit reverses that same motion back into the dock.
- Travel remains visual-only; clicking the docked icon is still the only action that consumes a capsule. Wallet, healing, inventory and reward rules are unchanged.
- Regression coverage and the Generation 1.26 human-test checklist cover duplicate prevention, mid-flight reversal, frame fit, reduced motion and mouse/touch/keyboard acceptance.


## Generation 1.27 — Store HP Capsule split actions (2026-11-13)

- Removed the separate "Use owned capsule" Store card; the HP Capsule now appears in one purchase row.
- The left-side capsule icon and adjacent count are the use control; it is enabled only when the player owns a capsule and HP is below maximum. The icon glows when inventory is nonzero and appears dim when none are owned.
- The right-side BUY control remains a separate purchase action. Buying deducts 10 XP and adds one capsule; clicking the icon consumes one owned capsule and restores up to 10 missing HP.
- Purchase and use hit targets are independent; existing wallet validation and transaction rules are unchanged.
- Added responsive layout, regression assertions and a human QA checklist. Browser/device human acceptance remains pending.


## Generation 1.28 — compact mobile HP HUD (2026-11-13)

- Reduced the in-game HP frame width on phone-sized viewports to a maximum of 286 CSS pixels (while retaining a viewport-safe side margin), and reduced its height, padding and internal gaps.
- Tightened the player-HP label/value and progress track spacing; the capsule dock and travel visual are also smaller on phones while remaining inside the frame.
- Desktop/tablet sizing, HP state behavior, capsule visibility, inventory actions, healing and wallet rules are unchanged.
- Added a regression assertion and a phone-focused human QA checklist. Real-device portrait/landscape acceptance remains required.


## Generation 1.29 — mobile HP capsule below the HP rail (2026-11-13)

- On phone-sized screens, the HP frame now wraps only the HP label, progress rail and numeric value instead of stretching horizontally across the viewport.
- The frame extends downward to form a dedicated capsule pocket. When HP is below 10, the Golden HP Capsule is centered below the HP rail, visible and directly tappable.
- The mobile arrival/return animation now docks at the lower centered position; desktop/tablet keeps its existing right-side internal dock.
- HP, inventory, healing, wallet transactions and full-HP visibility rules are unchanged. Automated regression coverage and a phone-first human QA checklist were updated.
- Real-device portrait/landscape acceptance remains pending.


## Generation 1.30 — shared HP Capsule inventory refresh (2026-11-13)

- Store-side capsule use now refreshes the Store row immediately after a successful wallet transaction, so its owned count decreases without closing and reopening Store.
- The in-game HP HUD continues to update its count through the shared wallet render path. Both controls call the same wallet consumption rule and consume exactly one capsule per successful use.
- Full HP, empty inventory, healing cap, XP and purchase behavior are unchanged.
- Regression tests cover immediate Store refresh and the shared wallet consumption result. Human testing should alternate Store and HUD use and confirm both counts remain synchronized.


## Generation 1.31 — N.U Casino mini-games (2026-11-13)

- Added a standalone N.U Casino page linked from the Generation 1 home screen and navigation.
- Three playable games: Coin Flip (2× return on a correct call), Lucky Dice (6-sided exact guess, 5× return), and Mini Slots (three-of-a-kind 8×, pair 2×).
- Casino uses a separate virtual-credit wallet starting at 100 credits. Wagers and payouts are recorded in the local transaction ledger and persist in the same browser save as the Generation 1 world.
- Casino credits are not XP, Mana, HP Capsules, cash, or redeemable value. No deposits, payments, withdrawals, or cash-out exist.
- Responsive layout, keyboard-operable native controls, insufficient-credit guard, and human QA checklist added. Human acceptance is pending.



## Generation 1.32 — universal hex gateway calibration (2026-11-13)

- The compact six-sided N.U gateway is available on the main world, Casino, Launcher and Creative Studio pages, and remains available while navigating the home, library, wallet, Store, profile and article views inside the main world.
- The gateway stays pinned near the upper-right/upper-middle frame edge. Its nine floating destinations fan out around the trigger without a full-screen menu panel; sizing and orbit radius adapt to narrow screens. It is the single menu/back entry point inside the main world, so legacy menu and back buttons are hidden there.
- Opening the gateway pauses an active main-world round through the existing PAUSE/RESUME control and applies an icy translucent blur to the page. Dismissing it restores the prior round state.
- Mouse hover selects and dwell-activates a destination; mouse click and keyboard activation use a two-step select/confirm path. Touch release activates directly and suppresses the synthetic click to prevent duplicate navigation.
- Leaving the menu region by more than the 10px boundary tolerance dismisses the gateway. Escape, focus navigation, reduced-motion preferences and page blur are supported.
- Gateway behavior is isolated from game rules, wallet values and local save data. This is a navigation-layer change only; human desktop/mobile acceptance remains required.
- Pre-change source is preserved on `backup/pre-hex-gateway-touch-calibration-2026-11-13` and under `BACKUPS/HEX-GATEWAY-PRE-CALIBRATION-2026-11-13/` on the feature branch.

## Project continuity and new-chat handoff

- [Project handoff and conversation archive (2026-11-13)](PROJECT-HANDOFF-AND-CONVERSATION-ARCHIVE-2026-11-13.md) — project map, interaction requirements, generation boundaries, casino record, QA references and a ready-to-paste new-chat prompt.
- **Generation boundary:** N.U Casino is Generation 1.31 only. Do not move or classify it as a Generation 2 feature.


## Operational protocol

- [N.U Implementation & Calibration Protocol](./docs/operations/NU-OPS-IMPLEMENT-01.md)
- [Human-test report template](./docs/operations/HUMAN-TEST-REPORT-TEMPLATE.md)


## Generation 1 — Exchange and asset-change chart (candidate)

- The lightweight Exchange page is part of Generation 1 and uses the existing local wallet/transaction ledger.
- The chart reconstructs asset balance changes from recorded signed transaction deltas; it is not a market-price chart.
- Casino Credits are shown as a Generation 1 virtual asset, separate from XP, Mana and HP.
- No conversion pairs, rates, fees, or exchange eligibility are invented. Conversion remains unavailable until the owner approves the pair/rate rules.
- History is limited to the wallet's retained local transaction window (currently 40 entries). Local browser data is not server-authoritative and does not synchronize across devices.


## Owner-directed change control — 2026-11-13

The shared Hex Gateway is **FROZEN / OWNER-APPROVAL REQUIRED**. Its controller, stylesheet and markup history are preserved, but no live Generation 1 page imports or mounts it. Do not restore its entrypoints, expose a Gateway icon, or alter the home/menu/game/drawing/Casino navigation surfaces without explicit owner approval.

Follow [CHANGE-CONTROL-AND-ARCHIVE-PROTOCOL.md](docs/operations/CHANGE-CONTROL-AND-ARCHIVE-PROTOCOL.md) for every future implementation request: inspect the baseline, create a recoverable backup, make the smallest scoped change, run available checks, record limitations and human QA, and archive the change evidence. Existing layout and gameplay must not be broadly redesigned when a focused correction is requested.
