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

## 3. Explicit freeze lock — Gateway operating gate
**LOCK ID:** NU-LOCK-GATEWAY-ICON-01  
**Status:** SCOPED UNFREEZE APPROVED — 2026-11-15; Generation 1 main-game pages only.  
**Owner correction:** This section supersedes the earlier Settings-based three-action description.

- The Gateway is an operational decluttering gate: it replaces scattered in-game navigation clicks with one entry point.
- It is visible only while an actual Generation 1 game is active in index.html. Keep it hidden on home/library and all non-game views.
- The Gateway exposes exactly three actions: **Back, Menu, Profile**. No Settings action is included in the current Gateway.
- The primary controller is movement-first: mouse/pen hover over the hex opens it; moving over Back/Menu/Profile executes that action without a click or a separate selection. Touch contact on the hex opens it and freezes the page; touch contact/movement onto an option executes it. Click/Enter remain fallback input paths for accessibility, not required steps for pointer/touch users.
- Opening the Gateway freezes the active round and all background rendering/ambient loops until the user decides. This includes the game loop, Background Engine, Dynamic Layers and Pixel World. Closing without a route selection restores only a pause that the Gateway itself initiated.
- Hide duplicate in-game navigation triggers (the topbar MENU button and the game-view BACK button) while gameplay is active. While Gateway is open, its scrim blocks every page/game control outside the Gateway; those controls return unchanged after close. The Gateway is not a replacement for the player's ordinary Pause/Resume control outside the Gateway.
- Menu opens a centered modal directory. Each module entry contains only a concise title and a keyboard keycap. Do not place descriptions, statistics, previews or destination content inside the menu; render content in the destination view/page.
- Menu order is fixed for this scope: player modules first (Store, Profile, Exchange, Wallet), then games (Painting, Random Game, Bubble Hunt, Mana Collector, Chaos Attack). Random Game selects only from the three core Generation 1 games; Painting is not in the random pool.
- Store-purchased assets are non-exchangeable. Exclude them from Exchange asset selectors, balance-history charts and virtual market simulation while retaining ownership in the Wallet.
- The Gateway remains hidden and behaviorally inactive on Casino, Launcher, Creative Studio, Pixel Art Studio, Wallet and Exchange. Future analogous gates for other areas require separate owner approval and their own access rules.
- Existing game rules, HUD, save schema and wallet balances are preserved except for the explicit Exchange eligibility rule above.

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

## 7. Mandatory human-acceptance gate — owner rule (2026-11-15)

**Rule:** No implementation, release candidate, feature, or defect is marked APPROVED or REJECTED solely from automated checks, source inspection, or an agent's assessment. A human test and a traceable human report are required first.

- CI-PASSED means only that the recorded automated workflows passed. It is not human acceptance.
- Before a human report exists, the acceptance state must remain **PENDING HUMAN TEST / PENDING HUMAN REPORT**. Do not convert that state to APPROVED or REJECTED.
- A failed CI run may be recorded as an automated failure, but it does not by itself constitute the owner's final human acceptance/rejection decision.
- The human report must identify the candidate commit/build, date, tester (or anonymous tester ID), device, OS, browser, viewport/orientation, input method (mouse/touch/keyboard), test scenario, expected result, actual result, PASS/FAIL, and evidence or reproduction steps. Do not collect passwords, private credentials, or unnecessary personal data.
- Each reported defect receives a reproducible issue with severity, affected build, steps, expected/actual behavior, and evidence. Fixes require a new candidate build and a repeat human test of the affected scenario.
- Final acceptance is recorded only after the required human scenarios have reports. A mixed result remains **PARTIALLY TESTED / PENDING**, not globally approved.
- Merge/deployment must not be used to bypass this gate. If a separate public preview is explicitly prepared for testing, label it **TEST CANDIDATE — NOT APPROVED** and preserve rollback; public availability itself is not acceptance.
- Keep the following states distinct: **IMPLEMENTED**, **CI-PASSED / CI-FAILED**, **HUMAN-QA-PENDING**, **HUMAN-QA-PASSED / HUMAN-QA-FAILED**, **APPROVED / REJECTED**, **MERGED**, and **DEPLOYED**. No state implies another.
