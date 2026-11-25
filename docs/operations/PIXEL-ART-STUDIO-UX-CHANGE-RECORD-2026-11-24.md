# Pixel Art Studio — Stage 2 International UX Change Record

- Package: `NU-QA-STUDIO-HUMAN-REPORT-20261124`
- Stage: 2 — International English, icon clarity and accessibility semantics
- Related correction/package: `NU-FIX-STUDIO-FILL-BEHAVIOR-20261124`
- Parent record: Repository Issue #68
- Date: 2026-11-25
- Status: `MACHINE-PASS`
- Stage 1 Fill candidate: `bc4108790d2a84d773fa21524964719d40238e17` — MACHINE-PASS
- Stage 2 starting baseline: candidate branch `fix/studio-fill-ux-successor-20261124`, SHA `bc4108790d2a84d773fa21524964719d40238e17`
- Stage 2 tested source/workflow SHA: `676b08306d2e46e394b7b3e653029820d5228fe5`
- Recovery baseline: `backup/pre-studio-fill-ux-successor-2026-11-24`, verified identical to original implementation baseline `ef57a6ec40feea195359dcb9581a5746d63bbd2b`
- Current default branch HEAD at stage entry: `8e23c76e4dab7c1cb23ef68b3b964e51a2f314c7`; three commits ahead of original baseline, all confined to unrelated simulation demo/core/tests and its workflow. The Studio candidate is intentionally kept on its authorized isolated successor branch; no unrelated default-branch changes are imported.

## Exact Stage 2 scope

### Authorized paths
1. `pixel-art-studio.html` — replace remaining mixed Persian/English product copy with English; improve explicit accessible names and icon semantics for the static Studio tool controls; preserve all existing IDs, actions and layout contracts.
2. `nu-pixel-art-studio.js` — replace Persian user-facing runtime messages and dynamic dock/tab/layer/tool labels with English; provide stable English `aria-label` and `title` values for generated tool buttons; mark decorative glyphs as hidden from assistive technology.
3. `tests/nu-studio-ux.test.js` — new focused assertions for English-only Studio UI copy and accessible names/labels.
4. `tests/nu-studio-browser-smoke.py` — add browser assertions for generated quick-tool accessible names and English dock labels.
5. `tests/nu-studio-compact-ux.test.js` — update two directly coupled legacy source-copy assertions from Persian to the new English labels/accessibility contract. This dependency was discovered by the first full regression run; the failures were assertion drift, not runtime failures.
6. `.github/workflows/pixel-art-studio-machine.yml` — include the new English/accessibility UX unit test and the updated compact-UX regression test in the focused Studio unit command; keep the existing workflow matrix and permissions unchanged.
7. This Stage 2 change record.

