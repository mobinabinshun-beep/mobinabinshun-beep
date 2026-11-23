# Pixel Art Studio — Color-Mixing Brush Change Record

- Date: 2026-11-23
- Package / work ID: NU-WIP-STUDIO-COLOR-MIXING-BRUSH-20261123
- Parent: Repository Issue #62
- Canonical requirements: [Separate Fading and Color-Mixing Brush specification](./PIXEL-ART-STUDIO-FADING-AND-COLOR-MIXING-BRUSH-SPEC-2026-11-21.md)
- Status: IMPLEMENTED / MACHINE-QA-IN-PROGRESS — code and focused unit tests completed; browser CI pending
- Candidate branch: feat/pixel-art-studio-color-mixing-brush-2026-11-23
- Baseline SHA: ff00c755378b12eb9c4af035804ab52db5a76908
- Pre-change backup: backup/pre-color-mixing-brush-2026-11-23 (verified identical; 0 ahead / 0 behind)
- Demo Pages run: 45183379421 — SUCCESS; Pages build SHA ff00c755378b12eb9c4af035804ab52db5a76908
- Runtime baseline addendum: [2026-11-23 Pages artifact snapshot](../../archive/runtime-baseline/NU-PUBLIC-DEMO-20261121T121811Z-f9b42ac/DEPLOYMENT-ADDENDUM-20261123.md)

## 1. Owner-authorized scope

Implement the distinct Color-Mixing Brush as a separate selectable Studio tool, not as a rename or variant of Fading. Preserve existing Fading behavior and controls.

The package stage currently being executed is the Color-Mixing Brush. The mobile workspace redesign remains a separate subsequent stage and must not be coded concurrently with this stage.

## 2. In-scope files

- nu-studio-pro-tools.js — deterministic color-pickup/smudge algorithm.
- nu-pixel-art-studio.js — tool selection, stroke state, active-layer integration and independent mixing-strength control.
- tests/nu-studio-color-mix.test.js — algorithm and boundary regression tests.
- tests/nu-studio-browser-smoke.py — browser interaction smoke and color-mixing end-to-end checks.
- .github/workflows/pixel-art-studio-machine.yml — focused unit and cross-browser browser automation.
- .github/workflows/pixel-art-studio-live-qa.yml — post-Pages live-demo browser verification.
- pixel-art-studio.html — QA-candidate banner only, if needed to identify this candidate.
- docs/operations/PIXEL-ART-STUDIO-FADING-AND-COLOR-MIXING-BRUSH-SPEC-2026-11-21.md — implementation clarification only.
- this change record.

## 3. Explicitly protected / out of scope

- Gateway, controller, interaction-core and shared input contracts.
- Classic LV / XP / Mana HUD, game logic, Wallet, economy, saves and other games.
- Library and index page behavior.
- Global CSS or unrelated Studio export contracts.
- Existing Fading tool algorithm, tool ID and independent intensity control.
- Existing frozen/backup branches and historical candidate evidence.
- Mobile workspace redesign, edge rails, orientation controls and rotation dial; those belong to the subsequent package stage.
- No feature deletion, broad refactor, unrelated cleanup or rewrite from zero.

## 4. Baseline and snapshot evidence

- Current default branch before implementation: ff00c755378b12eb9c4af035804ab52db5a76908.
- Exact Pages build identity: ff00c755378b12eb9c4af035804ab52db5a76908.
- Pages artifact ID: 14822971147; 7,349,846 bytes; 324 entries.
- Artifact SHA-256: 6ee3de8324a3e5b6e40277b671fb758c6f2374ef4f92687242b7b4f101533fd1.
- Studio HTML, Studio runtime, Pro Tools, Studio Layout and Gateway blob SHAs are recorded in the linked runtime baseline addendum.
- Pre-change backup branch is identical to baseline.
- Direct served HTTP body/cache and live browser runtime state remain NOT CAPTURED; the downloaded exact Pages artifact is the source/deployment snapshot evidence and does not claim physical-device observation.

## 5. Implementation acceptance criteria

1. Color-Mixing Brush is a separate selectable tool with a distinct tool ID, label and help description.
2. It picks up colors already painted on the active canvas/layer and smears/mixes those colors along the stroke; it does not simply paint the foreground color.
3. Brush size uses the existing shared brush-size control.
4. Mixing strength has an independent, adjustable 1–100 control.
5. Pointer movement interpolation prevents gaps when events skip pixel cells.
6. Multi-color strokes are deterministic for a fixed source and stroke path; reversing direction may produce a different result as expected for a pickup/smudge tool.
7. Transparent cells remain transparent and do not inject the display checkerboard/background into the picked pigment.
8. Active selection clips both pickup sampling and pixel writes.
9. Active layer lock prevents changes; layer-mask edit mode is not silently bypassed.
10. Every stroke is one undoable action; Undo/Redo restore the exact pixels and layer state.
11. Fading remains separately selectable with its own intensity control and no shared state leakage.
12. Existing drawing tools, layers, selection, exports and Gateway/controller behavior do not regress.

