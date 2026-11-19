# Debug register — N.U

This is the durable index for reproducible defects, human QA reports, interaction traces and verified resolutions. Keep original human reports verbatim; append investigation and resolution rather than replacing history.

## Active records

| Record | Area | State | Canonical evidence |
|---|---|---|---|
| Unified interaction core | Touch, physical mouse, selective/click controllers, virtual mouse, Gateway, platform UI, game objects | Object-level producers for Bubble Hunt, Mana Collector and Chaos Attack merged; 71/71 Gateway and 341/341 full Gen1 tests pass on deployed SHA `a814cf2`; physical/end-to-end QA pending | [Interaction system contract](./INTERACTION-SYSTEM-2026-11-19.md) · [Backlog](../operations/INTERACTION-DEBUG-BACKLOG-2026-11-19.md) · [Change record](../operations/INTERACTION-GAME-OBJECT-PRODUCERS-CHANGE-RECORD-2026-11-19.md) |
| Gateway/controller interaction failure | Virtual pointer, Gateway option selection and gameplay interaction | Latest build `a814cf2` machine-tested and Pages-deployed; direct HTTP read-back NOT_TESTED; HUMAN-QA-PENDING; original failed report preserved | [Issue #210](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/210) |
| Gateway/controller baseline | Pause ownership, navigation, simulated pointer | Normative prior contract; newer owner direction takes precedence | [Gateway/controller contract](../operations/GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md) |

## Required fields for every new debug record

1. Original human report (verbatim), timestamp and reporter context.
2. Device/input translator, OS/browser, page/game and interaction context.
3. Expected result versus actual result.
4. Minimal reproduction steps and frequency.
5. Target object/control and event path (capture → normalize → resolve → target → select → confirm → authorize → execute).
6. Console/runtime traces and evidence references, with secrets and personal data removed.
7. First affected commit/build and last known-good build, when known.
8. Root cause (confirmed or explicitly suspected), fix commit and changed files.
9. Focused tests, regression results and exact tested SHA.
10. Demo deployment URL, verified live build identity and deployment run.
11. Human retest outcome, exact tested build and remaining observations.

## State vocabulary

- REPORTED: human observation captured, not yet reproduced.
- INVESTIGATING: evidence collection and reproduction in progress.
- FIXED-UNVERIFIED: code changed; tests or deployed build not yet verified.
- MACHINE-APPROVED-LOCKED: declared automated checks pass on an exact immutable SHA and that exact build is deployed to demo with identity verified.
- HUMAN-QA-PENDING: machine-approved candidate awaits owner testing.
- HUMAN-QA-FAILED / REOPENED: human reports failure; affected scope returns to investigation regardless of previous machine pass.
- HUMAN-ACCEPTED: owner explicitly accepts the exact tested build. Never infer this state.

Machine approval and human acceptance are separate. A CI pass alone is not machine approval under this protocol; deployment identity must also be verified. Never overwrite a failed human report with a machine-pass status.

## Retention

- Keep dated records append-only in practice: corrections add a new dated section or linked record.
- Link every record from this index and link relevant issues/PRs/commits back here.
- Preserve decisions, constraints, test evidence and human feedback that can accelerate later development.
- Do not store credentials, tokens, private personal data or unredacted sensitive logs.


## Historical checkpoint — 2026-11-19 — Gamepad single-route correction

- Runtime candidate: `bc3557e96a58cb3d0cff73fc3fd5139e44ae2a84`.
- Pre-change recovery: `backup/pre-gamepad-single-input-route-2026-11-19` → `1384d160735ad12f68011469e740fd0288384e24`.
- Exact candidate checkpoint: `checkpoint/machine-approved-gamepad-single-input-2026-11-19-final` → `bc3557e96a58cb3d0cff73fc3fd5139e44ae2a84`.
- Gateway 68/68; Arcane Shield 83/83; full Generation 1 338/338; Graphics integrity 13/13.
- Pages deployment [44404722479](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44404722479) succeeded with the exact candidate SHA and public demo URL.
- Human QA remains pending. No real-device acceptance or owner acceptance is claimed.

## Latest verified checkpoint — 2026-11-19 — Game-object producers

- Producer candidate: `e8d207edd73083be578d7d301e07cbc1e474671a`; merged by PR #219 at `4665e11f2a3a34eaef0a9fba2b252b1689f43ad1`.
- Cache-fix candidate: `d1da424e707b44a370b6e42567766ddfac414f2b`; merged by PR #220 at `a814cf20e28e0a1f4455c4e9fd094a9948f74f86`.
- Final cache key: `nu-games.js?v=20261119-game-object-events-r1`.
- Gateway/main-game: 71/71 PASS — [run 44427652450](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652450).
- Full Generation 1: 341/341 PASS — [run 44427652536](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652536).
- Studio export, graphics preview/static validation and graphics integrity passed — runs 44427652401, 44427652390 and 44427652309.
- PRE-CHANGE backups: `backup/pre-game-object-instrumentation-2026-11-19` → `9440dc05676e81516466c13b49f3d43a1e5f4a1b`; `backup/pre-game-object-cache-bust-2026-11-19` → `4665e11f2a3a34eaef0a9fba2b252b1689f43ad1`.
- Post-test checkpoint: `checkpoint/post-test-game-object-cache-bust-2026-11-19` → `d1da424e707b44a370b6e42567766ddfac414f2b`.
- Pre-release checkpoint: `checkpoint/pre-release-game-object-cache-bust-2026-11-19` → `a814cf20e28e0a1f4455c4e9fd094a9948f74f86`.
- Pages deployment [44427652015](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44427652015) succeeded and reports `pages_build_version` equal to the final merge SHA. Direct HTTP/browser read-back remains NOT_TESTED.
- Human QA remains pending; no physical-device or owner acceptance is claimed. Issue #210 remains open.
