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

- The owner explicitly authorized unfreezing the Gateway only while an actual game is active in index.html. Keep it hidden on the home screen, library, menu, profile, store and all non-game views.
- Gateway must remain hidden and behaviorally inactive on Casino, Launcher, Creative Studio, and all other internal pages until separate owner approval. Existing legacy navigation remains available.
- Keep the legacy main MENU and in-game PAUSE/RESUME controls visible and operable; Gateway is additive navigation, not a replacement for those controls.
- Do not change Gateway destinations, shared game rules, wallet/save data, or unrelated pages as part of this scoped unfreeze.
- Gateway actions are limited to Back/Home, Menu Options (existing menu), and Settings Options (existing Launcher settings route). Any further page expansion or new destination requires separate explicit owner approval.

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


## 7. Scoped freeze — Generation 1 player profile appearance
**LOCK ID:** NU-LOCK-G1-PROFILE-APPEARANCE-01  
**Status:** PRE-PACKAGING FREEZE REQUESTED — 2026-11-14

- Preserve the restored historical profile card and its four fields.
- Keep the three appearance axes in a separate panel below the card: hue spectrum, neutral white/dark tint, and selected-color lightness.
- Do not change the panel structure or the three-axis model before Generation 1 packaging without explicit owner approval.
- The public demo controls are temporary preview controls only; they reset on close and do not persist.
- This freeze is not a declaration of operational completion. The operational launcher-mounted downloadable build must implement the two-stage selection, final confirmation lock, image upload, and 2×4 image placement grid described in `docs/implementation/NU-G1-PLAYER-PROFILE-OPERATIONAL-SPEC.md`.
- At Generation 1 closeout, package the operational build, not the public demo. Server deployment and native platform installers remain separate deliverables with their own acceptance evidence.
