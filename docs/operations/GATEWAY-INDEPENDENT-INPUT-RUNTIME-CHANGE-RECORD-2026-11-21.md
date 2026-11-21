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
- `tests/nu-controller-pointer-runtime.test.js`
- `tests/nu-gateway-controller-input.test.js`
- `tests/nu-gateway-pointer-controller-mode.test.js`
- This change record.

No HUD, game rules, game-object interaction code, Wallet/economy/save data, CSS, canvas routing selectors, or unrelated gameplay modules were changed.

## Machine regression coverage added/updated

- Active-game-only virtual-pointer activation.
- Exact virtual-pointer coordinates remain unchanged while Gateway is open.
- No pointermove/mousemove delivery over Gateway; separate controller direction events continue.
- One-press and held-repeat Gateway direction; separate confirm edge; no duplicate confirm.
- Held gamepad and keyboard input through Gateway closure is blocked (including suppressing held keyboard repeats from reaching the game resume handler) until neutral and a fresh press; fresh gameplay movement is emitted only after that transition.
- Gateway direction selects one item without activation; separate confirm activates; Down past the last item exits without selecting/activating another.
- Physical mouse hover activation and mouse-outside exit.
- Touch open → lift → separate option tap; continuing touch outside exit; lifted-finger outside tap exit.

The tests are behavior-level Node harnesses for the pointer adapter and Gateway DOM event flow, not source-string checks alone. All four focused test files also passed a direct harness execution (50/50). Exact-SHA GitHub Actions regressions passed: Gateway #44853286320, Arcane Shield/Mana #44853286198, Wallet/Profile #44853286276, HUD #44853286183, Exchange #44853286209, Graphics Integrity #44853286205, Graphics Preview #44853286245, and Studio Export #44853286192. All runs are for candidate `062a3594496cd4047ad942c2bd78c6f469008677`.

## Baseline, backup and live verification boundary

- A recovery branch was created before runtime edits from the last-known deployed runtime source: `backup/pre-gateway-independent-input-runtime-2026-11-21`.
- GitHub compare verified that recovery ref is identical to `aacb211c7282439bbca1cab256aa30859909951a` (0 ahead / 0 behind).
- The prior deployment record identifies Pages run `44837990921` for that source commit. The public URL could not be independently fetched in this session (web cache miss), so the current live build and a decomposed browser-observed runtime snapshot remain **UNVERIFIED**. The source recovery point is verified; this record does not claim a complete live-runtime snapshot, live smoke test, or deployment verification.
- The exact-SHA machine-passed candidate checkpoint was created and verified. **Trial merge/deploy source update:** PR #234 was squash-merged to the default Pages source on 2026-11-21 as commit `9e902456469e3b939cb16ba6b35245bf10f38751`. This is a trial publish for human QA only, not final production acceptance. A post-merge recovery ref `backup/gateway-independent-input-trial-merge-2026-11-21` is verified identical to that merge commit (0 ahead / 0 behind). The Pages build/deploy run for this new commit and the live demo content could not be independently retrieved in this session; therefore **LIVE-DEPLOYMENT-VERIFICATION remains UNVERIFIED**. Human acceptance remains pending the owner’s retest.

## Required human QA

On the public demo, verify:
1. Controller virtual mouse moves and highlights game targets in gameplay, and separate confirm activates them.
2. Enter Gateway with the virtual pointer; its coordinates/cursor remain at the game-space position and do not move over options.
3. Up/Down selects one item per press; hold repeats; confirm activates; Down beyond the last option exits without activation.
4. Touch opens, can be lifted, and later taps options; touch exit works both while held outside and by a later outside tap.
5. Physical mouse hover activates an option; leaving/clicking outside closes Gateway.
6. Every exit keeps gameplay frozen until the first fresh gameplay-space input; held controller input does not release the pause.

**Acceptance:** HUMAN-QA-PENDING. No final ACCEPT or owner approval is claimed. The merge to the Pages source is a trial publication only; do not treat it as a human QA pass.


## 2026-11-21 follow-up — historical behavior composition and deferred human QA

