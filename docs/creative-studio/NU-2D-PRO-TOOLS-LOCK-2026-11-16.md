# N.U Studio — Professional 2D Tools Freeze

**Frozen scope:** Phase A — professional 2D painting and selection tools  
**Frozen source commit:** \`2dcb1eda62da24fbd1b871e704650442da08a133\`  
**Feature branch:** \`feat/studio-2d-professional-tools-2026-11-16\`  
**Recovery branch:** \`freeze/studio-2d-pro-tools-2026-11-16\`  
**Verification:** [Studio regression run](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/43881024031) — PASS, 262/262 tests.

## Frozen capabilities
- Rectangular and freehand lasso selection, selection outline, select all/invert/deselect.
- Move and nearest-neighbour scale of the selected region.
- Linear and radial gradients, clipped to the active selection.
- Square, circular and diamond brush tips; dot, diagonal and deterministic grain textures.
- Adjustable quadratic Bezier curve strokes.
- Selection-aware brush, fill and color adjustments.
- Per-layer binary non-destructive masks with add, invert, mask-paint, apply and remove.
- Per-layer blend modes and named layer groups with group visibility and opacity controls.
- Selection, masks, layer metadata and group state participate in undo/redo snapshots.

## Known limits (not defects hidden by the freeze)
- Masks are binary, not grayscale alpha.
- Groups are named layer collections with visibility/opacity, not nested folders.
- Bezier strokes are not editable node-based vector paths.
- Custom brush-tip import is not included.
- Animation, sprite/tilemap authoring, vector path editing and package building remain archived.

## Change control
1. Keep the recovery branch read-only.
2. Reopen this frozen scope only with the owner's instruction.
3. Preserve the earlier icon/export freeze and all existing import/export regression gates.
4. Do not begin archived future phases as part of maintenance to this 2D toolset.
5. Browser pointer interaction and real device performance still require human QA.

This document is a repository-level freeze record. GitHub server-side branch protection must be enabled separately by a repository administrator if enforced immutability is required.
