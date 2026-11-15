# N.U Project-wide operational audit and execution checklist

**Audit date:** 2026-11-15  
**Audit baseline:** `c72d6705faf037bf21a0a570fa9a5f0c5c09565c`  
**Scope:** all 11 repositories visible in the linked GitHub installation; primary source, archive, project modules and public placeholders.  
**Classification:** machine evidence and human acceptance are separate. A merged commit, passing CI or Pages deployment never implies human approval.

## 1. Executive status

The project is an active Generation 1 browser prototype. The primary implementation lives in `mobinabinshun-beep/mobinabinshun-beep`; the private `Repository` is the active historical/archive/quarantine record. The other connected repositories are currently shells or empty repositories, not parallel implementations.

At the audit baseline:
- Public default branch contains the current prototype and multiple merged improvements.
- Latest observed public Pages deployment succeeded at commit `c72d6705faf037bf21a0a570fa9a5f0c5c09565c`.
- No evidence in the inspected records establishes owner human acceptance for the current whole project or for all merged changes.
- The latest owner human test explicitly rejected the gameplay navigation/HUD outcome: legacy menu remained in gameplay and unintended/base-layout drift was observed.
- Treat the current public demo as **deployed, machine-checked in selected workflows, but human-rejected / acceptance not granted** until a new deployed candidate passes the owner's test.

## 2. Repository inventory

| Repository | Observed contents | Operational role |
|---|---|---|
| `mobinabinshun-beep/mobinabinshun-beep` | Full Generation 1 source, assets, tests, workflows, manifests, docs, backup branches | **Canonical active source and public demo** |
| `mobinabinshun-beep/Repository` | Extensive historical backups, archives, quarantines, operation records; PRs #1–3 | **Private archive / evidence repository** |
| `Intelligence-Execution-Core` | README only; one initial commit | Empty placeholder; no executable core audited |
| `Creative-Studio` | README only; one initial commit | Empty placeholder; actual Studio code is in canonical source repo |
| `Repository1`, `Repository2`, `Repository3` | README only; one initial commit each | Empty archive placeholders |
| `Repository4`, `Repository5` | Git repository empty / no readable commits or tree | Empty placeholders |
| `Public_Repository`, `Public` | No readable tree/commit evidence | Empty public placeholders |

No code changes were made to placeholder repositories. Do not split or migrate source into them without a separate architecture decision.

## 3. Status vocabulary (mandatory)

Every feature and release gate must use one of these states:

1. **IMPLEMENTED** — code exists in the canonical branch.
2. **MACHINE-PASSED** — named automated checks passed for an exact commit.
3. **MACHINE-FAILED** — one or more required checks failed.
4. **DEPLOYED** — exact commit/build is on the public demo.
5. **HUMAN-PENDING** — no owner test report for that exact deployed build.
6. **HUMAN-REJECTED** — owner reported a reproducible defect or mismatch.
7. **HUMAN-APPROVED** — explicit owner approval for the exact tested build and scope.
8. **FROZEN** — no change without a new, direct, scoped owner instruction.
9. **BLOCKED** — dependency, conflict, missing evidence or failed gate prevents progression.

A feature can be IMPLEMENTED + MACHINE-PASSED + DEPLOYED + HUMAN-PENDING at once. Do not compress these into a single "done" label.

## 4. Verified implemented work and current evidence

### 4.1 Runtime, game and core
- Generation 1 browser prototype, game modules, random pool (Bubble, Mana, Chaos), 10 interactions/round, localStorage save key `nu-world-save-v1` are present in the manifest.
- `nu-engine.js` is a frozen baseline (ENGINE-LOCK.md); no routine visual/game feature may edit it.
- Runtime diagnostics are bounded heuristics, not true CPU/GPU benchmarking or general Internet speed/packet-loss tests.
- No server account or cloud save is documented; do not imply cloud persistence.

