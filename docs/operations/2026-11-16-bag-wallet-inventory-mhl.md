# N.U Bag, Inventory, Wallet and MHL — implementation record

**Change ID:** NU-BAG-WALLET-01  
**Date:** 2026-11-16  
**Status:** IMPLEMENTED IN CANDIDATE · AUTOMATED CI RUNNING · HUMAN QA PENDING · NOT DEPLOYED  
**Repository:** `mobinabinshun-beep/mobinabinshun-beep`  
**Candidate branch:** `feat/wallet-health-module-2026-11-15`  
**Existing review:** https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/136

## Owner request and acceptance intent

Add a Bag destination to the main menu. Bag opens a dedicated page with Inventory and Wallet. Inventory lists owned items collected or acquired across supported games. Wallet exposes player Profile, balances, financial Transactions, independent Health history and Mana History. Navigation must remain available between Bag, Inventory and Wallet, and Gateway must be available on those pages without changing the already established main-game Gateway behavior.

The owner retains final human and quality acceptance. This record does not imply human approval.

## Change control and recovery

- Pre-change candidate commit: `9aeac1936a2f163856c31c5782726e5508c1cbd6`
- Backup branch: `backup/pre-bag-wallet-history-2026-11-16`
- Pre-change archive: `archive/pre-change/2026-11-16-NU-BAG-WALLET-01/original/`
- Archive manifest: `archive/pre-change/2026-11-16-NU-BAG-WALLET-01/original/MANIFEST.md`
- The archive preserves the original versions of every existing file modified by this change. Git blob SHA-1 values are recorded in the manifest.
- Implementation is isolated on the candidate branch. The public default branch and deployment have not been changed.

## Implemented candidate behavior

### 1. Menu → Bag

- The main menu now presents BAG instead of a direct Wallet shortcut.
- Bag is a separate view with two destinations: INVENTORY and WALLET.
- The Bag view does not start a game or mutate game state.

### 2. Inventory

- Inventory is a projection of owned item assets registered in the shared wallet.
- Eligible item groups: consumables, items, equipment, upgrades, collectibles and materials.
- Only positive owned quantities appear.
- XP, Mana, HP, Casino credits and exchange currencies are not treated as inventory items.
- Current supported consumables include owned HP Capsules and Mana Capsules when they have a positive visible quantity. Future game items can register through the existing asset registry and appear by group.
- Inventory does not create a second balance store; Wallet remains the source of truth.

### 3. Wallet navigation and histories

Wallet includes:
- PROFILE — opens the existing demo player profile.
- BALANCES — shared owned-asset projection.
- TRANSACTIONS — concise signed deltas only, such as `-10 XP · +1 HP Capsule`. HP-only changes are omitted from the financial transaction list and remain in Health history.
- HEALTH — reads the independent `nu-health-records-v1` store and keeps medicine/item use, damage, healing, deaths and per-Wave summaries. The first four categories retain their latest five events; the Wave ledger retains the latest 20 settled Waves.
- Per-Wave summaries accumulate all recorded damage and healing events for that Wave, then close on Wave settlement. Each row shows total damage, net HP change, successful interaction count and settlement reason. This supports entries such as `Chaos Attack · Wave … · +1 DAMAGE · -1 HP`.
- MHL — **Mana History Ledger**. This is a separate Wallet view derived from Mana- and magic-linked deltas in the existing Wallet transaction ledger. It includes game and Store changes, for example `+10 Mana` or `-10 Mana · +1 N-BI Arcane Charge`. It does not duplicate or independently mutate Wallet transactions; it reflects the latest 24 wallet records.

Bag and Inventory shortcuts remain available from Wallet. Inventory and Wallet navigation remains available from Bag and Inventory.

### 4. Gateway

- Gateway is available on Bag, Inventory and Wallet, including Wallet tabs.
- Its three existing commands remain BACK, MENU and PROFILE.
- BACK returns Wallet/Inventory to Bag, and Bag to the previous Home/Game view.
- PROFILE opens the existing demo profile; closing Profile returns to the page from which it was opened.
- Gateway opening/closing continues to use the existing background-freeze events. Game pause ownership is only changed when the game view itself is active.
- The existing main-game-only Gateway scope and actions are otherwise preserved.

