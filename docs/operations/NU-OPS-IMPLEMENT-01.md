# N.U Implementation & Calibration Protocol

**Protocol ID:** NU-OPS-IMPLEMENT-01  
**Status:** Active — mandatory for implementation requests  
**Effective:** 2026-11-13  
**Testing rule update:** 2026-11-14 — public-demo-first human acceptance

## 1. Trigger
For every instruction such as «اعمال کن»، «پیاده کن»، «فیکس کن»، «دیباگ کن»، «کالیبره کن»، «بهینه کن»، «بکاپ بگیر» or «مستند کن», apply this procedure.

## 2. Mandatory implementation sequence
1. Inspect the exact target, current default-branch commit, related files, shared dependencies and tests.
2. Create a timestamped backup branch from the exact inspected commit before editing.
3. Work on a separate candidate branch; do not experiment directly on the public default branch.
4. Keep the change minimal and localized. Change only the files and behavior required by the request. Preserve the existing layout, visual identity, game rules, save schema, wallet, routes, accessibility and responsive behavior unless the owner explicitly asks otherwise.
5. Before editing, list the intended files and observable effects. If the request could change unrelated screens or behavior, ask one clarification before proceeding.
6. Run syntax checks and relevant regression tests. Review the complete diff for unrelated changes, accidental formatting/reflow, cache/version mistakes and documentation drift.
7. Record the request, exact files, decisions, backup ref, candidate ref, tests, limitations and rollback method in a dated conversation archive and implementation record.
8. Open a PR with a narrow scope and test evidence. Merge/deploy only through the approved project workflow and after the required checks and release authorization. Label human QA separately from CI.
9. Preserve candidate branches, CI evidence and rollback information after merge.

## 3. Public demo is the human-acceptance environment — mandatory
**The N.U team tests product behavior in the public browser demo.** This is the canonical project testing practice and must be followed for all member/team acceptance rounds.

1. Human testers must use the published N.U public demo URL (or an explicitly approved public demo preview URL) in a real browser on their own device. Do not ask members to test by opening source files, GitHub code pages, a local file:// URL, localhost, or a developer-only environment.
2. Before inviting testers, verify that the public demo actually serves the candidate build. Record the exact public URL, deployed commit/build identifier, deployment time and test window. A PR branch or source commit is not proof that the candidate is deployed.
3. If the candidate is not present on the public demo, mark the round **NOT READY FOR HUMAN QA / HUMAN-QA-PENDING**. Do not substitute source inspection or local execution and do not tell members that a source link is a live test link. Arrange the authorized demo deployment first.
4. Keep demo testing distinct from production release. Publish only to the established/approved demo environment and follow the owner’s release authorization. No production release, merge, domain/DNS change, or deployment-configuration change is implied by a request to prepare tests.
5. After deployment verification, share one public demo link and the matching human-test report template/checklist with the owner, members and test team. Give testers the build identifier and the scenarios in scope.
6. Each tester completes a separate report from the actual public demo session. Record date/time and timezone, tester alias (optional), device/model, OS, browser/version, viewport, input method, reduced-motion setting, public URL and build identifier. Mark every scenario PASS / FAIL / NOT RUN and include actual observations, reproduction steps, and optional screenshots/video.
7. Collect reports from members and the test team through the project’s approved feedback intake (existing issue/report forms or the designated team channel). Consolidate duplicate findings, preserve each reproducible report, assign severity, and link defects to the tested build.
8. Retest fixes on a newly identified public demo build. Do not carry forward a prior PASS to a different build without retesting affected scenarios.
9. Human acceptance is **HUMAN-QA-PASSED** only after real-device/browser reports cover the required scenarios and environment details. Automated tests, CI, code review, and a deployment badge are supporting evidence, never substitutes for member/team human QA.

### Required test-state vocabulary
- **CODE-CHECKED:** source inspection or focused local checks completed.
- **CI-PASSED:** required automated workflow checks passed for the exact candidate commit.
- **DEMO-DEPLOYED:** the public demo is verified to serve the recorded candidate commit/build.
- **HUMAN-QA-PENDING:** member/team testing has not been completed or evidence is incomplete.
- **HUMAN-QA-PASSED:** required public-demo scenarios have been accepted based on recorded human sessions.
- **HUMAN-QA-FAILED:** one or more blocking/major defects prevent acceptance.

Never collapse these states into a single “tested” or “ready” claim.

## 4. Explicit freeze lock — Gateway icon
**LOCK ID:** NU-LOCK-GATEWAY-ICON-01  
**Status:** SCOPED UNFREEZE APPROVED — 2026-11-14; main game page only.

- The owner explicitly authorized unfreezing the Gateway only while an actual game is active in index.html. Keep it hidden on the home screen, library, menu, profile, store and all non-game views.
- Gateway must remain hidden and behaviorally inactive on Casino, Launcher, Creative Studio, and all other internal pages until separate owner approval. Existing legacy navigation remains available.
- Keep the legacy main MENU and in-game PAUSE/RESUME controls visible and operable; Gateway is additive navigation, not a replacement for those controls.
- Do not change Gateway destinations, shared game rules, wallet/save data, or unrelated pages as part of this scoped unfreeze.
- Gateway actions are limited to Back/Home, Menu Options (existing menu), and Settings Options (existing Launcher settings route). Any further page expansion or new destination requires separate explicit owner approval.

## 5. Shield visibility
- Do not display a shield meter, charge bar, shield capsule or shield status when the player has no shield item/state.
- Do not fabricate a default/full shield charge. A shield indicator may appear only after a real, persisted or authoritative shield-ownership/active-state source exists.
- If no such source exists in the current game model, keep the shield UI absent until the owner requests a real shield system.

## 6. Verification checklist
- [ ] Only requested files and behaviors changed.
- [ ] Frozen features remain inaccessible and visually absent outside their explicitly approved scope.
- [ ] No placeholder resource meter is shown without a real owned resource.
- [ ] Existing HP, Mana, XP, wallet, save and game flows remain unchanged.
- [ ] Relevant syntax and regression tests pass for the exact candidate commit.
- [ ] Public demo deployment is verified against the candidate build before inviting human testers.
- [ ] Members/team complete the required real-browser/device reports on the public demo.
- [ ] Desktop/mobile layout and input behavior are checked where relevant.
- [ ] Archive, implementation record, test reports and rollback reference are updated.

## 7. Rollback and evidence
Rollback by reverting the scoped PR/commit or restoring the exact pre-change backup branch. Never force-push the public default branch. Record CODE-CHECKED, CI-PASSED, DEMO-DEPLOYED, HUMAN-QA-PENDING, HUMAN-QA-PASSED and HUMAN-QA-FAILED as distinct states. A deployment does not imply human acceptance; human acceptance does not by itself authorize production release.
