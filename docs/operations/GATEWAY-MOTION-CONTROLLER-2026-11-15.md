# N.U Gateway — movement-first controller correction

**Date:** 2026-11-15  
**Scope:** Generation 1 active main-game Gateway only  
**Status:** IMPLEMENTED ON CANDIDATE · CI PENDING · HUMAN QA PENDING

## Owner correction

The prior controller was selection-first: hovering an option only highlighted it, the hex required a click to open, and touch activation waited for pointer release. The requested primary mode is movement-first.

## Intended behavior

- Mouse/pen entering the hex opens Gateway and pauses the active round.
- Touch contact on the hex opens Gateway immediately and pauses the active round.
- While open, mouse/pen movement onto Back, Menu or Profile activates the hovered action without click or an intermediate selection.
- Touch contact/movement onto an option activates it; document-level coordinate hit-testing supports finger drags even when the browser implicitly captures the touch pointer; pointer-up remains a compatibility fallback.
- Keyboard focus plus Enter and ordinary click remain fallback paths; they are not required for mouse/touch.
- Moving outside the existing Gateway orbit closes it. Escape and scrim close remain available.
- While open, the scrim intercepts page/game input and prevents touch scrolling. Document-level input isolation blocks page/window pointer and keyboard handlers; wheel/context-menu input is suppressed, and resize/orientation handlers are stopped after the Gateway recalculates its own option layout. The game round, Background Engine, Dynamic Layers and Pixel World retain the existing freeze-event contract.
- Only a Gateway-initiated pause is resumed on ordinary close. A pause that predates Gateway remains paused.

## Preserved boundaries

- Gateway is active only on the actual Generation 1 main-game view.
- Exactly three actions remain: Back, Menu, Profile.
- No Settings, Store, Wallet, Exchange or other new Gateway destination.
- No gameplay rules, XP/Mana/HP, HUD, save schema, wallet, economy, routes or non-game pages changed.
- Blur remains limited to decorative background layers; foreground text and HUD are not blurred.
- No changes to other page Gateways or unrelated renderer behavior.

## Changed files

- `nu-hex-gateway.js` — hover-open trigger, touch-down open, hover/touch option activation, touch-drag hit-testing, page-input/keyboard isolation and resize-event isolation.
- `nu-hex-gateway.css` — prevent touch scroll/overscroll through the pause scrim.
- `index.html` — updated controller cache token and movement-first hint.
- `tests/nu-hex-gateway.test.js` — assertions for mouse/pen hover, touch contact/drag hit-testing, click-free activation and scrim blocking.
- `docs/operations/NU-OPS-IMPLEMENT-01.md` — authoritative Gateway input contract.
- `docs/operations/GATEWAY-MENU-EXCHANGE-IMPLEMENTATION-2026-11-15.md` — corrected implementation behavior and test coverage.

## Backup and candidate

- Backup: `backup/pre-gateway-motion-controller-2026-11-15`
- Candidate: `fix/gateway-motion-controller-2026-11-15`
- Backup was created from the public default branch before edits. The default branch was not edited.

## Verification

- Controller JavaScript syntax: PASS.
- Test-file JavaScript syntax: PASS.
- Focused source assertions for hover-open, touch-open, movement activation, touch-drag hit-testing, duplicate guard, cache token, scrim blocking and input/resize isolation: PASS.
- Mocked pointer-flow harness: mouse hover-open/action, touch contact-open/drag-action, Menu/Profile pause restoration, and preservation of a pre-existing manual pause: PASS.
- Full Gateway regression execution: pending.
- GitHub Actions: no workflow runs or commit status checks were returned for the PR head; CI is therefore NOT VERIFIED.
- Human mouse/touch/keyboard and responsive browser QA: pending.
- Reference rationale in `mobinabinshun-beep/Repository` was updated to match movement-first activation (commit `c3f70441d7f84483acf6bf257f1e45eb05715f84`).
- Merge/deployment: not performed.

## Rollback

Revert the scoped PR/commit or restore the backup branch. Do not force-push the default branch.