**Follow-up candidate:** `fix/gateway-touch-tap-multisource-2026-11-21`  
**Initial implementation commit:** `97f6370711830f59a0cbda68c71c0afb61eb11b5`  
**Latest candidate commit after cache-bust and regression guards:** `032298e4bdea7a67136dbb3eceb189df7e154974`  
**Recovery ref:** `backup/gateway-touch-tap-multisource-candidate-2026-11-21` — created at the latest candidate SHA and compared identical (0 ahead / 0 behind).  
**PR:** [#235](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/235) — open; not merged.  
**Machine checks:** 8/8 relevant GitHub Actions runs succeeded on exact candidate SHA `032298e4bdea7a67136dbb3eceb189df7e154974`: Gateway, Arcane Shield/Mana, Wallet/Profile, HUD, Exchange, Graphics Integrity, Graphics Preview and Studio Export.  
**Deployment:** not performed for this follow-up candidate.  
**Human QA:** DEFERRED / PENDING.

### Historical comparison and chosen composition

- Historical commit `d48039d06039385fcb5c837f0f28cc0a2d13e54e` contained the touch pointer-up path that opened Gateway on a short deliberate tap. This is the useful behavior restored here.
- Historical dwell implementation `aacb211c7282439bbca1cab256aa30859909951a` supplied the 500 ms stationary touch dwell, 500 ms physical-mouse trigger hover, and 1000 ms simulated-pointer trigger dwell. The hold path is retained; the short touch tap is no longer discarded.
- Independent-pointer candidate `062a3594496cd4047ad942c2bd78c6f469008677` supplied the separation boundary: virtual pointer belongs to active gameplay only, remains frozen at its game-space location while Gateway is open, and controller direction selects without activating; confirm remains separate.
- These are composed as a forward correction, not a wholesale rollback to any historical commit.

### Exact behavior now represented in candidate source

1. Direct touch on the Gateway trigger: a stationary hold can open after 500 ms; a deliberate pointer-up before that threshold now opens immediately. Releasing after the hold already opened does not toggle-close the Gateway.
2. Physical mouse: trigger hover opens after 500 ms; while Gateway is open, hovering an actionable option invokes its action. Direct click remains available.
3. Simulated mouse: trigger entry opens after 1000 ms through the `nu:simulated-pointer-target` event; Gateway navigation remains a separate direction/confirm path. The virtual pointer is not moved by Gateway navigation.
4. Gateway option touch: opening touch may be lifted; a later, separate touch on an option activates it.
5. JavaScript asset query version changed on index, launcher, casino and studio pages to `20261121-touch-tap-r2`, with a test guard against stale versions.

### Important unresolved verification

- The candidate source and automated workflows are verified, but PR #235 is not merged and this follow-up is not published to the public demo.
- The current deployed build identity is still not independently verified.
- The exact live behavior of touch, physical mouse and simulated mouse has not been observed on the public demo or owner devices.
- Therefore do not mark the scenario as operationally accepted. The prior owner report that it did not work remains open and authoritative.

### Deferred agenda — resume from this exact point

- [ ] Merge/deploy PR #235 only after reviewing its exact candidate and CI evidence; publish to the public experimental demo for human QA, not final acceptance.
- [ ] Verify live build identity and loaded Gateway script query version `20261121-touch-tap-r2`.
- [ ] Human QA: touch tap opens; touch hold opens; lift then separately tap a Gateway option; outside-zone touch exit and resume-on-fresh-input.
- [ ] Human QA: physical mouse hover opens; option hover activates; click remains functional; exit by leaving/clicking outside.
- [ ] Human QA: virtual pointer enters trigger and opens after 1000 ms; stays frozen at exact game-space position while open; Up/Down selects only; hold repeats; confirm activates; Down beyond last item exits without activation; leave/re-enter gating works.
- [ ] Confirm all three input methods leave gameplay paused until a fresh gameplay-space input; no held input leaks through closure.
- [ ] Record each scenario separately as PASS/FAIL with device, browser, page/game, exact deployed SHA, expected/actual result and evidence. Any failure reopens only the affected scope for a successor candidate.
- [ ] Only after owner human approval may the operational evaluation report ACCEPT. CI success alone is not human acceptance.

**Resume pointer:** start with PR #235, candidate SHA `032298e4bdea7a67136dbb3eceb189df7e154974`, backup ref above, and this deferred agenda. Do not restart the investigation or overwrite prior human reports.
