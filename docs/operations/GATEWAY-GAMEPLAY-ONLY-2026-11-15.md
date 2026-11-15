# N.U Gateway — gameplay-only scoped implementation

**Date:** 2026-11-15  
**Project:** N.U Interactive World — Generation 1  
**Owner authorization:** Explicitly reaffirmed in the current conversation: unlock Gateway for the new design, target only the main game pages, and obtain separate approval before changing other pages.  
**Baseline commit:** `c72d6705faf037bf21a0a570fa9a5f0c5c09565c`  
**Backup branch:** `backup/pre-gateway-gameplay-scope-2026-11-15`  
**Candidate branch:** `feature/gateway-gameplay-only-2026-11-15`

## Scope

Only the Generation 1 main game entry (`index.html`) and its shared Gateway controller/styles/tests are changed. Casino, Launcher, Creative Studio, Exchange, Wallet/Profile/Store views, game engines, renderers, save schema and resource HUD are not edited.

## Implemented in candidate

- Gateway controller activation is limited to the active `#game-view`; it is not activated on Home, Library, Wallet, Casino, Launcher or Creative Studio.
- Gateway actions are now exactly:
  - **Back** — return to the existing Home view.
  - **Menu Options** — open the existing main navigation menu.
  - **Settings Options** — navigate to the existing Launcher Settings panel (`launcher.html#settings-panel`). Launcher source is not modified.
- Existing 20% trigger/item focus growth, radial item layout, pulse/confirmation animation, touch-direct activation, mouse hover dwell and two-step click confirmation are retained.
- Opening the Gateway pauses the active round through the existing Pause control.
- Frost/blur is isolated to the decorative world background layers; foreground controls and HUD are not blurred.
- The classic topbar Menu and in-game Pause/Resume controls remain visible and unchanged.
- Gateway remains hidden on Home and other pages. Existing markup on non-game pages is left untouched; the shared controller exits when the main game view is absent.

## Protected / unchanged

- Classic LV / XP / Mana HUD (locked by `docs/operations/LOCKED-AREAS.md`).
- HP Capsule, N-BI shield state/UI, XP/Mana calculations, wallet, local save key and economy.
- `nu-engine.js`, `nu-games.js`, background/graphics engines and game rules.
- Casino, Launcher, Creative Studio, Exchange and all other non-main-game pages.
- No new destination, game tool or Casino action is added to the Gateway.

## Changed files

- `index.html`
- `nu-hex-gateway.js`
- `nu-hex-gateway.css`
- `tests/nu-hex-gateway.test.js`
- This implementation record.

## Verification

- Source-level scope and route review: completed.
- Gateway regression assertions updated for gameplay-only activation, route set, protected controls and background-only blur.
- Gateway main-game regression workflow #88: PASS (syntax + focused Gateway regression).
- Graphics integrity #272, Generation 1 HUD layout #99, graphics preview smoke #693, and static validation: PASS.
- Wallet/Profile workflow #104 and Studio export workflow #490: FAILED on the same two existing profile-preview assertions (`demo-card-image` file-input expectation and eight photo-placement controls). The current privacy-safe profile preview no longer exposes those controls; `index.html` and the profile test are outside this PR's intended changes. No out-of-scope repair was made.
- No local runtime was available in this GitHub-only session.
- Browser/device visual QA: pending public-demo deployment.
- Public deployment: not performed or verified.
- Merge: not performed.

## Rollback

Restore the exact pre-change source using `backup/pre-gateway-gameplay-scope-2026-11-15` at baseline `c72d6705faf037bf21a0a570fa9a5f0c5c09565c`, or revert the scoped candidate PR. Do not force-push the default branch.

## Next approval boundary

No files outside the main game entry and its Gateway controller/styles/tests may be changed without a new explicit owner approval. Any further Gateway destination, Casino/Studio/tool entry, HUD change, or separate page modification requires its own scope confirmation.

**Status:** CANDIDATE IMPLEMENTED · GATEWAY CI PASS · TWO UNRELATED PROFILE SUITE FAILURES RECORDED · PUBLIC DEMO / HUMAN QA PENDING · NOT MERGED
