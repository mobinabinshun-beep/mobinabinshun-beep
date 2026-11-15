# Wallet Audit Trail and Animation Layer

## Placement
The Exchange page presents recent asset movements under **AUDIT TRAIL / RECENT ASSET MOVEMENTS / LOCAL SAVE**. The player profile, owned-asset snapshot, and **SAME WALLET · NO COPIED BALANCE / RECENT WALLET TRANSACTIONS** are nested beneath that audit section. The standalone wallet bridge panel is removed.

## Canonical data contract
- `NU.load()` and `NUWallet.normalizeSave()` remain the source of truth for the local player save.
- `NUExchangeEngines.walletEngine.read()` is read-only and reports the same `nu-world-save-v1` save; it must not maintain a shadow balance or independent transaction ledger.
- Asset movement history is reconstructed from the canonical wallet transaction deltas. The wallet transaction list is a separate, read-only view of those same recorded transactions.
- Market background simulation is not wallet activity and must never enter the audit ledger or change player assets.

## Animation contract
- Audit animation responds to changes in the canonical player identity, owned-asset values, or transaction history.
- The `nu:wallet:audit-updated` event is a presentation signal only. It does not create, approve, or settle a transaction.
- The audit panel uses a restrained visual pulse; reduced-motion preferences disable the animation and retain a non-motion outline cue.

## Offline and responsive behavior
- The page continues to use the local browser save and local transaction history; no network round-trip is required to read or display this audit view.
- A local save remains local-only. Offline mode must not imply remote synchronization or server confirmation.
- The audit section and nested wallet view adapt to narrow screens. Keep the movement list readable and controls usable at mobile widths.
- If browser storage is unavailable or cleared, existing runtime fallback behavior applies; never fabricate a recovered balance or claim a save was persisted when storage rejected it.

## Safety boundaries
- No copied wallet balance, synthetic transaction, live-market settlement, real-money conversion, or cross-game transfer is introduced.
- The wallet bridge remains read-only. Any future mutation must go through the canonical wallet APIs and their own validation and tests.
