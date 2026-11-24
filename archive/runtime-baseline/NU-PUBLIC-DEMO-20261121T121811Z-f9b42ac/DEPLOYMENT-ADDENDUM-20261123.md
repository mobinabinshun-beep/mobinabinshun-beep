# Runtime Baseline Snapshot — 2026-11-23 Pages artifact addendum

- Parent Snapshot ID: NU-PUBLIC-DEMO-20261121T121811Z-f9b42ac
- Addendum ID: NU-PUBLIC-DEMO-ARTIFACT-20261123T132306Z-ff00c755
- Status: PARTIAL — exact GitHub Pages build artifact captured and hashed; direct served HTTP body/cache and browser runtime state remain unverified.
- Public Studio URL: https://mobinabinshun-beep.github.io/mobinabinshun-beep/pixel-art-studio.html
- Public Library URL: https://mobinabinshun-beep.github.io/mobinabinshun-beep/index.html#library-section
- Pages workflow: [run 45183379421](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/45183379421)
- Pages source/build SHA reported by deploy job: ff00c755378b12eb9c4af035804ab52db5a76908
- Build, deploy and report-build-status jobs: SUCCESS
- Pages artifact ID: 14822971147
- Artifact archive: https://api.github.com/repos/mobinabinshun-beep/mobinabinshun-beep/actions/artifacts/14822971147/zip
- Artifact SHA-256: 6ee3de8324a3e5b6e40277b671fb758c6f2374ef4f92687242b7b4f101533fd1
- Artifact size: 7,349,846 bytes
- Artifact contents: artifact.tar containing 324 deployed-site entries
- Artifact captured locally at verification time as /mnt/data/nu-pages-baseline-ff00.zip; extracted verification copy: /mnt/data/nu-pages-baseline-ff00/
- Capture time: 2026-11-23 13:23 UTC

## Exact deployed-file identity checks

Git blob SHA values computed from the downloaded Pages artifact match the current default-branch file blobs at source SHA ff00c755378b12eb9c4af035804ab52db5a76908:

| Deployed file | Git blob SHA |
|---|---|
| pixel-art-studio.html | e6abbc9b9727e1fd4907ee374a5ddd2508608c45 |
| nu-pixel-art-studio.js | a9da9c75819a4327125ffdc59626a9e85feb0f08 |
| nu-studio-pro-tools.js | 720c0a38d21d909999dbe19464340c2d4f432781 |
| nu-studio-layout.js | d9f918521e6b5a066717dc09df8e9be343504036 |
| nu-hex-gateway.js | 8d45bfd5a7c53a884d6f90f97b996eda3729395b |

The full artifact SHA-256 identifies the complete downloaded deployment archive; the table above independently verifies the Studio entrypoint, two core Studio modules, layout module and shared Gateway file.

## Recovery point

- Pre-change source backup branch: backup/pre-color-mixing-brush-2026-11-23
- Backup base SHA: ff00c755378b12eb9c4af035804ab52db5a76908
- GitHub compare result: IDENTICAL, 0 ahead / 0 behind.
- Working candidate branch: feat/pixel-art-studio-color-mixing-brush-2026-11-23
- No runtime source file had been modified at the time this snapshot was captured.

## Coverage and limitations

- Source/deployment artifact basket: CAPTURED — exact Pages artifact archive and SHA-256 retained in the current execution workspace; exact source blob identities recorded above.
- Pages deployment identity basket: CAPTURED — GitHub Actions reports the successful Pages build version and environment URL.
- Served HTTP response body, response headers, CDN/cache state and browser-rendered screenshots: NOT CAPTURED — direct HTTP retrieval was blocked in the current verification environment.
- Browser/device runtime storage and observed input state: NOT CAPTURED — no live browser/device session was available at capture time.
- Physical Android/iOS devices: NOT TESTED.
- No user-specific local storage or private user data was copied.

This addendum improves the source/deployment-artifact evidence over the 2026-11-21 snapshot but intentionally does not upgrade the parent snapshot to COMPLETE. A later Playwright live-demo run can add automated browser evidence; physical-device and owner human QA remain separate.
