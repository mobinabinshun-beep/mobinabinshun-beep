# N.U Generation 1 — Technical Audit, Debug Record & Pixel Art Studio
**Record:** NU-G1-AUDIT-2026-11-12  
**Date:** 2026-11-12  
**Implementation repository:** mobinabinshun-beep/mobinabinshun-beep  
**Work branch:** `feature/gen1-pixel-art-studio-audit-2026-11-12`  
**Backup branch:** `backup/gen1-before-pixel-art-studio-2026-11-12`  
**Baseline commit:** `c8107656b1ae78ab9c34ebcd58630bd8a7d5233b`  
**Scope:** Generation 1 only. Generation 2 remains parked/quarantined.

## 1. Backup and change boundary
- Created the backup branch from the public repository default branch before editing.
- GitHub compare verified the backup branch is identical to the default branch: ahead 0, behind 0, no file changes.
- All new implementation work is isolated on the feature branch. The default branch was not modified by this work.
- Protected modules were not changed: `nu-engine.js`, `nu-graphics-core.js`, `nu-background-engine.js`, `nu-dynamic-layers.js`, `nu-game-render-adapter.js`, `nu-graphics-runtime.js`, and `nu-pixel-world.js`.
- No deployment, domain/DNS, or Generation 2 activation was performed.

## 2. Repositories and governance reviewed
Read the public Generation 1 repository README, index, game module, adaptive runtime, pixel renderer, graphics core/background/dynamic/runtime adapters, package manifest, asset instructions and current SVG capsule.
Read R18 archive project record, 2026-11-10 addendum, project catalog and archive structure.
Read R00 Gateway README, project execution tracker and repository map; R17 Source Registry README; R19 Filter Engine README; and N.U Public Index README.
Governance distinction retained: R17 is source identity/provenance, R18 is intake/quarantine, R19 defines filters/routing, R00 coordinates execution; none of these roles automatically grants Canon, rights, or deployment approval. FUTURE-2026-002 remains PARKED/PRESERVED as a future-project archive record; this Gen1 scope is separately user-requested.

## 3. Verified Generation 1 baseline
### Existing games
- Bubble Hunt: successful interactions award XP.
- Mana Collector: successful interactions award Mana; full storage blocks collection.
- Chaos Attack: N-BI shot consumes 10 Mana and neutralizes one Chaos mass; surviving masses advance and breach the defense boundary.
- Each selected core game round uses 10 successful interactions. Random launch selects only the three core games.
- XP, level, Mana, HP, HP-pill inventory and related demo values use localStorage key `nu-world-save-v1`; this is browser-local, not cloud-synced.

### HP and store debugging
- Actual HP damage already existed in Chaos Attack: each unneutralized mass crossing the defensive boundary removes 1 HP.
- Completing 10 successful interactions restores 1 HP, up to 10.
- At HP zero, current code applies a YOU DIED flow, resets HP to 10, and truncates XP down to the previous 100-XP boundary. This death penalty/reset is an existing rule that should receive human design review before it is treated as final.
- The prior floating feedback helper is intentionally empty. Damage had therefore been silent; this candidate now emits a compact accessible transaction toast for each Chaos breach.
- HP pill visibility remains conditional: inventory count > 0 and HP < 10. Consumption removes one pill and restores up to 10 HP; the displayed amount is now the actual amount restored, not always a misleading +10.
- Store purchase spends 10 XP and adds one pill; the store only lists the item when affordable. Purchase success/failure and use feedback are shown through the transaction toast.

### Graphics
- Existing graphics are modular: capability budget, exact-image background loader, independent dynamic Canvas overlay, game render adapter, and runtime orchestrator.
- Four quality tiers are allocated from device capability; low-tier profiles reduce overlay budgets and parallax rather than modifying the source artwork.
- Canonical image path expected by runtime: `assets/nu-celestial-city.png`.
- Verified that this PNG is currently absent from the public repository (404). `assets/README.md` records a private archive blob and exact upload target. Until the original PNG is uploaded, the background engine correctly falls back to the existing procedural pixel-world layer.
- Offline support is not guaranteed; saves are localStorage only; no server accounts/cloud sync are present.
- The adaptive/network sampling module remains unchanged. The network sampler is a small same-origin HTTP probe, not ICMP or a comprehensive throughput test.

