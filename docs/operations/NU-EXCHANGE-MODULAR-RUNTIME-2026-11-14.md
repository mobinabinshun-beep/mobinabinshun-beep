# N.U Exchange — modular single-player runtime and finalization notes

Date: 2026-11-14

## Current product boundary
- Exchange remains a Generation 1, offline-capable, downloadable, single-player feature.
- Every balance, transaction, market step, trend indicator and chart is derived only from the current player's local N.U wallet save.
- There is no shared order book, other-player data, external price feed, real-world exchange rate, real-money value, deposit, withdrawal or cash-out.
- Existing wallet-backed Generation 1 assets are shown; no placeholder coin or unsupported asset is invented.

## Modular Launcher integration
- `nu-exchange-core.js` exposes a registry for game adapters and separately registered coins and assets.
- Launcher/game modules may register through `NUExchangeCore.registerGame({id,name,coins,assets,transferEnabled:false})`.
- The registry starts empty. The Exchange coin, asset and game selectors remain empty until actual game adapters register supported items.
- `transferAvailability` checks that source and destination are different, both adapters are explicitly approved, and the same coin or asset exists in both games.
- Settlement is intentionally disabled. No transfer is performed by this release; future settlement needs owner-approved source/destination adapters, atomicity, validation, duplicate prevention, audit and recovery rules.

## History, cache and animated replay
- Exchange owns a derived localStorage snapshot under `nu_exchange_cache_v2`; each refresh replaces it from the current local wallet save.
- Each listed asset retains at most 24 chart changes plus its starting point and at most five written transaction rows.
- Each market index retains at most 24 real transaction steps and five written step summaries.
- Older Exchange-view history is not retained in the Exchange cache. The underlying game wallet ledger is not truncated or rewritten.
- Replay scales are 24 seconds, 1 minute 24 seconds, 24 minutes, 1 hour 24 minutes, 24 days, and 2 months 24 days. The selected duration distributes the same recorded 24 steps across a looping visual replay.
- Refresh restarts the replay from the local cache. Animation changes presentation only; it never fabricates wallet events or changes balances.
- The behavioral indicator is a descriptive supply/demand lean derived from the player's own signed asset deltas, not a psychological profile or shared market signal.

## Exchange action cooldown
- The visit counter tracks successful committed Exchange operations, not clicks, chart animation or failed attempts.
- Ten successful operations may complete. The 11th attempted operation starts a 120-second cooldown and blocks further attempts.
- If the player leaves before attempting the 11th operation, the in-memory visit count resets. Once a cooldown has started, its end timestamp persists locally across leaving/reopening the page.
- No current transfer operation is enabled, so the cooldown guard is a prepared integration hook and is not currently triggered by gameplay.

## Two-step maintenance latch
- Cross-game transfer is locked by default.
- Unlock requires the exact phrase `UNLOCK N.U EXCHANGE` in step one and a second confirmation at least 500 ms later and within 30 seconds.
- The module can be explicitly re-locked.
- This is only a local UX safeguard; it is not authentication, authorization or anti-cheat security.

## Validation still required
- Automated regression and syntax checks.
- Human browser/mobile QA for responsive charts, replay modes, refresh behavior, storage edge cases and countdown visibility.
- Real Launcher adapter integration and transfer settlement are future work, not part of the current release.
