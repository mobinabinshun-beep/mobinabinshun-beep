# N.U Virtual Market Simulator — Generation 1

## Purpose
The N.U Virtual Market Simulator is a fictional, browser-local **single-player** market visualization for the offline and downloadable demo. Its chart resembles a trading terminal (OHLC candles, volume, trend and activity summaries), but every value is derived only from the current player's own local wallet, assets, financial actions and saved transaction history.

## Hard boundary
- No connection to stock exchanges, currencies, cryptocurrencies, commodities, real market feeds, external price APIs or real-world economic data.
- No real-money value, deposits, withdrawals, cash-outs, investment claims or external trading.
- The displayed value is a synthetic **N.U Index**, not a currency price or exchange rate.
- The initial index baseline of 100 is an arbitrary internal simulation anchor, not a real-world peg or valuation.
- No swap or asset conversion is enabled by this simulator.

## Activity model
- Only the current player's own recorded Generation 1 wallet transactions are inputs.
- This is not a multiplayer market: no other players, shared order book, global player activity or synchronized world market is modeled.
- The demo is designed to calculate and display its simulation from local save data without requiring a network connection.
- A positive asset delta (earning/reward/issuance) is treated as simulated supply pressure.
- A negative asset delta (spending/consumption) is treated as simulated demand pressure.
- Each event adjusts the index by a bounded, deterministic percentage based on the magnitude of the recorded delta. Values are illustrative game mechanics, not economic forecasts.
- Events are grouped into hourly OHLC candles. Volume is the sum of absolute recorded in-game deltas; demand and supply summaries are derived from their signs.
- The simulator does not invent candles when there is no activity. It only has the currently retained local transaction history (maximum 40 records); clearing browser data clears that local history.
- Current index and candles are a derived view of this player's local ledger, not server-authoritative state. Different browsers/devices may show different histories; no cross-device sync is implied.
- Local browser storage is not secure or tamper-resistant and must not be represented as protected competitive assets.

## Generation boundary
This feature belongs to Generation 1 and runs in the existing browser prototype. Generation 2 remains reserved for advanced/heavy game systems and is not started by this feature.


## Future server direction — archive idea only

A future server-backed version may be considered separately for authenticated per-player persistence, server-side transaction validation, idempotent settlement, audit/recovery, and optional cross-device continuity. A shared multiplayer economy is a separate future product decision and requires explicit owner approval. None of these server or multiplayer ideas are part of the current offline/downloadable demo or implementation commitment.

## Exchange display and local cache limits — 2026-11-14
- HP (the current HP meter) is not an exchange-listed asset. HP Capsules remain a distinct inventory item and are not the HP meter.
- The exchange's own browser cache stores only the latest 24 balance changes plus their starting balance per listed asset, the latest 5 written transaction-history entries per asset, and at most 24 market candles for the selected asset. Each refresh replaces this derived cache snapshot, so older exchange-view entries are not retained there.
- The simulator reads only the latest 24 local wallet transactions. The underlying game wallet ledger remains separate; the exchange cache limit does not delete or rewrite the game's wallet save.
- Both charts display horizontal and vertical guide lines to make the 24-step history easier to read.
