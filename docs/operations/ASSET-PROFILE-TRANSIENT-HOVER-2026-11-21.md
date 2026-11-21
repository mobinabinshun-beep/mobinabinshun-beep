# Player Game Asset Profile — Transient Hover Contract & Change Record

**Date:** 2026-11-21  
**Status:** MACHINE-APPROVED-LOCKED · PRE-RELEASE-BACKUP-VERIFIED · DEPLOYMENT-UNVERIFIED · HUMAN-QA-PENDING  
**Owner authority:** Direct owner instruction in the 2026-11-21 conversation  
**Feature name:** پروفایل دارایی های پلیر در هر بازی

## Owner-confirmed behavior

The profile is a temporary, read-only projection of the current player's game-relevant assets. It appears only while one of the game's resource capsule bars is inside an active pointer interaction region and disappears immediately when the pointer leaves.

Supported sources:
- Physical mouse: pointer enters/leaves a resource capsule bar.
- Direct touch: show while touch is down on a resource capsule bar; hide on touch release/cancel or leaving the region.
- Simulated/virtual mouse: follow the shared controller pointer's hit-tested target transitions; show while the virtual pointer target is a resource capsule bar and hide as soon as it leaves.

No click-to-pin, toggle, persistent expansion, focus-triggered display, extra action, or gameplay action is part of this contract. The HP capsule's own use action remains independent.

## Visual and data rules

- Transparent surface; no panel background, border, rounded card, backdrop blur, or box shadow.
- Floating concise text only. No title, explanatory subtitle, wallet heading, or long description.
- Show the current game-relevant positive asset values only. A value equal to zero is omitted completely.
- Show the player's saved level (LV) and earned XP in every game once XP is positive; the first earned XP therefore reveals the level, XP and the available positive assets together.
- A positive Mana Capsules count remains eligible for display even when current Mana is zero.
- The profile is read-only and derives its values from the existing wallet/game state. It must not change asset calculations, progression, save data, game rules, or the classic HUD layout.

## Acceptance criteria

1. Starts hidden.
2. Physical mouse entering a bar shows it; leaving hides it immediately.
3. Direct touch on a bar shows it only during the touch interaction; release/cancel hides it.
4. Simulated mouse hit-testing a bar shows it; target transition outside the bars hides it.
5. Clicking does not pin or toggle the profile. Keyboard focus alone does not open it.
6. Zero-valued assets are absent; positive values are shown. LV appears after XP becomes positive.
7. No opaque panel/card/chrome or long explanatory text appears.
8. LV/XP/Mana bar markup, layout, labels, fills, values, responsive sizing, and game rules remain unchanged.
9. The HP capsule use action remains independently functional.

## Scope and exclusions

Runtime files:
- nu-games.js: profile projection and transient input behavior.
- nu-world.css: profile-only transparent floating-text presentation.
- index.html: cache keys for the two changed runtime files.
- tests/nu-hud-layout.test.js: focused static regression assertions, added to the existing HUD workflow.

No edits to nu-wallet.js, wallet data, HP/XP/Mana calculations, classic HUD structure/layout, Gateway, game canvas routing, or unrelated game logic.

## Baseline and recovery evidence

- Source baseline commit before candidate writes: e1428c2501901975cc3410159bb89216b9459922.
- PRE-CHANGE recovery ref: backup/pre-game-asset-profile-hover-only-2026-11-21.
- Recovery ref was fetched back and verified to resolve exactly to e1428c2501901975cc3410159bb89216b9459922.
- Candidate branch: fix/game-asset-profile-hover-only-2026-11-21.
- Machine-approved candidate SHA: 5349809ee25d26a026d792263eb8047d012401f0.
- PRE-RELEASE recovery ref: backup/pre-release-game-asset-profile-hover-only-2026-11-21; fetched back and verified to resolve to the exact machine-approved SHA above.
- Pre-change file blob SHAs:
  - nu-games.js: e118c03e9891126cf1244e5aec75a4da38b6ab86
  - nu-world.css: 22b077b2827fa203b0a86a55c5c8e2a931efb719
  - index.html: d3920a8de507ca11d7072edffb2266dc2107f9cf
  - tests/nu-hud-layout.test.js: 13337be040064298d4fc5ca41db87f6d0afa8f1c

**Important baseline limitation:** GitHub Pages workflow success on the source SHA does not prove that the currently served public demo is running that SHA. The public demo's live build identity and decomposed runtime snapshot have not yet been independently verified. Therefore the source PRE-CHANGE recovery ref is verified, but a complete live Runtime Baseline Snapshot is NOT claimed. No stable-demo deployment is authorized by this record until live identity/baseline evidence is available.

## Machine validation and release

- Focused regression assertions were added to the existing HUD layout test suite.
- Required workflow: N.U Generation 1 HUD layout regression (syntax check plus HUD and HP capsule interaction tests).
- MACHINE-TEST-PASSED on exact SHA 5349809ee25d26a026d792263eb8047d012401f0. All nine commit checks completed successfully: HUD layout, graphics preview smoke, graphics integrity, wallet/profile, Arcane Shield/Mana, Gateway main-game, Exchange, Studio export and static validation.
- Focused HUD run: https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44867810495.
- Full regression examples: https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44867810543 and https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44867810535.
- Earlier failed candidate runs were superseded by the passing exact SHA; their failures were stale cache-key expectations and a test syntax/assertion correction, not hidden.
- Before any demo deployment, create/fetch-back a PRE-RELEASE recovery ref for the exact machine-passed candidate.
- Deployment must be reported with the exact candidate SHA and verified public build identity. If the public demo cannot host the isolated candidate safely, use a controlled preview and do not claim the stable demo contains it.
- Human QA remains pending after machine approval and deployment; owner acceptance is separate.

## Human QA checklist

Test Bubble Hunt, Mana Collector and Chaos Attack on:
- Physical mouse.
- Direct touch on a real touch device.
- Simulated mouse/controller pointer.

For each: enter a resource capsule bar, verify concise floating text; leave the bar, verify immediate disappearance; click/tap without pinning; verify zero values are absent and first XP reveals LV; verify HP capsule use remains functional. Record exact URL/SHA, device/OS/browser, viewport, input source, expected/actual, PASS/FAIL and evidence.

## Rollback

If the candidate introduces a critical regression, stop rollout and restore only from a verified checkpoint after identifying the exact affected candidate. Preserve this record and the failed candidate as history.