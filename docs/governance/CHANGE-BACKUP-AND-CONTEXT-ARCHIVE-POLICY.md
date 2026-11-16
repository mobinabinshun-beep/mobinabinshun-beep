# Change Backup, Documentation, and Context Archive Policy

**Effective date:** 2026-11-16  
**Status:** Project workflow policy  
**Applies to:** N.U repositories and related project work unless the owner explicitly scopes an exception.

## Mandatory pre-change procedure

1. Identify the exact repository, target branch, and current HEAD commit.
2. Record the baseline commit SHA before editing.
3. Create a uniquely named recovery branch or tag pointing to that exact baseline commit. Never rely on a working branch as the only backup.
4. Inspect existing files and their protection/lock rules before changing them.
5. Do not overwrite protected files, exported formats, schemas, or compatibility contracts without explicit authorization.

## Change isolation and implementation

1. Make changes on a dedicated feature/fix branch, not directly on the default branch.
2. Keep each change set focused and reviewable.
3. Preserve existing user data and source assets. Prefer additive or migration-safe changes.
4. If a migration or destructive operation is unavoidable, document the impact, recovery procedure, and validation before execution.
5. Do not claim a backup, test, deployment, or merge occurred unless the corresponding operation has been verified.

## Required change record

For every implementation change, add or update a dated record containing:

- Goal and user-approved scope.
- Repository, base branch, baseline commit SHA, recovery branch/tag, and working branch.
- Files added, modified, moved, or removed.
- Technical rationale and important implementation decisions.
- Data formats, schemas, compatibility constraints, and protected contracts affected.
- Tests run, exact results, CI run links, and any tests not run.
- Deployment status, if applicable.
- Known defects, limitations, risks, and deferred work.
- Exact rollback instructions and the commit/branch to restore.
- Links to the PR, commits, artifacts, and related records.

## Project context and conversation archive

Maintain a durable project-context record in the repository. Capture the technical substance of relevant background discussions, including:

- User requirements and explicit approvals/constraints.
- Architecture decisions and rejected alternatives where material.
- Current project state and verified capabilities.
- Open bugs, unresolved questions, deferred phases, and next safe action.
- Links to relevant source conversations when a durable URL is available.

Do not invent or imply that a complete ChatGPT transcript has been exported. When the full transcript is not available for archival, preserve a faithful, dated summary of the project-relevant context and decisions. Exclude credentials, access tokens, private keys, and unrelated personal information.

## Verification and release gate

- Run the most relevant automated tests and report exact counts/results.
- Add regression tests for every reproduced defect where feasible.
- Separate automated verification from manual browser/device/hardware QA.
- Do not label a feature complete, stable, certified, or locked unless its stated acceptance checks have passed.
- Merge through a pull request where repository controls permit.
- After merge, record the merge commit and verify the resulting default-branch state.
- Keep the recovery branch/tag until the owner explicitly approves its retirement.

## Current baseline captured with this policy

- Repository: `mobinabinshun-beep/mobinabinshun-beep`
- Baseline commit: `2f81cf268fe6b89338d6c8001a86538ea917d730`
- Existing 2D Studio recovery branch: `freeze/studio-2d-pro-tools-2026-11-16`
- Existing 2D Studio lock: `docs/creative-studio/NU-2D-PRO-TOOLS-LOCK-2026-11-16.md`
- Existing tool inventory: `docs/creative-studio/NU-2D-STUDIO-TOOL-INVENTORY-AND-ICON-EXPORT-2026-11-16.md`
- Verified prior CI result: 262/262 tests passed in run [43881024031](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/43881024031).
- Verified prior Pages deployment workflow: [43881185306](https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/43881185306) completed successfully. This does not substitute for manual browser QA.
- Outstanding: the previously reported empty/blank SVG export and ICO export behavior still require direct reproduction and regression verification. Do not describe these export paths as fixed until tested.
- Protected Studio export/engine contracts remain protected unless the owner explicitly authorizes a scoped change.

## Enforcement note

This document establishes the required working procedure. It does not itself enable GitHub branch protection, rulesets, immutable backups, or repository permissions. An administrator must configure those controls in repository settings where stronger server-side enforcement is desired.

## Change log

### 2026-11-16 — Initial policy
- Recorded the owner's requirement to back up the prior version before every change.
- Established mandatory technical documentation, project-context summaries, recovery references, and verification reporting.
- Captured the known Studio baseline and outstanding SVG/ICO verification work.
