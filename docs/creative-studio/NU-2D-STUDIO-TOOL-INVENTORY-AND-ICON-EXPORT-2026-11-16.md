# N.U Pixel Art Studio — 2D Tool Inventory & Icon Export
**Record:** NU-STUDIO-2D-ICON-EXPORT-2026-11-16  
**Status:** implemented candidate; Studio regression CI passed; owner visual acceptance pending  
**Scope:** current Generation 1 browser-based 2D Studio only

## Owner-directed scope
Improve the existing two-dimensional editor so the owner can design the N.U application icon. Do not begin the deferred Creative Suite, animation or package-builder work in this change. The owner controls when future phases start.

## Existing tools found in the repository
- Drawing: pencil, eraser, bucket fill, eyedropper, line, outlined rectangle, outlined ellipse; brush size 1–16.
- Canvas: 16/24/32/48/64 presets, independent width/height, aspect lock, nearest-neighbor resize, zoom 25–800%, fit and scroll.
- Color: built-in/custom palette, palette extraction, import color reduction, transparency cutoff, optional Floyd–Steinberg dithering.
- Import: browser-local PNG, JPEG, WebP, GIF and SVG where the browser decoder supports it; original dimensions by default; source file retained separately.
- Layers: four layers, active-layer selection, visibility, lock and opacity; visible composite rendering.
- Editing: crop, horizontal/vertical mirror, 90°/180° rotation, negative, brightness, contrast, saturation, warm/cool, RGB offsets, shine, fade, sharpen, overlay image, chroma-key removal and rasterized text.
- History: bounded undo/redo snapshots.
- Export: PNG (1×/2×/4×/8×/16×), SVG vector paths, SVG embedded-raster fallback, SVG source text and NU-GFX-IR/2 machine-readable data.

## 2D additions in this candidate
- Filled rectangle and filled ellipse tools.
- Paint symmetry: off, horizontal, vertical, or horizontal + vertical; applies to brush strokes and shape drawing.
- SVG reliability: vectorize the exact visible composite snapshot; reject a truly empty canvas; use an embedded PNG fallback if non-empty artwork yields no vector paths or exceeds the vectorizer limit; ensure the XML contains real line breaks and a self-contained PNG data URI.
- Windows icon export: multi-resolution .ico with 16, 24, 32, 48, 64, 128 and 256 px entries. Each entry is a 32-bit BGRA DIB with an AND transparency mask; this avoids PNG-compressed ICO entries and retains compatibility with older Windows icon readers.
- Non-square art is centered into a square icon without stretching; transparent padding is preserved.
- PNG, SVG and NU-GFX-IR remain independent output paths.

## Terminology: ICO vs ISO
For an application icon, the Windows icon container is .ico. .iso is a disk-image format, not an icon format. This implementation interprets the requested ISO icon as ICO. If a disk-image ISO was intended, that is a separate packaging task and is not included.

## Icon design acceptance
- Export includes all listed dimensions and valid directory offsets/payload lengths.
- 32-bit alpha and AND mask preserve transparent regions.
- DIB headers have correct dimensions (height stored doubled), one plane and 32 bits per pixel.
- Test the generated ICO in a Windows icon viewer; if Windows XP remains a target, include an XP-compatible viewer or real XP VM test.
- SVG opens as a visible self-contained image; verify path-based and embedded-raster fallback branches.
- PNG transparency and all previous import/layer/IR tests remain green.

## Protected boundaries
- Existing freeze branches are read-only.
- No Generation 1 gameplay, wallet/economy, adaptive runtime or protected HUD changes.
- Preserve local-only import and original source bytes.
- Automated CI is evidence only; deployment and human visual acceptance are separate.


## Machine verification record
- Candidate commit tested: 743b977c818d288ebd40c6fe3ad9031d6c00f902
- Workflow: N.U Studio export regression gates
- Run: https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/43877071226
- Result: PASS — syntax checks and 245 Node tests, 245 passed / 0 failed
- Human browser and Windows shell checks remain pending.


## Professional 2D tool expansion — implementation candidate
- Rectangular selection and freehand lasso selection.
- Move and nearest-neighbour scale of selected pixels, constrained to canvas bounds.
- Linear and radial gradients, clipped to the active selection when present.
- Square, circular and diamond brush footprints with deterministic dot, diagonal and grain textures.
- Quadratic Bezier curve drawing with adjustable curvature.
- Per-layer non-destructive binary masks with add, invert, apply, remove and mask-paint modes. Masks are currently binary (visible/hidden), not continuous grayscale alpha masks.
- Per-layer blend modes, group assignment, and group-level visibility/opacity controls. Groups are named collections, not nested folder trees.
- Selection and mask state are included in undo/redo snapshots; resizing and transforms preserve layer data.
- This phase remains separate from animation, spritesheets, tilemaps, vector authoring and package management, which remain archived.
