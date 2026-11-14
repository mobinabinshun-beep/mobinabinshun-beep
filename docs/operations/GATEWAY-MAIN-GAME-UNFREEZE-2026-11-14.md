# N.U Gateway — scoped main-game unfreeze

**Date:** 2026-11-14  
**Lock:** NU-LOCK-GATEWAY-ICON-01  
**Approval:** Explicit owner approval to unfreeze Gateway on the main game page only  
**Status:** Candidate refined; all required automated CI passed; public demo deployment authorized and pending merge

## Scope
- Main game entry: index.html, active gameplay view only. Gateway is hidden on the home screen, library, menu, profile, store and every non-game view.
- Gateway remains hidden/inactive on Casino, Launcher, Creative Studio and all other internal pages.
- No changes to those pages, game rules, wallet/save schema, or resource economy.

## Implementation
- Removed the global CSS freeze and replaced it with a main-game-only visibility scope.
- Added a runtime guard: Gateway controller activates only while the game view has its active state; home/library and non-game views keep the Gateway hidden.
- Preserved the legacy MENU and PAUSE ROUND controls; Gateway does not hide them.
- Retained existing six-sided N.U mark, hover/click/touch/keyboard behavior, responsive orbit, reduced-motion handling and pause/resume integration. Reduced the visible actions to Back/Home, Menu Options (existing menu), and Settings Options (existing Launcher route).
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
- Automated regression assertions cover active-game-only visibility, preserved legacy controls, the three requested actions, touch/mouse/keyboard behavior, dismissal, responsive sizing, and absence of an unsupported N-BI shield meter.
- The previous candidate's dedicated Gateway regression, graphics-integrity, graphics-preview smoke and Studio regression workflows all passed. The latest gameplay-only/menu refinement requires a fresh run.
- Desktop/mobile human browser acceptance is pending. Do not mark the demo human-tested until the owner tests it on real browsers/devices.

## Human test checklist
1. On desktop, confirm the Gateway is absent on the home/library screen; launch a game and confirm the compact six-sided N.U Gateway appears only during active gameplay.
2. Hover the trigger and the three destinations (Back/Home, Menu Options, Settings Options); confirm the menu opens and hover selection behaves as expected.
3. Click the trigger and a destination; confirm the existing two-step click/confirm behavior.
4. On a touch device, tap a destination and confirm it activates once, without a duplicate click.
5. Press Escape and move outside the 10px boundary; confirm dismissal.
6. While a round is active, open Gateway and confirm the round pauses; dismiss it and confirm prior pause state is restored.
7. Confirm the original MENU and PAUSE/RESUME controls remain visible and usable.
8. Confirm N.U branding, LV, HP Capsule, XP and Mana remain intact; no N-BI shield bar appears without a shield.
9. Use the existing main MENU to open Casino and verify Casino still loads with Gateway hidden.
10. Use Settings Options to open the existing Launcher route; confirm Gateway remains hidden there. Visit Creative Studio and confirm its prior frozen state remains unchanged.
11. Repeat in phone portrait/landscape and with reduced-motion enabled.

**Public Pages URL (candidate is approved for demo deployment; verify deployed revision after merge):** https://mobinabinshun-beep.github.io/mobinabinshun-beep/
