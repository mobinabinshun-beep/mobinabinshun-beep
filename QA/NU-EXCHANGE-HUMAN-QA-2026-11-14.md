# N.U Exchange — Human QA handoff

**Build branch:** `feature/nu-exchange-studio-launcher-spec`  
**Scope:** Generation 1 exchange visualization only  
**Status:** Candidate changes committed; browser execution and human acceptance are still pending.

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
- Gateway lock and deployment configuration were not changed.

## Human test procedure
1. Open the candidate exchange page in a browser with the N.U source served locally or through an authorized preview environment.
2. Generate several ordinary XP/Mana wallet events in the existing game UI, then reload Exchange.
3. Confirm the market chart contains only recorded activity and shows candle bodies, distinct high/low wicks, closing-index line, and volume bars.
4. Toggle each chart layer independently. Confirm other layers remain visible and the chart remains legible.
5. Select Reduced motion. Confirm replay progression stops at the current full snapshot; toggle it off and confirm replay resumes.
6. Compare wallet balances and transaction count before/after changing chart options and replay speed. They must remain identical.
7. Confirm HP is absent from both selectors and that the transfer submit control remains disabled.
8. Reload the page and verify the same local transaction IDs reproduce the same candle OHLC values.
9. Test desktop and narrow mobile widths, keyboard navigation, and a browser with `prefers-reduced-motion: reduce` enabled.

## Record results
For each step record: PASS / FAIL / NOT RUN, browser + version, viewport/device, and concise observations. Attach screenshots for chart layers, reduced-motion behavior, HP exclusion, and disabled transfer UI. Do not report acceptance based on CI or source inspection alone.

## Known limitations / not claimed
- No live public preview or deployment has been performed by this change set.
- The project does not provide verified production hosting status in this handoff.
- This is not a real financial market, trading system, order book, or price prediction.
- Cross-game settlement, online wallet sync, and production authentication remain out of scope.
