# Public Demo Human Acceptance Gate

**Status: Mandatory / blocking.**

## User acceptance rule

The project owner will not perform, submit, or be expected to provide a human test report, approval, or rejection against a local build, preview URL, branch-only artifact, pull-request diff, screenshot, or internal CI result.

Human testing begins **only after a working version is deployed and accessible in the public demo**.

The required sequence is:

1. Prepare the candidate and run internal CI/CD and automated checks.
2. Deploy the candidate to the public demo environment.
3. Verify that the public demo URL is reachable and serves the intended commit/build.
4. Send the public demo URL and concise test scope to the project owner.
5. Wait for the project owner's own observation and explicit human report: **Approved** or **Rejected** (with findings).
6. If rejected, fix the reported issues and repeat from deployment. Do not treat a local pass or CI pass as human acceptance.
7. Only after explicit approval may the candidate be proposed for promotion, merge, or locking in the graphics core, subject to the normal repository/protocol gates.

## Blocking constraints

- No request for human testing before a public demo deployment exists.
- No claim that a feature is visually verified merely because its files exist, its tests pass, or its PR is open.
- No merge, production lock, or core promotion based solely on internal CI/CD.
- A draft PR, branch preview, or GitHub file URL is not the public demo.
- If public deployment is blocked, report the blocker and continue engineering work; do not transfer the verification burden to the project owner.

## Required release evidence

Before inviting human testing, record:
- Public demo URL.
- Deployed commit SHA / build identifier.
- Deployment status and timestamp.
- Automated CI/CD result.
- Exact visible changes and known limitations.
- Confirmation that the previously working game/world access remains available.

## Acceptance record

Human result: **Pending public demo deployment**

Owner decision: **Not yet requested**

Approval/rejection evidence: **To be recorded only after the owner tests the public demo.**

This gate applies to the background/image-first renderer work and subsequent visual-layer integration unless the project owner explicitly changes it.
