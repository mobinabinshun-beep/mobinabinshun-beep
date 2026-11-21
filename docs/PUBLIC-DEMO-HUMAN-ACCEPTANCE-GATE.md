# Public Demo Deployment & Human Acceptance Gate

**Status: Mandatory / active.**  
**Revised:** 2026-11-16  
**Supersedes:** the prior pre-deployment human-approval rule.

## Purpose

The public demo is the required surface for human QA. Machine verification and a recoverable backup authorize the assistant to deploy a clearly labelled QA-only candidate to the demo; this is not a product release. Human approval is collected after deployment and testing, not before it.

## Required sequence

1. Inspect project instructions, feature documentation, current deployed commit and dependencies.
2. Implement the scoped candidate on an isolated branch.
3. Run the relevant automated tests, syntax/static checks and CI workflows.
4. If the relevant machine checks pass, create and verify a backup of the exact candidate and preserve the pre-change/deployed checkpoint.
5. Deploy the candidate to the public demo. No separate human confirmation is required before this demo deployment.
6. Verify the public demo URL serves the intended commit/build; record timestamp, URL, SHA/build identifier and deployment result.
7. Run available post-deployment smoke/regression checks against the public demo.
8. Give the owner and testers the public demo URL, deployed build identifier, test scope and known limitations.
9. Wait for the human report. Record **HUMAN-QA-PENDING**, **PARTIAL**, **PASSED** or **FAILED** accurately.
10. On approval, lock only the scope explicitly approved (item, section or pack). On rejection, reopen only the affected scope, correct it and repeat from machine verification and backup through redeployment and human QA.

## Authority and boundaries

- **Machine PASS + verified exact-candidate backup + required runtime-baseline capture = authorization to deploy a QA-only candidate to the public demo.**
- Machine checks do not constitute human acceptance and must never be represented as visual/device/human QA.
- Public demo deployment is not product publication, production promotion, launch, or release and does not itself lock or accept a feature.
- No branch preview, PR page, local build or screenshot substitutes for the public demo.
- A candidate may be live on the public demo while human QA is pending.
- Do not perform any beyond-demo product release, production promotion, stable-version publication, package/store release or public launch unless the owner has first accepted the human QA result for that exact demo build/scope and then gives a separate, direct, unambiguous instruction naming the release action. Human PASS, CI, merge, demo deployment or silence is not authorization.
- Preserve all existing feature locks. This document changes the release order only; it does not unlock feature scopes.
- If deployment cannot be completed through the configured public-demo mechanism, report the exact technical blocker. Do not claim deployment or ask the owner to test a non-public preview.

## Required deployment evidence

Record before requesting human QA:
- Public demo URL.
- Deployed commit SHA / build identifier.
- Deployment status and timestamp.
- Verified backup ref and backup SHA.
- Relevant automated CI/test result.
- Post-deploy smoke result (or why it could not run).
- Exact visible changes and known limitations.
- Confirmation that previously working game/world access remains available, to the extent machine-checkable.

## Human report requirements

The owner/testers should report the tested build, device/browser/viewport/orientation, input method, scenario, expected and actual result, PASS/FAIL, and reproduction steps/evidence. Avoid passwords, private credentials and unnecessary personal information.

## Scope approval and locks

Human approval may cover one item, one section or a whole pack. Record the exact approved scope and deployed build. Only that scope becomes locked. A later direct instruction naming a locked scope reopens only that scope. If its correction affects a connected locked/approved system, pause, explain the dependency, offer three practical options with a recommended candidate, and wait for the owner's selection or clarification.

## Acceptance record

- Deployment state: recorded per candidate.
- Human QA state: pending until a human report is supplied.
- Owner approval/rejection: recorded only from explicit owner decision.
- Lock state: recorded per accepted scope, never inferred from deployment or CI.


## Owner amendment — QA demo is not a product release (2026-11-21)

The project owner's latest direct instruction controls over any older wording that conflates demo delivery with publishing/release:

- The public demo is a **human-test environment only**. Deploying a TEST CANDIDATE there is a QA handoff, not a product release, production publication, launch, promotion, or announcement.
- The execution assistant may prepare and place an already-authorized, machine-passed candidate on the designated demo solely to enable human testing, following the required runtime-baseline capture, exact-candidate backup, deployment and live-build verification gates.
- The candidate must be visibly labelled **TEST CANDIDATE — NOT HUMAN-APPROVED**, with its exact build/commit identity and known limitations. Keep the change isolated to the demo candidate; do not imply owner acceptance.
- **No product release, production promotion, stable-version publication, package/store release, public launch announcement, or other beyond-demo publication may occur unless BOTH conditions are met:** (1) the owner has reviewed and explicitly accepted the human QA results for the exact demo build/scope; and (2) the owner then gives a separate, direct, unambiguous instruction authorizing that named release/promotion action.
- Human QA PASS, owner acceptance of the demo, green CI, merge, a backup, a demo deployment, or silence is never by itself permission to release or promote. If no separate release instruction exists, remain at the demo QA stage.
- Do not repeatedly frame the absence of a release as a pending assistant decision. The assistant's current task is the authorized work and QA handoff; release is outside the active workflow unless the owner later directs it.
