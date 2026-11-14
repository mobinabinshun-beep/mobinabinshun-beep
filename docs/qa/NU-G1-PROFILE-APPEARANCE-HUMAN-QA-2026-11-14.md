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
- [ ] After the simulated lock, only image replacement and the 2×4 placement controls remain editable, including the extended profile and visual-design controls.
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

## Extended operational profile concepts
- [ ] Age Band, Bio and Interests appear separately from the historical four-field card.
- [ ] Extended fields are optional, temporary and private by default.
- [ ] Frame material, typography and corner geometry update the preview.
- [ ] Hologram intensity, edge glow and glass transparency update the preview.
- [ ] Scan lines, data texture and ambient motion can be toggled.
- [ ] Quality preset is visible as a preview choice; reduced-motion remains respected.
- [ ] Local save, encrypted export/import and future network sections are clearly labelled as not implemented.

## Game data separation
- [ ] Profile card remains separate from HP, XP, Mana, Wallet balances and transaction history.
- [ ] No fabricated statistics appear in the historical profile card.

## Human report
Record browser and OS, device class, viewport, pass/fail per item, console errors, accessibility issues and screenshots with all personal information excluded.

## Decision variants to compare
- [ ] Saturation can be adjusted independently as a fourth comparison axis; judge whether it adds value or should be removed.
- [ ] Age mode switches between exact age, age band, both for comparison, and no age field.
- [ ] Stats location switches between citizen card, separate HUD, Wallet projection and hidden; no invented values are displayed.
- [ ] Lock policy can be compared: appearance only; appearance plus profile text; all profile and appearance fields except photo/position.
- [ ] Public-card availability choices are visible: optional, local-identity-required/public-optional, and required comparison.
- [ ] Share preview is blocked unless explicit consent is selected; no network transfer occurs.
- [ ] YES/NO private-access flow is understandable; only fake test text is used and no authentication occurs.
- [ ] Recovery options can be previewed without recovering or changing data.
- [ ] Local save, export, import and server-sync buttons clearly report simulation only and create no file, save or network request.
- [ ] Image fit toggles crop-to-fill / contain.
- [ ] 2×4 grid can be compared as image anchor or photo slot.
- [ ] Full lock leaves image fit and placement available; the other two lock policies behave according to their labels.

- [ ] Target platform options can be compared: browser, Windows, Linux/macOS, Android and iOS.
- [ ] Delivery options can be compared: launcher-integrated, standalone and both.
- [ ] Local save, export protection, import validation and future sync models are visible as concepts only.
- [ ] Authentication model alternatives are visible without collecting real credentials.
- [ ] Reduced decorative effects and high-contrast preview work and reset on close.
- [ ] Browser reduced-motion preference overrides ambient animation.
