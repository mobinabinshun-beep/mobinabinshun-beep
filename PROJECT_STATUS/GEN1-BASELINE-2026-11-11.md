# N.U Interactive World — Generation 1 Baseline & Development Plan

Date: 2026-11-11

## Source baseline
- Repository: https://mobinabinshun-beep/mobinabinshun-beep
- Baseline commit: 59609bbbc5abde96e2edc545334fe956db48195a
- Commit URL: https://mobinabinshun-beep/mobinabinshun-beep/commit/59609bbbc5abde96e2edc545334fe956db48195a
- Preservation pointer: `preservation/public-demo-2026-11-11`
- Work branch: `development/nu-world-documented-completion`

## Release safety
The public default branch is not the development target. Work is isolated on this branch. Do not merge or deploy until the full quarantine mirror is complete, regression checks pass, and release approval is explicitly given.

## Protected existing systems
1. Adaptive capability-matching runtime (`nu-engine.js`) — preserve behavior and source.
2. Network test/runtime behavior — preserve behavior and source.
3. Existing game mechanics and pixel-world renderer — extend through additive modules/adapters; do not replace.

## Documented current-state limits
- Shared purchasable economy is not yet implemented.
- N-BI/Mana costs and the documented upgrade levels must be implemented only from the archived spec; no invented balancing values.
- Arcane Shield remains a documented/planned feature until its exact rules are extracted from the addendum.
- Online/offline support must distinguish local demo functionality from server-authoritative multiplayer; LocalStorage alone is not proof of secure sync or cross-device persistence.
- Browser/device QA and GitHub Pages deployment must be separately verified.

## Work sequence
1. Full file-for-file quarantine backup and verification.
2. Inventory all source files, workflows, Pages settings, assets, and backup folders.
3. Extract the main project record and 2026-11-10 addendum into an implementation checklist.
4. Implement additive modules in small commits; maintain adapters around protected engines.
5. Build a downloadable package from the same tagged source revision; keep it in-repository until requested.
6. Run syntax, unit, integration, offline, online, low-end-device, and regression checks.
7. Publish only after explicit release approval.

## Visual direction
Use the supplied reference image as art direction: monumental fantasy city, cosmic sky geometry, warm gold/amber arcane light, deep navy/charcoal shadows, layered atmospheric depth, and readable UI. The image is a visual reference, not a license to claim a fully rendered 3D world.

## Baseline commit
`59609bbbc5abde96e2edc545334fe956db48195a`
