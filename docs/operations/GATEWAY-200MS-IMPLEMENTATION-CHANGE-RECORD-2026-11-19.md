# Gateway 200 ms Direct Mouse/Touch — Runtime Change Record

- **Date:** 2026-11-19
- **Owner authorization:** explicit confirmation in the active conversation
- **Related requirement record:** [PR #224 — 200 ms direct Gateway dwell](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/224)
- **Tracking issue:** [#210 — unified input translators and interaction core](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/210)
- **Candidate branch:** `fix/gateway-200ms-direct-dwell-2026-11-19`
- **Pre-change source SHA:** `72d9cd05925b6b3e965aa0d490692399e37ec321`
- **Pre-change recovery ref:** `backup/pre-gateway-200ms-direct-input-2026-11-19`

## 1. Scope and protected boundaries

### Allow-list
- `nu-hex-gateway.js`: direct physical mouse/touch trigger dwell, actionable-option dwell, cancellation and duplicate-event handling.
- `index.html`, `launcher.html`, `casino.html`, `pixel-art-studio.html`: Gateway runtime script cache key only.
- `tests/nu-gateway-controller-input.test.js`, `tests/nu-gateway-pointer-controller-mode.test.js`, `tests/nu-hex-gateway.test.js`: focused contract and timed runtime regression coverage.
- This change record.

### Deny-list
- `nu-controller-pointer.js`: no changes; simulated-pointer adapter is protected.
- `nu-interaction-core.js`, Gateway CSS/markup, game canvas routing, global CSS and unrelated modules.
- Classic LV/XP/Mana HUD, game rules, game objects, wallet/save/economy, assets, unrelated pages and deployment configuration.

## 2. Pre-change evidence and backup

- The default branch source head was inspected at `72d9cd05925b6b3e965aa0d490692399e37ec321`.
- Recovery ref `backup/pre-gateway-200ms-direct-input-2026-11-19` was created at that SHA. A read-back of `nu-hex-gateway.js` succeeded and matched the inspected blob `ea8c211381a11a9322c8fd8e729ae259ab6ece3c`.
- The runtime source at that head used 500 ms for physical mouse trigger hover, direct touch trigger opening on pointerup, and mouse option hover selection without dwell execution.

### Public-demo runtime snapshot limitation

- Historical QA evidence records Pages build/deploy run `44374258659` and deployed source SHA `14fcd0bc254258519077339d1095af9967c98e4b` at the time of Issue #204.
- The public URL is `https://mobinabinshun-beep.github.io/mobinabinshun-beep/`.
- Independent HTTP/browser read-back of the currently served page and assets is unavailable in this execution environment.
- Therefore the currently live build identity is **UNVERIFIED** and the decomposed PRE-CHANGE Runtime Baseline Snapshot is **PARTIAL / NOT BACKUP-VERIFIED**. The historical Pages record is not represented as proof of the current live build. Uncaptured live baskets remain explicitly NOT CAPTURED; no complete runtime backup is claimed.

## 3. Owner-confirmed target behavior

- Physical mouse hover on the Gateway trigger: 200 ms opens Gateway.
- Physical touch held on the Gateway trigger: 200 ms opens Gateway.
- A shorter direct touch tap opens/closes immediately.
- Physical mouse hover on an actionable Gateway option: 200 ms executes the action without requiring a prior Select.
- Physical touch held on an actionable option: 200 ms executes the action without requiring a prior Select.
- A shorter direct touch tap and a direct mouse click remain immediate.
- Changing target, leaving/cancelling, or releasing before the dwell threshold cancels the pending dwell action.
- One physical gesture produces at most one execution; touch compatibility clicks are suppressed after the native touch path.

## 4. Simulated-pointer invariants

The shared `nu-controller-pointer.js` adapter is unchanged. Its contract remains:
- 1000 ms Gateway trigger-entry dwell.
- Directional movement/highlight and hierarchical option navigation only.
- A/Enter performs the separate confirmation.
- Existing B/Escape cancel, extra-Down exit, and leave/re-enter behavior remain unchanged.

## 5. Implementation and verification

Candidate head SHA at this assessment: `7be547379085abf2e40d3c435856d5825653330d`.

### Machine evidence for this candidate SHA

- Gateway workflow run [#495](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44549576572): JavaScript syntax step **PASS**; test step **89 PASS / 2 FAIL**.
- All tests in the changed Gateway test files passed, including the 16 direct-input / dwell / cancellation / simulated-pointer isolation checks added for this change.
- The two failing assertions are outside this PR's changed files:
  1. `tests/nu-controller-pointer.test.js:23` expects the stale `nu-games.js?v=20261119-game-object-events-r1` token in `index.html`.
  2. `tests/nu-interaction-core.test.js:83-84` uses an over-escaped CSS selector regex for the game canvas.
- These are recorded as **unrelated baseline blockers**, not silently fixed by expanding this Gateway scope.
- Graphics preview/static validation [run #1398](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44549577207): **PASS**.
- Graphics integrity [run #756](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44549576655): **PASS**.
- Exchange [run #315](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44549576756), wallet/profile [run #455](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44549576900), and HUD layout [run #454](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44549576823): **PASS**.
- Studio export [run #1279](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44549576738) and full Generation 1 [run #129](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44549577371): **FAIL** on the same two unrelated assertions. The focused Arcane/Mana tests passed.

Do not infer machine approval from the documentation-only PR #224 or from a partial workflow pass.

Required focused checks:
- 199 ms does not trigger; 200 ms does.
- Physical mouse trigger dwell and immediate click.
- Touch trigger dwell and shorter immediate tap.
- Mouse and touch option dwell without Select.
- Cancellation on target change, release and pointer cancellation.
- Touch compatibility-click deduplication / one gesture one execution.
- Simulated pointer remains at 1000 ms with directional navigation and separate A/Enter confirmation.
- Syntax, Gateway main-game regression and relevant cross-page load/cache checks.

## 6. Release and acceptance state

- Runtime implementation: **CANDIDATE IMPLEMENTED; PR #225 OPEN**.
- Changed Gateway tests: **PASS**; overall Gateway/Generation 1 CI: **PARTIAL / BLOCKED BY 2 UNRELATED ASSERTIONS**.
- PRE-RELEASE candidate backup: **NOT CREATED** (full CI gate not green).
- Deployment and live build identity: **NOT VERIFIED**.
- Physical mouse/touch device QA: **PENDING**.
- Simulated-pointer physical-device regression QA: **PENDING**.
- Owner acceptance: **PENDING**.

A successful CI run validates only the checks that ran on its exact SHA. It does not establish a deployed build, live behavior, human QA or owner acceptance.
