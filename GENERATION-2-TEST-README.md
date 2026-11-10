# N.U Interactive World — Generation 2 isolated test

This is an isolated prototype on `feature/nu-world-generation-2`. It does not replace or modify Generation 1 runtime files.

## Open the test
After the branch files are committed, use:
- GitHub branch source: https://github.com/mobinabinshun-beep/mobinabinshun-beep/tree/feature/nu-world-generation-2
- Static test entry: https://raw.githack.com/mobinabinshun-beep/mobinabinshun-beep/feature/nu-world-generation-2/GENERATION-2-TEST.html

The static test host may take a short time to refresh its cache.

## Prototype scope
- Independent layered Canvas scene inspired by the supplied dark celestial city reference.
- Frame-time adaptive visual quality, independent from simulation logic.
- 30×30 territory game with alternating four-direction moves, immutable paths, 70 selectable AI behavior profiles, region flood-fill scoring and wager settlement.
- XP, Mana, X/N Credits wallet; HP excluded from wager currencies.
- Mana capacity based on capsule count; overflow payout is burned and never credited.
- Win payout is 2× stake; loss forfeits stake; consecutive wins increase the next suggested wager multiplier; closing casino resets streak.
- Arcane shield capacity 10, configurable color, absorbs damage before HP.
- Shop and first-purchase two-choice tutorial.

## Important prototype limitations
- This is a playable mechanics test, not production multiplayer or a server-authoritative casino. Wallet and AI are client-side and must not be used for real-money or competitive value.
- The 70 profiles are behavior strategies, not a 70% win probability.
- Region scoring uses cell flood-fill separated by path edges. Exact tie and boundary rules remain open for design review.
- Scene is a procedural approximation; the uploaded reference image itself is not embedded as a source asset.
- Online safe-zone integration, download/native packaging, persistence, security, economy balancing, accessibility, full regression and integration into the public home page are not yet completed.
- `nu-engine.js`, `nu-games.js`, `nu-pixel-world.js`, `index.html` and `nu-world.css` are unchanged.

## Test checklist
1. Load on desktop and mobile; verify adaptive quality changes without changing game state.
2. Open shop; test affordability and first-purchase quest.
3. Test shield purchase/color and damage absorption through `window.NUGeneration2Test.damage(n)` in developer console.
4. Start 30×30 match; move only orthogonally, verify occupied vertices cannot be reused.
5. Test wagers with XP and Mana, including a Mana payout exceeding capsule capacity.
6. Close/reopen casino and verify streak reset.
7. Compare all original Generation 1 file hashes before any integration.
