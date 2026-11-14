# N.U Implementation & Calibration Protocol

**Protocol ID:** NU-OPS-IMPLEMENT-01  
**Status:** Active — mandatory for implementation requests  
**Effective:** 2026-11-13

## 1. Trigger
For every instruction such as «اعمال کن»، «پیاده کن»، «فیکس کن»، «دیباگ کن»، «کالیبره کن»، «بهینه کن»، «بکاپ بگیر» or «مستند کن», apply this procedure.

## 2. Mandatory sequence
1. Inspect the exact target, current default-branch commit, related files, shared dependencies and tests.
2. Create a timestamped backup branch from the exact inspected commit before editing.
3. Work on a separate candidate branch; do not experiment directly on the public default branch.
4. Keep the change minimal and localized. Change only the files and behavior required by the request. Preserve the existing layout, visual identity, game rules, save schema, wallet, routes, accessibility and responsive behavior unless the owner explicitly asks otherwise.
5. Before editing, list the intended files and observable effects. If the request could change unrelated screens or behavior, ask one clarification before proceeding.
6. Run syntax checks and relevant regression tests. Review the complete diff for unrelated changes, accidental formatting/reflow, cache/version mistakes and documentation drift.
7. Record the request, exact files, decisions, backup ref, candidate ref, tests, limitations and rollback method in a dated conversation archive and implementation record.
8. Open a PR with a narrow scope and test evidence. Merge/deploy only after the requested scope and required CI checks are satisfied. Label human QA separately from CI.
9. Preserve candidate branches, CI evidence and rollback information after merge.

## 3. Explicit freeze lock — Gateway icon
**LOCK ID:** NU-LOCK-GATEWAY-ICON-01  
**Status:** SCOPED UNFREEZE APPROVED — 2026-11-14; main game page only.

- The owner explicitly authorized unfreezing the Gateway for the main game page (index.html, including its home/library and active game views).
- Gateway must remain hidden and behaviorally inactive on Casino, Launcher, Creative Studio, and all other internal pages until separate owner approval.
- Keep the legacy main MENU and in-game PAUSE/RESUME controls visible and operable; Gateway is additive navigation, not a replacement for those controls.
- Do not change Gateway destinations, shared game rules, wallet/save data, or unrelated pages as part of this scoped unfreeze.
- Any further page expansion requires a new explicit owner approval identifying the target pages and behavior.

## 4. Shield visibility
- Do not display a shield meter, charge bar, shield capsule or shield status when the player has no shield item/state.
- Do not fabricate a default/full shield charge. A shield indicator may appear only after a real, persisted or authoritative shield-ownership/active-state source exists.
- If no such source exists in the current game model, keep the shield UI absent until the owner requests a real shield system.

## 5. Verification checklist
- [ ] Only requested files and behaviors changed.
- [ ] Frozen features remain inaccessible and visually absent.
- [ ] No placeholder resource meter is shown without a real owned resource.
- [ ] Existing HP, Mana, XP, wallet, save and game flows remain unchanged.
- [ ] Relevant syntax and regression tests pass.
- [ ] Desktop/mobile layout and input behavior are checked where relevant.
- [ ] Archive, implementation record and rollback reference are updated.

## 6. Rollback and evidence
Rollback by reverting the scoped PR/commit or restoring the exact pre-change backup branch. Never force-push the public default branch. Record CI-PASSED, DEPLOYED, HUMAN-QA-PENDING and HUMAN-QA-PASSED as distinct states; automated CI is not human browser acceptance.
