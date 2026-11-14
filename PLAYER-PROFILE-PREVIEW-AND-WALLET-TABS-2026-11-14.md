# N.U Generation 1 — Classic Player Profile Preview and Wallet Tabs

Date: 2026-11-14
Status: MERGED TO PUBLIC DEFAULT BRANCH
Scope: Wallet tab placement/animation and Player ID profile presentation only.

## Historical baseline

The approved 2026-11-11 public-demo profile correction establishes the initial classic profile as an optional, display-only preview. It does not create a public account, upload a portrait, store passwords, or claim secure identity protection. The older backup made before that correction predates the profile and is not a valid profile-design baseline.

This implementation restores a compact classic Player ID presentation while retaining the currently working local Player ID and progression fields. It does not replace or regenerate the existing `NU-` Player ID.

## Wallet tabs

- The Profile, Balances and Transactions tabs are mounted at the upper edge of the wallet card.
- In their resting state they sit slightly recessed into the card; hover, keyboard focus and active selection move them upward.
- Profile remains first from left to right.
- Existing panel switching, wallet balances, 24-entry transaction cap, Gateway behavior and game routes are unchanged.
- Reduced-motion preference remains supported.

## Profile preview modes

The profile is a presentation preview. Future compatible builds may populate additional card fields; the public demo does not add account registration, network publishing, portrait upload, or private-save authentication.

### Public / limited preview

- Shows only the display name, callsign and rank label.
- Hides the local Player ID and progression/statistics block.
- This is a presentation mode, not an online share or publishing action.

### Player / full preview

- Reveals the currently available local Player ID, level, XP, HP and Mana fields.
- The mode is deliberately labelled as a preview. The current public browser demo does not authenticate this view or protect its data.
- Closing the profile returns the UI to the limited preview.

### Security boundary and future builds

The public demo must not be described as providing secure private storage or an authenticated security view. A future downloadable/local build may implement the private view only after a reviewed passphrase flow, password verification, encryption of private save payloads, rate limiting, recovery design and local-device threat disclosure. Public card data must remain separate from private save data; never expose passwords, password hashes, keys or wallet/save access through a public card.

## Personal rank palette

- A continuous hue-spectrum slider is placed outside and below the profile card.
- It changes the card's accent color only; it does not recolor critical status semantics.
- The selected hue is stored as a small local theme token under `nu-profile-rank-palette-v1`, not as a screenshot or profile secret.
- The selected color remains fixed across profile close/reopen and browser reload until the player changes it or uses Reset Palette.
- Default hue is 195°.

## Validation

Added regression coverage for upper-edge tab order/animation, classic profile mode separation, palette placement/persistence and the public-demo security disclaimer. CI is expected to run the existing wallet, Player ID, Gateway and new profile preview tests.

## Preservation

Only `index.html`, `nu-world.css`, the new `nu-profile-preview.js`, wallet regression workflow/tests and this specification are in scope. Game rules, economy, saved Player ID, wallet schema, transaction history, Gateway routing and unrelated views are not to be changed.
