# N.U Creative Studio — Export Regression Lock

**Pre-repair source snapshot:** `freeze/studio-export-known-good-2026-11-13`
**Working repair:** `fix/studio-export-resolution-guard-2026-11-13`
**Earlier import/edit recovery point:** `freeze/studio-known-good-2026-11-13`

## Protected behavior
- Import must remain browser-local and preserve the original source file.
- PNG, SVG and NU-GFX-IR/1 exports must use the visible layer composite, excluding hidden layers and respecting visible opacity.
- PNG output scales are explicit (1×, 2×, 4×, 8×, 16×); unsafe canvas dimensions must fail with a clear scale-reduction message, never silently produce an empty file.
- Transparent pixels must remain transparent in PNG output.
- Analysis and export must support the same 1,048,576-pixel upper bound as the vectorizer.
- A report-generation failure must not corrupt or replace the user's artwork.
- Object URLs used for downloads must not be revoked immediately after the click.

## Required regression gates
- Raster import and palette mapping tests.
- Large-image analysis test above the former 262,144-pixel ceiling.
- PNG dimension and transparency conversion tests.
- Composite export, SVG geometry and human-report tests.
- JavaScript syntax and static asset-reference checks.

## Change control
1. Keep both freeze branches read-only; do not develop on them.
2. Make Studio changes on a feature branch and merge only after all required CI checks pass.
3. Do not modify protected adaptive runtime, game simulation, wallet/economy or unrelated modules for Studio export work.
4. Treat any failure in import, composite export, transparent PNG, SVG or Graphic IR tests as a release blocker.

## Enforcement status
The repository connector used for this repair does not expose GitHub branch-protection/ruleset administration. The freeze branches preserve exact recovery points, and this document records the required gates; server-enforced branch protection still needs to be enabled in GitHub Settings by a repository administrator.
