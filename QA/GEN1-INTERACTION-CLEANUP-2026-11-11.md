# N.U Generation 1.9 — Candidate QA
Date: 2026-11-11
Branch: feature/gen1-cleanup-2026-11-11

## Delivered in this candidate
- Removed floating reward labels for XP/Mana/+1 and post-interaction result labels.
- Kept the 1/10–10/10 marker attached only to the interacted object.
- Removed the automatic +1 HP round-completion reward.
- Added a virtual HP Capsule store item: costs 10 earned XP, adds one inventory capsule, restores up to 10 missing HP, is consumed once, and cannot be used at full HP. Actual HP is capped at 10; no hidden one-point damage is applied.
- Added concise green HP-bar feedback showing the actual restored amount.
- Preserved the existing first-visit two-choice Store guide and connected its OPEN STORE action to the item list.
- Added a separate static-first background compositor module with low-cost star, astrolabe, atmospheric cloud, golden beam and water-glint layers. It respects reduced-motion, save-data, tab visibility and quality tiers.
- Added the artwork path reference assets/niroo-celestial-city.jpg and CSS fallback. The supplied binary artwork itself is not yet in the repository; until it is committed, the compositor falls back to the gradient/pixel-world scene. Do not describe this as the supplied-image renderer being finished.
- Protected nu-engine.js was not modified.
- Existing online center-safe spawn exclusion remains; downloaded mode retains full-screen spawn freedom.
- Generation 2 branches remain parked and untouched.

## Known limitations
- HP Capsule price (10 XP) is implemented from the provided requirement. The shield, Mana capsule and N-BI upgrades remain hidden because their exact costs/effects are not approved in the active Generation 1 code.
- Arcane shield charge/damage/depletion/recharge rules are not implemented.
- Casino, 70 casino outcome patterns, shared cross-game wallet conversions and territory mode are not implemented.
- The image binary must be added at assets/niroo-celestial-city.jpg to activate the exact supplied artwork as the background. The current source preview is intentionally a safe fallback until then.
- No real-money economy or wagering exists.
- No live browser/device QA or deployed Pages preview has been completed in this pass.

## Manual test checklist
1. Launch Bubble Hunt, Mana Collector and Chaos Attack.
2. Confirm no floating XP, Mana, +1 or action-result labels appear.
3. Confirm 1/10–10/10 appears only at a successfully interacted target.
4. Earn at least 10 XP; open Menu > N.U Store; open the first-visit guide; buy one HP Capsule.
5. Damage HP in Chaos Attack, use the capsule from Store, verify actual restoration is min(10, 10-currentHP), inventory decreases by one, and full HP prevents use.
6. Verify capsule purchase subtracts 10 XP and item count persists after reload in the same browser.
7. Check low-performance/reduced-motion mode and hidden-tab pause for the compositor.
8. Confirm online article-safe center exclusion and downloaded full-screen behavior.
9. Compare nu-engine.js blob SHA with base branch; it must remain unchanged.

## Release gate
This PR is a test candidate, not a public deployment. Merge only after the artwork binary is present, browser QA passes, and the team reviews the build.
