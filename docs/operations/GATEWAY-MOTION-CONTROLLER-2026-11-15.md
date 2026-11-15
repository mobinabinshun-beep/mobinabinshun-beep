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
- Touch contact/movement onto an option activates it; pointer-up remains a compatibility fallback.
- Keyboard focus plus Enter and ordinary click remain fallback paths; they are not required for mouse/touch.
- Moving outside the existing Gateway orbit closes it. Escape and scrim close remain available.
- While open, the scrim intercepts page/game input. The game round, Background Engine, Dynamic Layers and Pixel World retain the existing freeze-event contract.
- Only a Gateway-initiated pause is resumed on ordinary close. A pause that predates Gateway remains paused.

## Preserved boundaries

- Gateway is active only on the actual Generation 1 main-game view.
- Exactly three actions remain: Back, Menu, Profile.
- No Settings, Store, Wallet, Exchange or other new Gateway destination.
- No gameplay rules, XP/Mana/HP, HUD, save schema, wallet, economy, routes or non-game pages changed.
- Blur remains limited to decorative background layers; foreground text and HUD are not blurred.
- No changes to other page Gateways or unrelated renderer behavior.

## Changed files

- `nu-hex-gateway.js` — hover-open trigger, touch-down open, hover/touch option activation, duplicate-activation guard.
- `index.html` — updated controller cache token and movement-first hint.
- `tests/nu-hex-gateway.test.js` — assertions for mouse/pen hover, touch contact, click-free activation and scrim blocking.
- `docs/operations/NU-OPS-IMPLEMENT-01.md` — authoritative Gateway input contract.

## Backup and candidate

- Backup: `backup/pre-gateway-motion-controller-2026-11-15`
- Candidate: `fix/gateway-motion-controller-2026-11-15`
- Backup was created from the public default branch before edits. The default branch was not edited.

## Verification

- JavaScript syntax: pending.
- Gateway regression test: pending.
- CI workflow: pending.
- Human mouse/touch/keyboard and responsive browser QA: pending.
- Merge/deployment: not performed.

## Rollback

Revert the scoped PR/commit or restore the backup branch. Do not force-push the default branch.
