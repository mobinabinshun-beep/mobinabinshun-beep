# Gateway, navigation and controller integration — 2026-11-17

**Status:** MACHINE VERIFIED AND MERGED TO DEFAULT/PAGES SOURCE BRANCH — live demo link-check UNVERIFIED; human/device QA pending  
**Branch:** `feature/gateway-controller-navigation-2026-11-17`  
**Baseline:** `2f81cf268fe6b89338d6c8001a86538ea917d730`  
**Preservation branch:** `preservation/pre-gateway-controller-navigation-2026-11-17`  
**Verified source candidate:** `026a65da2a8d7b5a0feace4e7e6d97ebcaca3470`  
**Verified recovery branch:** `backup/pre-public-demo-gateway-controller-2026-11-17`  
**Merged PR:** [#166](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/166)  
**Merge commit:** `b2a0b5ed6bc4489a43641272300361e438d6653b`

## Scope

- Keep Gateway as the sole navigation/pause entry point in the mounted game and player utility views.
- Add Profile to Gateway's mounted scope; route Gateway Back through the existing view-stack close controls so nested navigation returns to the exact prior view.
- Hide the duplicate Profile Back control while Gateway is present, matching the existing Bag, Inventory and Wallet behavior.
- Make Gateway pause the active round and release only the pause it owns. A pre-paused or inactive round is not resumed by closing Gateway.
- Add keyboard arrow navigation and Enter/Space confirmation for Gateway options.
- Keep mouse hover as the visible option highlight and a single click as the action. Touch remains direct activation with synthetic-click suppression.
- Add standard Gamepad API support: D-pad/left stick moves between Gateway options or game targets; A confirms; B closes Gateway.
- Stop gamepad polling while the game is paused, Gateway is open, or the document is hidden.
- Keep the classic LV/XP/Mana HUD, game economy, save schema and Exchange rules outside this change.

## Files changed

- `nu-games.js`
- `nu-hex-gateway.js`
- `nu-hex-gateway.css`
- `nu-gateway-pause.js` (new pure pause-ownership helper)
- `index.html` (load the helper before the game runtime; cache-bust the game script)
- `NU-GENERATION-1-MANIFEST.json`
- `tests/nu-gateway-controller-input.test.js`
- `tests/nu-gateway-pause.test.js`

## Machine checks — PASS

All seven GitHub Actions workflows completed successfully for source candidate `026a65da2a8d7b5a0feace4e7e6d97ebcaca3470`:

| Workflow | Run | Result |
|---|---:|---|
| Gateway main-game regression | 43963602868 | PASS — 15/15 |
| Studio export regression gates (full `tests/*.test.js`) | 43963603092 | PASS — 277/277 |
| Wallet and Profile regression | 43963603310 | PASS — 54/54 |
| Exchange feature regression | 43963603141 | PASS — 54/54 |
| Graphics integrity | 43963603148 | PASS |
| Graphics preview smoke checks | 43963603247 | PASS |
| Generation 1 HUD layout regression | 43963603197 | PASS |

The focused pause helper tests cover running, pre-paused, inactive, completed and repeated-close states. Gateway tests cover Back/Pause exclusivity, Profile mounting, nested Wallet/Profile history, mouse highlight/click, keyboard navigation, Gamepad navigation/confirmation, hidden-tab behavior and background freeze hooks.

The recovery branch `backup/pre-public-demo-gateway-controller-2026-11-17` was verified identical to the tested source candidate SHA above. Browser/device interaction and human visual acceptance remain **NOT VERIFIED** and are not implied by CI.

## Release state

- Candidate implementation is machine-verified, backed up and merged to the repository's default branch (the configured source branch used for the public site).
- Public demo URL: `https://mobinabinshun-beep.github.io/mobinabinshun-beep/`.
- Live demo link-check could not be completed by the available page-fetch path; deployment visibility is therefore **UNVERIFIED**, not PASS.
- No production promotion is included. Human QA remains pending. This record does not claim HUMAN-QA-PASSED, OWNER-APPROVED or SCOPE-LOCKED.

## Human demo checklist

1. Open a core game; open Gateway. Confirm the round stops immediately and target positions/progress remain fixed.
2. Close Gateway. Confirm only a Gateway-created pause is released and the same round continues.
3. Navigate Menu/Profile from Gateway and close the destination. Confirm the round remains paused until the destination is dismissed.
4. Open Gateway in Bag, Inventory, Wallet and Profile. Confirm no duplicate Back control is visible.
5. Test Menu → Bag → Wallet → Profile → Back → Wallet → Back → Bag. Confirm the exact prior view is restored at every step.
6. Mouse: hover each option to see the active highlight; click once to activate.
7. Keyboard: use arrows to move, Enter/Space to activate, Tab to traverse, Escape to close.
8. Gamepad: D-pad or left stick to move, A to activate, B to close. Repeat inside a game to select targets and use A to interact.
9. Touch: tap Gateway and options; confirm there is no duplicate activation.
10. Switch tabs while Gateway is open and verify hidden-tab rendering/input stops; return and verify no abandoned round is restarted.
11. Repeat on phone portrait/landscape and with reduced-motion enabled.

## Exclusions

No classic LV/XP/Mana HUD edits, game-rule/economy changes, save migration, Store/Exchange changes, unrelated module redesign, or production promotion.
