# N.U Creative Studio — original-dimension import acceptance

**Scope:** Generation 1 browser Studio only. Launcher packaging and native platform work remain deferred until Studio human acceptance.

## User-visible import contract
- Supported browser-decodable image files are imported locally (PNG, JPEG, WebP, GIF and SVG where the browser can decode them).
- The default import mode preserves the decoded source width and height exactly.
- The original source file remains untouched and is kept separately from the editable working copy.
- Reduced-detail import is an explicit user selection; the Studio never silently scales an image to satisfy the device budget.
- If the source exceeds the safe browser edge or pixel budget, import is rejected with the measured dimensions, safe budget and a clear next step. The source file is not changed.
- The current upload limit remains 25 MB; browser decoding and per-device canvas limits still apply.

## Performance safeguards
- The existing graphics profile's maxCanvasPixels is honored (bounded at 3,000,000 pixels); fallback budget is 520,000 pixels.
- High-resolution preview rendering uses one ImageData write rather than one fillRect call per source pixel.
- Undo history is bounded according to working-image size to avoid retaining dozens of full-resolution copies.
- Canvas edges are capped at 16,384 pixels for browser safety.

## Acceptance tests
- Default import retains exact decoded width and height.
- Explicit reduced-detail choices create a separate working copy and do not alter the original file.
- Over-budget original imports fail visibly instead of silently downscaling.
- Existing palette mapping, transparency, dithering, layers, drawing and export tests continue to pass.

## Deferred
Native desktop packaging, offline installation, launcher module registry, extension signing/sandboxing, cross-platform adapters and launcher-to-game integration are not part of this Studio milestone.
