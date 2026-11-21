# Pixel Art Studio 2D — Operational Checklist & Machine Verification

- Record date: 2026-11-21
- Status: OPERATIONAL CHECKLIST / REVALIDATE AGAINST CURRENT HEAD
- Product: N.U Pixel Art Studio 2D painting module
- Product code repository: `mobinabinshun-beep/mobinabinshun-beep`
- Canonical requirements archive: [Unified Persian checklist](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-21/PIXEL-ART-STUDIO-2D-TOOLS-UNIFIED-CHECKLIST-fa.md)
- Deferred-work record: [Deferred work / resume point](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-21/DEFERRED-WORK-PIXEL-ART-STUDIO-2D-TOOLS-fa.md)
- Scope issue: [Repository Issue #62](https://github.com/mobinabinshun-beep/Repository/issues/62)
- Candidate implementation: [PR #238](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/238)

> This file is the public code-repository execution checklist. The linked archive document remains the canonical detailed requirements record. Do not treat historical SHA values or CI runs as proof of the current default branch or live demo.

## 1. Mandatory version identity before comparison

Record these values for every verification session:

| Field | Required evidence |
|---|---|
| Default branch name | GitHub branch metadata |
| Current default-branch HEAD | Full commit SHA |
| Candidate branch / PR | Exact branch and PR number |
| Candidate HEAD | Full commit SHA |
| Live demo build identity | Deployment SHA/build metadata, or explicitly NOT CAPTURED |
| Runtime snapshot | Artifact/link and capture time, or NOT CAPTURED |
| Test environment | OS, browser/version, viewport, input device |
| Workflow evidence | Workflow name, run ID, tested SHA, conclusion |

Never compare a candidate against a remembered SHA without fetching the current refs. Never equate default-branch HEAD with the deployed GitHub Pages build. A missing runtime identity remains `NOT CAPTURED / UNVERIFIED`.

## 2. Status vocabulary

Use only these labels per checklist item:

- `PASS` — exact current SHA tested; reproducible evidence attached.
- `FAIL` — expected behavior failed; attach reproduction and logs.
- `BLOCKED` — verification cannot proceed; state the blocking dependency.
- `NOT-TESTED` — no valid execution evidence.
- `BASELINE-EXISTS` — previously implemented capability; recheck on current source.
- `CANDIDATE-ONLY` — present only on an unmerged candidate branch.
- `DEFERRED` — explicitly outside this delivery scope.

A test-file assertion, source inspection, CI badge, or old workflow run alone is not browser/device acceptance. Do not mark PASS without a tested SHA and evidence.

## 3. Scope and non-regression locks

- [ ] Changes remain limited to Pixel Art Studio and proven direct dependencies.
- [ ] Do not alter classic LV / XP / Mana HUD, Wallet/economy, Gateway/controller contracts, gameplay canvas routing, global CSS, Library, other games, or unrelated modules.
- [ ] Do not delete existing tools, data, tests, branches, or accepted behavior.
- [ ] Do not wholesale-merge historical Blueprint or Freeze/backup branches.
- [ ] Do not begin Animation, Onion Skin, FPS/GIF, Sprite Sheet, Tileset/Tilemap, vector-authoring, project-file/autosave/recovery, or full graphics-platform work in this scope.
- [ ] Inspect the exact diff; remove every unrelated path/change.

## 4. Existing baseline capabilities — verify, do not rebuild

- [ ] Brush, eraser, fill, picker, line and shape tools.
- [ ] Textured brush, brush shapes/density and symmetry.
- [ ] Rectangular and free/Lasso selection; move and resize selection.
- [ ] Linear/radial gradients and layer masks.
- [ ] Layers, groups, visibility, lock, opacity and blend modes.
- [ ] Undo/Redo across painting, selection, masks, transforms and layer changes.
- [ ] Zoom, fit-to-view, pan and pointer-coordinate mapping.
- [ ] Local import with original preserved and independent working copy.
- [ ] Palette conversion, color-count controls, transparency, resampling and dithering.
- [ ] PNG, SVG, Graphic IR and ICO exports.
- [ ] Existing Blueprint center point, center axes, 1/4/8/16 divisions and pixel-grid overlay.

## 5. Candidate additions — verify separately from baseline

The following were recorded as candidate work in PR #238; re-fetch PR status and head SHA before relying on this list:

- [ ] Invert selection without mutating the source mask.
- [ ] Fading Brush with intensity 1–100 and shared brush-size control.
- [ ] Free rotation of active layer / selected region using nearest-neighbour sampling.
- [ ] Two-finger canvas-view rotation, independent of pixel-data rotation.
- [ ] Safe cancellation/transition between pointer strokes and multi-touch gestures.
- [ ] Blueprint boundary, ruler, divisions, angular axes and depth axis controls.
- [ ] Selection clipping for clear, replace, chroma-key, image overlay and raster text.
- [ ] Quick-toolbar and transform-panel integration; active tool is clearly visible.

## 6. Focused machine-test matrix

### Selection and clipping
- [ ] Invert-selection mask is the exact complement; source mask remains unchanged.
- [ ] Rectangular, irregular and holed selections behave correctly.
- [ ] Inside-selection operations affect only selected pixels.
- [ ] Outside-selection pixels remain byte-for-byte unchanged.
- [ ] Deselect restores the previous tool and expected selection state.
- [ ] Undo/Redo restores pixels, selection and active-layer metadata correctly.
- [ ] Clear/replace/chroma-key/overlay/raster-text clipping is covered independently.

### Fading Brush
- [ ] Intensity boundaries 1 and 100 plus representative intermediate values.
- [ ] Repeated stroke accumulation and alpha/transparency behavior.
- [ ] Brush diameter, texture and symmetry interaction.
- [ ] Selection clipping and locked-layer behavior.
- [ ] Undo/Redo restores the exact pre-stroke state.
- [ ] Invalid intensity inputs are rejected or clamped by a documented contract.

### Pixel-data rotation
- [ ] Angles 0, +45, -45, +90, -90 and 180 degrees.
- [ ] Rectangular canvases; odd/even width and height.
- [ ] Transparent pixels, edge clipping and nearest-neighbour determinism.
- [ ] Irregular selection and holes; outside-selection pixels untouched.
- [ ] Rotation center, direction and rounding rules have explicit expected coordinates.
- [ ] Undo/Redo restores exact original pixels.

### Canvas-view gestures and pointer mapping
- [ ] Two-touch rotate, zoom and pan on supported touch devices.
- [ ] One-finger drawing remains correct when no multi-touch gesture is active.
- [ ] pointercancel, lost pointer capture and touch interruption do not leave stuck state.
- [ ] Pointer-to-canvas mapping remains correct after rotate/zoom/pan.
- [ ] Gesture rotation never mutates image pixel data.
- [ ] Mouse, pen and touch behavior do not regress.

### Blueprint and export
- [ ] Existing 1/4/8/16 division control remains available and consistent.
- [ ] New guide toggles and axes have deterministic geometry and clear active state.
- [ ] Guide overlays, selection outlines and rulers never appear in PNG/SVG/ICO/Graphic IR exports.
- [ ] Export dimensions, alpha, color and composite remain correct.

### Historical regression gates
- [ ] PR #18 — viewport, fit, pointer mapping, import and working copy.
- [ ] PR #22 — bootstrap selector helper/listener registration.
- [ ] PR #27 — preserve source dimensions.
- [ ] PR #28 — raster mapper/device budget.
- [ ] PR #162 — SVG/ICO, filled shapes and symmetry.
- [ ] PR #163 — selection, gradients, textured brush, Bezier, masks, groups and blend modes.

## 7. Required test execution and evidence

Run focused tests first, then the relevant Studio regression suite, export checks, graphics preview checks, lint/build, and applicable shared-system regressions. Use the repository's actual scripts/workflows; do not invent command names.

For every run, record:
1. exact command or workflow name;
2. workflow run ID and URL (for CI);
3. exact tested commit SHA;
4. environment and relevant browser/device;
5. test names and pass/fail counts;
6. logs/artifacts and reproducible failure details.

Historical PR #238 workflow IDs previously recorded include 44894499113, 44894499121, 44894499123 and 44894499062, plus 44894551138, 44894551010, 44894551048 and 44894550993. Treat them as historical evidence only; fetch each run and confirm its tested SHA and conclusion before citing it for a decision. Earlier notes identified tested SHA `c1dde9c2fe76e350a0c4e88263865d6623a9d759` and candidate HEAD `662b40d507017ed84a82d7b9a1b88c5e0cdc374e`; revalidate both against GitHub.

## 8. Human QA and release gates

- [ ] Machine checks pass on the exact candidate SHA.
- [ ] Candidate is preserved as a verified checkpoint; record exact ref/SHA.
- [ ] Live demo build identity and runtime snapshot are verified before deployment; otherwise keep deployment gate blocked and report the missing evidence.
- [ ] Browser smoke test is performed on the exact deployed build.
- [ ] Real touch-device QA covers two-finger gestures and drawing transitions.
- [ ] Human QA records expected/actual result, device, OS, browser, viewport, input method and evidence.
- [ ] Owner acceptance is recorded separately from machine approval.

CI PASS is not live-build proof, device QA, owner acceptance, or production promotion.

## 9. Deferred roadmap — not part of this delivery

- Animation timeline, Onion Skin, FPS and GIF export.
- Sprite sheets, tilesets and tilemaps.
- Full vector authoring / Bezier editor.
- Native project files, autosave, recovery, version history and package builder.
- Multi-renderer Canvas2D/WebGL/WebGPU platform, advanced image analysis/vectorization, provenance pipeline and standalone cross-platform app.

Reopen these only through a separately scoped owner decision and requirements record.

## 10. Verification record template

Copy this block into the relevant change record for each run:

```text
Verification date/time:
Default branch + HEAD SHA:
Candidate PR/branch + HEAD SHA:
Live build SHA / identity:
Runtime snapshot: CAPTURED / NOT CAPTURED
OS / browser / version:
Viewport:
Input device:
Workflow / command:
Run ID + URL:
Test names:
PASS:
FAIL:
BLOCKED:
NOT-TESTED:
Artifacts / logs:
Human QA status:
Owner acceptance:
Known limitations:
```

## 11. Resume procedure

1. Read this file, root `AGENTS.md`, and the linked canonical archive checklist and deferred-work record.
2. Fetch the current default branch, backup ref, PR #238 and all relevant SHAs; compare them rather than trusting this dated record.
3. Inspect the current Studio source, tests, workflow definitions and exact diff.
4. Re-run the machine matrix against the current source/candidate SHA.
5. Record results and unresolved gaps in a dated Change Record.
6. Keep the runtime snapshot/deployment status truthful; do not deploy while a mandatory safety gate is unresolved.
7. Hand the exact deployed build to human QA only after the applicable machine and runtime gates pass.

No code change, deployment, PR merge, or human acceptance is authorized merely by this checklist.


## Owner addendum — Mobile touch UX and cross-page Gateway audit (2026-11-21)

Requirements and source-level inventory are documented in:
[PIXEL-ART-STUDIO-MOBILE-TOUCH-UX-AND-GATEWAY-AUDIT-2026-11-21.md](./PIXEL-ART-STUDIO-MOBILE-TOUCH-UX-AND-GATEWAY-AUDIT-2026-11-21.md).

This addendum adds the following required scope before implementation:
- Full-viewport mobile workspace, with canvas as the dominant usable surface and safe-area/visual-viewport handling.
- Compact collapsible edge rails and categorized tool drawers; quiet recognizable icons, accessible names and active-tool indication.
- A circular single-axis viewport rotation dial with zoom-in/out, zoom percentage and reset; viewport transforms must never mutate artwork pixels.
- Portrait, landscape-left and landscape-right support, with control placement aligned to the physical bottom edge and no forced OS orientation lock.
- Separate selected-artwork rotation with preview/cancel/commit, outside-selection pixel preservation and exact Undo/Redo.
- Gateway touch/route audit on every intended page, including short tap, hold, multi-touch, orientation changes, safe areas, route correctness and desktop/controller regressions.

Initial root HTML inventory: shared Gateway assets are present in index.html, launcher.html, casino.html and pixel-art-studio.html; absent in 404.html, background-candidates.html and exchange.html. All four Gateway-enabled pages declare a viewport meta tag. This is static source inspection only, not mobile browser/device verification. Nested pages and iframes remain to be inventoried.

**Status: DOCUMENTED / IMPLEMENTATION NOT STARTED.** No executable source was changed in this documentation step. Before coding, recheck locks, baseline and backup; implement on an isolated branch; run automated and physical-device QA; deliver only a demo QA candidate.
