# Public Demo Deployment & Human Acceptance Gate

**Status: Mandatory / active.**  
**Revised:** 2026-11-16  
**Supersedes:** the prior pre-deployment human-approval rule.

## Purpose

The public demo is the required surface for human QA. Machine verification and a recoverable backup authorize the assistant to deploy a candidate to the public demo; human approval is collected after deployment and testing, not before it.

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

- **Machine PASS + verified backup = authorization to deploy to the public demo.**
- Machine checks do not constitute human acceptance and must never be represented as visual/device/human QA.
- Public demo deployment is not production promotion and does not itself lock a feature.
- No branch preview, PR page, local build or screenshot substitutes for the public demo.
- A candidate may be live on the public demo while human QA is pending.
- Do not promote beyond the demo or perform an additional release/promotion action without explicit owner approval where required.
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
