# N.U Creative Studio — Export Regression Lock

**Verified fixed snapshot:** `freeze/studio-export-fixed-2026-11-13`  
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

## Verified repair record
- PR #32 was merged after both `N.U Studio export regression gates` (run 4) and `N.U graphics preview smoke checks` (run 271) passed.
- The merge commit is `dd8779d42e1201d99f0c4d24bb99e5d85b4b48ad`.
- The public Pages deployment and real-device download behavior must still be verified separately; automated tests do not prove a browser saved a file to disk.

## Enforcement status
The repository connector used for this repair does not expose GitHub branch-protection/ruleset administration. The freeze branches preserve exact recovery points, and this document records the required gates; server-enforced branch protection still needs to be enabled in GitHub Settings by a repository administrator.


## 2026-11-16 — 2D icon-design candidate freeze
- **Candidate source branch:** `fix/studio-2d-svg-ico-tools-2026-11-16`
- **Frozen source commit:** `f23f8ca38ef011b81279ca01186caa27ea37961a`
- **Read-only recovery branch:** `freeze/studio-2d-icon-tools-2026-11-16`
- **Regression evidence:** [Studio export regression run](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/43877235179) — JavaScript syntax and full Node regression suite passed (245 tests; 245 passed, 0 failed).
- **Scope covered:** visible-composite SVG export, self-contained raster fallback, blank-artwork guard, filled rectangle/ellipse, paint symmetry, and multi-resolution ICO export.
- **ICO payload:** 16/24/32/48/64/128/256 px, 32-bit DIB/BGRA plus AND transparency mask; the real Windows shell and Windows XP compatibility still require human testing.
- **Owner design lock:** this exact 2D tool/export scope is frozen against unrelated feature expansion while the owner designs the icon. Reopening these files or export contracts requires the owner's direct instruction.
- **Human QA:** browser rendering, download behavior and actual Windows icon display remain pending. CI success is not human acceptance.
- **Future Creative Suite phases:** preserved in `docs/creative-studio/NU-CREATIVE-SUITE-FUTURE-ARCHIVE-2026-11-16.md`; archived only, not scheduled or implemented.

This freeze is a repository workflow checkpoint. It does not by itself enable GitHub server-side branch protection; configure repository rules in GitHub Settings if technical enforcement is required.


## 2026-11-17 — unified owner lock for 2D icon design
- **Owner directive:** keep the current scope limited to the two-dimensional Pixel Art Studio and lock it so the owner can design the N.U application icon. Future Creative Suite phases remain archived and inactive.
- **Frozen source commit:** `2f81cf268fe6b89338d6c8001a86538ea917d730`.
- **Unified recovery/freeze branch:** `freeze/studio-2d-icon-design-2026-11-17` (verified identical to the frozen source commit).
- **Pre-change backup branch:** `backup/pre-studio-icon-design-review-2026-11-17` (verified identical to the same source commit).
- **Included scope:** current 2D drawing/editing tools, professional selection/layer/mask/gradient/brush features, PNG/SVG/ICO and Graphic IR exports.
- **Excluded scope:** animation, spritesheets, tilesets/tilemaps, editable vector node authoring, project/package management and the future workflow-management application. These remain archived; no schedule or implementation authorization is implied.
- **SVG defect boundary:** source contains visible-composite SVG export, blank-canvas guard and self-contained embedded-PNG fallback. The owner's specific blank output has not been reproduced because the faulty SVG sample was not attached; browser/viewer verification remains pending. Do not report the observed case as conclusively fixed until a real export is reopened and inspected.
- **Verification evidence:** PR #162 workflow 43877235179 passed 245/245; PR #163 workflow 43881024031 passed 262/262. These are prior CI results, not a new run or browser QA.
- **Human QA:** pending for real browser downloads, SVG visual reopening, ICO display in Windows shell and low-memory/mobile behavior.
- **Deployment:** public Pages build identity was not independently verified in this review.
- **Reopening:** only the owner may reopen this exact 2D scope by direct instruction. A request to change a dependency or excluded phase must be scoped separately before implementation.

This is a repository-level scope lock and recoverable Git checkpoint. GitHub server-side branch protection/ruleset enforcement has not been configured or verified; contributors must treat the freeze branch as read-only and work only on a new authorized candidate branch after explicit reopening.
