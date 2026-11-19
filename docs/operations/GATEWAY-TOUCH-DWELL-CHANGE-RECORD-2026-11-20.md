# Gateway direct-touch dwell — scoped change record (2026-11-20)

## Authorization and scope
- Owner authorization: explicit two-stage approval in the conversation on 2026-11-20.
- Authorized behavior: direct physical touch on the Gateway trigger must dwell for 500 ms before opening.
- Early release or pointer cancellation cancels the pending open.
- The synthetic click remains suppressed.
- Touching an already-open trigger does not implicitly close it; use the existing close/cancel surfaces.
- In scope: `nu-hex-gateway.js`, `tests/nu-gateway-pointer-controller-mode.test.js`, and this record/lock cross-reference.
- Out of scope and unchanged: HUD, CSS, controller adapter, game rules, pause lifecycle, Gateway navigation/actions, deployment configuration.

## Baseline and recovery
- Pre-change PR candidate: `62d7df73afd2457a37a3b4df433fcc1bd7a1b85d`.
- Verified pre-change recovery branch: `backup/pre-gateway-touch-dwell-2026-11-20` (created from that exact SHA).
- Working PR: [#228](https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/228).
- Working branch: `governance/four-protocol-ci-qa-r3-2026-11-19`.

## Implementation
- Touch `pointerdown` schedules the existing 500 ms Gateway open timer.
- Touch `pointerup` cancels the timer if Gateway has not opened; it does not immediately toggle Gateway.
- Touch `pointercancel` cancels the pending timer.
- Existing synthetic-click suppression remains in place.
- The focused test asserts dwell scheduling, early-release cancellation, pointer-cancel handling and absence of immediate pointerup toggle.

## Verification state
- Machine QA: PENDING exact-head CI.
- Candidate backup: PENDING until machine checks pass.
- Public demo deployment/live-build verification: NOT PERFORMED.
- Human device QA: PENDING.
- Final acceptance: NOT GRANTED; machine approval and owner human QA are separate gates.

## Re-lock
This is a one-time, narrowly scoped exception. After the exact candidate is verified and handed to human QA, the Gateway owner lock remains in force. Any further behavior change requires a new explicit owner instruction.