### Explicitly out of scope
- No changes to Fill behavior or its Stage 1 implementation/tests.
- No progressive-disclosure redesign, tool ownership/context-sensitive controls, Blueprint/Compass, viewport/zoom/Magnifier, project portability, Perspective/Depth, Demo/local parity or public clean-demo banner in this stage; those remain later serial stages.
- The existing QA banner is intentionally left untouched here; its removal belongs to Stage 8 clean public UI and must be tested with the parity handoff.
- No HTML/CSS graphics-layer export (Repository Issue #67).
- No Gateway, Library, games, HUD, Wallet/economy, global CSS, shared interaction/input contracts, build/deploy runtime or unrelated files.
- No deletion or reduction of any existing tool, control, export, shortcut, layer, selection, data or behavior.

## Acceptance criteria
- Studio page and generated Studio runtime UI contain no Persian-language product copy.
- Every static and generated drawing-tool button has a meaningful English accessible name; decorative glyphs do not pollute the accessible name.
- Dynamic dock headings, tabs, tool labels, layer controls, hints and status/error/download messages are English and remain understandable.
- Existing element IDs, data-tool values, event handlers, keyboard shortcuts, controls, exports and Fill behavior remain intact.
- Focused unit tests, Studio integration/regression tests, browser smoke on desktop/mobile, and the configured 3-OS × 3-browser matrix pass on one exact Stage 2 SHA.
- No unrelated diff; exact diff reviewed before Stage 2 is marked MACHINE-PASS.

## Verification plan
- Run Node syntax checks and all focused Studio unit/integration tests using the existing `pixel-art-studio-machine.yml` workflow.
- Run Playwright desktop/mobile browser smoke for Chromium, Firefox and WebKit on Ubuntu 24.04, Windows 2022 and macOS 15.
- Record workflow run IDs, exact SHA, pass/fail, and any NOT-TESTED coverage.
- Preserve Stage 1 Fill regression evidence and ensure it remains passing.

## Stage 2 machine verification — PASS

Exact tested SHA: `676b08306d2e46e394b7b3e653029820d5228fe5`

- Studio machine workflow run `45512323771`: SUCCESS.
- Focused Studio unit tests: 77/77 PASS, including `nu-studio-ux.test.js` and `nu-studio-compact-ux.test.js`.
- Browser matrix: 9/9 PASS — Ubuntu 24.04 (Chromium, Firefox, WebKit); Windows 2022 (Chromium, Firefox, WebKit); macOS 15 (Chromium, Firefox, WebKit).
- Static validation: PASS.
- Studio Export regression: PASS.
- Graphics Preview smoke: PASS.
- Arcane Shield/Mana regression: PASS.
- Gateway regression: PASS.
- Earlier assertion-only failure was traced to two legacy expectations in `nu-studio-compact-ux.test.js`; after updating those directly coupled assertions and adding both UX suites to the workflow command, the exact SHA above passed all checks.
- Read-back confirms zero Persian-script characters in `pixel-art-studio.html` and `nu-pixel-art-studio.js`.
- Stage 1 Fill implementation and regression coverage remain in the candidate; Stage 1 PASS evidence remains separately recorded at SHA `bc4108790d2a84d773fa21524964719d40238e17`.

## Stage 3 — Progressive disclosure, tool ownership and context-sensitive options

- Status: `MACHINE-PASS`
- Stage 3 baseline: successor branch `fix/studio-fill-ux-successor-20261124`, SHA `3a79a25a36c0f217eb0d44fcd8a3d7a8ad55ab89`
- Stage 3 tested source/workflow SHA: `ec81c2ea5ab0d574d7c770eb49fddbc12c0419e4`
- Stage 3 machine workflow run: `45514014255` (SUCCESS)
- Stage 2 MACHINE-PASS evidence remains bound to SHA `676b08306d2e46e394b7b3e653029820d5228fe5`.

### Authorized paths
1. `nu-pixel-art-studio.js` — create a compact tool-options context panel in the existing dock; move/reuse existing settings nodes without duplicating IDs or dropping controls; show only settings owned by the active tool/family; keep current tabs and operations.
2. `tests/nu-studio-ux.test.js` — assert tool-to-setting ownership and no duplicate controls.
3. `tests/nu-studio-browser-smoke.py` — verify actual visible options change when switching between Pencil, Fill, Fading Brush, Color-Mixing Brush, Texture, Gradient and selection tools on desktop/mobile.
4. `tests/nu-studio-compact-ux.test.js` — preserve compact drawer/tab and tool grouping invariants while asserting context-panel integration.
5. This change record.

### Context ownership contract
- Paint family (Pencil, Eraser, Line, Rectangle, Ellipse, filled shapes): brush size and shared brush-shape/symmetry options.
- Fading Brush: paint-family options plus fading intensity only.
- Color-Mixing Brush: paint-family options plus mixing strength only.
- Texture Brush: paint-family options plus texture type/density only.
- Fill: bucket mode and color tolerance only; do not expose brush-only controls.
- Gradient: gradient mode and end color only.
- Selection/Move: selection operations and scale controls only.
- Eyedropper and tools without configurable options: no unrelated settings; show a concise tool-specific description.
- Existing settings retain their IDs, event handlers, values and behavior. Existing tabs remain available; no feature is deleted.

### Acceptance criteria
- Selecting a tool updates the context panel immediately and identifies the active tool.
- Irrelevant settings are hidden, not deleted; switching back restores their values.
- No duplicate IDs or detached/unreachable controls; all settings remain keyboard/screen-reader accessible.
- Existing progressive disclosure (drawer collapsed by default; one tab panel active) is preserved and the context panel stays compact.
- Browser tests prove the setting visibility matrix and value persistence on desktop/mobile.
- Fill Stage 1 and all Stage 2 English/accessibility regressions remain green.

### Out of scope
No new tools, redesign of the eight tabs, Blueprint/Compass, viewport/zoom/Magnifier, project portability, Perspective/Depth, Demo/local parity, clean-demo banner, Issue #67, export changes, or changes to HTML/CSS/global styles/Gateway/HUD/Wallet/Library/other games.

### Stage 3 machine verification — PASS

Exact tested SHA: `ec81c2ea5ab0d574d7c770eb49fddbc12c0419e4`

- Studio machine workflow push run `45514014255`: SUCCESS.
- Focused Studio unit tests: 78/78 PASS.
- Browser matrix: 9/9 PASS — Ubuntu 24.04, Windows 2022 and macOS 15, each with Chromium, Firefox and WebKit.
- Browser smoke verified the active-tool settings visibility contract for Pencil, Fill, Fading Brush, Color-Mixing Brush, Texture Brush, Gradient, Selection, Bezier and Eyedropper.
- Browser smoke changed Fill tolerance, fading intensity, mixing strength, texture type/density, gradient mode, selection scale and Bezier tension; each value persisted after switching away and back.
- Static validation, Studio Export, Graphics Preview, Gateway and Arcane Shield/Mana regression checks: PASS on the exact candidate SHA.
- Pre-Stage 3 checkpoint branch `backup/pre-studio-stage3-context-2026-11-25` verified identical to its starting SHA `c3f137bbfb41603b9814ea5d412677177e165e01`.

## Stage 4 — Blueprint guide contrast and Compass circle tool

- Status: `IN-PROGRESS`
- Stage 4 code baseline: `ec81c2ea5ab0d574d7c770eb49fddbc12c0419e4` (Stage 3 MACHINE-PASS; next checkpoint branch will be recorded before runtime writes).

### Authorized paths
1. `pixel-art-studio.html` — add one accessible Compass drawing-tool entry to the existing shape/tool list; preserve existing IDs and tool controls.
2. `nu-pixel-art-studio.js` — implement adaptive high-contrast guide strokes, screen-space guide thickness, optional high-contrast toggle, Compass center/radius preview and circle commit/cancel lifecycle. Preview center/radius are render-only overlays and must never enter pixel data or exports.
3. `tests/nu-studio-ux.test.js` — assert Compass wiring and guide rendering/overlay separation.
4. `tests/nu-studio-browser-smoke.py` — verify guide visibility and Compass interaction on desktop/mobile, including preview vs committed output, cancellation and undo.
5. `tests/nu-studio-compact-ux.test.js` — preserve tool grouping and accessible Compass name.
6. This change record.

### Acceptance criteria
- Blueprint, ruler, divisions, axes and depth guides remain distinguishable on dark/light/checkerboard/colored/image/negative artwork using a contrast halo plus a crisp accent stroke.
- Guide line width is computed from displayed canvas scale so lines remain legible at zoom levels without overwhelming pixel art.
- High-contrast mode defaults on and can be toggled without changing artwork data.
- Compass supports center selection → radius drag → circle preview → commit/cancel; the preview shows the circle plus temporary center point and radius line.
- On commit, only the circle is written to pixel data; center/radius guides disappear immediately and are absent from PNG/SVG/project exports.
- Cancel restores the exact pre-operation image; commit is one undo step and redo restores the circle.
- Existing guide toggles, tool IDs, keyboard behavior, Fill, context options and Stage 1–3 tests remain intact.

### Out of scope
No viewport/Magnifier, project portability, Perspective/Depth, export redesign, HTML/CSS layer export (Issue #67), demo parity/clean banner, Gateway/HUD/Wallet/Library/games, global styles, or other tool additions.

## Stage 4 — Blueprint guide contrast and Compass circle tool

- Status: `IN-PROGRESS`
- Stage 4 code baseline: `ec81c2ea5ab0d574d7c770eb49fddbc12c0419e4` (Stage 3 MACHINE-PASS; next checkpoint branch will be recorded before runtime writes).

### Authorized paths
1. `pixel-art-studio.html` — add one accessible Compass drawing-tool entry to the existing shape/tool list; preserve existing IDs and tool controls.
2. `nu-pixel-art-studio.js` — implement adaptive high-contrast guide strokes, screen-space guide thickness, optional high-contrast toggle, Compass center/radius preview and circle commit/cancel lifecycle. Preview center/radius are render-only overlays and must never enter pixel data or exports.
3. `tests/nu-studio-ux.test.js` — assert Compass wiring and guide rendering/overlay separation.
4. `tests/nu-studio-browser-smoke.py` — verify guide visibility and Compass interaction on desktop/mobile, including preview vs committed output, cancellation and undo.
5. `tests/nu-studio-compact-ux.test.js` — preserve tool grouping and accessible Compass name.
6. This change record.

### Acceptance criteria
- Blueprint, ruler, divisions, axes and depth guides remain distinguishable on dark/light/checkerboard/colored/image/negative artwork using a contrast halo plus a crisp accent stroke.
- Guide line width is computed from displayed canvas scale so lines remain legible at zoom levels without overwhelming pixel art.
- High-contrast mode defaults on and can be toggled without changing artwork data.
- Compass supports center selection → radius drag → circle preview → commit/cancel; the preview shows the circle plus temporary center point and radius line.
- On commit, only the circle is written to pixel data; center/radius guides disappear immediately and are absent from PNG/SVG/project exports.
- Cancel restores the exact pre-operation image; commit is one undo step and redo restores the circle.
- Existing guide toggles, tool IDs, keyboard behavior, Fill, context options and Stage 1–3 tests remain intact.

### Out of scope
No viewport/Magnifier, project portability, Perspective/Depth, export redesign, HTML/CSS layer export (Issue #67), demo parity/clean banner, Gateway/HUD/Wallet/Library/games, global styles, or other tool additions.

## Stage 4 machine verification — PASS

- Reopened Stage 4 baseline: 3891b244f62beb88d11df372e52831037aa985e4.
- Runtime fix: nu-pixel-art-studio.js routes Escape to the active workspace controller only; on mobile it closes only the mobile drawer, and on desktop it closes only the desktop drawer.
- Regression coverage: tests/nu-studio-ux.test.js asserts controller isolation; tests/nu-studio-browser-smoke.py uses Escape to cancel Compass on desktop and mobile, then verifies the mobile dock can reopen.
- Exact tested cumulative source/workflow SHA: 576b477150b3976d158f54f19b3fb5e19d36a5b4.
- Studio machine workflow push run 45528650321: SUCCESS; 81/81 focused Studio unit/regression tests PASS, syntax validation PASS, 9/9 browser matrix PASS (Ubuntu 24.04, Windows 2022 and macOS 15 × Chromium/Firefox/WebKit).
- Cross-project gates on the same SHA: Studio Export run 45528659318 PASS; Graphics Preview run 45528659356 PASS; Arcane Shield/Mana run 45528659334 PASS; Gateway main-game run 45528659338 PASS; static validation PASS.
- The separate PR-event machine mirror 45528659409 has the same 9 browser jobs; eight are complete PASS and macOS Chromium is still finishing its browser-engine setup. The push-event full matrix is already complete PASS.
- No nu-studio-layout.js change is included. The aggregate package remains IN-PROGRESS; no final backup/restore, public demo deployment, live-build verification, human QA handoff or owner acceptance is claimed.

## Stage 5 — Viewport, zoom and Magnifier

- Status: DISCOVERY-COMPLETE / IMPLEMENTATION-NOT-STARTED.
- Discovery baseline: 576b477150b3976d158f54f19b3fb5e19d36a5b4.
- Current state: the page already has Fit to View and a 25–800% slider; mobile has +/- controls. Desktop +/- controls and a dedicated Magnifier/loupe tool are missing. Zoom currently recomputes fitted canvas dimensions but does not preserve a pointer-anchored focus during zoom.
- Authorized paths:
  1. pixel-art-studio.html — add desktop Zoom In/Out controls and accessible Magnifier overlay/loupe markup; preserve existing IDs and slider/fit/mobile controls.
  2. nu-pixel-art-studio.js — unify zoom control state across desktop/mobile buttons and slider; implement pointer/viewport-anchored zoom, view-only Magnifier pointer lifecycle and context-sensitive Magnifier controls. Do not alter drawer controllers in this stage.
  3. nu-studio-layout.js — add only pure viewport geometry helpers needed for zoom anchoring and pixel-aware mapping; do not alter unrelated workspace drawer behavior.
  4. tests/nu-studio-layout.test.js — unit-test zoom anchoring, bounds, fit and pixel mapping.
  5. tests/nu-studio-ux.test.js — assert Magnifier accessibility and control wiring.
  6. tests/nu-studio-browser-smoke.py — verify synchronized desktop/mobile +/- and slider, fit/reset, anchored zoom, live loupe behavior and unchanged pixels/undo history on desktop/mobile.
  7. tests/nu-studio-compact-ux.test.js — preserve compact tool grouping and Magnifier accessible name.
  8. This change record.
- Acceptance criteria:
  - Fit-to-view initially shows the complete canvas; slider, desktop +/- and mobile +/- all update one shared 25–800% zoom state; Fit/Reset restores the fitted view.
  - Zoom preserves the pixel under the pointer (or viewport center when invoked by buttons) as the focus where bounds permit; scrolling remains inside the workspace frame and no page-level horizontal overflow is introduced.
  - Nearest-neighbor/pixelated rendering and accurate pixel hit-testing remain correct at fractional and high zoom levels; zoom never changes artwork pixels, layers, selections, export bytes or undo/redo history.
  - Magnifier is a view-only tool with an accessible name and a live loupe that follows mouse/touch input, shows the sampled pixel region at a selectable magnification, and hides on pointer leave/cancel or Escape.
  - Magnifier size/strength controls appear only while Magnifier is active; tool options remain context-sensitive and do not leak into other tools.
  - Desktop and mobile browser tests cover viewport resize, touch, pointer anchoring, bounds and reduced-motion behavior.
- Out of scope: project portability, Perspective/Depth, export redesign, HTML/CSS layer output (Issue #67), demo parity/clean banner, Gateway/HUD/Wallet/Library/games, and unrelated drawer behavior.

## Handoff
Stages 1–4 are MACHINE-PASS at their recorded exact SHAs. Stage 5 scope is documented above and is ready for a pre-change checkpoint. No Stage 5 runtime write has started. The aggregate package remains IN-PROGRESS; no final candidate backup, demo deployment, human QA handoff or owner acceptance is claimed.


## Stage 6 — Clean public welcome and progressive tool categories

- Owner scope opened in Repository Issue #68 comment on 2026-11-25.
- Stage 5 frozen parent: `70746d1c5ecb5d7b14b1f9fda1e1ee14c7e9422d`; its verified backup remains immutable.
- Stage 6 initial implementation commit: `289a9fdc3ebfd2eba909d41083873a5069a1603b`.
- Stage 6 initial CI run `45533401762`: FAIL. This was caused by stale assertions that still required the superseded public QA banner and old ungrouped tool labels/metadata; it did not establish a runtime failure. Browser matrix was skipped because the Studio unit gate failed.
- A pre-repair recovery ref was created at the exact initial Stage 6 implementation SHA: `backup/pre-studio-stage6-clean-welcome-2026-11-25`.

### Implemented Stage 6 scope
- Public intro is now exactly `Welcome to N.U — Public Test Demo`; internal QA/build labels and `GEN 01` are removed from the product page.
- Five accessible tool categories are present: Draw, Shapes, Selection, Effects and View. Only the selected category's tools are shown; selecting a tool switches to its owning category.
- Category tabs expose tab semantics, keyboard left/right navigation and selected-state/tabindex updates.
- Tool names, visible labels and decorative icon semantics remain explicit; tool-specific context settings and prior Fill/Compass/Magnifier behavior are retained.

### Directly coupled regression-test repair
- `tests/nu-studio-ux.test.js`: replace stale “Quick tools / Canvas tools” copy assertions with the new dock/category labels; update Magnifier and Compass metadata assertions to include their owning categories.
- `tests/nu-studio-advanced-tools.test.js`: replace the old requirement to display `TEST CANDIDATE / NOT HUMAN-APPROVED / DEMO QA ONLY` with the newer owner-approved clean welcome requirement, while retaining assertions that Fading Brush and Color-Mixing Brush remain available.
- The second test file was added to the Stage 6 direct test allow-list because the first complete regression run proved its legacy banner assertion conflicts with the 2026-11-24 clean-public-UI owner principle. No product behavior was changed to satisfy a stale internal-banner test.

### Current verification
- Reruns are in progress on the successor branch after the assertion updates; no Stage 6 MACHINE-PASS is claimed until the exact final SHA completes the Studio unit suite, full 3-OS × 3-browser matrix and cross-project regression gates.
- Stage 1–5 machine evidence remains bound to its own exact SHAs; Stage 5 candidate remains frozen.
- Aggregate package remains IN-PROGRESS. No final package backup, public demo deployment, live build verification, HUMAN-QA-PENDING handoff or owner acceptance is claimed.
