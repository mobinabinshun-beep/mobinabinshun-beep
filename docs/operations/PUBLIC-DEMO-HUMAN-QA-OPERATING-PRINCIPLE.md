# Public demo first: human QA operating principle

**Scope:** this operating rule applies to the active feature branch and the project's game and interactive-module work.

## Delivery sequence

1. Implement the approved feature on the active feature branch and keep the change isolated from unrelated work.
2. Run the relevant automated regression, syntax, integration, wallet/state-safety, and rendering checks.
3. When the required automated checks pass, merge the machine-approved, backed-up QA candidate into the public-demo source so the human test team can evaluate the real integrated experience. This is a demo-only QA handoff, not a product release.
4. Treat the public demo as the human QA environment: testers verify desktop, mobile, touch, responsive layout, interaction flow, accessibility/usability, and cross-module regressions, then submit a written report with reproduction steps and evidence.
5. Triage the human report, fix confirmed issues on a follow-up branch, rerun automated checks, and refresh the public demo for another QA pass.
6. Public-demo availability is not production acceptance. Do not describe a feature as product-released, production-ready, or launched merely because it is on the demo or has passed human QA. A separate explicit owner instruction is required after human acceptance for any beyond-demo release or promotion.

## Guardrails

- Do not hold an automated-green feature out of the public demo solely because human QA has not happened yet; human QA is the reason to publish to the demo.
- Do not bypass failing required automated checks. If a check is unavailable or flaky, record that explicitly and obtain owner direction before proceeding.
- Keep simulated market activity visibly labelled and separate from real player transactions, wallet balances, inventory, orders, and settlement.
- Preserve existing game state, navigation, wallet ownership, and save behavior unless the approved scope explicitly changes them.
- Every demo handoff must identify the exact commit, demo URL, automated-check result, known limitations, and the human QA areas requested.
- Human testers report observations; their PASS does not authorize product release. Only the owner may accept the human QA result, and a separate explicit owner instruction is required for any later release/promotion.

## Current handoff

- Exchange chart-linked indicators and event timeline were merged in PR #116.
- Merge commit: `dbcb08ccc1f3cc2de7caa05a74c21503dfbada81`.
- The seven required PR checks passed on candidate head `8ca8eec051394d749f1523447b3003a3ab6219eb`.
- GitHub Pages build and deployment completed successfully after the merge.
- Public demo: https://mobinabinshun-beep.github.io/mobinabinshun-beep/
- Human browser, touch, responsive, and usability QA is now the next required step; this handoff is not production approval.


## Owner amendment — QA demo is not a product release (2026-11-21)

The project owner's latest direct instruction controls over any older wording that conflates demo delivery with publishing/release:

- The public demo is a **human-test environment only**. Deploying a TEST CANDIDATE there is a QA handoff, not a product release, production publication, launch, promotion, or announcement.
- The execution assistant may prepare and place an already-authorized, machine-passed candidate on the designated demo solely to enable human testing, following the required runtime-baseline capture, exact-candidate backup, deployment and live-build verification gates.
- The candidate must be visibly labelled **TEST CANDIDATE — NOT HUMAN-APPROVED**, with its exact build/commit identity and known limitations. Keep the change isolated to the demo candidate; do not imply owner acceptance.
- **No product release, production promotion, stable-version publication, package/store release, public launch announcement, or other beyond-demo publication may occur unless BOTH conditions are met:** (1) the owner has reviewed and explicitly accepted the human QA results for the exact demo build/scope; and (2) the owner then gives a separate, direct, unambiguous instruction authorizing that named release/promotion action.
- Human QA PASS, owner acceptance of the demo, green CI, merge, a backup, a demo deployment, or silence is never by itself permission to release or promote. If no separate release instruction exists, remain at the demo QA stage.
- Do not repeatedly frame the absence of a release as a pending assistant decision. The assistant's current task is the authorized work and QA handoff; release is outside the active workflow unless the owner later directs it.


## Current human QA handoff — Pixel Art Studio 2D (2026-11-21)

- Demo URL: https://mobinabinshun-beep.github.io/mobinabinshun-beep/pixel-art-studio.html
- Pages build SHA: `c35e5b2edec0d48a0d255ed78ce77a207a241a5f`; Pages run `44903824271` — build/deploy SUCCESS.
- Candidate PR: [#238](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/238), merged only to deliver a demo QA candidate.
- Detailed scenarios/reporting: [Human QA Handoff](https://github.com/mobinabinshun-beep/mobinabinshun-beep/blob/main/docs/operations/PIXEL-ART-STUDIO-2D-HUMAN-QA-HANDOFF-2026-11-21.md).
- State: HUMAN-QA-PENDING. The page visibly identifies the candidate as not human-approved.
- This handoff is not product release or production promotion; beyond-demo action requires human acceptance of this exact build/scope and a separate explicit owner instruction.
