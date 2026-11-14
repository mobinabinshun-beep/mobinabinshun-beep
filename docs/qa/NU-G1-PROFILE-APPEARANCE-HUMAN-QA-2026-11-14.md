# N.U Gen1 Player Profile — Appearance Preview Human QA

**Target:** Public demo profile view  
**Status:** Pending human browser/device acceptance  
**Related specification:** `docs/implementation/NU-G1-PLAYER-PROFILE-OPERATIONAL-SPEC.md`

## Desktop
- [ ] Open Player Profile from the navigation menu.
- [ ] Confirm the original image placeholder and Name, Callsign, Family Name and Age fields remain in the historical layout.
- [ ] Confirm the appearance panel is a separate bordered card directly below the profile card.
- [ ] Move the hue slider and confirm the card color family changes.
- [ ] Move White ↔ Dark and confirm a neutral white/black tint changes without changing the selected hue.
- [ ] Move Color Light ↔ Dark and confirm the selected color's lightness changes.
- [ ] Confirm displayed values track each slider.
- [ ] Edit a profile text field and confirm the privacy warning appears.
- [ ] Change appearance only and confirm it does not trigger the personal-data warning.
- [ ] Close and reopen the profile; confirm all three appearance controls reset to defaults.
- [ ] Confirm no appearance values are saved in browser storage.

## Mobile and accessibility
- [ ] Check portrait and landscape layouts.
- [ ] Operate each range control by touch.
- [ ] Operate each range control by keyboard.
- [ ] Confirm labels and live values remain readable and controls do not overflow.
- [ ] Check reduced-motion behavior and visible focus.

## Explicit non-goals for this demo
- Image upload/crop and 2×4 placement grid.
- Two-stage final confirmation and appearance lock.
- Persistent profile, authenticated account, server sync or native installers.

Human tester should report browser/OS, viewport class, pass/fail per item and any visual defects without sharing personal data.
