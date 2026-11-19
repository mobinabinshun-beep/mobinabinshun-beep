# Anti-destruction protocol: explicit scope only

**Status:** mandatory repository-level operating instruction for every AI model, coding agent, script, bot and human contributor that reads or executes repository work.  
**Authority:** the user's latest direct instruction defines the authorized scope. This file does not grant permission to change unrelated areas.

## 1. The user's instruction is a strict scope boundary

- Change only the named target and the smallest directly necessary dependencies.
- If the user says "fix X", do not refactor, restyle, rename, migrate, optimize, upgrade or otherwise alter Y or any unnamed subsystem.
- Preserve all behavior, interfaces, files, data, visual design and tests outside the explicit scope.
- Do not interpret a request as permission to perform adjacent cleanup, broad architecture work, speculative improvements or repository-wide edits.
- A request to roll back means restore the exact verified pre-change checkpoint for the named scope. Do not reset the whole repository or erase unrelated work.

## 2. Mandatory pre-write guard

Before the first write:
1. State internally and in the change record: requested outcome, exact in-scope paths, directly required dependencies, and explicit out-of-scope areas.
2. Read the current version of each in-scope file and its relevant tests.
3. Record the current branch/commit and preserve a recoverable pre-change checkpoint for any code, data, schema, shared contract or structural change.
4. Inspect the proposed diff. If it contains an unrelated path or behavior, remove that change before proceeding.
5. If scope, ownership, dependency impact or recovery point cannot be verified, do not write. Ask one narrow clarification or report the blocker.

## 3. Minimal-change rule

- Prefer the smallest local patch over replacement, rewrite, refactor or new abstraction.
- No bulk formatting, mass renaming, dependency upgrades, generated-file churn, cache-key churn outside the changed asset, or unrelated test edits.
- Do not change shared/global CSS, event routing, input adapters, storage, wallet, account, security, build/deploy or runtime lifecycle unless the requested behavior demonstrably depends on that exact surface.
- When a shared surface must change, document the concrete dependency and add a focused regression test for the boundary.
- Never delete, overwrite or silently reinterpret user data or work belonging to another contributor.

## 4. Test and release boundaries

- Run the narrowest relevant test first, then only the directly affected regression suite.
- A passing test proves only the tested contract. It does not prove physical-device behavior, live deployment, user acceptance or unrelated subsystem health.
- Do not mark a task complete until the exact deployed commit is verified where verification is available. Otherwise mark deployment/read-back as unverified.
- Keep human acceptance separate from machine checks. A human report of failure overrides an earlier machine pass for that behavior.
- Preserve the failure report and prior evidence; do not rewrite history to make a failed attempt appear successful.

## 5. Rollback and recovery

- Roll back only the explicitly named scope, using the verified checkpoint or exact pre-change blobs.
- Preserve later unrelated commits, documentation, user changes and other subsystems.
- Never force-push, reset the default branch, delete branches, or restore the whole repository as a shortcut.
- After rollback, read back every restored file and compare its blob/checkpoint identity. Record any intentionally retained forward fix separately and explain why it is necessary.
- If the verified checkpoint itself contains a known defect, do not silently claim rollback restores functionality; state the boundary and seek a narrowly authorized correction.

## 6. Hard scope lock

For every task, establish a written lock with:
- **Authorized target:** exact feature/behavior and paths.
- **Forbidden scope:** all unrelated features and paths.
- **Allowed dependencies:** only proven direct dependencies.
- **Change budget:** minimum necessary files and behavior.
- **Stop condition:** any unplanned side effect, unexpected diff, failing unrelated test, or uncertain ownership pauses further writes.

Any new development outside that lock requires a new explicit, focused user instruction. A vague request, inferred benefit, test failure in an unrelated area, or agent preference is not authorization.

## 7. Required handoff

Report only verified facts: exact paths changed, paths deliberately untouched, checkpoint/commit, focused test results, deployment/read-back state, known limitations and any pending human QA. Never claim a technical GitHub branch/ruleset lock unless repository settings confirm it. This file is an agent instruction; platform-level enforcement requires separately configured repository rulesets/branch protection.
