# N.U Implementation & Calibration Protocol

**Protocol ID:** NU-OPS-IMPLEMENT-01  
**Applies to:** N.U Interactive World, its public human-test demo, and linked development repositories  
**Effective date:** 2026-11-13  
**Status:** Active operating procedure

## 1. Trigger

Whenever the project owner says «اعمال کن», «پیاده کن», «فیکس کن», «دیباگ کن», «کالیبره کن», «بهینه کن», «بکاپ بگیر», «مستند کن», or an equivalent implementation instruction, follow this protocol unless a safety, access, or ambiguity issue requires clarification.

## 2. Required sequence

1. **Scope & inspect:** identify the target repository, entrypoints, shared dependencies, existing behavior, tests, and current branch/head. Do not assume similarly named pages share a runtime.
2. **Pre-change backup:** create a timestamped backup branch from the exact inspected base commit. Preserve original source blobs or an archive snapshot for high-risk changes.
3. **Candidate branch:** implement on a separate, descriptively named feature branch. Never write experimental work directly to the public default branch.
4. **Implement narrowly:** preserve game rules, wallet/save contracts, accessibility, reduced-motion behavior, responsive layouts, and navigation semantics unless explicitly changed. Clearly label visual-only simulations.
5. **Calibration & optimization:** check desktop/mobile breakpoints, touch/mouse/keyboard input, focus, animation reversals, overflow, z-index, state transitions, performance and reduced-motion fallback.
6. **Debug & fix:** run syntax checks and every relevant repository test/workflow. Inspect diffs for unintended changes, duplicate controls, stale assets, and documentation drift.
7. **Document:** update README/manifest/changelog and add a dated implementation record describing request, files, decisions, tests, limitations and acceptance status.
8. **Conversation archive:** save a concise dated record of requirements and implementation decisions in docs/operations/conversation-archive/. Never store credentials, tokens, personal secrets or unrelated private data.
9. **Public demo & human report:** use the approved candidate/Pages process. Record device/browser, viewport, input mode, expected/actual result and evidence. CI is not proof of human QA.
10. **Review & release:** open a PR with scope, backup ref, test evidence, limitations and manual QA checklist. After backup and required CI checks pass, a clearly labeled public demo candidate may be merged/deployed specifically for human acceptance when that is the requested deliverable. Keep its status as HUMAN-QA-PENDING and do not call it production/released. A production release still requires recorded human acceptance. If deployment is not requested, keep the candidate unmerged.
11. **Post-change archive:** record PR, commit, workflow runs, deployment status, remaining risks and rollback branch.

## 3. Minimum acceptance matrix

- Desktop mouse: hover, click, focus and keyboard confirmation.
- Mobile touch: tap target, no duplicate synthetic activation, no accidental gameplay hit.
- Navigation: Back, Menu, Settings; pause/resume behavior; no gateway on home.
- HUD: game title and N.U mark do not collide; LV and capsule bars remain visible; values remain legible inside rails.
- HP capsule: frame expands, capsule travels to the right dock, can be used, then returns/contracts at full HP.
- N-BI: visual charge motion is distinguished from actual damage mitigation unless game logic is explicitly changed.
- Reduced motion: no essential control or state is lost when animations are suppressed.
- Responsive: narrow phone, wide phone, tablet and desktop; no horizontal overflow.
- Regression: wallet, HP, XP, Mana, round completion, pause/resume, game selection and routes remain intact.

## 4. Evidence labels

- **SOURCE-REVIEWED** — files and logic inspected.
- **CI-PASSED** — named automated checks passed.
- **DEPLOYED** — deployment workflow succeeded.
- **HUMAN-QA-PENDING** — real browser/device acceptance not yet recorded.
- **HUMAN-QA-PASSED** — tester, device/browser, viewport and results recorded.
- **RELEASED** — approved PR merged to the public default branch.

These labels are not interchangeable.

## 5. Rollback

Rollback by reverting the release commit or restoring the documented pre-change backup branch. Never force-push the public default branch. Preserve failed candidate branches and CI evidence.

## 6. Public demo and reporting

The public demo is for human testing, not a claim of production readiness. Every release candidate must include a concise human report template and a clear feedback path. Reports separate reproducible defects from subjective design feedback and note effects on gameplay, accessibility, performance or presentation.