## 4. Pixel Art Studio added to Generation 1 library
New files:
- `pixel-art-studio.html`
- `nu-pixel-art-studio.js`

Library integration:
- Adds “N.U Pixel Art Studio” as a fourth Generation 1 library entry.
- Explicitly labels it as a creative tool, not a fourth core combat/collection game.
- It is deliberately excluded from the random gameplay pool; random launch continues to select only Bubble Hunt, Mana Collector and Chaos Attack.
- Adds a direct navigation link from the main menu.

Editor functions:
- Local file import for PNG, JPEG, WebP and GIF using createImageBitmap with an HTMLImageElement fallback. The image is processed in the user's browser; no upload endpoint or remote image transmission exists.
- Square pixel grids at 16, 24, 32, 48 and 64 cells.
- Aspect-ratio-preserving contain fit with transparent letterboxing.
- Local 16-color palette extraction/quantization from the imported image.
- Pencil, eraser, flood fill, color picker, custom color, palette swatches, undo/redo, clear/new canvas, and grid overlay toggle.
- SVG export creates grouped vector paths from pixel cells with transparent background and crisp-edge rendering. PNG preview export is also available.
- The SVG is vector geometry, not a bitmap hidden inside an SVG wrapper. The export is intended for editable downstream use; palette quantization is destructive relative to the original image, so retain the source image separately.

## 5. Candidate code fixes
- Chaos breach damage now has a visible transaction toast (no floating text over objects).
- HP pill feedback reports the actual restored HP amount.
- Added Pixel Art Studio navigation/library card, page, editor module, manifest entry and README documentation.
- No protected engine/runtime module was modified.

## 6. Static validation performed
- JavaScript syntax parsed successfully for `nu-games.js`, `nu-pixel-art-studio.js`, `nu-engine.js`, `nu-graphics-core.js`, `nu-background-engine.js`, `nu-dynamic-layers.js`, and `nu-graphics-runtime.js`.
- Manifest parsed as valid JSON.
- Read-after-write fetch verified all new/modified files on the feature branch.
- Git compare confirms the backup branch matches the original default branch and the feature branch is 9 commits ahead, 0 behind at the time of audit.
- Browser interaction, image-decoding compatibility, touch input, SVG rendering in target applications, download behavior, and low-end device performance have NOT yet been human/browser tested. Static parsing is not equivalent to end-to-end QA.

## 7. Human QA checklist
1. Open Pixel Art Studio from the main library and from the menu.
2. Import transparent PNG, JPEG, WebP and GIF; verify contain fit and palette.
3. Test pencil, eraser, bucket, picker, custom color, undo/redo, clear, grid toggle.
4. Export SVG and open it in at least two browsers and a vector editor; verify transparency and crisp pixels.
5. Export PNG and verify dimensions are grid size × 16.
6. Verify a fresh random game launch never selects Pixel Art Studio.
7. In Chaos Attack, allow one mass to breach; verify exactly -1 HP and warning toast.
8. Buy HP pills with >=10 XP; verify -10 XP, +1 inventory and reload persistence.
9. At HP below 10, consume one pill; verify inventory -1 and actual HP restoration; at 10/10 verify no use button.
10. Test touch and reduced-motion settings.

## 8. Open issues / next work
- Upload original owner-supplied `assets/nu-celestial-city.png` to the public repository; currently missing.
- Human review of the death penalty: XP truncation at zero HP and HP reset to 10.
- Verify Chaos damage + round-completion +1 HP interaction and the exact intended timing of HP pill use.
- Confirm whether HP pill purchase should be permitted during an active game or only from the store.
- Arcane shield charge/absorption and N-BI/Mana upgrade prices remain unfinalized.
- Standard Mana geometry, Bubble and Chaos visual polish remain open.
- Confirm offline cache/PWA behavior; no guaranteed offline mode.
- Generation 2 concepts and assets remain quarantined; do not merge them into this Gen1 candidate.

## 9. Source references
- MDN SVG download behavior: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/download
- MDN SVG preserveAspectRatio: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio
- N.U implementation repository and archive contain the primary project-specific implementation/governance evidence.
