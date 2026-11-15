# Change, Backup, Demo Testing & Feedback Protocol

**Status:** Mandatory for all future changes in this repository  
**Applies to:** Source code, assets, configuration, documentation, builds, and deployment changes.

## Non-negotiable release sequence

No change may be applied to the public demo or treated as ready for release until the following gates have been completed in order.

1. **Record the request and conversation**
   - Preserve the user's request, relevant decisions, assumptions, implementation plan, and acceptance criteria in a change record.
   - Record the date, affected repository/branch, and responsible contributor.
   - Do not include credentials, tokens, private keys, or other secrets in the record.

2. **Back up and archive the pre-change state**
   - Capture the exact pre-change commit SHA and branch.
   - Create a recoverable Git checkpoint (commit/tag or equivalent immutable reference).
   - Archive copies of every file that will be modified or removed, preserving its original path and recording checksums where practical.
   - Store the archive under `archive/pre-change/<date>-<change-id>/` (or an equivalent repository-approved archive location).
   - Verify that the checkpoint and archived files can be retrieved before proceeding.
   - Never overwrite or delete the only recoverable copy of an earlier version.

3. **Implement in isolation**
   - Make the change on a dedicated working branch or isolated demo candidate.
   - Keep the archived baseline unchanged.
   - Document all changed files and link the implementation commit to the change record.

4. **Run technical checks**
   - Run applicable automated tests, build/lint checks, asset-loading checks, and regression checks.
   - Record exact commands, environment, results, and known limitations.
   - A failed or skipped critical check blocks promotion to the public demo until explicitly resolved and documented.

5. **Deploy to the public demo only**
   - The first deployed target for a change must be the designated public demo/staging environment.
   - Do not silently promote a candidate to production, the canonical release, or other stable/public distribution channels.
   - If no clearly designated demo environment exists, stop and document the missing environment; do not substitute production.

6. **Human testing and feedback collection**
   - Publish concise test instructions and the expected outcomes for human testers.
   - Collect feedback, reproduction steps, browser/device details where relevant, screenshots/logs when voluntarily provided, and severity/impact.
   - Keep a dated feedback report linked to the change record.
   - Do not treat deployment alone as acceptance.

7. **Review, fix, and decide**
   - Triage feedback; fix regressions through this same protocol, including a fresh backup/archive before each subsequent change.
   - Record unresolved issues and their impact.
   - Promote beyond the demo only after human-test results and feedback have been reviewed and the authorized project owner has explicitly approved the promotion.
   - If approval is absent, the demo remains the highest permitted release stage.

8. **Rollback**
   - If the demo causes a critical regression, stop promotion and restore the verified pre-change checkpoint/archive.
   - Record the rollback reason, affected commit, recovery point, and verification results.

## Required change record

Each change must have a record (for example, `CHANGELOG/<change-id>.md`) containing:

- Request/conversation summary and acceptance criteria
- Date, repository, branch, and change identifier
- Pre-change commit SHA and backup/archive location
- Files changed and implementation commit SHA
- Automated test/build results and limitations
- Public demo URL and deployment revision
- Human test instructions, test period, and collected reports
- Feedback triage, fixes, outstanding risks, and rollback details if applicable
- Explicit approval decision for any promotion beyond the demo

## Enforcement rule

**Backup → archive → conversation/change record → isolated implementation → technical checks → public demo → human testing → feedback review → explicit approval → optional promotion.**

Skipping a gate blocks the next stage. When evidence is unavailable, mark the gate as **NOT VERIFIED**; never claim it passed. This protocol supplements normal Git history and does not replace verified, recoverable backups.


## Per-stage human acceptance is mandatory

This rule applies to **every independently reviewable change package or implementation stage**, including visual, functional, data, configuration, documentation, build and deployment work. Automated tests and CI are necessary evidence, but they never replace human acceptance.

- A stage must be isolated, backed up, documented and technically checked, then deployed to the designated public Demo before human acceptance is requested.
- The project owner must be given the exact public Demo URL, deployed commit/build identifier, scope and concise scenarios. A branch, PR, local build, screenshot or CI result is not a substitute.
- The stage remains **HUMAN-QA-PENDING** until the owner records an explicit Approved, Rejected, or Approved-with-limitations result against that deployed revision.
- Do not begin the next independent implementation stage, stack additional feature work on the unaccepted candidate, merge, lock, or promote while the current stage is pending or rejected. A rejection requires triage and a new isolated fix cycle under this same protocol.
- Each subsequent fix or changed stage requires its own fresh backup/change record, technical checks, Demo deployment and human retest. Previous acceptance does not automatically approve later revisions.
- If public Demo deployment or human review is unavailable, stop at the current stage, record **NOT VERIFIED / HUMAN-QA-PENDING**, and report the blocker. Do not describe the work as complete or accepted.
- The owner may explicitly authorize a documented exception or a deliberately bundled stage. No contributor or automation may infer such authorization from silence, a passing CI run, or an open PR.

**Stage invariant:** one independently reviewable change stage → one identifiable Demo revision → one recorded human decision. No stage advances on automated evidence alone.