### 5. Exchange and data boundaries

- Inventory is not a tradable-asset list.
- Store-purchased assets retain their existing Exchange exclusion.
- HP remains excluded from Exchange and is not shown as a financial transaction delta; HP events belong to Health history.
- MHL is a filtered view of Wallet transactions, not a new currency or Exchange market.
- No real-money payment, deposit or withdrawal path is introduced.
- Health data remains separate from Wallet storage.

## Files changed

- `index.html` — Bag and Inventory views, Wallet MHL tab, menu entry and navigation shortcuts.
- `nu-player-ui.js` — Bag/Inventory routing, item rendering, concise transaction rendering and MHL rendering.
- `nu-world.css` — responsive Bag, Inventory and Wallet navigation styles.
- `nu-hex-gateway.js` / `nu-hex-gateway.css` — Gateway availability and Back routing for Bag/Inventory/Wallet.
- `nu-wallet.js` — read-only inventory projection.
- `tests/nu-wallet.test.js` — inventory projection tests.
- `nu-health.js` / `tests/nu-health.test.js` — independent per-Wave damage/healing accumulation, idempotent settlement and 20-Wave retention.
- Existing Health module code from the preceding Wallet Health candidate remains in the same PR; its independent store and game event integration are not replaced.

## Automated verification

- Added wallet tests for owned item-group projection and exclusion of currencies/progression/vitals.
- Automated CI for the updated PR: **PENDING / NOT VERIFIED** at record creation.
- Browser execution, touch/keyboard checks, visual layout and live Pages deployment: **PENDING**.
- No test result is inferred from a source diff or successful Git write.

## Human test checklist

1. Open Home → MENU → BAG. Confirm the page opens without starting a game.
2. Open Inventory with no owned items. Confirm an honest empty state appears.
3. Earn or buy a supported item (for example, an HP Capsule) and confirm its owned count appears in Inventory.
4. Confirm XP, Mana, HP and currency balances do not appear as Inventory items.
5. Open Wallet → Balances and confirm balances remain consistent with the game.
6. Open Transactions. Confirm purchase and consumption are separate rows and show only concise signed deltas; HP-only entries must not appear.
7. Open Health. Confirm medicine use, damage, healing and death histories remain independent of financial transactions; after a Wave ends, confirm its total damage and net HP change appear in Wave Damage Summary.
8. Open MHL. Confirm Mana Collector and Mana-linked Store changes appear with signed values and no invented entries.
9. From Bag, Inventory and each Wallet tab, open Gateway. Confirm BACK, MENU and PROFILE work and the foreground controls remain readable.
10. Confirm BACK returns Wallet/Inventory to Bag and Bag to the prior Home/Game view.
11. Open Profile from Gateway, close it, and confirm return to the previous Bag/Wallet page. Confirm temporary profile values are cleared on close.
12. Repeat on narrow portrait and landscape layouts, with keyboard focus and touch input.

## Deployment blocker and outstanding gates

- The repository has no branch-specific public-demo deployment workflow in `.github/workflows/`. The current public Pages site is the default-branch site.
- The mandatory `docs/PUBLIC-DEMO-HUMAN-ACCEPTANCE-GATE.md` forbids treating a branch preview/PR as the public demo and forbids merging/promoting before explicit human acceptance. No separate staging target or deployment action is configured in this repository.
- Therefore this candidate cannot yet be deployed to the required public demo without changing the deployment arrangement. Do not merge the PR or ask the owner to test the branch as a substitute.
- Confirm CI and exact commit status.
- Resolve any regression or workflow failure before demo deployment.
- Deploy only to the designated public demo target after technical checks.
- Collect dated human reports from the owner and testers, including browser/device and reproduction steps.
- Do not promote beyond the demo without explicit owner approval.

## Rollback

The exact pre-change source checkpoint is `backup/pre-bag-wallet-history-2026-11-16` at `9aeac1936a2f163856c31c5782726e5508c1cbd6`. Original modified files are archived under the path above. Roll back by reverting the candidate commits or restoring the checkpoint/archive; do not force-push the public default branch.
