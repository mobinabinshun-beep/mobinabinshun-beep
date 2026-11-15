# N.U Exchange chart controls — 2026-11-15

**Status:** Candidate branch; not merged or deployed  
**Scope:** Exchange presentation and replay only  
**Base:** Current public default branch at the time of work  
**Backup:** `backup/pre-exchange-chart-upgrade-2026-11-15`  
**Candidate:** `feature/exchange-chart-controls-2026-11-15`

## Implemented in this candidate

- Replay selector labels are now number-free: Seconds, Minutes, Hours, Days, Weeks, Months.
- Added a player-controlled visible-history zoom range over the retained local history (4–24 steps).
- Added independent controls for grid, candle shadows, volume, moving-average analysis line and display-only tolerance.
- Added configurable moving-average periods and optional parametric dispersion bands (rolling mean ± one standard deviation), drawn as neutral grey dashed lines. These are descriptive overlays only, not forecasts or trade signals.
- Added Night/Day themes and Aurora, Emerald, Rose, Amber and Monochrome palettes. Preferences are stored locally in a dedicated namespaced key.
- Positive and negative OHLC candles remain derived from the local player's wallet transactions.
- Candle wicks receive deterministic visual-only variation of up to ±5 N.U index points. The variation does not change candle open/close, market index, wallet balances or transactions.
- The chart refresh continues to follow local wallet state and the existing replay timer. A detected ledger addition/removal restarts the replay cursor and briefly highlights the chart; no animation or counter creates a wallet event.

## Preserved boundaries

- This remains a fictional, offline, single-player N.U economy display.
- No external market feed, real-world price, shared order book, deposits, withdrawals, cash-out or real-money trading was added.
- The cross-game transfer module remains locked; settlement is not enabled.
- Wallet schema, transaction ledger, game engine, protected HUD, Gateway and adaptive/network runtime were not changed.
- The current wallet ledger retains at most 24 transactions; chart zoom is bounded to those available local steps. The source ledger is not expanded or rewritten by this UI change.

## Regression coverage added

- Replay labels are checked for the six requested units and absence of numerals.
- Market wick tolerance is checked for determinism, a maximum of five index points, and no effect on candle close.

## Verification and release

- Source-level changes and regression assertions are committed to this candidate branch.
- CI graphics preview smoke checks passed, including JavaScript syntax and market-simulator tests. Both new Exchange regression tests passed.
- The Studio export regression workflow failed: 151/153 tests passed; two profile-preview assertions in `tests/nu-profile-preview.test.js` failed against unchanged `index.html`, which is outside this PR's diff.
- Browser/device QA and deployment have **not** been run. Keep the PR in draft until the unrelated failures are triaged and human browser/mobile acceptance passes.
- Rollback reference: `backup/pre-exchange-chart-upgrade-2026-11-15`.