### 4.2 Gateway and navigation
- Scoped Gateway unfreeze was merged in PR #76; current implementation is main-game-only by protocol.
- Current `NU-OPS-IMPLEMENT-01` explicitly says legacy MENU and PAUSE/RESUME remain visible and Gateway is additive.
- The manifest's historical note for Generation 1.32.1 says duplicate legacy menu/back buttons were removed from internal views, which conflicts with the current implementation record and owner test.
- PR #84 (active gameplay declutter) attempts to hide the shared topbar only during active gameplay and make Gateway the on-demand entry. It is **OPEN, not merged**, and GitHub reports `mergeable=false`, `mergeable_state=dirty`.
- PR #84 Gateway regression, HUD layout and graphics integrity passed; static validation, wallet regression and Studio export regression failed. Do not call the PR green.
- Owner's latest human report confirms the classic menu still appears in gameplay and rejects the current navigation outcome.

### 4.3 HUD / resources
- PR #78 moved LV and embedded XP/Mana labels; this was later superseded by PR #97 restoring the classic stacked LV → XP → Mana presentation.
- PR #97 merged; focused HUD and Gateway checks passed, but wallet and Studio export workflows failed on that candidate.
- PR #105 merged a temporary lock for classic LV/XP/Mana bars. Current lock is in `docs/operations/LOCKED-AREAS.md`; it protects markup, order, labels, values, CSS, responsive behavior and tests.
- The canonical HUD snapshot is in `docs/archive/2026-11-15/classic-resource-hud/nu-world.css.snapshot`.
- Do not modify the locked classic resource HUD unless the owner explicitly requests that specific change.
- HP capsule behavior has dedicated tests and prior interaction work; human visual acceptance of current integrated layout remains unverified.
- N-BI/shield meter must remain absent without a real owned/active shield source.

### 4.4 Background and visual layers
- PR #98 restored playable world fallback when the canonical background asset fails.
- PR #99 made network diagnostics non-blocking for world entry.
- PR #100 fixed background stacking behind interactive content.
- PR #102 adopted the UI layer and extension isolation constitution; PR #103 refreshed the CSS cache.
- PR #94 background integration merged; PR #95 follow-up instrumentation/stabilization remains open.
- PR #108 exact canonical background PNG publication is open draft; graphics integrity and preview smoke passed for its current head, but this is not human visual acceptance.
- PR #92 layered material preview and PR #80 uncropped background review candidate remain open drafts.
- Latest owner visual report should be treated as human rejection for the affected game-page composition until retested.

### 4.5 Player profile, wallet, Casino, Exchange, Studio and Launcher
- Profile/player card and wallet features exist in the canonical source with local/demo limitations described in the manifest and docs.
- Casino exists as a separate local virtual-credit game; it must not be conflated with real-money functionality.
- Creative Studio, Launcher, Exchange and their workflows/files are present in the canonical source repository; their presence is not equivalent to final human acceptance.
- PR #106 read-only wallet/profile Exchange bridge is open draft.
- PR #107 wallet static holographic backdrop is open draft. On its current head, HUD and graphics preview checks passed but wallet/profile regression and Studio export regression failed.
- PR #79 safe SVG import / odd pixel boards / Blueprint guide is open draft.
- PRs #89 profile workshop and #90 classic XP/Mana restoration are open; inspect supersession and stale branches before any merge. PR #97 already merged the classic bars; PR #105 subsequently locked them.
- Studio raster import performance PR #31 and PRs #28–30 remain open; do not merge overlapping/stale branches without rebasing and focused regression.

## 5. Machine verification snapshot

### Public default branch
- Latest observed Pages build/deploy for baseline `c72d6705...`: build, status report and deploy jobs **SUCCESS**.
- Graphics preview smoke and graphics integrity succeeded for recent default-branch commits.
- This is evidence of build/deployment only, not proof of full functional correctness or human approval.

### Open candidate failures / conflicts
- PR #84: Gateway regression PASS; HUD layout PASS; graphics integrity PASS; static validation FAIL; wallet regression FAIL; Studio export regression FAIL; mergeability DIRTY.
- PR #107: graphics integrity, preview smoke and HUD layout PASS; wallet/profile regression FAIL; Studio export regression FAIL.
- PR #95: Studio export regression FAIL on observed head; PR remains open.
- PR #97: focused HUD, static validation, Gateway and graphics checks PASS; wallet and Studio export checks FAIL.
- PR #108: graphics integrity and graphics preview smoke PASS on observed head; remaining checks and human acceptance not established.
- Do not suppress, relabel or ignore failures because the changed files appear unrelated. Triage each failure to determine pre-existing baseline failure versus regression, and document evidence.

