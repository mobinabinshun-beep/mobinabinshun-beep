# N.U — Launcher bottom background contrast repair

**Date:** 2026-11-15  
**Change ID:** LAUNCHER-BOTTOM-CONTRAST-01  
**Issue:** #126  
**Status:** Draft candidate · CI pending · human visual QA pending

## Request
Correct the Launcher page's near-black lower background while preserving the existing blue/celestial atmosphere.

## Exact scope
- Replace the near-black terminal radial-gradient stop with a deep-blue tone.
- Add a matching solid-color fallback.
- Fix the background attachment so the gradient does not shift with document scroll height.
- Only `nu-launcher.css` is changed.

## Baseline and recovery
- Inspected base: `3a0de39d2b99f99264e2a08c3da7db2c79887511`
- Original CSS blob SHA: `10127d4ff2e04202ebc86f604657e7dd0fb95e7d`
- Backup branch: `backup/pre-launcher-contrast-2026-11-15`
- Candidate branch: `fix/launcher-bottom-contrast-clean-2026-11-15`
- Exact original CSS archived under `archive/pre-change/2026-11-15-launcher-bottom-contrast-01/`

## Protected behavior
No changes to game rendering, HUD, Gateway, adaptive calibration, profile, wallet, save data, or storage.

## Verification and limitations
The baseline CSS contained the reported `#050a11` terminal stop. The source patch is limited to the body background declaration. Browser visual QA at desktop and mobile viewports remains pending; no deployment or human acceptance is claimed.

## Rollback
Revert the CSS commit or restore the archived `nu-launcher.css` / backup branch.

## Next gate
Run PR CI, then publish to the designated public demo and request human visual acceptance only after the exact deployed build is verified.
