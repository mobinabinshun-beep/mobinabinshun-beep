# N.U Exchange — Ambient Flow and Player Chart Drawing
**Date:** 2026-11-15  
**Status:** Implemented on the Gateway / Exchange candidate branch; automated CI and human browser acceptance pending.

## Scope
This change extends the existing activity-driven fictional market chart without replacing its transaction-backed OHLC history, replay controls, moving average, parametric bands, themes, palettes, volume, or durable Store-purchase exclusion.

## Ambient background flow
- A small animated background-flow layer is derived from the most recent eight local player market steps.
- Recent demand/supply balance shapes the direction bias; recent activity volume shapes animation intensity.
- Each ambient index pulse is clamped to at most ±3 N.U index points.
- Each ambient display-volume pulse is clamped to at most 3 display units.
- The layer is explicitly labelled **BACKGROUND FLOW / VISUAL ONLY**.
- Ambient pulses are never appended to the wallet ledger, market history, replay cache, asset balance chart, or transaction list.
- It uses no external market feed, shared order book, or real-world prices.

## Player chart drawing tools
- Cursor
- Trend line
- Horizontal level
- Vertical marker
- Shaded analysis zone
- Undo last annotation
- Clear annotations

Annotations are stored in local browser presentation preferences, keyed by selected virtual asset. They are not written to the N.U wallet save, do not affect asset balances, and are not interpreted as orders, quotes, forecasts, or trade signals. Coordinates are normalized so drawings remain positioned when the chart resizes.

## Accessibility and responsive behavior
- Toolbar controls are buttons with aria-pressed state.
- The drawing toolbar wraps on narrow screens.
- Pointer events support mouse, pen, and touch. Drawing mode temporarily disables chart touch scrolling on the canvas; cursor mode restores vertical page panning.
- Existing reduced-motion styling remains in force for the rest of the page; ambient flow is a low-amplitude canvas presentation effect.

## Files
- nu-exchange-visuals.js — ambient pulse model and local drawing interaction/rendering.
- exchange.html — drawing toolbar and module inclusion.
- nu-exchange.js — chart render integration.
- nu-exchange.css — responsive drawing controls.
- tests/nu-exchange-visuals.test.js — boundedness, determinism, and behavior-bias tests.
- NU-GENERATION-1-MANIFEST.json — module and behavior registration.

## Validation
- Added automated unit coverage for deterministic ambient pulses, ±3 index bound, 3-unit volume bound, and player demand/supply direction bias.
- Run the repository Node test suite and the Exchange / graphics GitHub Actions workflows on the final PR head.
- Human acceptance remains required for chart drawing on desktop and touch devices, annotation persistence per asset, resize behavior, and visual balance.
- No merge, public deployment, or human acceptance is implied by this implementation record.

## Safety invariants
- Wallet remains the only balance ledger.
- Ambient background flow never creates wallet transactions.
- Drawings remain presentation-only and never trigger transfers or settlement.
- Store-purchased assets remain excluded from Exchange selectors and simulation.
- No real money, external financial data, deposits, withdrawals, cash-out, or shared order book.


## Owner-requested idle-market behavior
- The chart now renders a rolling, non-persistent ambient candle tape even when the player has no recorded transactions.
- Each background candle uses a display-only absolute move of 0, 1, 2, or 3 index units. The cumulative probabilities are interpreted as P(|move| >= 1) = 90%, P(|move| >= 2) = 60%, and P(|move| = 3) = 30%; therefore exact outcomes are 0: 10%, 1: 30%, 2: 30%, 3: 30%.
- Positive and negative directions are equally likely (50% each, conditional on a non-zero move).
- The selected asset ID seeds the local deterministic sequence. Recent player demand/supply history only adjusts the visual volume intensity (bounded to 3); it does not bias the 50/50 direction or alter player data.
- Ambient candles and volume are labelled as simulated. They are never represented as real player trades and never enter wallet history, saved transactions, replay cache, asset balances, or settlement.
- When player history exists, a short ambient tail follows the latest recorded candle. When no history exists, a full 24-candle ambient tape is shown.
- Recorded player history and ambient simulation are displayed separately in the event counter and history list.

## Chart analysis controls
- Analysis line (moving average) and parametric dispersion bands remain independently user-toggleable.
- Trend line, horizontal level, vertical marker, and shaded analysis zone tools remain presentation-only and persist per selected asset in local browser preferences.
- Annotation controls do not write to the wallet or enable orders.
