# Pixel Art Studio 2D — Human QA Handoff

**State:** DEMO-QA CANDIDATE / HUMAN-QA-PENDING  
**Candidate PR:** [#238](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/238)  
**Candidate branch:** `feat/pixel-art-studio-2d-tools-2026-11-21`  
**Exact tested code/test candidate SHA:** `6db7811e2481756f93f8225613c88d281f071714`  
**Studio implementation logic SHA:** `9afab37c373091482d2010350a219856e46728d2`  
**Dedicated machine run:** [44903671261](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44903671261) — 48/48 passed; final workflow revision `4b817ed5b8fc1b9aff3f79db94588a7a8acfc06d  
**Demo URL:** https://mobinabinshun-beep.github.io/mobinabinshun-beep/pixel-art-studio.html  
**Home / library:** https://mobinabinshun-beep.github.io/mobinabinshun-beep/  
**Candidate merge / initial Pages build SHA:** `c35e5b2edec0d48a0d255ed78ce77a207a241a5f`; [Pages run 44903824271](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44903824271) completed build/deploy successfully. Subsequent documentation-only Pages rebuilds may have a new build SHA without changing Studio runtime code; use the latest Pages build identity recorded in the canonical unified checklist.

## What to test

1. **Fading Brush**
   - Select Fading Brush; test brush sizes 1, 3 and 7 and intensity 1, 50 and 100.
   - Paint across several differently colored and transparent pixels.
   - Expected: each destination cell blends against its own underlying pixel; intensity is predictable; no unexpected stroke-origin color smear.

2. **Selection inside/outside**
   - Test rectangular and lasso selections, invert selection, and a selection with holes.
   - Try pencil/brush, fill, clear, recolor/replace, chroma key and text/image overlay operations.
   - Expected: selected pixels change; unselected pixels remain unchanged; invert swaps the effective region.

3. **Layer and selection rotation**
   - Test 0°, +90°, −90°, 180° and free-angle rotation.
   - Test square and non-square canvases, with and without a selection.
   - Expected: the active layer/selected pixels rotate; pixels outside the selection remain unchanged; no unexpected clipping or destination collisions.

4. **Two-finger viewport rotation**
   - On a touch device, use two fingers to rotate the canvas view while artwork is present.
   - Then draw with one finger and compare the artwork before/after viewport rotation.
   - Expected: the view rotates independently; the artwork pixel data does not rotate from the viewport gesture; pointer placement remains aligned.

5. **Blueprint and guides**
   - Toggle blueprint boundary, ruler, divisions, grid, angular axes and depth axis independently and together.
   - Expected: overlays align with the logical canvas and do not alter artwork pixels.

6. **Undo/Redo and import/export**
   - Run several edit → undo → redo sequences around selection, fading, layer rotation and viewport rotation.
   - Import a local test image; verify source dimensions and working-copy behavior.
   - Export PNG, SVG and ICO where supported.
   - Expected: undo/redo restores the correct artwork and selection; guide overlays are not baked into exported artwork.

7. **Regression boundaries**
   - Confirm navigation back to the library still works.
   - Confirm unrelated game screens, classic LV/XP/Mana HUD, Wallet, Gateway and controller behavior appear unchanged.

## Required coverage

- Desktop: at least one Chromium-based browser and one Firefox/Safari browser where available.
- Mobile: Android and/or iOS, portrait and landscape.
- Touch: two-finger viewport rotation, one-finger drawing, selection gestures and gesture cancellation.
- Zoom: fit, low zoom, 100%, high zoom and scrollable workspace.

## Report format

Use the on-page **REPORT STUDIO TEST** link or the [Studio human-test issue template](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/new?template=studio-human-test.yml).

For each finding include: candidate build SHA shown on the page / final Pages build SHA, date, device class, OS, browser/version, viewport/orientation, input method, scenario, expected result, actual result, PASS/FAIL/BLOCKED, and reproducible steps. Do not upload private/copyrighted artwork or personal/credential data.

## Deployment verification and known limitations

- GitHub Pages reported successful build/deploy for the candidate merge SHA above. The latest docs-only rebuild identity is maintained in the canonical checklist.
- Direct external HTTP response/cache read-back and real browser rendering were not independently accessible through the current verification interface; human QA should confirm the page loads and displays the candidate banner.

## Known limitations / do not pre-mark PASS

- Real browser/device/touch behavior has not been independently human-tested yet.
- Runtime baseline snapshot is PARTIAL: source tree and GitHub Pages deployment identity are recorded, but direct live HTTP body/cache and browser runtime-state captures were unavailable.
- Free-angle rotation collision/edge behavior and guide exclusion from every export format need visual confirmation.
- A green CI run is not a human QA result.

## Authority boundary

This is a **demo-only QA handoff**. It is not product release, production promotion, stable publication or a public launch. Even after human QA and owner acceptance of this exact demo build, any action beyond the demo requires a separate, direct and unambiguous owner instruction naming that action.


## Owner clarification — Fading and Brush are separate tools (2026-11-21)

The owner clarified that the intended tools are **Fading (محوکن)** and **Brush (قلم ترکیب و قاطی کردن رنگ‌ها)**. They are independent tools, not one combined Fading Brush. See [the separate tool requirements and continuation record](./PIXEL-ART-STUDIO-FADING-AND-COLOR-MIXING-BRUSH-SPEC-2026-11-21.md).

The current candidate audit found a Fading Brush path but did not find a separate user-facing color-mixing Brush. Existing 48/48 machine evidence does not cover that missing Brush feature. The clarified requirement is recorded as an implementation gap; a docs/regression workflow PASS must not be represented as feature-complete approval. Human QA for the distinct two-tool behavior remains pending until the Brush implementation and its exact-SHA machine tests exist. The next session must resume from the requirements document, implement the missing Brush separately, rerun machine gates, and then collect written human reports.
