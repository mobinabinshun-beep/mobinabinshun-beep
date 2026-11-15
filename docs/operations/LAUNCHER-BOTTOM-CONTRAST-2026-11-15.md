# N.U — Launcher bottom background contrast repair

**Date:** 2026-11-15  
**Change ID:** LAUNCHER-BOTTOM-CONTRAST-02  
**Issue:** #126  
**Status:** CI-PASSED (graphics preview smoke run 918) · HUMAN-QA-PENDING · not deployed

## Request and scope
Correct the near-black lower Launcher background while preserving its existing blue/celestial atmosphere.
- Replace the near-black terminal gradient stop with deep blue.
- Add a solid-color fallback.
- Fix the background attachment so the gradient does not shift with document scroll height.
- Only `nu-launcher.css` changes at runtime.

## Baseline and recovery
- Inspected base: `08b640c5e2d6b755466ef4bd4677cd3d2bb1e56f`
- Original CSS blob SHA: `10127d4ff2e04202ebc86f604657e7dd0fb95e7d`
- Backup branch: `backup/pre-launcher-contrast-post-testfix-2026-11-15`
- Candidate branch: `fix/launcher-bottom-contrast-post-testfix-2026-11-15`
- Exact original CSS archived under `archive/pre-change/2026-11-15-launcher-bottom-contrast-02/`

## Protected behavior
No changes to gameplay, HUD, Gateway, adaptive calibration, profile, wallet, save data, or storage.

## Verification
The baseline still contained the reported `#050a11` terminal stop. The source patch is limited to the body background declaration. The earlier PR #147 failed its shared static-validation workflow only because the stale wallet test assertions had not yet been repaired; PR #146 has since merged those test-only corrections. Re-run CI on this clean post-repair candidate. Browser visual QA and deployment remain pending.

## Rollback
Revert the CSS commit or restore the archived `nu-launcher.css` / backup branch.

## Next gate
Run PR CI, then deploy the candidate to the public demo and request human visual acceptance against the exact deployed build.
