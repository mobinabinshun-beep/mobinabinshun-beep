# N.U Public Demo — Community Test Plan (2026-11-15)

**Target:** The currently deployed public GitHub Pages demo.  
**Purpose:** Collect reproducible reports from independent testers before the next release decision.  
**Status:** COMMUNITY-QA-REQUESTED. A report is evidence, not an automatic approval to change product behavior.

## Before testing

1. Open the public demo in a current desktop or mobile browser.
2. Record the exact demo URL and candidate version/full commit SHA shown for the build, if available.
3. Record browser/version, OS, device class, viewport, input method and reduced-motion setting.
4. Use a fresh browser profile only when testing first-visit behavior; use your normal profile for save/persistence checks.
5. Do not enter real names, contact details, passwords, financial information or other sensitive data.
6. Do not assume local XP, Mana, HP, Casino Credits or Exchange history sync between devices. They are browser-local demo data.
7. Test only behavior that is actually present in the build. Mark unavailable or unexposed features NOT APPLICABLE rather than assuming they work.

## Test matrix

### A. Home, navigation and startup

- [ ] Home screen loads without a blank/overlapping foreground.
- [ ] Startup calibration completes and ENTER WORLD becomes usable.
- [ ] Home screen does not start a game automatically.
- [ ] Main menu, library and page navigation open and return correctly.
- [ ] No horizontal page overflow at phone width.
- [ ] Background/atmosphere never covers, blurs, dims or intercepts foreground controls.

### B. Generation 1 games

For each game — Bubble Hunt, Mana Collector and Chaos Attack:

- [ ] Launch the game and confirm the title and HUD are readable.
- [ ] Missed clicks/taps do not advance the round.
- [ ] Successful interactions advance exactly one step, from 1/10 to 10/10.
- [ ] Pause/resume preserves round progress and target state.
- [ ] Completing a round produces the documented reward and does not exceed resource caps.
- [ ] Reload behavior is understandable; do not assume an unfinished round is restored.

**Chaos Attack extra checks**
- [ ] A successful N-BI shot removes one mass and consumes the documented Mana cost.
- [ ] A mass reaching the defensive boundary causes one HP damage and disappears.
- [ ] Multiple boundary crossings in one frame do not reset or corrupt HP.
- [ ] Test with insufficient Mana and record the exact message/behavior.

**Mana Collector extra checks**
- [ ] Rewards stop at configured storage capacity without displaying a false balance.

### C. Wallet, Store and HP Capsule

- [ ] Wallet balances match actions performed in this browser.
- [ ] Zero-value assets/rows are not misleadingly displayed.
- [ ] Buying an HP Capsule deducts the documented XP and adds one capsule.
- [ ] Using an owned capsule consumes exactly one and restores no more than missing HP (maximum HP is 10).
- [ ] Store count refreshes immediately after use; HUD and Store counts stay synchronized.
- [ ] Empty inventory and full HP prevent invalid use with clear feedback.
- [ ] No real-money, deposit, withdrawal or cash-out flow is presented.

### D. Casino and Exchange

**Casino**
- [ ] Coin Flip, Lucky Dice and Mini Slots accept valid inputs.
- [ ] Invalid/over-budget wagers are blocked without corrupting the local balance.
- [ ] A completed round updates Casino Credits only.
- [ ] Refresh preserves the local demo ledger in the same browser profile.

**Exchange**
- [ ] Exchange opens and returns to the world.
- [ ] Asset selector lists only implemented Generation 1 assets.
- [ ] Chart values agree with recorded local transaction deltas and reconstructed balances.
- [ ] Empty history is shown honestly; no market prices or exchange rates are invented.
- [ ] Conversion remains unavailable unless approved pairs/rates/fees are actually implemented.
- [ ] Replay controls, zoom/history range, candles, volume, indicators and themes remain usable when present.
- [ ] Store-purchased assets remain owned in Wallet but are excluded from Exchange eligibility.
- [ ] Chart remains legible on phone screens.

**Important:** Exchange history is local asset-balance history, not a market-price chart. The ledger is browser-local and has a limited retained history.

### E. Player Profile demo

- [ ] Profile opens/closes without trapping navigation.
- [ ] Temporary text fields show the public-demo privacy warning.
- [ ] Closing the profile clears temporary text and resets the preview.
- [ ] Appearance controls update the preview and reset as documented.
- [ ] Public/private and save/export/import concepts are clearly identified as simulations.
- [ ] Photo-frame actions are display-only in the public demo: they must not open a file picker, read a local file, persist an image, upload or download anything.
- [ ] No real personal data or credentials are entered.

### F. Creative Studio

- [ ] Import a non-sensitive sample image; confirm it stays local to the browser.
- [ ] Test pencil, eraser, fill, eyedropper, line, rectangle and ellipse.
- [ ] Undo/redo restores the expected prior state.
- [ ] Resize/zoom does not create nested page/canvas scrolling or hide tools.
- [ ] Try SVG, PNG and Graphic IR exports where available.
- [ ] Exported SVG contains editable vector geometry, not an embedded source raster.
- [ ] Oversized operations are refused safely with an understandable message.
- [ ] Closing/reloading does not imply cloud upload or cross-device sync.

### G. Gateway, accessibility and devices

- [ ] Gateway is visible only while an actual Generation 1 game is active; it remains hidden on Home/Library and non-game views.
- [ ] Gateway exposes exactly three actions: Back, Menu and Profile. Settings is not a Gateway action.
- [ ] Each action works with one click/tap and can be activated by keyboard.
- [ ] Opening Gateway pauses the active round and decorative background rendering.
- [ ] Closing Gateway resumes only a pause that Gateway itself initiated; a pause already set by the player remains in effect.
- [ ] HUD, game controls and foreground text remain clear and interactive while Gateway is open.
- [ ] Menu opens the centered module directory; its order and entries match the current documented menu contract.
- [ ] Test mouse, touch and keyboard separately.
- [ ] Escape/focus behavior and reduced-motion mode remain usable.
- [ ] Test phone portrait and landscape, tablet and desktop if available.
- [ ] Switch tabs and return; hidden-page animation should pause/resume without state corruption.

## How to report a defect

Use the repository's **Public Demo Feedback** issue form. Include:
- the exact demo URL and full candidate commit SHA/version, if displayed;
- test date/time and tester alias (optional);
- device, OS, browser/version, viewport and input method;
- numbered reproduction steps;
- expected result and actual result;
- frequency (always / sometimes / once) and severity (blocker / major / minor / visual);
- a screenshot or short recording only after removing names, account data and other personal information.

Do not file duplicate reports for the same reproducible defect; add a comment to the existing report if it matches. For ideas or preferences, use the feedback section and label them as suggestions rather than bugs.

## Release decision

- **CI-PASSED:** automated checks pass.
- **DEPLOYED-TEST-CANDIDATE:** the exact candidate commit is actually live and visibly labelled as not human-approved.
- **HUMAN-QA-PENDING:** one or more required device/scenario reports remain outstanding.
- **PARTIALLY-TESTED:** some scenarios have reports; overall acceptance remains pending.
- **HUMAN-QA-PASSED / APPROVED:** only after the required human reports are reviewed and the human owner records an explicit decision.

Passing automated tests does not prove visual, touch, accessibility or real-device acceptance. Deployment and report submission do not themselves approve a release.
