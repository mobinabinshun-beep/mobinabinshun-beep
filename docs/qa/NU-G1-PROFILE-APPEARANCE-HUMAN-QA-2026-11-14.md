# N.U Gen1 Player Profile — Unified Demo Human QA

**Target:** Public demo profile view on the feature branch
**Status:** Pending human browser/device acceptance
**Boundary:** All workshop functions are local visual simulations. No authentication, secure save, upload service, server sync or public sharing is implemented.

## Historical card
- [ ] Original image placeholder and Name, Callsign, Family Name and Age fields remain intact.
- [ ] Desktop two-column and mobile single-column layout remain usable.
- [ ] Editing text still shows the privacy warning.
- [ ] Closing the profile clears entered text and resets all workshop controls.

## Appearance
- [ ] Hue, neutral white/dark tint and color lightness operate independently.
- [ ] Appearance panel remains separate below the historical card.
- [ ] Stage A sliders respond to mouse, touch and keyboard.
- [ ] Confirm simulates Stage B lock and disables appearance sliders, profile text fields and public/private visibility toggles.
- [ ] After the simulated lock, only image replacement and the 2×4 placement controls remain editable.
- [ ] Reset returns to Stage A and default appearance.
- [ ] Appearance confirmation does not claim to persist across sessions.

## Privacy and identity concept
- [ ] All public-field toggles start unchecked.
- [ ] Selecting a field includes only that field in the public preview.
- [ ] Family Name and Age are private by default.
- [ ] Private-view toggle is clearly labelled simulation only.
- [ ] No real password or personal/sensitive data is entered during testing.

## Image and placement concept
- [ ] Local image selection previews in the placeholder without network upload.
- [ ] Eight placement cells render in a 2 × 4 grid.
- [ ] Selecting each cell updates the placement state.
- [ ] Closing the profile removes the local preview and restores the placeholder.
- [ ] File selection and placement work on desktop and mobile where supported.

## Game data separation
- [ ] Profile card remains separate from HP, XP, Mana, Wallet balances and transaction history.
- [ ] No fabricated statistics appear in the historical profile card.

## Human report
Record browser and OS, device class, viewport, pass/fail per item, console errors, accessibility issues and screenshots with all personal information excluded.
