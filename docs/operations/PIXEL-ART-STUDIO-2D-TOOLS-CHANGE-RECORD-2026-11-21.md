# Pixel Art Studio 2D Tools — Change & QA Record

**Date:** 2026-11-21  
**Issue:** #62 — deferred Pixel Art Studio 2D tools  
**Candidate branch:** `feat/pixel-art-studio-2d-tools-2026-11-21`  
**Draft PR:** [#238](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/238)  
**Baseline:** `e1428c2501901975cc3410159bb89216b9459922`  
**Initial machine-tested candidate:** `5933090148a20bfe4f12d8e1a0d8896381ac4da4`  
**Verified implementation head:** `dc3c37567c53df3899d677f8069dde15fe1ebaf9`  
**Runtime snapshot:** `NOT CAPTURED`

## Scope authorized for this candidate

1. Fading Brush with adjustable size and intensity.
2. Correct and explicit selection inside/outside behavior.
3. Two-pointer viewport rotation, independent of artwork transforms.
4. Free rotation for the active layer and selected pixels.
5. Blueprint, ruler, divisions, grid, angular and depth-axis overlays.
6. Grouped/collapsible tool categories in the Studio sidebars.

## Protected boundaries

- The backup branch `backup/pixel-art-studio-pre-two-tools-2026-11-21` is immutable.
- Do not modify Classic LV / XP / Mana HUD, XP/Mana calculations, game rules, saves, wallet, Gateway/controller contracts, or unrelated games.
- Do not use Studio changes as a reason to touch XP/Mana functions.
- No production merge, public runtime deployment, or release claim is authorized by machine-test approval alone.

## Existing candidate implementation

The incremental candidate now includes the following scoped implementation in `nu-studio-pro-tools.js` and `nu-pixel-art-studio.js`:
- `invertSelection` complements a mask without mutating its input.
- `rotatePixels` rotates a raster layer/selection around the canvas center with nearest-neighbor sampling.
- `rotatePoint` rotates geometry around an arbitrary center.\n- `fadePixel` blends brush color against the current pixel or a neutral transparent-canvas underlay at a validated 0–100 intensity.\n- Studio UI exposes a Fading Brush and intensity slider; the active layer can be rotated by a free angle, with an existing selection constraining the transform.\n- Two-touch gestures rotate the viewport using a CSS view transform and inverse pointer-coordinate mapping; reset affects the view only, not artwork pixels.\n- Blueprint boundary, ruler ticks, division guides, orthogonal axes and depth-axis overlays can be toggled independently. Existing tool categories remain grouped in collapsible sidebar panels and tabbed dock sections.

Focused tests were added in `tests/nu-studio-pro-tools.test.js`, and the dedicated Node 22 workflow is `.github/workflows/pixel-art-studio-machine.yml`.

## Machine evidence (initial candidate)

At candidate SHA `5933090148a20bfe4f12d8e1a0d8896381ac4da4`, these Actions runs completed successfully:
- Pixel Art Studio machine checks — run `44883360063`
- Studio export regression gates — run `44883360052`
- Graphics preview smoke checks — run `44883360087`
- Arcane Shield and Mana regression — run `44883360027`

Initial candidate checks passed at `5933090148a20bfe4f12d8e1a0d8896381ac4da4`. The expanded implementation first exposed an incorrect test expectation for an unselected pixel overwritten by a selected rotation; the assertion was corrected to verify an untouched pixel outside the transformed destination. At exact head `dc3c37567c53df3899d677f8069dde15fe1ebaf9`, all four workflows completed successfully: Pixel Art Studio machine checks (run `44894299002`), Studio export regressions (run `44894298990`), graphics preview smoke checks (run `44894299013`), and Arcane Shield/Mana regression (run `44894299072`).

## Outstanding work

The current candidate contains first-pass integration for fading brush, free layer/selection rotation, two-touch viewport rotation, guide overlays, and grouped tool navigation. Remaining work includes deeper selection inside/outside scenario coverage, validating all gesture edge cases and transform correctness, adding browser-level interaction tests, confirming ruler/blueprint usability at multiple zooms, full regression coverage, and exact-head CI verification. This remains a first-pass implementation, not a human-QA-ready release.

## Release gates

1. Complete scoped implementation on the candidate branch only.
2. Run syntax checks, focused tests, full relevant regression workflows, and inspect all changed paths against the protected boundaries.
3. Record the exact final candidate SHA and successful workflow run IDs.
4. Verify a runtime/build identity and capture a runtime snapshot before any demo deployment. Until then, runtime remains `NOT CAPTURED`.
5. Human QA must use the exact verified build and cover desktop pointer, touch, two-pointer gestures, selection boundaries, layer transforms, guide toggles, undo/redo, and mobile layout.
6. Do not merge or promote to production without explicit owner acceptance after QA.

## Status

**DOCUMENTED / FIRST-PASS IMPLEMENTATION — MACHINE PASS at `dc3c37567c53df3899d677f8069dde15fe1ebaf9`; NOT COMPLETE; HUMAN QA NOT READY; DEPLOYMENT BLOCKED.**
