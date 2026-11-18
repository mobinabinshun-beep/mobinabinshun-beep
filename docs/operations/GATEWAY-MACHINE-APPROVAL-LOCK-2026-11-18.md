# Gateway — product repository pointer and candidate handoff

**Date:** 2026-11-18  
**Status:** DOCUMENTATION POINTER · CANONICAL ARCHIVE CONTRACT IS AUTHORITATIVE

## Single source of truth

The only normative Gateway/controller behavior specification is the [Unified Gateway owner contract in the archive](https://github.com/mobinabinshun-beep/Repository/blob/docs/gateway-human-approval-lock-2026-11-18/Operations/2026-11-18/GATEWAY-MACHINE-APPROVAL-LOCK-AND-HUMAN-QA-fa.md).

It defines the selective commands (Menu/List, Back=Home=Exit, Profile), Gateway-only Pause/Freeze, no automatic Reload, freeze-until-first-real-gameplay-interaction after closing, simulated-mouse definition, controller list traversal, extra-down and held-down exit, pointer leave/re-enter reopening, 0.50s/1.00s entry targets, future eight-direction training, acceptance tests and machine-lock/human-QA rules.

Do not copy or independently redefine those rules in this repository. This file is only a pointer and a status handoff. Product code and tests remain authoritative evidence of what is actually implemented; the archive is authoritative for what is required.

## Locked runtime candidate — PR #178

- PR: https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/178
- Branch: `owner/gateway-speed-and-simulated-mouse-2026-11-17`
- Exact SHA: `78d25edbc6e2fed31a8925c7e33f5949af50bef5`
- Seven associated workflows previously observed successful; exact run IDs are recorded in the canonical archive contract.
- Status for that recorded coverage only: `AUTOMATED-QA-PASSED · HUMAN-QA-PENDING · MACHINE-LOCKED`.
- The new 0.50s/1.00s timing, extra-down/held-down exit, pointer leave/re-enter behavior and eight-direction training are not proven by those seven workflows.
- Do not modify PR #178 or its SHA. Any owner-authorized correction belongs on a successor branch after human feedback and explicit reopening.

## Documentation PRs

- Archive PR #30: https://github.com/mobinabinshun-beep/Repository/pull/30
- Product PR #186: https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/186
- Documentation commits require their own CI/readback. Until those checks are observed successful on exact final SHAs, their status remains `PENDING-AUTOMATED-QA`, not Machine Passed or Machine Locked.

## Historical product records

- `GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md` is retained as historical implementation/CI evidence; its behavior clauses are superseded.
- `GATEWAY-CONTROLLER-NAVIGATION-2026-11-17.md` is historical.
- Other dated Gateway implementation and pause notes preserve their original scope/evidence and must not be treated as the current behavior contract.

No runtime source is changed by this pointer. A documentation link, a merged source commit, a green workflow, a live demo and human acceptance are distinct evidence states.
