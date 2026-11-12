# N.U Generation 1 — Adaptive Pixel Art Workspace
**Record:** NU-G1-ADAPTIVE-PIXEL-WORKSPACE-2026-11-12  
**Scope:** Generation 1 Pixel Art Studio only  
**Branch:** `feature/gen1-adaptive-pixel-workspace-2026-11-12`

## Delivered in this candidate
- Connect Pixel Art Studio to the existing `nu-graphics-core.js` capability/budget profile. The shared graphics core itself is not modified.
- Show the detected tier and use its `maxCanvasPixels` budget as a conservative cap for editable artwork. If a resize exceeds the cap, refuse it with a readable message rather than allocating an oversized pixel array.
- Separate the resizable editing workspace frame from the actual pixel-art dimensions.
- Workspace width/height sliders and zoom slider; frame also supports native drag-resize and scroll access when larger than the viewport.
- Independent rectangular artwork width and height controls (1–2048) with optional aspect-ratio lock.
- Nearest-neighbor resampling for resizing the working artwork to preserve crisp pixel edges.
- SVG and PNG export use the current rectangular artwork dimensions.
- Undo/redo snapshots include dimensions as well as pixel data.
- Original imported file is never modified or uploaded; import and resampling happen in browser memory.

## Design boundaries
- Workspace frame dimensions affect only the editing viewport.
- Zoom affects display size only.
- Artwork dimensions affect the pixel grid and exports.
- Device tier limits the editable pixel-cell budget; it does not silently reduce the source file or change export quality.
- No changes to `nu-engine.js`, network sampling, shared game logic, core graphics runtime, or Generation 2 repositories.
- The three core games remain the only random gameplay pool; Pixel Art Studio remains a library tool.

## Existing capability-profile limitations
The existing graphics core uses browser-provided hints (hardware concurrency, approximate device memory, Save-Data and the existing sampler when present). It is a conservative heuristic, not a GPU benchmark or guarantee of browser memory. The Studio does not run continuous stress tests. Human testing is required on low-memory phones, desktop browsers, touch devices, and large/rectangular images.

## Static validation
- Editor JavaScript syntax parsed with Node-compatible JavaScript parser.
- Manifest JSON parsed successfully.
- HTML includes both local scripts: graphics core and Studio module.
- GitHub Actions is configured to run JS syntax, manifest, and local script-reference checks for this branch.
- No browser end-to-end tests have yet been run.

## Human QA
1. Resize workspace width/height independently and drag its bottom-right resize handle.
2. Zoom from 25% to 400%; verify scroll access at high zoom.
3. Resize artwork width and height with aspect lock on and off.
4. Verify nearest-neighbor preserves hard pixel edges.
5. Import a landscape and portrait image into a rectangular canvas; confirm contain fit and transparency.
6. Undo and redo a dimension change; verify both pixels and dimensions restore.
7. Export SVG and PNG; verify exact dimensions match the working artwork.
8. Try a canvas beyond the reported device budget; confirm a safe refusal.
9. Test on a low-memory mobile browser and a desktop browser.
