# N.U Generation 1 — Player Profile & Card Appearance Specification

**Date:** 2026-11-14  
**Status:** Operational target specification; demo preview only  
**Generation:** 1  
**Release boundary:** The public GitHub Pages demo is not the distributable operational build.

## 1. Purpose

The player completes the profile card fields and configures its appearance. The Generation 1 public demo may expose a visual preview of the appearance controls, but the operational profile is to be completed and packaged at the end of Generation 1 as part of the launcher-mounted downloadable release. Server-backed operation and platform installers are future work and must not be implied by the demo.

## 2. Profile surface and fields

Keep the restored historical profile format as the visual foundation:
- Image area (currently a placeholder in the demo).
- Name.
- Callsign.
- Family Name.
- Age.

The appearance controls belong in a separate bordered panel directly below the profile card. Do not merge them into the profile fields or change the historical card layout without explicit approval.

## 3. Three appearance axes

The separate appearance panel contains exactly three independent controls:

1. **Color spectrum / hue:** choose the card's base color.
2. **White ↔ dark neutral tone:** apply a neutral white or black tint independently of the selected hue.
3. **Color light ↔ dark:** adjust the lightness of the selected color itself.

The axes are intentionally distinct: hue selects the color family; neutral tone adds/removes white or black overlay; color lightness changes the selected hue's own brightness.

## 4. Operational two-stage selection and lock

The final operational workflow must preserve the documented two-stage intent:

- **Stage A — initial selection:** player explores the three appearance axes and previews a provisional card appearance.
- **Stage B — final confirmation:** player reviews and confirms the final appearance. The confirmation action freezes the card's color and appearance customization.
- Once confirmed, the appearance controls become locked/read-only for the remainder of the operational profile lifecycle. Do not silently unlock or mutate the confirmed appearance between sessions.

After the appearance lock, the only player-editable card elements are:
- The image inside the card.
- The image's placement, selected through the documented 2×4 position grid (eight placement cells).

The image upload and 2×4 placement editor are operational requirements, not capabilities of the current public demo.

## 5. Public demo boundary — current implementation

Implemented in the public demo preview:
- Original four profile text fields and historical layout.
- Separate appearance panel below the card.
- Three live preview controls (hue, neutral white/dark tint, color lightness).
- Temporary in-page preview only; values reset when the profile closes.
- Existing privacy warning still appears when personal text fields are edited; appearance controls do not trigger that warning.

Not implemented in the demo:
- Image upload, cropping or 2×4 placement.
- Two-stage confirmation flow or permanent appearance lock.
- Profile persistence, authenticated player identity, server synchronization or cloud account.
- Online server operation or native/downloadable platform installers.

Do not add a password field or imply account security in the public demo. The demo must continue warning users not to enter real or sensitive personal information.

## 6. Packaging and release rule

At the end of Generation 1, package the **operational launcher-mounted downloadable build**, not the public demo, as the release candidate. The operational build must implement this specification and the other approved Generation 1 scenarios/objectives before being described as operational. Online server deployment and platform-specific installers require their own implementation and acceptance evidence.

## 7. Freeze boundary

After this scoped preview is reviewed, freeze the profile card's structure, the three-axis control model, and the separation between profile fields and appearance panel until Generation 1 packaging. Any change before packaging requires explicit owner approval and a documented reason. This freeze does not claim that the operational workflow is already implemented.

## 8. Acceptance checklist

- [ ] Original card layout and four fields remain intact.
- [ ] Appearance panel is below and separate from the card.
- [ ] Hue, neutral white/dark tint and color lightness each change only their intended visual dimension.
- [ ] Demo appearance resets on close and is not persisted.
- [ ] Editing personal fields still shows the privacy warning.
- [ ] Mobile layout and keyboard/touch range controls are usable.
- [ ] Operational build has initial selection, final confirmation and an immutable appearance lock.
- [ ] Operational build allows only image replacement and 2×4 image placement changes after lock.
- [ ] Downloadable package is mounted on the launcher and tested on each claimed platform.
- [ ] Server and cross-device claims are backed by an actual deployed service and acceptance evidence.