## 6. Machine verification plan

- node --check for nu-pixel-art-studio.js and nu-studio-pro-tools.js.
- Focused node:test coverage for two-color and multi-color mixing, stroke direction, continuity, brush size/shape, transparency, selection clipping, deterministic output, invalid input and immutability.
- Existing Studio unit/layout/advanced regression suites on the exact candidate SHA.
- Playwright Chromium, Firefox and WebKit desktop/mobile viewport smoke.
- Browser interaction: create adjacent high-contrast pixels, mix them with the new tool while foreground color is unrelated, verify output, then verify Undo/Redo.
- Locked-layer browser check and Chromium touch-emulated canvas tap.
- Post-Pages Playwright smoke against the exact public Library and Studio URLs; verify live Color-Mixing Brush availability after deployment.
- Report every browser/OS/viewport/input actually run. Physical Android/iOS hardware remains NOT-TESTED unless an attached device runner is available.

## 7. Candidate, backup and human QA lifecycle

After the complete package stage passes machine checks:
1. Create a candidate backup from the exact tested SHA and verify identical tree/commit identity.
2. Deploy that exact candidate to the public demo for QA only.
3. Verify Pages build identity and post-deploy live browser smoke.
4. Freeze the exact candidate SHA and scope; do not amend it while queued.
5. Mark HUMAN-QA-PENDING and provide the human checklist for Fading/Color-Mixing separation, color pickup, transparency, selection, layer lock, Undo/Redo, desktop/mobile and touch.
6. Human acceptance is reserved to the owner; it is not inferred from CI or demo deployment.

## 8. Machine evidence log

| Evidence | SHA / Run | Result |
|---|---|---|
| Baseline Pages deployment | ff00c755378b12eb9c4af035804ab52db5a76908 / 45183379421 | PASS — Pages build/deploy |
| Baseline backup compare | ff00c755378b12eb9c4af035804ab52db5a76908 | PASS — identical |
| Local focused smudge algorithm tests | temporary extracted artifact copy | 7/7 PASS |
| Local browser navigation | current container browser policy | BLOCKED — navigation denied by environment; CI Playwright is the execution route |
| Candidate unit/browser CI | pending | NOT-TESTED |
| Candidate backup | pending | NOT-TESTED |
| Candidate demo deploy/live smoke | pending | NOT-TESTED |
| Human QA | pending | HUMAN-QA-PENDING only after verified demo handoff |

## 9. Closeout

This record is updated only with exact candidate SHA, workflow run IDs, actual results, backup identity, deployment build identity and human QA status. A prior candidate's 48/48 tests do not count as evidence for this new Color-Mixing Brush implementation.


## 10. Implementation checkpoint — 2026-11-23

- Added exported pure helper smudgeBrush to nu-studio-pro-tools.js. It samples existing pigment from the selected brush footprint, blends the carried pickup along an interpolated stroke path and applies the independent mixing-strength ratio to painted cells.
- Added the distinct color-mix-brush tool ID, localized label, independent Color mixing strength slider and explanatory help text in nu-pixel-art-studio.js.
- Kept Fading's existing tool ID, fadePixel implementation and Fading brush intensity control separate.
- The brush uses the shared size and current square/circle/diamond brush shape; the active selection clips sample and write; locked layers and mask-edit mode stop the operation with feedback.
- Transparent cells remain transparent and do not contribute the checkerboard display color.
- Pickup state resets on tool change, stroke completion and cancellation; cancellation restores the complete advanced-layer snapshot.
- The brush controls wrap on narrow widths to avoid forcing the brush settings into one horizontal row.
- Updated the demo candidate banner to identify the separate Fading + Color-Mixing Brush QA candidate.

### Focused local evidence

- node --check nu-pixel-art-studio.js: PASS.
- node --check nu-studio-pro-tools.js: PASS.
- python -m py_compile tests/nu-studio-browser-smoke.py: PASS.
- node --test tests/nu-studio-color-mix.test.js: 9 tests, 9 passed, 0 failed.
- The local container browser blocks navigation with ERR_BLOCKED_BY_ADMINISTRATOR; this is not counted as a browser PASS. Playwright Chromium/Firefox/WebKit runs are configured in GitHub Actions and remain pending.
