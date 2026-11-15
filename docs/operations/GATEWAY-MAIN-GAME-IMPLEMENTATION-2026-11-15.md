# N.U Generation 1 — Main-game Gateway implementation record

**Record:** NU-G1-GATEWAY-2026-11-15  
**Status:** CANDIDATE — PR #113 OPEN; CI AND HUMAN DEVICE QA PENDING
**Pull request:** https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/113  
**Authorization:** Owner explicitly unlocked the Gateway on 2026-11-15 for the main game pages only.  
**Target repository:** mobinabinshun-beep/mobinabinshun-beep

## Request and scope

Implement the compact N.U hexagonal navigation gateway on the active Generation 1 game view only. Keep the home/library screen free of the gateway icon. Expose exactly three gateway actions:

1. **Back / Home** — return to the existing home view.
2. **Menu Options** — open the existing main navigation menu.
3. **Settings Options** — navigate to the existing Launcher settings page.

The gateway remains hidden and behaviorally inactive on Casino, Launcher, Creative Studio, wallet/profile views, and all other pages. Existing legacy MENU and PAUSE/RESUME controls remain available.

## Preservation and branch protocol

- Inspected default branch: `Official-public-information-and-discovery-hub-for-N.U-(Niroo-Universe),-its-publishing-network,-projects,-publications-and-related-creative-works`
- Backup branch created before edits: `backup/pre-gateway-main-game-2026-11-15`
- Candidate branch: `feature/gateway-main-game-focused-2026-11-15`
- All edits were made on the candidate branch; the public default branch was not edited directly.
- Backup branch is an untouched pre-change snapshot of the inspected default branch.

## Candidate files changed

- `index.html` — cache-busted Gateway assets and changed the three action labels/routes.
- `nu-hex-gateway.css` — removed wallet activation scope; preserved compact fixed positioning, 20% trigger/option emphasis and reduced-motion behavior; removed the rule that cancelled the visual blur.
- `nu-hex-gateway.js` — restricted controller activation to the active game view; Back/Home, existing Menu, Launcher Settings; mouse hover dwell, touch release activation, two-step click/keyboard confirmation, 10px outside tolerance.
- `nu-games.js` — responds to Gateway open/close events by pausing/resuming the game background renderer and pixel-world renderer, in addition to the existing round pause control.
- `tests/nu-hex-gateway.test.js` — replaced obsolete wallet/profile/store expectations with main-game-only scope, three routes, renderer pause/resume and regression assertions.
- `NU-GENERATION-1-MANIFEST.json` — recorded the scoped candidate and explicit QA-pending state.

## Explicitly unchanged

- Casino page, Casino game logic and Casino routes.
- Launcher page and its settings implementation.
- Creative Studio, Pixel Art Studio and drawing tools.
- Wallet transaction logic, XP/Mana values, save schema and game rules.
- Classic LV / XP / Mana HUD markup and styles.
- HP Capsule implementation and shield/N-BI resource model.
- No product source in other repositories or other Generation 1 pages. A read-only archival copy of this implementation record was added to `mobinabinshun-beep/Repository` under `Operations/2026-11-15/`.

No shield meter was added. No shield state is fabricated.

## Intended observable behavior

- Gateway icon is absent on home/library and every non-game view.
- On an active game, the fixed hex icon is visible at the upper-right game-frame position.
- Hovering the icon opens the gateway; touching/clicking it opens the gateway.
- Opening freezes the active round and ambient world renderers. The translucent scrim blurs the background while keeping the gateway controls above it.
- Three unboxed orbital controls appear. Hovering a mouse option selects and activates it after a short dwell; touch release activates directly; click/keyboard confirmation uses a two-step selection.
- Leaving the expanded gateway region by more than the 10px boundary tolerance closes it and resumes the previous round state.
- Escape and clicking the scrim close the gateway and restore the previous state.
- Existing menu and pause controls remain available.

## Validation and outstanding checks

- Source-level assertions were updated in `tests/nu-hex-gateway.test.js`.
- Static JavaScript parse checks passed for `nu-hex-gateway.js`, `nu-games.js`, and the updated test file.
- Manifest JSON parsing and scoped-source assertions passed in the connector-side review.
- GitHub Actions on the earlier PR head: Latest code-head CI: Gateway main-game regression PASSED (run #100); graphics preview smoke PASSED (#718); HUD layout regression PASSED (#119); graphics integrity PASSED (#298).
- Two broader workflows failed outside this Gateway change: wallet/profile regression (#119) and Studio export regression (#524). Both report the same two profile-preview assertions: the old tests expect a file input and eight photo-placement controls, while the inspected base-branch profile markup has no `type="file"` input and no `data-demo-placement` controls. These files/features are outside this authorized scope and were not changed.
- Overall CI is NOT GREEN: wallet/profile regression (#124) and Studio export regression (#531) still fail on the same two unrelated profile-preview assertions. Gateway, HUD, graphics integrity and smoke checks pass. Do not merge while required checks remain red.
- Static JavaScript parsing and scoped-source assertions passed; real browser behavior and human device QA remain pending.
- JavaScript syntax/runtime and real-browser interaction: PENDING.
- Desktop, Android/iOS touch, responsive layout, keyboard and reduced-motion human QA: PENDING.
- GitHub Pages deployment: NOT CLAIMED.
- This candidate is not a release and must not be described as human-approved.

## Rollback

Preferred rollback is to close/revert the scoped candidate PR. The exact pre-change source remains available on `backup/pre-gateway-main-game-2026-11-15`. Do not force-push the public default branch.

## Conversation archive summary

Owner authorized reopening the Gateway for the main game only. The user explicitly excluded all other pages from changes pending separate approval. This record captures the implemented scope and validation state; it does not claim that every file in every N.U repository has been exhaustively read.
