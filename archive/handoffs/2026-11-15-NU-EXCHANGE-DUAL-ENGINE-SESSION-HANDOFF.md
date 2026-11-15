# N.U Exchange — Session Archive & Next-Chat Handoff
**Archived:** 2026-11-15  
**Working branch:** `feature/nu-wallet-exchange-bridge`  
**Related PR:** [#106](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/106)

## User's latest instruction
Stabilize project goals, data contracts and implementation details in repository documentation so another teammate or a new ChatGPT conversation can continue without repeating discovery questions. Design the Exchange core with two engines:
1. A wallet/data reader that reads wallet data, supplies the core, and calculates/updates Exchange views from the canonical wallet snapshot when the player enters the Exchange.
2. A module onboarding engine that discovers/normalizes new module coins and assets, turns them into a simple filtered protocol for the core, retains protocols while the game is installed or owned assets remain, then retains metadata for a limited period after uninstall and zero balance before deletion.

The Exchange core itself must never store player balances; the wallet remains the only balance store. Engine 1 refreshes profile, balance, charts and animations on Exchange entry. Engine 2 owns module discovery, economic protocol matching and quote/operation preparation. Settlement is still blocked pending authoritative ledger design.

## Agreed product/economy facts
- Bubble Hunt, Chaos Attack and Mana Collector share `nu.g1.shared-economy`; they are views into one shared profile/wallet, not three independent balances.
- Painting/Creative Studio is a separate game economy/progression ladder; its stated rule is 50 Studio XP per level.
- Bubble Hunt has its own progression ladder; the stated benchmark is one purposeful interaction = one BH XP and 100 XP per capsule. Never collapse these ladders based on labels.
- XP from Bubble Hunt must not be converted into Mana by default.
- Future games can have different names, currencies, XP systems, stack sizes and earning difficulty. Compare mechanism/effort/sinks/caps and benchmark against the Generation 1 reference catalog; only reviewed, versioned ratios establish equivalence.
- Casino Credits are separate. X Credits/N Credits remain unpriced until their mechanics and sinks are specified.
- The Exchange is an internal game-economy tool, not real-money/crypto trading.

## Implementation in this branch
- Added `nu-exchange-engines.js`: read-only wallet reader + manifest/protocol engine.
- `nu-exchange.js` uses the wallet reader for its live wallet view.
- `exchange.html` loads the new engine before the page controller.
- Added `tests/nu-exchange-engines.test.js`.
- Added full implementation/continuation document and README index.
- Extended the universal exchange architecture with the implemented dual-engine design.
- Wallet remains the canonical `nu-world-save-v1`; protocol metadata is stored separately under `nu.exchange.protocols.v1`.
- Newly discovered manifests are DECLARED_UNVERIFIED. Quote preview requires VERIFIED and approved valuation. No client-only manifest can promote itself.
- Protocol retention: installed module OR positive mapped wallet balance → retain; otherwise dormant 30 days then delete metadata. Unknown wallet mappings are retained conservatively.
- No wallet writes, conversion settlement, Gateway changes, engine-lock changes, deployment or merge.

## Critical known limitations
- Launcher install/uninstall lifecycle is not yet wired to the protocol engine. Launcher must call `discover(manifest,{installed:true})` on install/update and `reconcile({installedGameIds:[...]})` with the complete installed module list after every lifecycle change.
- Every real game asset needs an accurate walletKey mapping. Do not infer by display name.
- Current trust promotion/review workflow is not implemented, so quote preview rejects all newly discovered manifests.
- Atomic authoritative ledger, fees/limits/rounding and settlement are not implemented.
- Tests are authored but their execution and public demo behavior remain unverified. Run project test commands/CI and browser checks before merge.
- Public demo deployment is not done. Follow established process: test the public demo first, then collect human reports from members/team testers. Never silently merge/release before those gates.
- PR #106 previously diverged from default branch; re-check current compare status and reconcile history before merge.

## Exact next steps
1. Fetch latest default branch, feature branch and PR #106; verify no intervening changes.
2. Run syntax checks and project test suite; fix failures.
3. Add lifecycle tests: install, uninstall with owned balance, uninstall zero balance, 30-day expiry, reinstall before expiry, unknown wallet mapping.
4. Wire launcher lifecycle callbacks to `discover` and `reconcile`.
5. Validate wallet reader on the public demo with multiple browsers/tabs and no balance mutation.
6. Gather human QA reports using the established protocol; archive reports.
7. Reconcile branch history, update PR and request human review. Do not merge without owner approval.

## Canonical documents
- [Dual-engine implementation and handoff](../architecture/NU-EXCHANGE-DUAL-ENGINE-IMPLEMENTATION-AND-HANDOFF-2026-11-15.md)
- [Universal Exchange architecture](../architecture/NU-UNIVERSAL-GAME-ASSET-EXCHANGE-SPEC-2026-11-14.md)
- [Adaptive Runtime & Economic Intelligence Core](../architecture/NU-ADAPTIVE-RUNTIME-AND-ECONOMIC-INTELLIGENCE-CORE-2026-11-15.md)
- [Generation 1 base economy catalog](../economy/NU-GENERATION-1-BASE-ECONOMY-REFERENCE-CATALOG-2026-11-14.md)
- [Previous wallet bridge change record](../../CHANGELOG/2026-11-15-wallet-exchange-bridge.md)

This is a structured handoff, not a verbatim transcript of ChatGPT conversation history. Treat repository state and executable tests as authoritative over this summary.
