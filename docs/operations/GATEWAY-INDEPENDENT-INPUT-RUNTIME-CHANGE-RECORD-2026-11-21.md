# Gateway / gameplay virtual-mouse runtime correction — 2026-11-21

**Type:** Owner-directed runtime correction  
**Status:** IMPLEMENTED · MACHINE-PASS · BASELINE-SOURCE-BACKUP-VERIFIED · CANDIDATE-BACKUP-VERIFIED · LIVE-BASELINE-UNVERIFIED · HUMAN-QA-PENDING  
**Authority:** Owner amendment, canonical Gateway contract section 12  
**Candidate branch:** `fix/gateway-independent-controller-input-2026-11-21`  
**Candidate base:** `ea853f01167752747f92347a9f70df095c9182ff`  
**Exact machine-passed candidate:** `062a3594496cd4047ad942c2bd78c6f469008677`  
**Candidate recovery ref:** `backup/gateway-independent-input-runtime-candidate-2026-11-21` — verified identical to the machine-passed candidate (0 ahead / 0 behind).  
**Last-known deployed runtime source:** `aacb211c7282439bbca1cab256aa30859909951a`  
**Recovery ref:** `backup/pre-gateway-independent-input-runtime-2026-11-21` — verified identical to the last-known deployed source (0 ahead / 0 behind).

## Confirmed runtime defects

1. `nu-hex-gateway.js` called `NUControllerPointer.setEnabled(true)` and `setGatewayNavigation(true/false)`. Opening Gateway therefore started and reconfigured the gameplay pointer adapter.
2. The pointer adapter polled gamepad input on pages outside active gameplay and routed Gateway direction events through the pointer movement handler.
3. `moveGatewaySelection()` scheduled a 500 ms dwell callback that closed Gateway and executed the selected route. Direction therefore activated an option instead of only selecting it for separate confirmation.
4. Mouse hover and touch drag also used the same dwell-to-execute path, conflicting with the owner’s direct mouse-hover and separate touch-tap contract.

## Scoped implementation

- The virtual pointer starts only while the active `#game-view` and its game canvas are present. A view observer starts/stops the adapter as the game view enters/leaves scope; launcher, casino and studio pages no longer activate the pointer merely because a controller is connected.
- Gateway no longer references or calls the virtual-pointer adapter.
- The pointer adapter observes Gateway’s open surface as a read-only context. While Gateway is open it does not change pointer coordinates, hit-test targets, or dispatch pointermove/mousemove events. Controller Up/Down is emitted as a separate selective Gateway action; it never calls the pointer movement path.
- A fresh direction press emits one option step immediately; a sustained hold repeats at the adapter’s existing repeat interval. Neutral-state gating prevents an input held through Gateway entry/exit from navigating or resuming gameplay.
- Direction only highlights/selects. The existing separate confirm edge activates. Down beyond the last option exits without activating an item.
- Physical mouse hover activates the hovered option directly; physical click remains available. Touch can open Gateway, lift, and later tap an option. Touch/mouse exits continue to close Gateway while the game remains paused pending fresh gameplay input.
- Updated only the JavaScript asset query versions on the four pages that load these modules. The protected canvas/touch routing selectors and CSS cache keys were not changed.

## Changed files

- `nu-controller-pointer.js`
- `nu-hex-gateway.js`
- `index.html`
- `launcher.html`
- `casino.html`
- `pixel-art-studio.html`
- `tests/nu-controller-pointer.test.js`
- `tests/nu-gateway-controller-input.test.js`
- `tests/nu-gateway-pointer-controller-mode.test.js`
- This change record.

No HUD, game rules, game-object interaction code, Wallet/economy/save data, CSS, canvas routing selectors, or unrelated gameplay modules were changed.

## Machine regression coverage added/updated

- Active-game-only virtual-pointer activation.
- Exact virtual-pointer coordinates remain unchanged while Gateway is open.
- No pointermove/mousemove delivery over Gateway; separate controller direction events continue.
- One-press and held-repeat Gateway direction; separate confirm edge; no duplicate confirm.
- Held input through Gateway closure is blocked until neutral and a fresh press; fresh gameplay movement is emitted only after that transition.
- Gateway direction selects one item without activation; separate confirm activates; Down past the last item exits without selecting/activating another.
- Physical mouse hover activation and mouse-outside exit.
- Touch open → lift → separate option tap; continuing touch outside exit; lifted-finger outside tap exit.

The tests are behavior-level Node harnesses for the pointer adapter and Gateway DOM event flow, not source-string checks alone. All four focused test files also passed a direct harness execution (50/50). Exact-SHA GitHub Actions regressions passed: Gateway #44853286320, Arcane Shield/Mana #44853286198, Wallet/Profile #44853286276, HUD #44853286183, Exchange #44853286209, Graphics Integrity #44853286205, Graphics Preview #44853286245, and Studio Export #44853286192. All runs are for candidate `062a3594496cd4047ad942c2bd78c6f469008677`.

## Baseline, backup and live verification boundary

- A recovery branch was created before runtime edits from the last-known deployed runtime source: `backup/pre-gateway-independent-input-runtime-2026-11-21`.
- GitHub compare verified that recovery ref is identical to `aacb211c7282439bbca1cab256aa30859909951a` (0 ahead / 0 behind).
- The prior deployment record identifies Pages run `44837990921` for that source commit. The public URL could not be independently fetched in this session (web cache miss), so the current live build and a decomposed browser-observed runtime snapshot remain **UNVERIFIED**. The source recovery point is verified; this record does not claim a complete live-runtime snapshot, live smoke test, or deployment verification.
- The exact-SHA machine-passed candidate checkpoint is now created and verified. The next release action is a trial publish to the public experimental demo, solely to begin human QA; it is not final production acceptance. Human acceptance remains pending the owner’s retest.

## Required human QA

On the public demo, verify:
1. Controller virtual mouse moves and highlights game targets in gameplay, and separate confirm activates them.
2. Enter Gateway with the virtual pointer; its coordinates/cursor remain at the game-space position and do not move over options.
3. Up/Down selects one item per press; hold repeats; confirm activates; Down beyond the last option exits without activation.
4. Touch opens, can be lifted, and later taps options; touch exit works both while held outside and by a later outside tap.
5. Physical mouse hover activates an option; leaving/clicking outside closes Gateway.
6. Every exit keeps gameplay frozen until the first fresh gameplay-space input; held controller input does not release the pause.

**Acceptance:** HUMAN-QA-PENDING. No final ACCEPT or owner approval is claimed.