## 6. Frozen / protected boundaries

Read and enforce all of:
- `ENGINE-LOCK.md`: frozen `nu-engine.js`.
- `docs/operations/LOCKED-AREAS.md`: classic LV/XP/Mana HUD lock.
- `STUDIO-EXPORT-LOCK.md` and `STUDIO-KNOWN-GOOD-LOCK.md`: Studio export/known-good boundaries.
- `docs/operations/NU-OPS-IMPLEMENT-01.md`: scoped Gateway unfreeze and implementation discipline.
- `Operations/2026-11-15/NU-UI-LAYER-AND-EXTENSION-SAFETY-CONSTITUTION-2026-11-15.md`: layer/extension isolation rules.
- `docs/PUBLIC-DEMO-HUMAN-ACCEPTANCE-GATE.md`: human acceptance is blocking.
- `CHANGE-AND-DEMO-PROTOCOL.md`: backup → archive → isolated implementation → CI → public demo → human test → explicit approval.

Default protected surfaces unless explicitly authorized: engine, game rules, save schema, wallet/economy, Casino, Home/Library, Launcher, Studio, profile, assets/material source, responsive behavior, accessibility, routes and all frozen HUD elements.

## 7. Project-wide operational checklist

### Gate 0 — Establish the source of truth
- [ ] Record exact default-branch SHA, deployment SHA, candidate SHA and timestamps.
- [ ] Identify canonical source repository; mark all shell repositories as non-authoritative.
- [ ] Inventory open PRs and identify duplicate/stale/superseded work.
- [ ] Reconcile contradictions between manifest notes, operations records, active code and owner direction.
- [ ] Capture current public demo as-is before any further change.

### Gate 1 — Dual approval scope
- [ ] **Allowed-to-change list:** exact screen, behavior, files and observable effect requested by owner.
- [ ] **Must-not-change list:** protected screens, modules, data, rules, visual identity and routes.
- [ ] Identify shared dependencies and CSS selectors that could leak into other screens.
- [ ] If a request is ambiguous or affects a protected boundary, stop and ask before coding.
- [ ] Owner approves the scope before implementation.

### Gate 2 — Backup and archive
- [ ] Create backup branch from the exact inspected commit.
- [ ] Archive every file to be changed with original path and checksums where practical.
- [ ] Verify retrieval of backup and archive.
- [ ] Write a dated request/conversation record, acceptance criteria and rollback procedure.

### Gate 3 — Isolated implementation
- [ ] One issue/change per branch and PR.
- [ ] Keep the diff minimal; no opportunistic refactors, formatting sweeps or broad CSS changes.
- [ ] Add/adjust only focused tests for the requested behavior.
- [ ] Review diff against both allow-list and protected deny-list.
- [ ] Compare screenshots/DOM/layout against the classic baseline where visual calibration is involved.

### Gate 4 — Machine checks
- [ ] Syntax and parse checks.
- [ ] Focused unit/regression tests.
- [ ] Cross-module regression (Gateway, HUD, wallet, profile, Studio, Casino, Launcher as affected).
- [ ] Asset/path/cache checks.
- [ ] Responsive checks at desktop, phone portrait and landscape.
- [ ] Reduced-motion and keyboard/touch/mouse checks.
- [ ] Full PR checks pass; failures are classified with reproducible evidence.
- [ ] Record exact workflow IDs, commit SHA, commands and outcomes.

### Gate 5 — Demo deployment
- [ ] Merge only after scope review and required checks.
- [ ] Confirm Pages deployment succeeded for exact merge SHA.
- [ ] Open the public URL and verify served build/revision, not just GitHub Actions green.
- [ ] Record known limitations and human test instructions.

