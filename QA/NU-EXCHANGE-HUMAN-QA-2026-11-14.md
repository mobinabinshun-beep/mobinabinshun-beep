# N.U Exchange — Human QA handoff

**Build branch:** `feature/nu-exchange-studio-launcher-spec`  
**Scope:** Generation 1 exchange visualization only  
**Status:** Candidate changes committed; public-demo deployment and member/team human acceptance are still pending.

## What changed
- Added deterministic, event-seeded high/low wick ranges to the fictional market candles. Identical transaction IDs and asset keys produce identical candles.
- Added independent chart visibility controls for candle bodies, high/low wicks, closing-index line, and activity-volume bars.
- Added a reduced-motion display option that shows the current replay snapshot without animated progression; the operating-system reduced-motion preference disables the decorative tendency pulse.
- Clarified that the index is fictional and is not a real-world price, order book, or forecast.

## Safety boundaries preserved
- The market remains derived from local wallet transaction history; no network market data is introduced.
- The chart is a visualization only and does not write to the wallet ledger or balances.
- HP remains excluded from the exchange asset selector and market asset registry.
- Cross-game settlement remains disabled. No transfer adapter, conversion rate, or payout path was enabled.
- Gateway behavior and deployment configuration were not changed by the exchange candidate.

## Mandatory public-demo test procedure
1. Do not send testers to this Markdown file, a GitHub source page, a local file, localhost or a developer-only server as the test target.
2. First publish the candidate to the project's approved public N.U demo environment through the authorized release workflow. This QA handoff does not itself authorize deployment, merge, production release or changes to deployment configuration.
3. Verify the live public demo is serving the exact candidate commit/build. Record the public URL, deployed commit/build identifier and deployment time. If that cannot be verified, mark the round **NOT READY FOR HUMAN QA / HUMAN-QA-PENDING** and do not invite testers yet.
4. Share the same public demo URL, build identifier and the [Human Test Report Template](../docs/operations/HUMAN-TEST-REPORT-TEMPLATE.md) with members and the test team.
5. Ask each tester to use the public demo in a real browser/device and submit one report per session. Record device/model, OS, browser/version, viewport, input method, reduced-motion setting and timezone.
6. Generate ordinary XP/Mana wallet events through the public demo's existing game UI, then open Exchange from the demo navigation.
7. Confirm candle bodies, deterministic high/low wicks, closing-index line and activity-volume bars. Toggle each chart layer independently and confirm the remaining layers stay visible and legible.
8. Select Reduced motion. Confirm replay progression stops at the current full snapshot; toggle it off and confirm replay resumes.
9. Compare wallet balances and transaction count before/after changing chart options and replay speed. They must remain identical.
10. Confirm HP is absent from the asset selector and transfer/settlement remains disabled.
11. Reload the public demo and verify the same local transaction IDs reproduce the same candle OHLC values in that browser profile.
12. Test desktop and narrow mobile widths, keyboard navigation, touch input and a browser with `prefers-reduced-motion: reduce` enabled.

## Member/team report collection
- Collect one completed report per tester/session using the repository's Human Test Report Template and the approved team feedback intake.
- Record PASS / FAIL / NOT RUN for every scenario; include actual observations, reproduction steps, severity and optional screenshots/video.
- Consolidate duplicate defects without discarding the original tester reports. Link every finding to the exact deployed build.
- Retest fixes against a newly identified public-demo build; a prior build's PASS does not automatically carry forward.
- CI and source review are supporting evidence only. They cannot mark this candidate HUMAN-QA-PASSED.

## Current evidence state
- CODE-CHECKED: JavaScript syntax and focused deterministic/read-only behavior checks passed for the candidate.
- CI-PASSED: no workflow run was associated with the candidate head at the time of the prior check.
- DEMO-DEPLOYED: not verified.
- HUMAN-QA-PENDING: public-demo deployment and member/team reports are outstanding.

## Known limitations / not claimed
- No live public preview or deployment has been performed or verified by this change set.
- The public demo must be confirmed to serve this exact candidate before it is used for acceptance.
- This is not a real financial market, trading system, order book, or price prediction.
- Cross-game settlement, online wallet sync, and production authentication remain out of scope.
