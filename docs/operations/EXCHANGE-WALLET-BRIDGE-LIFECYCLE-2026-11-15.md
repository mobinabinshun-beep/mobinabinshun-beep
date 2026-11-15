# N.U Exchange — Wallet Bridge and Module Lifecycle
**Date:** 2026-11-15  
**Status:** Implemented on the current Gateway / Exchange candidate; CI and human QA pending.

## Wallet bridge
- Exchange reads the canonical local save through NU and NUWallet.
- The bridge shows player identity, owned asset rows, recent transactions, and X/N fields explicitly marked unpriced.
- Refresh occurs on Exchange page entry, same-tab nu:save-updated, cross-tab storage, and page re-entry.
- Wallet remains the sole balance source. The Exchange does not create a shadow wallet, mutate balances, or execute settlement.

## Module manifest and protocol lifecycle
- Protocol metadata is stored under nu.exchange.protocols.v1, separately from wallet balances.
- Generation 1 game manifests for Bubble Hunt, Mana Collector, and Chaos Attack are declared by the Launcher.
- On startup, the Launcher discovers each installed module manifest and registers a non-settlement game adapter.
- On wallet save, the Launcher reconciles protocol ownership against the latest canonical asset rows.
- A nu:launcher:modules-changed event accepts an installedGameIds array and optional manifests. Future install/uninstall UI must dispatch this event or call NUExchangeModuleLifecycle.discover / reconcile.
- Uninstalled protocols remain while a mapped wallet asset is owned. Unmapped assets are retained conservatively. Otherwise, metadata enters a 30-day dormant retention before cleanup.
- All newly discovered protocols are DECLARED_UNVERIFIED. Quote previews remain unavailable and settlement stays disabled.

## Trust and economic boundaries
- Asset IDs are stable module identifiers; walletKey explicitly maps to canonical wallet rows.
- Display names do not establish economic equivalence.
- XP, Mana, HP, capsules, Casino Credits and X/N Credits are not implicitly interchangeable.
- X/N Credits remain unpriced.
- No transfer or quote path writes to the wallet.

## Files and validation
- nu-exchange-engines.js — wallet reader and protocol metadata engine.
- nu-games.js — Generation 1 manifest discovery and Launcher lifecycle hooks.
- exchange.html / nu-exchange.js / nu-exchange.css — read-only Wallet bridge panel and refresh integration.
- tests/nu-exchange-engines.test.js — read-only behavior, trust state, ownership retention, unmapped retention and refresh event tests.
- NU-GENERATION-1-MANIFEST.json — module and lifecycle registration.

Automated tests are authored but not yet executed on the final PR head. Browser/device QA, public demo verification, merge, and deployment remain pending.
