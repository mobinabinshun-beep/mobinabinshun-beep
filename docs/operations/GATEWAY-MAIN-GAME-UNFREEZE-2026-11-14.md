# N.U Gateway — scoped main-game unfreeze

**Date:** 2026-11-14  
**Lock:** NU-LOCK-GATEWAY-ICON-01  
**Approval:** Explicit owner approval to unfreeze Gateway on the main game page only  
**Status:** Candidate branch prepared; CI and public deployment pending

## Scope
- Main game entry: index.html, including the home/library and active gameplay views.
- Gateway remains hidden/inactive on Casino, Launcher, Creative Studio and all other internal pages.
- No changes to those pages, game rules, wallet/save schema, or resource economy.

## Implementation
- Removed the global CSS freeze and replaced it with a main-game-only visibility scope.
- Added a runtime guard: Gateway controller activates only when the main game view exists.
- Preserved the legacy MENU and PAUSE ROUND controls; Gateway does not hide them.
- Retained existing six-sided N.U mark, hover/click/touch/keyboard behavior, responsive orbit, reduced-motion handling and pause/resume integration.
- Retained the existing LV, HP, XP and Mana UI. No shield bar is introduced; N-BI remains absent without a real shield state.
- Bumped only the main page's Gateway asset query versions to avoid stale cached CSS/JS.

## Files changed
- index.html
- nu-hex-gateway.js
- nu-hex-gateway.css
- tests/nu-hex-gateway.test.js
- .github/workflows/gateway-main-game.yml
- docs/operations/NU-OPS-IMPLEMENT-01.md

## Preservation and rollback
- Exact pre-change backup branch: backup/pre-gateway-unfreeze-main-game-2026-11-14
- Candidate branch: feature/gateway-main-game-unfreeze-2026-11-14
- Backup was created from inspected default-branch commit 1cd05c8262f592f2849fed2e618e6320e486dc5f.
- Rollback: revert the scoped PR/commit or restore the backup branch; do not force-push the default branch.

## Verification
- Automated regression assertions cover page scope, preserved legacy controls, touch/mouse/keyboard behavior, dismissal, responsive sizing, Casino link and absence of an unsupported N-BI shield meter.
- The existing PR-triggered workflow passed its graphics-integrity job, but that job does not execute the Gateway regression suite.
- A dedicated Gateway regression workflow was added for syntax and Node test execution; its first run is not yet available on this PR.
- Desktop/mobile human browser acceptance is pending. Do not mark the demo human-tested until the owner tests it on real browsers/devices.

## Human test checklist
1. On desktop, open the main page and confirm the compact six-sided N.U Gateway is visible.
2. Hover the trigger and destinations; confirm the menu opens and hover selection behaves as expected.
3. Click the trigger and a destination; confirm the existing two-step click/confirm behavior.
4. On a touch device, tap a destination and confirm it activates once, without a duplicate click.
5. Press Escape and move outside the 10px boundary; confirm dismissal.
6. While a round is active, open Gateway and confirm the round pauses; dismiss it and confirm prior pause state is restored.
7. Confirm the original MENU and PAUSE/RESUME controls remain visible and usable.
8. Confirm N.U branding, LV, HP Capsule, XP and Mana remain intact; no N-BI shield bar appears without a shield.
9. Follow the Casino link from the main menu and verify Casino still loads; confirm Gateway itself remains hidden on Casino.
10. Visit Launcher and Creative Studio and confirm their prior frozen Gateway state remains unchanged.
11. Repeat in phone portrait/landscape and with reduced-motion enabled.

**Current public Pages URL (still serves the pre-PR default-branch build; candidate not deployed):** https://mobinabinshun-beep.github.io/mobinabinshun-beep/
