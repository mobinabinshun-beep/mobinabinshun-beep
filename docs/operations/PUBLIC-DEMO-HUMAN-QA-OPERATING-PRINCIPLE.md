# Public demo first: human QA operating principle

**Scope:** this operating rule applies to the active feature branch and the project's game and interactive-module work.

## Delivery sequence

1. Implement the approved feature on the active feature branch and keep the change isolated from unrelated work.
2. Run the relevant automated regression, syntax, integration, wallet/state-safety, and rendering checks.
3. When the required automated checks pass, merge the approved candidate into the public-demo branch so the human test team can evaluate the real integrated experience.
4. Treat the public demo as the human QA environment: testers verify desktop, mobile, touch, responsive layout, interaction flow, accessibility/usability, and cross-module regressions, then submit a written report with reproduction steps and evidence.
5. Triage the human report, fix confirmed issues on a follow-up branch, rerun automated checks, and refresh the public demo for another QA pass.
6. Public-demo availability is not production acceptance. Do not describe a feature as production-ready until the owner accepts the human QA report and the separate production release gate is satisfied.

## Guardrails

- Do not hold an automated-green feature out of the public demo solely because human QA has not happened yet; human QA is the reason to publish to the demo.
- Do not bypass failing required automated checks. If a check is unavailable or flaky, record that explicitly and obtain owner direction before proceeding.
- Keep simulated market activity visibly labelled and separate from real player transactions, wallet balances, inventory, orders, and settlement.
- Preserve existing game state, navigation, wallet ownership, and save behavior unless the approved scope explicitly changes them.
- Every demo handoff must identify the exact commit, demo URL, automated-check result, known limitations, and the human QA areas requested.
- Human testers report observations; they do not authorize production release or changes to wallet/settlement safety boundaries.

## Current handoff

- Exchange chart-linked indicators and event timeline were merged in PR #116.
- Merge commit: `dbcb08ccc1f3cc2de7caa05a74c21503dfbada81`.
- The seven required PR checks passed on candidate head `8ca8eec051394d749f1523447b3003a3ab6219eb`.
- GitHub Pages build and deployment completed successfully after the merge.
- Public demo: https://mobinabinshun-beep.github.io/mobinabinshun-beep/
- Human browser, touch, responsive, and usability QA is now the next required step; this handoff is not production approval.
