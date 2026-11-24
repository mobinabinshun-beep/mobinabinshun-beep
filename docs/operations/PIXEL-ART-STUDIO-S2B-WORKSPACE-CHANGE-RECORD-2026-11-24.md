# Pixel Art Studio — S2B Workspace Change Record

- Date: 2026-11-24
- Package: `NU-PKG-STUDIO-COLOR-MIXING-AND-MOBILE-WORKSPACE-20261123`
- Stage: `S2B-WORKSPACE`
- Correction/debug ID: `NU-FIX-STUDIO-DRAWER-VISIBILITY-PLAYWRIGHT-RACE-20261124`
- PR: [#241](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/241) — OPEN / DRAFT
- Candidate branch: `feat/pixel-art-studio-color-mixing-brush-2026-11-23`
- Pre-repair checkpoint: `ccce2ace4113c02c02507773b93c35ce6f2e2cd2`
- Current candidate SHA: `836d69acf1100f2cd9efebf77e32a2d32ff2cb9e`
- Current stage status: `PENDING — FULL 9/9 MATRIX NOT YET COMPLETE`
- No S3 stage has started.

## Scope lock

Authorized target: S2B desktop workspace drawer browser verification and the smallest directly necessary test synchronization.

Changed path:
- `tests/nu-studio-browser-smoke.py`

Runtime paths inspected but not changed in this repair:
- `pixel-art-studio.html`
- `nu-pixel-art-studio.js`
- `nu-studio-layout.js`

Forbidden/untouched:
- Gateway, controller, interaction-core, shared input contract, gameplay input routing, HUD, Wallet/economy, games, Library, exports, layers/brush algorithms, approved backups and prior candidate branches.
- No merge, deployment, backup mutation, human acceptance or product release.

## Root-cause investigation

The previous Studio run `45291859753` failed at the immediate Playwright visibility assertion:
`AssertionError: Desktop tools drawer did not open`.

Source inspection established:
- The Studio runtime script is loaded at the end of the document after the drawer and toggles exist in the DOM.
- The mobile workspace controller resolves the existing `.layout > aside` and assigns `studio-tools-drawer` before registering the desktop controller.
- The desktop click handler synchronously updates the body state class, `aria-expanded`, and `data-workspace-drawer-state`.
- The drawer CSS intentionally transitions `visibility` and `transform` over 200 ms.
- The previous test sampled `is_visible()` immediately after the click, without waiting for the rendered transition.

The repair keeps the existing runtime behavior and changes the browser assertion to poll the actual rendered state. It requires:
- body desktop-open class and drawer state `open`;
- computed `display` not `none`;
- computed `visibility` equal to `visible`;
- positive rendered width and height;
- drawer bounds inside the viewport;
- settled horizontal transform at zero;
- the existing canvas non-blocking hit-test.

This is a test synchronization/debug correction, not a claim that the complete stage has passed.

## Change and evidence

- Commit: `836d69acf1100f2cd9efebf77e32a2d32ff2cb9e`
- Message: `test(studio): await rendered desktop drawer visibility`
- Exact changed path: `tests/nu-studio-browser-smoke.py`
- Previous file blob: `0c9ea3bfab13dce1ca5da4c67b7cabdd53d65fb8`
- New file blob: recorded by commit `836d69acf1100f2cd9efebf77e32a2d32ff2cb9e`
- Branch comparison against current candidate SHA: identical, 0 ahead / 0 behind.

### Previous failing run

- Studio run: `45291859753`
- Unit: PASS.
- Browser matrix: 6 FAIL / 3 PASS according to the nine individual GitHub job conclusions.
- Failure message: `Desktop tools drawer did not open`.
- Related same-SHA regressions: Gateway `45291859724`, Studio Export `45291859733`, Arcane Shield/Mana `45291859713`, Graphics Preview `45291859674` — all SUCCESS.

### Retest on current SHA

- Studio run: `45301469452`
- Unit job: PASS.
- Browser matrix: 6/9 jobs completed SUCCESS; 3 Ubuntu jobs were still in `Install browser engine (Linux)` at the last check. Aggregate run remained IN_PROGRESS. Therefore S2B is NOT PASS yet.
- Completed browser jobs: Windows 2022 / Chromium; macOS 15 / Chromium, Firefox, WebKit; Windows 2022 / Firefox, WebKit.
- Pending browser jobs: Ubuntu 24.04 / Chromium, Firefox, WebKit.
- Gateway regression: `45301469454` — SUCCESS.
- Studio Export regression: `45301469491` — SUCCESS.
- Arcane Shield/Mana regression: `45301469441` — SUCCESS.
- Graphics Preview regression: `45301469417` — SUCCESS.

## Backup and candidate preservation

- No backup or previously approved candidate branch was written or modified.
- `backup/pre-color-mixing-brush-2026-11-23` remains identical to the original baseline SHA `ff00c755378b12eb9c4af035804ab52db5a76908`.
- `backup/pre-public-demo-color-mixing-brush-candidate-2026-11-24` remains identical to Stage 1 candidate SHA `cc04f585715bf62f903f6f8a16b52f115f4891f9`.
- The S2B candidate remains on PR #241; it is unmerged and undeployed.

## Gate and next action

- S2B: `PENDING` until all nine OS/browser jobs and the unit job complete successfully on the exact current SHA, with the four required regressions successful.
- If any pending Ubuntu job fails, inspect its exact log and correct only the authorized S2B scope; rerun the full matrix and regressions on the successor SHA.
- Do not begin S3A or any later feature stage until S2B is fully PASS.
- Physical Android/iOS hardware remains NOT-TESTED; browser emulation does not replace physical-device QA.
- Demo deployment, final package backup/freeze, HUMAN-QA-PENDING and owner acceptance remain deferred until the entire package passes its machine gates.


## Follow-up documentation checkpoint

- Documentation-only commit: `6fa315454b234ffbfff42b2a0ce2bf80160e8c48` added this record after the tested source/test commit `836d69acf1100f2cd9efebf77e32a2d32ff2cb9e`.
- Runtime and browser-test files were unchanged by that documentation commit.
- Because machine approval is bound to an exact SHA, the new branch head must be revalidated by the Studio workflow; the in-progress run `45301469452` remains evidence for SHA `836d69acf1100f2cd9efebf77e32a2d32ff2cb9e` only.
- S2B remains PENDING until the complete matrix and four regressions pass on the final branch head.
