# Runtime Baseline Snapshot — N.U Public Demo

- Snapshot ID: `NU-PUBLIC-DEMO-20261121T121811Z-f9b42ac`
- Snapshot status: **PARTIAL — source baseline captured; live HTTP/runtime observation not independently accessible**
- Public demo URL: https://mobinabinshun-beep.github.io/mobinabinshun-beep/
- Pages deployment workflow: [run 44903216151](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44903216151)
- Pages source/build version reported by deploy job: `f9b42ac092304ec2fce8978427af9b13070e59c8`
- Pages build/deploy/report jobs: all successful in run 44903216151
- Capture time: 2026-11-21 12:18:11 UTC (workflow creation time; source read-back performed in this capture)
- Source commit: [`f9b42ac092304ec2fce8978427af9b13070e59c8`](https://github.com/mobinabinshun-beep/mobinabinshun-beep/commit/f9b42ac092304ec2fce8978427af9b13070e59c8)
- Git tree SHA: `f9b42ac092304ec2fce8978427af9b13070e59c8`
- Tracked blobs indexed: 280; recursive tree truncated: false
- Source manifest: [SOURCE-TREE-MANIFEST.json](./SOURCE-TREE-MANIFEST.json)

## Identity and evidence boundary

The GitHub Pages deployment job for run 44903216151 reports a successful deployment and explicitly records Pages build version `f9b42ac092304ec2fce8978427af9b13070e59c8` and environment URL above. This establishes the Pages source/build identity reported by GitHub Actions. A direct HTTP fetch of the served HTML/assets was not available through the current verification interface; therefore the actual live response body, cache state, browser-rendered state and runtime storage are **not independently captured**. Do not claim a complete live runtime snapshot or a full backup.

## Basket status

| Basket | Indexed files | Status |
|---|---:|---|
| 01-SOURCE-AND-ENTRYPOINTS | 7 | SOURCE-CAPTURED |
| 02-PAGES-AND-ROUTES | 8 | SOURCE-CAPTURED |
| 03-UI-AND-STYLES | 8 | SOURCE-CAPTURED |
| 04-RUNTIME-MODULES | 38 | SOURCE-CAPTURED |
| 05-ASSETS | 12 | SOURCE-CAPTURED |
| 06-BUILD-AND-CONFIG | 9 | SOURCE-CAPTURED |
| 07-TESTS | 49 | SOURCE-CAPTURED |
| 08-DATA-SCHEMAS-AND-STORAGE | 2 | SOURCE-CAPTURED |
| 09-DOCUMENTATION-AND-DEPENDENCY-REFERENCES | 69 | SOURCE-CAPTURED |
| 10-LIVE-DEPLOYMENT-EVIDENCE | 1 workflow run + deploy job log | PARTIAL — GitHub Pages reports success; external HTTP read-back unavailable |
| 11-OBSERVED-RUNTIME-AND-INPUT-STATE | 0 live captures | NOT CAPTURED — no browser/device session or runtime storage snapshot |
| 12-DATA-AND-LOCAL-STORAGE | source references only | PARTIAL — no live user data or browser storage copied |
| 13-DEPENDENCY-AND-INTEGRATION-MAP | source tree and module references | PARTIAL — source-level map only, not a live network/runtime trace |
| 14-RESTORE-AND-ROLLBACK | source commit + verified backup refs | PARTIAL — source restoration references recorded; live Pages rollback not exercised |

## Verified source recovery points

- Pre-demo default source backup: `backup/pre-pixel-art-studio-human-demo-current-2026-11-21` — intended to match `f9b42ac092304ec2fce8978427af9b13070e59c8`; verify compare result in the change record.
- Candidate source backup: `backup/pre-public-demo-pixel-art-studio-candidate-2026-11-21-r2` — exact candidate branch head; verify compare result in the change record.
- Historical pre-demo capture branch: `backup/pre-pixel-art-studio-human-demo-2026-11-21` at the prior source SHA `f6396096ddc2d9cd3d508006289422f35c87b213`.
- Studio code candidate remains in PR #238; this snapshot is the pre-candidate demo source baseline, not the candidate.

## Restore instructions

1. The source-level baseline is recoverable from commit `f9b42ac092304ec2fce8978427af9b13070e59c8` and its exact Git tree/blob identities in `SOURCE-TREE-MANIFEST.json`.
2. The pre-demo backup ref above is the intended fast source restore point; confirm it remains identical before any restore.
3. Do not restore or rewrite the public demo solely from this partial snapshot if the live served state differs. First capture the actual live state or compare its Pages build identity and asset responses.
4. If a critical demo regression is observed, stop further candidate changes, preserve evidence, notify the owner, and use the verified pre-demo checkpoint under the project's rollback protocol.

## Known gaps

- Direct live HTTP body and response headers.
- Browser-rendered screenshots at desktop/mobile viewports and portrait/landscape.
- Actual runtime local/session storage and state-flow observations (without private user data).
- Asset response/cache identity and service-worker/cache behavior, if any.
- Network/dependency runtime trace.
- Restore exercise against the live Pages environment.

This snapshot is intentionally **PARTIAL**. The missing baskets are explicit; no complete backup claim is made.