### Gate 6 — Human acceptance
- [ ] Owner tests the exact public deployment on desktop and mobile.
- [ ] Record browser, OS/device, orientation, reproduction steps and expected/actual behavior.
- [ ] Capture screenshots/logs only when voluntarily provided.
- [ ] Mark each criterion HUMAN-APPROVED or HUMAN-REJECTED separately.
- [ ] Rejected item returns to Gate 1 with a new backup and narrow fix.
- [ ] No production promotion or permanent lock based only on CI or deployment.

### Gate 7 — Closeout
- [ ] Update manifest, operations record, changelog and archive.
- [ ] Preserve PR, backup, candidate and rollback refs.
- [ ] Close stale/superseded PRs only after verifying no unique work is lost.
- [ ] Keep unresolved items visibly BLOCKED / HUMAN-PENDING.
- [ ] Owner explicitly authorizes final promotion.

## 8. Prioritized execution backlog

| Priority | Work item | Current state | Next action |
|---|---|---|---|
| P0 | Reconcile Gateway/menu behavior | HUMAN-REJECTED; PR #84 open/dirty | Resolve conflicting protocol/manifest, inspect exact diff, create fresh scoped candidate |
| P0 | Protect classic HUD and compare with reference | PR #97 merged; PR #105 lock merged | Keep locked; human visual check only, no source edits |
| P0 | Reconcile page composition/layers with owner baseline | PR #100/#102/#103 merged; latest human report rejects layout | Compare current deployed page with archived classic snapshots; identify exact unintended deltas |
| P0 | Restore clean public human-test candidate | Deployed baseline exists; acceptance not granted | Only after P0 fixes and full CI pass, deploy new candidate and request owner test |
| P1 | Background asset finalization | PR #108 open draft; PR #95 open | Validate canonical source, fallback, layer order and performance; separate machine vs human states |
| P1 | Wallet/profile regressions | PR #107 and #106 open drafts; failures observed | Triage failures before further feature work |
| P1 | Studio import/export | PR #79, #28–31 open; export failures in candidates | Establish known-good baseline and close regressions before new features |
| P1 | Player profile human acceptance | PR #89 open; prior work merged | Test exact public build and privacy/local-only claims |
| P2 | Exchange integration | PR #77/#106 drafts; local simulation exists | Keep offline/local claims explicit; test deterministic replay and wallet bridge in isolation |
| P2 | Launcher/Casino cross-page QA | Code present; Gateway explicitly frozen off these pages | Regression test routes, game launch, credits/save separation |
| P2 | CI noise and repository hygiene | PR #21 draft; many overlapping old PRs | Deduplicate only after dependency/supersession review |
| P3 | Placeholder repositories | README-only or empty | Keep non-authoritative; decide future ownership/role before moving code |

## 9. Gateway conflict resolution rule

The current active operations protocol says legacy MENU and PAUSE/RESUME remain visible and Gateway is additive. The owner has now reported that persistent MENU in gameplay is unacceptable and the requested design expects the Gateway to be the compact navigation access point while the game is active. PR #84 implements this direction but is dirty and has failed unrelated workflow gates.

Therefore:
- Do not merge PR #84 as-is.
- Treat the owner’s latest direct report as the newest product direction for active gameplay.
- Reconcile the manifest's historical "single navigation entry point" note and `NU-OPS-IMPLEMENT-01` section 3 in a documentation-only decision record before code changes.
- Preserve Home/Library and non-game navigation; do not remove global navigation from non-game views.
- Keep pause/resume behavior and engine/gameplay untouched.
- Make the menu/Gateway adjustment only in the main game active-state scope, with a focused test proving the menu is absent in active gameplay and Gateway is available, then verify no other route changes.

## 10. Audit limitations

- Repository discovery covered all 11 installed repositories returned for the owner query. Several are empty or README-only; no source tree was available to audit there.
- Full semantic review of every line in the large source repository was not performed in this pass. This is a repository, branch, PR, manifest, protocol, test-workflow and key-document audit, not a formal security audit.
- Human acceptance is based only on recorded owner reports. No independent physical device testing was performed by this audit.
- Machine results are commit-specific and can become stale after any subsequent push.

**Final state:** operational inventory and backlog established. No runtime files changed by this audit. Human approval remains outstanding; the latest gameplay/navigation feedback is rejected and blocks project-wide acceptance.
