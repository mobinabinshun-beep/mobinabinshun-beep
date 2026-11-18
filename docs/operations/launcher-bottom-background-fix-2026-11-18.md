# Launcher bottom background contrast — change record

- Date: 2026-11-18
- Status: IMPLEMENTED · MACHINE-TEST-PENDING · BACKUP-VERIFIED · HUMAN-QA-PENDING
- Request: Issue [#126](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/126)
- Supersedes stale candidate: [PR #127](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/127) (based on an obsolete base revision)
- Candidate branch: `fix/launcher-bottom-background-successor-2026-11-18`
- Base commit: `705b5f99a7bf2b32c4156c5d647a5e678985d76a`
- Recovery ref: `backup/pre-launcher-bottom-contrast-successor-2026-11-18` at the same base SHA

## Scope
Only the Launcher calibration page background and its focused regression workflow/test are changed.

## Root cause
The body radial gradient ended at near-black `#050a11`, making the lower page appear black.

## Implementation
- Replaced the terminal gradient color with deep blue `#0b1724` and intermediate `#0d1b2a`.
- Added a matching `background-color` fallback.
- Fixed the background attachment so it does not shift with document height.
- Added `tests/nu-launcher-background.test.js` and wired it into the graphics preview smoke workflow.

## Allow-list
- `nu-launcher.css`
- `.github/workflows/graphics-preview-check.yml`
- `tests/nu-launcher-background.test.js`
- `docs/operations/launcher-bottom-background-fix-2026-11-18.md`

## Deny-list
No gameplay, HUD, Gateway/controller, calibration logic, profile, wallet, storage, adaptive sampler, background artwork, or native launcher behavior changes.

## Verification
- Baseline CSS inspected on the current default branch.
- Backup ref created from the exact pre-change default commit; ref identity is recorded above.
- Focused regression test is wired into the PR workflow; execution result will be recorded after Actions completes.
- No browser visual QA or live Pages verification is claimed yet.

## Human QA — pending
- [ ] Desktop: scroll from top to bottom; background remains visibly deep blue.
- [ ] Mobile: scroll at narrow viewport; no black lower region or horizontal seam.
- [ ] Confirm cards, footer, text and controls retain readable contrast.
- [ ] Verify the exact public demo build and record URL + deployed SHA.

## Restore
Create a new branch from `backup/pre-launcher-bottom-contrast-successor-2026-11-18` or revert only this PR with a new reviewed commit. Do not force-push or rewrite history.
