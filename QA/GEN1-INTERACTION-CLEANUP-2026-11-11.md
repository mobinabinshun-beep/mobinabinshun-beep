# N.U Generation 1.1 — Interaction Cleanup QA
Date: 2026-11-11
Branch: feature/gen1-cleanup-2026-11-11

## Changes in this branch
- Removed floating XP/Mana reward popup helper and its call sites.
- Removed post-click object labels such as "Bubble collected", "Mana collected" and "N-BI fired".
- Kept 1/10–10/10 feedback and positioned it at the interacted target coordinates.
- Removed the automatic +1 HP reward after a completed 10-action round; HP changes must follow explicit health rules.
- Removed obsolete capsule-gain floating animation CSS.
- Existing menu Store entry and two-choice first-visit quest were already present and wired in source; no duplicate menu/quest was added.
- Protected nu-engine.js was not changed.
- Existing center-safe spawn exclusion for online/article context was not changed.

## Not included / not certified
- Reference artwork has not yet been committed as an asset; the image-based layered background engine is not implemented.
- No claim that the Arcane shield is finalized. Charge/damage/depletion/recharge rules remain pending.
- No HP-pill inventory, store purchase prices, wallet conversion, casino or territory game changes are included.
- No live-browser, mobile, accessibility, performance or deployed Pages QA has been performed in this source-only pass.
- Public default branch and deployment are unchanged.

## Manual test checklist
1. Open the feature branch preview/build and launch each of Bubble Hunt, Mana Collector and Chaos Attack.
2. Click a valid target: only a short 1/10–10/10 indicator should appear on that target.
3. Confirm no floating XP, Mana, +1, or action-result label appears.
4. Confirm the XP/Mana bars and their fill boundaries still update correctly.
5. Confirm menu > Store opens the existing first-visit two-choice quest.
6. Confirm the adaptive runtime/network probe files remain unchanged against the base branch.
7. Test online center-safe spawning and downloaded full-screen spawning separately.
8. Test reduced motion, hidden-tab pause, touch, resize and low-performance devices.

## Release gate
Do not merge or change the public deployment until the source review, browser QA and artwork asset integration are complete.
