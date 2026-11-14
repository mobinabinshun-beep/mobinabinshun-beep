# N.U Generation 1 — Player Profile & Card Appearance Specification

**Date:** 2026-11-14  
**Status:** Operational target specification; demo preview only  
**Generation:** 1  
**Release boundary:** The public GitHub Pages demo is not the distributable operational build.

## 1. Purpose

The player completes the profile card fields and configures its appearance. The Generation 1 public demo is an experimental human-test workshop for reviewing the unified profile experience, but the operational profile is to be completed and packaged at the end of Generation 1 as part of the launcher-mounted downloadable release. Server-backed operation and platform installers are future work and must not be implied by the demo.

## 2. Profile surface and fields

Keep the restored historical profile format as the visual foundation:
- Image area (currently a placeholder in the demo).
- Name.
- Callsign.
- Family Name.
- Age.

The appearance controls belong in a separate bordered panel directly below the profile card. Do not merge them into the profile fields or change the historical card layout without explicit approval.

## 3. Three appearance axes

The separate appearance panel contains three core independent controls plus an optional fourth comparison control:

1. **Color spectrum / hue:** choose the card's base color.
2. **White ↔ dark neutral tone:** apply a neutral white or black tint independently of the selected hue.
3. **Color light ↔ dark:** adjust the lightness of the selected color itself.
4. **Saturation (comparison-only):** independently test saturation so reviewers can decide whether it should remain, be merged or be removed.

The axes are intentionally distinct: hue selects the color family; neutral tone adds/removes white or black overlay; color lightness changes the selected hue's own brightness.

## 4. Operational two-stage selection and lock

The final operational workflow must preserve the documented two-stage intent:

- **Stage A — initial selection:** player explores the three appearance axes and previews a provisional card appearance.
- **Stage B — final confirmation:** player reviews and confirms the final appearance. The confirmation action freezes the card's color and appearance customization.
- Once confirmed, the appearance controls become locked/read-only for the remainder of the operational profile lifecycle. Do not silently unlock or mutate the confirmed appearance between sessions.

After the appearance lock, the only player-editable card elements are:
- The image inside the card.
- The image's placement, selected through the documented 2×4 position grid (eight placement cells).

The demo now includes a local-only image preview and 2×4 placement simulation. These are not production upload, crop, persistence or secure storage capabilities.

## 5. Public demo boundary — current implementation

Implemented in the public demo preview:
- Original four profile text fields and historical layout.
- Separate appearance panel below the card with three independent controls.
- Temporary appearance preview; values reset when the profile closes.
- Existing privacy warning on personal/extended profile edits.
- Explicit public-field selection preview; all fields default to private.
- Private-view state simulation, clearly marked as non-authenticated.
- Optional Age Band, Bio and Interests concept fields, separate from the historical four.
- Holographic design preview controls for frame material, typography, corner geometry, hologram intensity, glow, transparency, scan lines, data texture, ambient motion and quality preset.
- Stage-B appearance confirmation simulation. It disables profile fields, visibility toggles and appearance controls; only image replacement and 2×4 placement remain editable until reset.
- Local FileReader image preview (up to 5 MB) and eight-cell (2×4) placement simulation; the selected image is not uploaded.
- Local save/security/network status panel explaining future requirements without implementing them.

Not implemented in the demo:
- Actual authentication, password/passphrase verification or secure private-view access.
- Durable/immutable appearance lock across sessions.
- Image cropping/editing or remote upload.
- Profile persistence, authenticated player identity, secure save/export/import or recovery.
- Server synchronization, cloud account or native/downloadable platform installers.

Do not add a password field or imply account security in the public demo. The demo must continue warning users not to enter real or sensitive personal information.

## 6. Packaging and release rule

At the end of Generation 1, package the **operational launcher-mounted downloadable build**, not the public demo, as the release candidate. The operational build must implement this specification and the other approved Generation 1 scenarios/objectives before being described as operational. Online server deployment and platform-specific installers require their own implementation and acceptance evidence.

## 7. Lock decision — pending full audit

No profile/card freeze or lock is authorized by this document. First reconcile the historical Generation 1 product specification, Citizen Card architecture, public-demo profile decisions, launcher/downloadable build records, owner handoffs, and team archive/governance records. Record conflicts and obtain explicit owner approval before defining any freeze scope or lock point. This specification is an audit aid, not a unilateral lock instruction.

## 8. Profile panel inventory audit

The current profile view contains the historical profile card, separate appearance panel, privacy/public-display workshop, local-identity concept panel, staged-appearance simulation with three lock policies, exact-age/age-band comparison, Bio/Interests, private access YES/NO simulation, recovery choices, explicit share-consent preview, local image fit and 2×4 crop-anchor/photo-slot alternatives, holographic design controls, stats placement comparison, local save/export/import/server-sync simulations, game-status/wallet boundary note, personal-data warning, demo limitation note and close action. The following remain operational omissions by design: secure authentication, durable appearance lock, image crop and production upload, profile persistence, secure local save/export/import integration and online/server synchronization. The additional profile fields and visual-design controls remain review concepts until their final behavior is approved. Wallet balances and transaction tabs remain separate wallet surfaces, not missing profile panels.

## 9. Acceptance checklist

- [ ] Original card layout and four fields remain intact.
- [ ] Appearance panel is below and separate from the card.
- [ ] Hue, neutral white/dark tint and color lightness each change only their intended visual dimension.
- [ ] Demo appearance resets on close and is not persisted.
- [ ] Editing personal fields still shows the privacy warning.
- [ ] Public-field selection defaults to private and updates only the local preview.
- [ ] Private-view and appearance-lock simulations are clearly distinguished from real security/persistence.
- [ ] Local image preview and all eight placement cells work without network upload.
- [ ] Closing the profile resets all workshop state.
- [ ] Mobile layout and keyboard/touch controls are usable.
- [ ] Operational build has initial selection, final confirmation and an immutable appearance lock.
- [ ] Operational build allows only image replacement and 2×4 image placement changes after lock.
- [ ] Downloadable package is mounted on the launcher and tested on each claimed platform.
- [ ] Server and cross-device claims are backed by an actual deployed service and acceptance evidence.
