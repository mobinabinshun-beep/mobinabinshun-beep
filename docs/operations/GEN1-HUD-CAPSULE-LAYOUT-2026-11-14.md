# Generation 1 HUD capsule layout — implementation record

**Date:** 2026-11-14  
**Protocol:** NU-OPS-IMPLEMENT-01  
**Status:** Merged to public demo; focused CI and Pages deployment passed; human QA pending

## Request and acceptance criteria
- Move LV to the lower-left of the gameplay resource rail.
- Keep N.U identity and 10 ACTIONS in the upper HUD row.
- Put XP CAPSULE and MANA CAPSULE labels and values inside their respective capsule rails.
- Preserve centered HP bar and the existing state-driven HP capsule slide-out/return animation.
- Never show an N-BI shield meter without a real owned/active shield state.
- Keep the change limited to the main Generation 1 game HUD.

## Preservation
- Exact inspected source base: 47b963af2cbea9f5fb6e9c3ad1b392be7f2f7d78
- Backup branch: backup/pre-hud-capsule-layout-2026-11-14
- Candidate branch: fix/gen1-hud-capsule-layout-2026-11-14
- No engine, game rules, wallet, save schema, Gateway, Casino, Launcher or Creative Studio changes.

## Files changed
- index.html — move LV chip into lower resource rail.
- nu-world.css — responsive three-column rail; XP/Mana labels and values positioned inside capsules.
- tests/nu-hud-layout.test.js — regression assertions.
- .github/workflows/hud-layout-regression.yml — syntax and HUD/HP capsule test workflow.

## Verification
- Dedicated HUD layout regression: PASS.
- Existing HP capsule interaction tests: PASS.
- Gateway regression: PASS.
- Graphics integrity: PASS.
- Graphics preview smoke: PASS.
- Studio export regression: PASS.
- Pull Request #78 merged as source commit d2ec0d322d3b84b248dedcb2939fa2876bb4e554.
- GitHub Pages build and deploy: PASS for that merged demo revision.
- Human desktop/mobile browser QA: PENDING.

## Human QA checklist
1. Verify LV appears at lower-left beside the XP and Mana rails.
2. Verify N.U · GEN 01 and 10 ACTIONS remain in the upper HUD.
3. Verify XP CAPSULE and MANA CAPSULE labels and values are inside their bars without overlap at desktop, phone portrait and landscape widths.
4. Verify the centered HP bar remains centered.
5. Damage HP, verify the HP capsule slides out from the rail to the right, consume it, and verify the capsule returns under/into the HP rail.
6. Verify no N-BI shield bar appears without an owned/active shield.
7. Verify all three Generation 1 games and their round controls still work.
8. Repeat with reduced-motion enabled.

## Rollback
Revert the scoped PR/commit or restore backup/pre-hud-capsule-layout-2026-11-14. Never force-push the default branch.
