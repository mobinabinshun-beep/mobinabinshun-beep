# Gateway multi-input dwell correction — 2026-11-20

## Human report / intake
Owner-reported failures:
- Physical mouse: Gateway trigger/options do not open/activate reliably by dwell.
- Touch: drag/scroll movement across Gateway is not recognized; dwell activation fails.
- Simulated mouse/controller: dwell activation is not available consistently.
Goal: offer dwell-to-open/activate as a fast alternative alongside existing click and select/confirm behavior.

## Baseline and recovery
- Public deployed baseline: `59cf8c34288a524c36642c9122959cd289bdb905`.
- Exact pre-change recovery branch: `backup/gateway-mouse-touch-controller-before-dwell-2026-11-20`.
- Working branch: `fix/gateway-mouse-touch-controller-dwell-2026-11-20`.
- This record does not authorize merge or final production release. Under the binding owner decision `PUBLIC-DEMO-HUMAN-TEST-LAB`, once this explicitly scoped/open/demo-eligible candidate reaches MACHINE-PASS on its exact SHA and BACKUP-VERIFIED, the next required action is to publish that candidate to the public experimental demo for human QA; no additional pre-test human approval is required. Human approval is requested only after live demo testing and reporting.

## Root cause from source inspection
- Physical mouse trigger had a 500 ms open timer, but Gateway items only selected on pointerenter; there was no dwell-to-activate path for items.
- Touch used pointerdown/up on the trigger and cancelled on pointercancel; touch movement over options had no hit-test selection/dwell path. Touch-action allowed browser panning to cancel the pointer sequence.
- Simulated controller moved through Gateway selection and emitted confirm separately; selection had no dwell-to-activate path.

## Candidate correction
- Add a shared 500 ms dwell activation timer for Gateway items.
- Physical mouse item hover selects and starts dwell; pointerleave cancels.
- Touch pointer movement hit-tests Gateway options; drag movement over an option starts/restarts dwell. Touch-action is set to none on Gateway trigger/options to preserve the gesture while interacting with the Gateway.
- A stationary touch on an option retains the existing tap activation; a moved touch uses dwell instead of accidentally activating on release.
- Simulated mouse target and directional controller selection use the same dwell activation timer.
- Existing click and keyboard confirm remain available; no selective click requirement is introduced.

## Files changed
- `nu-hex-gateway.js`
- `nu-hex-gateway.css`
- `index.html` (cache-busting asset versions)
- `tests/nu-gateway-pointer-controller-mode.test.js`
- `tests/nu-gateway-controller-input.test.js`

## QA / release gates
- Machine CI: PENDING.
- Browser/device tests (mouse, touch, simulated controller): PENDING.
- Public demo deployment: NOT PERFORMED.
- Human report and approval: PENDING.
- Final ACCEPT: NOT GRANTED. Once CI passes on the exact candidate SHA and its backup is verified, publish it to the public experimental demo and start owner/human testing; do not wait for pre-test approval.


## Follow-up correction — 2026-11-21
- Static audit confirmed the documented touch-drag path was incomplete: movement was never recorded, so release could activate the original option after a drag.
- Corrected by tracking the active touch pointer ID, applying a 10 px movement threshold, cancelling trigger-open dwell after movement, hit-testing the current option during an open-Gateway drag, and suppressing release activation after movement.
- Touch pointer-up/cancel now clears pointer state and pending dwell; stationary touch keeps the existing tap activation.
- CSS now applies `touch-action: none` to the Gateway trigger and options, matching the approved candidate interaction contract.
- Machine CI: NOT YET VERIFIED for this follow-up. Browser/device QA and public demo remain pending. After exact-SHA MACHINE-PASS and BACKUP-VERIFIED, publish the experimental demo build for human QA under the binding owner decision; no merge/final release is implied.


## CI diagnosis and test correction — 2026-11-21
- First follow-up CI run exposed a test-fixture defect, not a Gateway runtime syntax error: the new touch-action assertion referenced `gatewayCss` without loading the CSS fixture.
- Added the missing CSS fixture import to the pointer/controller regression test.
- Exact-head CI rerun for the corrected test commit was not yet observed at the time of this record update; no PASS is claimed until all required checks complete successfully.

## Corrected release gate — 2026-11-21
- MACHINE-PASS is the gate that unlocks the demo-test release, not final acceptance.
- For this authorized/open/demo-eligible Gateway scope, after MACHINE-PASS on the exact candidate SHA and BACKUP-VERIFIED, deploy the same candidate to the public experimental demo without waiting for a second/pre-test human approval.
- Verify live URL and build identity, run post-deploy smoke checks, then hand the deployed build to human testers and collect evidence/reports.
- HUMAN-PASS / owner approval and Final ACCEPT remain pending until human testing is complete. Merge or final production release is not implied by demo-test deployment.
