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
- Machine CI (initial candidate): PASS on exact SHA `f8af8bfb60cf965a87476236ee388e80409f8f20` (8/8 checks).
- Browser/device tests (mouse, touch, simulated controller): PENDING — human QA handoff is now open on the deployed demo.
- Public demo deployment: VERIFIED SUCCESS — GitHub Pages run `44837990921`, deployed commit `aacb211c7282439bbca1cab256aa30859909951a`.
- Human report and approval: PENDING.
- Final ACCEPT: NOT GRANTED. Candidate is published to the public experimental demo; human/device testing and owner approval are now pending.


## Follow-up correction — 2026-11-21
- Static audit confirmed the documented touch-drag path was incomplete: movement was never recorded, so release could activate the original option after a drag.
- Corrected by tracking the active touch pointer ID, applying a 10 px movement threshold, cancelling trigger-open dwell after movement, hit-testing the current option during an open-Gateway drag, and suppressing release activation after movement.
- Touch pointer-up/cancel now clears pointer state and pending dwell; stationary touch keeps the existing tap activation.
- CSS now applies `touch-action: none` to the Gateway trigger and options, matching the approved candidate interaction contract.
- Machine CI: PASS on exact SHA `f8af8bfb60cf965a87476236ee388e80409f8f20` (8/8 checks). This status applies only to that SHA; any successor commit requires its own exact-SHA validation. Browser/device QA and public demo remain pending.


## CI diagnosis and test correction — 2026-11-21
- First follow-up CI run exposed a test-fixture defect, not a Gateway runtime syntax error: the new touch-action assertion referenced `gatewayCss` without loading the CSS fixture.
- Added the missing CSS fixture import to the pointer/controller regression test.
- Exact-head CI rerun for the corrected test commit later completed successfully: 8/8 checks PASS on `f8af8bfb60cf965a87476236ee388e80409f8f20`.

## Corrected release gate — 2026-11-21
- MACHINE-PASS is the gate that unlocks the demo-test release, not final acceptance.
- For this authorized/open/demo-eligible Gateway scope, after MACHINE-PASS on the exact candidate SHA and BACKUP-VERIFIED, deploy the same candidate to the public experimental demo without waiting for a second/pre-test human approval.
- Verify live URL and build identity, run post-deploy smoke checks, then hand the deployed build to human testers and collect evidence/reports.
- HUMAN-PASS / owner approval and Final ACCEPT remain pending until human testing is complete. Merge or final production release is not implied by demo-test deployment.


## Candidate release checkpoint — 2026-11-21
- Exact candidate CI: PASS, 8/8 checks on `f8af8bfb60cf965a87476236ee388e80409f8f20`.
- Candidate backup ref: `backup/gateway-mouse-touch-controller-dwell-candidate-2026-11-21`, verified to point to the exact same SHA `f8af8bfb60cf965a87476236ee388e80409f8f20`.
- The Gateway lock entry was aligned with the owner's corrected gate. That documentation change creates a successor head and therefore the exact-SHA CI and backup gates must be reverified for the final candidate before demo deployment.
- Public experimental demo deployment: VERIFIED SUCCESS. Human/device QA: PENDING. Final ACCEPT: NOT GRANTED.


## Demo-test release execution — 2026-11-21
- Final candidate SHA: `ec1473ec7e46c73058fe3357732ef71b1441dfd8`.
- Exact-SHA machine validation: 8/8 checks PASS.
- Candidate recovery ref: `backup/gateway-mouse-touch-controller-dwell-candidate-2026-11-21-final`; independently read back and verified to point to the exact candidate SHA.
- PR #230 merged for the explicitly authorized public demo-test release: merge/deployment commit `aacb211c7282439bbca1cab256aa30859909951a`.
- GitHub Pages build and deployment run: `44837990921`; build, report-build-status and deploy jobs all SUCCESS. Deployment log reports Pages deployment created for the exact merge SHA and the public environment URL below.
- Public experimental demo: https://mobinabinshun-beep.github.io/mobinabinshun-beep/
- Direct HTTP/browser content read-back was unavailable in this execution environment; the Pages deployment status and deployed SHA are verified from the official deployment job log. Record this limitation; do not claim a manual browser smoke test.
- Human QA is now the active next stage: test physical mouse dwell, stationary touch, touch drag across options, scroll/cancel behavior, simulated mouse, directional controller dwell, click/keyboard fallback, and regression-free pause/resume. Record device/OS/browser, steps, expected/actual, evidence and report.
- Human approval and Final ACCEPT: PENDING. No final production promotion is claimed.
