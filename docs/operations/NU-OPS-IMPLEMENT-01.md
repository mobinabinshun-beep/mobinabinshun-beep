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
- The Gateway exposes exactly three one-click actions: **Back, Menu, Profile**. No Settings action is included in the current Gateway.
- Opening the Gateway freezes the active round and all background rendering/ambient loops until the user decides. This includes the game loop, Background Engine, Dynamic Layers and Pixel World. Closing without a route selection restores only a pause that the Gateway itself initiated.
- Hide duplicate in-game navigation triggers (the topbar MENU button and the game-view BACK button) while gameplay is active. Keep the actual PAUSE/RESUME and game-specific controls operable; they are not duplicate navigation controls.
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
