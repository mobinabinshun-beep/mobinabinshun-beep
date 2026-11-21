# Pixel Art Studio 2D Tools — Change & QA Record

**Date:** 2026-11-21  
**Issue:** #62 — deferred Pixel Art Studio 2D tools  
**Candidate branch:** `feat/pixel-art-studio-2d-tools-2026-11-21`  
**Draft PR:** [#238](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/238)  
**Baseline:** `e1428c2501901975cc3410159bb89216b9459922`  
**Initial machine-tested candidate:** `5933090148a20bfe4f12d8e1a0d8896381ac4da4`  
**Verified implementation head:** `c1dde9c2fe76e350a0c4e88263865d6623a9d759`  
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

Initial candidate checks passed at `5933090148a20bfe4f12d8e1a0d8896381ac4da4`. The expanded implementation first exposed an incorrect test expectation for an unselected pixel overwritten by a selected rotation; the assertion was corrected to verify an untouched pixel outside the transformed destination. At code head `dc3c37567c53df3899d677f8069dde15fe1ebaf9`, all four workflows passed. A follow-up hardening commit `921088f1381d8a419be305aa69f692dc3a6a2789` additionally cancels in-progress paint/selection gestures when a two-touch viewport gesture begins and normalizes angle wraparound. All five runs for that head passed. The follow-on selection-clipping patch applies selection consistently to clear, color replacement, chroma-key removal, image overlays and rasterized text, with a dedicated regression assertion. Ruler tick marks and diagonal angular axes were refined. At exact code head `c1dde9c2fe76e350a0c4e88263865d6623a9d759`, all six runs passed: Pixel Art Studio machine checks (PR run `44894499113`, push run `44894494454`), Studio export regressions (PR run `44894499121`, push run `44894494465`), graphics preview smoke checks (run `44894499123`), and Arcane Shield/Mana regression (run `44894499062`).

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

**DOCUMENTED / FIRST-PASS IMPLEMENTATION — MACHINE PASS at `c1dde9c2fe76e350a0c4e88263865d6623a9d759`; NOT COMPLETE; HUMAN QA NOT READY; DEPLOYMENT BLOCKED.**


## Latest machine verification — 2026-11-21

**Verified application/test code SHA:** `9afab37c373091482d2010350a219856e46728d2`

The code review found and fixed a Fading Brush integration defect: the old wrapper blended every brush cell against the stroke-origin pixel. It now calls `fadePixel(pixels[key], ...)` per destination cell, preserving each cell's own underlay. A regression test asserts this behavior.

Additional test coverage now includes:
- Exact pixel coordinates for +90°, −90°, 180° and identity rotation.
- Non-square 4×3 canvas rotation.
- Selection hole and preservation of a pixel outside the selected region.
- Fading intensity endpoints 1 and 100 on opaque and transparent pixels, plus the existing midpoint test.
- Empty, full and irregular selection inversion.
- Workflow execution of `nu-studio-advanced-tools.test.js` in the dedicated Node 22 job.

At the exact SHA above, all four PR workflow families passed:
- Pixel Art Studio machine checks — PR run **44900204189**, push run **44900200008**.
- Studio export regression gates — PR run **44900204242**, push run **44900200074**.
- Graphics preview smoke checks — PR run **44900204214**.
- Arcane Shield/Mana regression — PR run **44900204219**.

The dedicated Studio job completed successfully; its log reports **47 tests, 47 passed, 0 failed, 0 skipped**. Syntax checks passed. Export, graphics smoke and adjacent regression workflows also passed.

**Machine status:** PASS for the candidate code at the exact SHA above. **Controlled human QA may begin against this exact candidate build.** This does not mean full Issue #62 acceptance: browser/device touch behavior, visual QA, Undo/Redo end-to-end, export-overlay exclusion, and owner review remain open. Runtime snapshot remains `NOT CAPTURED`; no merge, production deployment, or release is authorized.


## Owner instruction update — demo QA is not release (2026-11-21)

The owner's latest direct instruction supersedes older wording that treats public-demo delivery as publishing:
- Demo deployment is only a QA handoff; it is not a product release, launch, stable publication or production promotion.
- The exact machine-passed candidate may be placed on the public demo after the mandatory runtime baseline and exact candidate backup gates, labelled `TEST CANDIDATE — NOT HUMAN-APPROVED`.
- Any beyond-demo release requires BOTH explicit human acceptance of the exact demo build/scope and a separate direct, unambiguous owner instruction naming the release action.
- No CI result, demo deployment, merge, tester PASS, silence or general human acceptance can substitute for that second instruction.


## Demo-only human QA candidate — exact current evidence (2026-11-21)

**State:** `MACHINE-APPROVED / DEMO-QA-PENDING`  
**Exact code/test candidate SHA:** `6db7811e2481756f93f8225613c88d281f071714`  
**Core Studio implementation logic SHA shown on the page:** `9afab37c373091482d2010350a219856e46728d2`  
**PR:** #238 — still Draft/open at time of this record.

### Machine evidence on the exact candidate SHA

- Pixel Art Studio machine checks — PR run **44903476403** PASS; push run **44903474023** PASS.
- Studio export regressions — PR run **44903476442** PASS; push run **44903474080** PASS.
- Arcane Shield/Mana regression — PR run **44903476426** PASS.
- Graphics preview smoke — PR run **44903476449** PASS.
- Gateway main-game regression — PR run **44903476397** PASS.
- Dedicated Studio job: **48 tests, 48 passed, 0 failed, 0 skipped**; syntax checks passed.
- The Studio page now visibly displays `TEST CANDIDATE — NOT HUMAN-APPROVED · DEMO QA ONLY` and its core implementation logic SHA.

### Verified recovery points

- Exact candidate backup: `backup/pre-public-demo-pixel-art-studio-candidate-2026-11-21-r4` — identical to candidate SHA `6db7811e2481756f93f8225613c88d281f071714` (0 ahead / 0 behind).
- Pre-demo source backup: `backup/pre-pixel-art-studio-demo-before-merge-2026-11-21` — identical to pre-demo source `f475e75cdb7e16d4b14a646fe57cfb5e0ccbd266` (0 ahead / 0 behind).
- Earlier candidate backups r1–r3 and baseline backup branches remain preserved.

### Runtime baseline snapshot

- Snapshot: `archive/runtime-baseline/NU-PUBLIC-DEMO-20261121T121811Z-f9b42ac/`
- Source tree: 280 tracked blobs, exact Git tree/blob SHA index.
- GitHub Pages baseline run **44903305930** deployed Pages build version `f39f4f2d175e1fa751cb2329c2b63407e9e38efd` successfully; the source delta from parent `f9b42ac...` is only the two snapshot documentation files.
- Snapshot state remains **PARTIAL**: direct external HTTP response/cache and browser runtime-state capture were unavailable. Source-level pre-demo backup and Pages deployment identity are verified; do not claim a complete runtime snapshot.

### Human QA handoff

Instructions: [PIXEL-ART-STUDIO-2D-HUMAN-QA-HANDOFF-2026-11-21.md](./PIXEL-ART-STUDIO-2D-HUMAN-QA-HANDOFF-2026-11-21.md)

Demo target after candidate deployment:
https://mobinabinshun-beep.github.io/mobinabinshun-beep/pixel-art-studio.html

Human QA has not yet been performed. Required areas include fading brush, selection inside/outside, free rotation, two-finger viewport rotation, Blueprint overlays, Undo/Redo, import/export, guide exclusion from exports, desktop/mobile/touch and regression boundaries.

### Authority boundary

This candidate is for **demo-only human QA**, not product release. The owner has explicitly directed that no release, production promotion, stable publication, package/store release or launch may occur unless the owner first accepts human QA for the exact demo build/scope and then issues a separate direct instruction naming the specific release action. No such release instruction is part of this task.


### Final workflow revision verification

- Final branch/workflow revision: `4b817ed5b8fc1b9aff3f79db94588a7a8acfc06d` (the application/test source remains the exact code candidate `6db7811e2481756f93f8225613c88d281f071714`; this revision adds the docs-path trigger so QA handoff changes also run CI).
- Pixel Art Studio PR run **44903671261** PASS; push run **44903667233** PASS — **48/48 tests, 0 failed, 0 skipped**.
- Studio export PR run **44903671292** PASS.
- Arcane Shield/Mana PR run **44903671265** PASS.
- Graphics preview PR run **44903671284** PASS.
- Gateway main-game PR run **44903671277** PASS.
- Candidate backup `backup/pre-public-demo-pixel-art-studio-candidate-2026-11-21-r4` remains identical to the application/test source SHA `6db7811e2481756f93f8225613c88d281f071714`; final branch state receives a separate exact-ref backup before demo merge.


## Public demo QA deployment — verified by GitHub Pages (2026-11-21)

- PR #238 was merged to the configured GitHub Pages source solely to make the candidate available for human QA.
- Merge / Pages build SHA: `c35e5b2edec0d48a0d255ed78ce77a207a241a5f`.
- Pages workflow: [run 44903824271](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44903824271) — **SUCCESS**.
- Jobs: build SUCCESS, deploy SUCCESS, report-build-status SUCCESS.
- The deploy job recorded Pages build version `c35e5b2edec0d48a0d255ed78ce77a207a241a5f` and environment URL https://mobinabinshun-beep.github.io/mobinabinshun-beep/.
- Human test page: https://mobinabinshun-beep.github.io/mobinabinshun-beep/pixel-art-studio.html.
- The page visibly identifies itself as `TEST CANDIDATE — NOT HUMAN-APPROVED · DEMO QA ONLY` and displays the core logic SHA.
- Candidate backup: `backup/pre-public-demo-pixel-art-studio-candidate-2026-11-21-final-r3` — identical to the final pre-merge branch head `dd38bdf8ba2b7d55e2733d6e51930b0260a097e2`.
- Pre-demo source backup: `backup/pre-pixel-art-studio-demo-before-merge-2026-11-21` — identical to `f475e75cdb7e16d4b14a646fe57cfb5e0ccbd266`.

**Post-deploy verification boundary:** GitHub Pages build/deploy is confirmed successful and reports the exact build SHA/URL. Direct external HTTP body/cache read-back and real browser interaction could not be independently captured through the current verification interface. Therefore the Pages workflow is PASS, while direct HTTP/browser smoke is **UNVERIFIED / delegated to human QA**.

**Human QA:** `HUMAN-QA-PENDING`. Use the linked handoff document for desktop/mobile/touch, selection, rotation, Fading Brush, Blueprint, Undo/Redo and export checks.

**Authority:** this is a demo-only QA deployment, not a product release, launch, stable publication or production promotion. A beyond-demo release requires explicit owner acceptance of the human QA for this exact build/scope and a separate direct instruction naming that release action. No release action is included.
