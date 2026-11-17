# Gateway machine-approval lock and human-QA handoff

**Effective date:** 2026-11-18  
**Status:** OWNER-DIRECTED PROCESS — EFFECTIVE  
**Canonical specification:** [Archive decision](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-18/GATEWAY-MACHINE-APPROVAL-LOCK-AND-HUMAN-QA-fa.md)

This product-repository record points to the canonical owner directive. The archive document is authoritative; do not maintain a divergent copy of the full specification here.

## Required candidate status

Every candidate that passes its recorded automated checks must be handed off as:

`AUTOMATED-QA-PASSED · HUMAN-QA-PENDING · MACHINE-LOCKED`

The lock applies to the exact candidate SHA and branch. No automated agent, bot, workflow or contributor acting as an automated execution agent may make further content changes to that candidate until human QA feedback and an explicit scope reopening are recorded. Preserve the candidate SHA and its test evidence. Any requested correction must be implemented on a successor branch, not by mutating the frozen candidate.

Automated approval is not human acceptance, owner approval, scope lock, merge authorization or production release.

## Existing Gateway candidate reviewed on 2026-11-18

- PR: https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/178
- Candidate branch: `owner/gateway-speed-and-simulated-mouse-2026-11-17`
- Candidate SHA: `78d25edbc6e2fed31a8925c7e33f5949af50bef5`
- Seven associated CI workflows were observed completed successfully; exact run IDs and coverage limits are in the canonical archive decision.
- Human QA remains pending. The newly specified 0.50s/1.00s activation delays and the extra-down / held-down list-exit behavior are not proven by those seven workflows and remain open acceptance items.

No runtime source file is changed by this documentation-only record. Do not interpret this record as implementation or test evidence for the newly specified timing/list-exit behavior.


## Owner clarification — unified Gateway/controller contract (2026-11-18)

The canonical archive now includes the owner's detailed, overriding acceptance addendum:
- Remove duplicate controls only where Gateway provides the same function.
- Selective actions: Menu/List, Back = Home = Exit (main page), Profile.
- Pause exists only through Gateway; freeze before Gateway options appear. No automatic Reload on page/Gateway entry.
- After Gateway closes, gameplay remains frozen until the first deliberate real interaction with the game. Preserve pre-existing pause.
- Directional/click-step cursor movement is simulated mouse input. While Gateway is open, controller navigation takes over.
- Down traverses options; one extra Down after the last option exits. Holding Down may pass through and exit without activating skipped options. Users may pause between options indefinitely.
- On exit, the virtual pointer remains over Gateway; reopening requires leaving its bounds and re-entering.
- Target activation delay: physical mouse/touch 0.50s; simulated mouse 1.00s. These remain unverified until dedicated timing tests pass.
- Eight-direction first-use training remains FUTURE / NOT IMPLEMENTED until separately built and tested.

**Implementation boundary:** PR #178 remains frozen at its recorded SHA. Follow-up implementation belongs on successor branch `owner/gateway-contract-successor-2026-11-18`, created from that exact SHA; it must not mutate PR #178. The addendum is a specification, not evidence that every behavior is implemented.
