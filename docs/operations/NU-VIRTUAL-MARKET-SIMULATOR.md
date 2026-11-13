# N.U Virtual Market Simulator — Generation 1

## Purpose
The N.U Virtual Market Simulator is a fictional, browser-local market visualization. Its chart resembles a trading terminal (OHLC candles, volume, trend and activity summaries), but its indices and all displayed market behavior exist only inside the N.U game universe.

## Hard boundary
- No connection to stock exchanges, currencies, cryptocurrencies, commodities, real market feeds, external price APIs or real-world economic data.
- No real-money value, deposits, withdrawals, cash-outs, investment claims or external trading.
- The displayed value is a synthetic **N.U Index**, not a currency price or exchange rate.
- The initial index baseline of 100 is an arbitrary internal simulation anchor, not a real-world peg or valuation.
- No swap or asset conversion is enabled by this simulator.

## Activity model
- Only recorded Generation 1 wallet transactions are inputs.
- A positive asset delta (earning/reward/issuance) is treated as simulated supply pressure.
- A negative asset delta (spending/consumption) is treated as simulated demand pressure.
- Each event adjusts the index by a bounded, deterministic percentage based on the magnitude of the recorded delta. Values are illustrative game mechanics, not economic forecasts.
- Events are grouped into hourly OHLC candles. Volume is the sum of absolute recorded in-game deltas; demand and supply summaries are derived from their signs.
- The simulator does not invent candles when there is no activity. It only has the currently retained local transaction history (maximum 40 records); clearing browser data clears that local history.
- Current index and candles are a derived view of the local ledger, not server-authoritative shared market state. Different browsers/devices may show different histories.

## Generation boundary
This feature belongs to Generation 1 and runs in the existing browser prototype. Generation 2 remains reserved for advanced/heavy game systems and is not started by this feature.
