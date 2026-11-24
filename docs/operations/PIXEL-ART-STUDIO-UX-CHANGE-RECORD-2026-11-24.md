# Pixel Art Studio — Stage 2 International UX Change Record

- Package: `NU-QA-STUDIO-HUMAN-REPORT-20261124`
- Stage: 2 — International English, icon clarity and accessibility semantics
- Related correction/package: `NU-FIX-STUDIO-FILL-BEHAVIOR-20261124`
- Parent record: Repository Issue #68
- Date: 2026-11-25
- Status: `IN-PROGRESS`
- Stage 1 Fill candidate: `bc4108790d2a84d773fa21524964719d40238e17` — MACHINE-PASS
- Stage 2 starting baseline: candidate branch `fix/studio-fill-ux-successor-20261124`, SHA `bc4108790d2a84d773fa21524964719d40238e17`
- Recovery baseline: `backup/pre-studio-fill-ux-successor-2026-11-24`, verified identical to original implementation baseline `ef57a6ec40feea195359dcb9581a5746d63bbd2b`
- Current default branch HEAD at stage entry: `8e23c76e4dab7c1cb23ef68b3b964e51a2f314c7`; three commits ahead of original baseline, all confined to unrelated simulation demo/core/tests and its workflow. The Studio candidate is intentionally kept on its authorized isolated successor branch; no unrelated default-branch changes are imported.

## Exact Stage 2 scope

### Authorized paths
1. `pixel-art-studio.html` — replace remaining mixed Persian/English product copy with English; improve explicit accessible names and icon semantics for the static Studio tool controls; preserve all existing IDs, actions and layout contracts.
2. `nu-pixel-art-studio.js` — replace Persian user-facing runtime messages and dynamic dock/tab/layer/tool labels with English; provide stable English `aria-label` and `title` values for generated tool buttons; mark decorative glyphs as hidden from assistive technology.
3. `tests/nu-studio-ux.test.js` — new focused assertions for English-only Studio UI copy and accessible names/labels.
4. `tests/nu-studio-browser-smoke.py` — add browser assertions for generated quick-tool accessible names and English dock labels.
5. `tests/nu-studio-compact-ux.test.js` — update two directly coupled legacy source-copy assertions from Persian to the new English labels/accessibility contract. This dependency was discovered by the first full regression run; the failures were assertion drift, not runtime failures.
6. This Stage 2 change record.

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

## Handoff
After Stage 2 MACHINE-PASS, proceed serially to Stage 3 only. The whole package is not yet MACHINE-PASS; no candidate backup for final delivery, demo deployment, human QA handoff or owner acceptance is claimed at this stage.
