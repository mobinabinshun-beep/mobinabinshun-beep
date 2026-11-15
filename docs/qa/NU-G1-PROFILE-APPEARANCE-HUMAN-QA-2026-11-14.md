# N.U Gen1 Player Profile — Public Demo Human QA

**Target:** Currently deployed public GitHub Pages demo.  
**Status:** HUMAN-QA-PENDING.  
**Scope:** This checklist reflects the latest public-demo boundary recorded in the root README on 2026-11-15. Older workshop specifications may describe concepts that are not enabled in the public demo.

## Historical card and privacy

- [ ] Original card layout and Name, Callsign, Family Name and Age fields remain readable.
- [ ] Desktop and mobile layouts remain usable without clipped controls.
- [ ] Editing temporary text displays the public-demo privacy warning.
- [ ] Closing the profile clears temporary text and resets preview controls.
- [ ] Test only with fictional values; do not enter personal or sensitive information.

## Appearance workshop

- [ ] Hue, neutral tint and lightness controls update the preview independently where exposed.
- [ ] Optional saturation comparison is clearly identified as a preview choice.
- [ ] Confirm/reset behavior matches the labels shown in the current demo.
- [ ] Any simulated lock or public/private view is clearly described as local preview only.
- [ ] Reduced-motion and high-contrast behavior remain usable.

## Photo-frame boundary — important

The latest public-demo README states that the two photo-frame actions are visual-only. They must not open a file picker, read a local file, persist an image, upload or download an image.

- [ ] Upload Image action is visibly identified as a demo-only/non-operational control.
- [ ] Download Previous Image action is visibly identified as a demo-only/non-operational control.
- [ ] Activating either action does not open a picker, read/write local data or initiate a network request.
- [ ] No obsolete test should require a file input or eight active 2×4 placement controls unless the owner explicitly changes the public-demo scope.

## Simulated concepts

- [ ] Public-field toggles, private-view, save/export/import, sharing, recovery and sync concepts are labelled as simulations/not implemented wherever shown.
- [ ] No real authentication, password collection, public sharing or server synchronization is implied.
- [ ] Profile card remains separate from HP, XP, Mana, Wallet balances and transaction history.

## Report

Record browser/OS, device class, viewport, input method, reduced-motion setting, pass/fail per item, console errors and screenshots with all personal information removed. Submit findings through the repository's Public Demo Feedback issue form.

**Acceptance:** Human QA remains pending until real desktop and mobile reports are reviewed by the project owner.
