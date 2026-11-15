# Change Record — Wallet / Exchange Read-only Bridge

- Date: 2026-11-15
- Repository: mobinabinshun-beep/mobinabinshun-beep
- Base branch: feature/nu-exchange-studio-launcher-spec
- Working branch: feature/nu-wallet-exchange-bridge
- Pre-change commit: 743baaf562ee8abb2f26a9a565042527aa8345ef
- Request: connect N.U Exchange to the existing player wallet and its saved data.
- Acceptance: Exchange reads the same local wallet/profile, displays balances and recent transaction history, refreshes after same-tab and cross-tab saves, keeps legacy/unattributed and unpriced fields visibly distinct, and does not mutate balances or enable settlement.
- Baseline archive: archive/pre-change/2026-11-15-wallet-exchange-bridge/
- Archived files: nu-wallet.js, nu-exchange-core.js, nu-exchange.js, exchange.html, tests/nu-wallet.test.js, tests/nu-exchange-runtime.test.js.
- Implementation: read-only wallet bridge, profile summary, all supported asset balances, unpriced X/N credit visibility, and save event refresh.
- Test/deployment gates: automated checks to be recorded after implementation. Public demo deployment is NOT VERIFIED; human QA remains pending. No deployment or merge authorized.
- Safety: preserve ENGINE-LOCK.md; do not modify nu-engine.js, Gateway, wallet balances or ledger settlement.
