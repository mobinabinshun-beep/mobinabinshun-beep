# N.U Human Acceptance & Public Demo Test Gate

**Policy ID:** NU-QA-HUMAN-GATE-01  
**Status:** Mandatory — all contributors, maintainers, coding agents and project work  
**Effective date:** 2026-11-15  
**Owner rule:** No change is accepted or rejected without a human test and a traceable human report.

## 1. Non-negotiable principle

Every project change must be documented. Every documented change intended for the product must be made available in the public demo as a clearly identified **HUMAN-TEST CANDIDATE** so project members and invited testers can exercise the actual change and submit human reports.

Automated CI, code review, source inspection, a successful build, a deployment, or an agent's statement is never a substitute for human testing. Until the required human reports are received and reviewed, the change remains **PENDING HUMAN TEST / PENDING HUMAN REPORT**. It is neither approved nor rejected.

## 2. Required lifecycle for every change

1. **Record the request:** document the requirement, intended behavior, scope, affected screens/modules, acceptance criteria and known limitations.
2. **Implement on a candidate branch:** preserve the default branch and create a rollback point according to the repository implementation protocol.
3. **Verify automatically:** run relevant syntax, unit, regression, accessibility and build checks. Record exact commit SHA and results. CI failure is an engineering failure to fix, not a human rejection.
4. **Publish a demo candidate:** after the candidate is safe to expose and required automated checks pass, deploy that exact candidate to the public demo/test environment. Display its version/commit and the visible label **TEST CANDIDATE — NOT HUMAN-APPROVED**. If the Pages setup cannot safely host an isolated candidate, create/use a dedicated preview/demo deployment path; do not silently claim the production demo contains the change.
5. **Invite human testing:** provide a focused test plan and a public/accessible route for testers to submit reports. Test the actual deployed commit, not a different local build.
6. **Collect and review reports:** link each report to the exact candidate commit. Reproduce failures, file defects, fix them on a new candidate, redeploy and request retesting of affected scenarios.
7. **Record the decision:** only after the required human scenarios have traceable reports may the responsible human owner record APPROVED or REJECTED. Partial coverage remains PARTIALLY TESTED / PENDING.
8. **Promote after acceptance:** merge/promote the accepted candidate to the stable release path only after the human acceptance decision and required engineering gates. Preserve the reports, CI evidence and rollback reference.

## 3. Status vocabulary — never collapse these states

- **DOCUMENTED:** requirement and intended behavior are recorded.
- **IMPLEMENTED:** code/configuration change exists on a named commit.
- **CI-PASSED / CI-FAILED:** automated checks only.
- **DEPLOYED-TEST-CANDIDATE:** exact commit is available in the public demo for evaluation; this does not mean accepted.
- **HUMAN-QA-PENDING:** required human evidence is not complete.
- **HUMAN-QA-PASSED / HUMAN-QA-FAILED:** human test outcomes, linked to reports and build.
- **PARTIALLY-TESTED:** some scenarios have reports; overall acceptance remains pending.
- **APPROVED / REJECTED:** explicit human owner decision supported by the reports.
- **PROMOTED / MERGED / RELEASED:** delivery state, separate from acceptance.

No status implies another. In particular, **CI-PASSED ≠ HUMAN-QA-PASSED**, **DEPLOYED ≠ APPROVED**, and **no report ≠ PASS**.

## 4. Minimum human report fields

Each report should include:
- candidate version or full commit SHA and demo URL;
- test date and tester name or chosen tester ID (anonymous reporting is acceptable);
- device/model where relevant, OS, browser/version, viewport and orientation;
- input method: mouse, touch, keyboard, assistive technology, as applicable;
- test scenario and steps;
- expected result and actual result;
- explicit PASS / FAIL / BLOCKED outcome;
- screenshot/video or reproducible steps where possible;
- defect severity and frequency for failures.

Do not request passwords, access tokens, private credentials or unnecessary personal information. Reports must not expose another person's private data.

## 5. Defect handling and retest

A failed scenario creates a traceable defect record containing the affected commit, severity, reproducible steps, expected/actual behavior and evidence. A fix creates a new candidate commit. The affected human scenario must be repeated against that new deployed candidate. Previous passing reports do not automatically validate changed behavior.

## 6. Public demo safety

The public demo is a human-evaluation channel, not proof of release approval. Candidate deployments must:
- visibly identify the build as a test candidate and show its commit/version;
- state known limitations and avoid presenting unfinished features as complete;
- avoid real-money, sensitive-data or unsafe operations outside their approved scope;
- retain a known-good rollback target;
- keep tester feedback separate from private credentials and personal data.

If a change cannot safely be exposed to the public demo, document why and use a controlled preview with invited human testers. Record the exception; do not silently skip human QA.

## 7. Required contribution/PR checklist

- [ ] Requirement, scope and acceptance criteria documented.
- [ ] Candidate branch, exact commit and rollback reference recorded.
- [ ] Relevant automated checks recorded with links/results.
- [ ] Exact candidate deployed to demo/preview and labelled NOT HUMAN-APPROVED.
- [ ] Human test instructions and report route supplied.
- [ ] Human reports linked to the exact candidate commit.
- [ ] Failures fixed and affected scenarios retested.
- [ ] Human owner decision recorded before stable promotion.
- [ ] README/implementation record and status updated.

## 8. Authority

This policy applies to every change, not only game code: UI, gameplay, Gateway, wallet, profile, economy, graphics, content, documentation that changes product requirements, infrastructure, deployment and future modules. A documentation-only clarification that does not alter product behavior still requires a recorded change, but does not need a runtime demo deployment; record it as **DOC-ONLY** and obtain human review of the document where acceptance is required.

The project owner may explicitly scope the required human scenarios, but no contributor or automated system may waive the human-acceptance principle. Silence, lack of reports, passing CI, or public availability must never be interpreted as approval or rejection.

## 9. Related records

- [N.U Implementation & Calibration Protocol](./operations/NU-OPS-IMPLEMENT-01.md)
- [Human Test Report Template](./HUMAN-TEST-REPORT-TEMPLATE.md)
- [Repository-wide agent instructions](../../AGENTS.md)
