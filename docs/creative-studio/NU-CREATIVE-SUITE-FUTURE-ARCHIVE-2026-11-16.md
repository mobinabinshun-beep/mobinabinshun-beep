# N.U Creative Suite — Deferred Roadmap Archive
**Record:** NU-CREATIVE-SUITE-FUTURE-ARCHIVE-2026-11-16  
**Status:** ARCHIVED / NOT SCHEDULED / NOT IMPLEMENTED  
**Decision authority:** project owner

This document preserves the discussed future program. It is not authorization to begin implementation. The owner decides when to start, sequence it, and which application or workflow will manage the program.

## Deferred phases
### A — Professional 2D painting and editing
Advanced brush presets/custom brushes, freehand selection, move/transform selection, gradients, texture brushes, Bezier/curve tools, non-destructive masks, layer groups and blend modes.

### B — Animation
Frame timeline, frame duplication/reordering, onion skin, FPS controls, loop preview, animated GIF export and frame metadata.

### C — Game-art asset production
Sprite, sprite sheet, tileset, tilemap, character sheets, backgrounds, visual effects, UI assets and reusable palette libraries.

### D — Vector authoring
Editable Bezier paths, nodes/handles, stroke/fill controls, gradients, SVG import as editable geometry and vector path editing.

### E — Project management and packaging
Editable project format, autosave/recovery, version history, asset metadata, N.U asset package builder, manifest, previews, validation report and reproducible exports.

### F — QA and platform compatibility
Dimension/palette/alpha/frame validation, naming conventions, size budgets, package compatibility, low-memory testing and eventual integration with the native N.U runtime.

## Proposed future project package (archive only)
N.U-Asset-Project/
- project.nuasset
- manifest.json
- source/ — editable SVG, raster source and Graphic IR
- sprites/ — sprite sheets and animation metadata
- tiles/ — tileset and tilemap data
- palettes/ — palette definitions
- previews/ — visual previews
- validation/ — machine-readable QA report

## Governance
- No future phase starts automatically.
- Do not replace or destabilize the current 2D Studio to prepare for future phases.
- Keep the current 2D icon-design milestone independent.
- The owner controls scope, priority, milestones, tool selection and project-management process.
- When the owner later opens a phase, review this archive and create a separate scoped plan, branch, tests and acceptance record.
