# N.U Implementation & Calibration Protocol

**Protocol ID:** NU-OPS-IMPLEMENT-01  
**Status:** Active — mandatory for all project implementation and maintenance  
**Effective:** 2026-11-16  
**Owner:** Project owner (human product direction and final human QA)  
**Execution:** Assistant (implementation, machine verification, backup, deployment, reporting)

## 1. Roles and authority

- **Project owner:** directs ideas and priorities, clarifies product intent, performs or coordinates human QA on the public demo, and decides acceptance/locks.
- **Assistant:** executes scoped work, reads project documentation, inspects dependencies, implements one change at a time, runs machine checks, creates recoverable backups, deploys eligible candidates to the public demo, tests the deployed build with available automated/runtime checks, and reports evidence and limitations.
- Machine checks establish technical readiness only. They never impersonate the owner's human acceptance.
- The assistant must not claim human approval, human visual verification, or successful device testing unless a human report explicitly supplies that result.

## 2. Standard implementation-to-demo cycle

For every direct implementation request (implement, fix, debug, calibrate, optimize, document, etc.):

1. **Inspect:** read AGENTS.md, this protocol, relevant architecture/feature/QA/lock records, current source, tests, current deployed/default commit, and dependencies. Identify the exact requested scope and any cross-system effects.
2. **Plan:** state the intended change and affected files/systems. Keep work one scoped change at a time. Do not expand into unrelated cleanup.
3. **Implement:** work on an isolated candidate branch. Preserve approved/locked areas and existing game rules, visual identity, save formats, wallet semantics, navigation and responsive behavior unless the owner explicitly requests a change.
4. **Machine verify:** run syntax/static checks and all relevant automated regression/build/CI workflows. Review the full diff and check for regressions, unrelated changes, dependency effects, security/privacy issues and documentation drift.
5. **Machine backup:** after the candidate is technically ready and before public deployment, create a named immutable/recoverable backup reference of the exact candidate and preserve the pre-change checkpoint. Record commit SHA, branch/ref, archive paths and rollback steps. A backup must be verified to point to the intended commit.
6. **Deploy to public demo:** once relevant machine checks pass and the backup is verified, apply the candidate to the public demo. **No prior human approval is required for this demo deployment.** Use the configured public-demo deployment path; verify the public URL and deployed commit/build. If deployment is technically blocked, do not pretend it happened: report the exact blocker and continue only with non-destructive setup/engineering that is within the owner's authorization.
7. **Test the deployed demo:** run available post-deploy smoke/regression checks against the public URL/build. Check that the intended commit is actually served. Report machine results separately from unperformed human/device checks.
8. **Human QA:** provide the owner and testers the public demo URL, deployed build/commit, concise test scope, known limitations and a report template. The owner and their testers perform real human visual, interaction, accessibility and device testing.
9. **Record outcome:** record each human finding against its exact build. If accepted, lock the approved scope. If rejected, record defects, reopen only the affected scope under the rules in Section 4, fix, machine-test, back up, redeploy and repeat public-demo QA.
10. **Promotion:** a successful demo deployment is not human acceptance and is not a production promotion. Do not promote beyond the public demo, or perform a separate release/promotion action, without the owner's explicit approval when such promotion is required.

## 3. Machine status and human status are separate

Use these statuses accurately and independently:

- **IMPLEMENTED** — code change exists.
- **MACHINE-TEST-PASSED / MACHINE-TEST-FAILED** — named automated checks and exact commit.
- **BACKUP-VERIFIED** — backup ref and target SHA are recorded and verified.
- **DEMO-DEPLOYED / DEMO-DEPLOYMENT-BLOCKED** — public demo URL, deployed SHA/build and timestamp, or exact blocker.
- **POST-DEPLOY-SMOKE-PASSED / FAILED / NOT-RUN** — checks against the deployed demo.
- **HUMAN-QA-PENDING / PARTIAL / PASSED / FAILED** — only from human testing and report.
- **OWNER-APPROVED / OWNER-REJECTED** — explicit owner decision.
- **SCOPE-LOCKED** — exact approved item/section/pack and acceptance record.
- **PROMOTED** — separate release action, never implied by demo deployment.

Never write “verified” without identifying whether it means machine, post-deploy smoke, or human verification.

## 4. Approval, scope locks and explicit reopening

- The owner may approve and lock a single item, a section, or an entire pack. Record the exact scope and build/commit accepted.
- An approval locks only the stated scope. It does not silently lock neighboring or dependent systems.
- A locked scope stays unchanged unless the owner directly and explicitly requests a change to that specific scope.
- A direct request such as “reopen HP Capsule … and change …” opens only the named HP Capsule scope; all other locks remain in force.
- Treat a scoped reopen as temporary authorization for that requested correction, not as a permanent unlock. After correction, repeat the standard machine-test → backup → public-demo deployment → post-deploy test → human QA cycle. On owner acceptance, relock the corrected scope.
- If the requested correction may affect another locked or approved area, stop before changing the connected area. Explain the dependency and ask how to proceed.
- When cross-system impact exists, provide **three practical implementation options**, grounded in project documentation, goals and scenarios. Identify the best candidate and explain why. Wait for the owner's explanation or selection before implementing the cross-system part.
- After the owner clarifies/selects, implement only the authorized solution, then repeat the full cycle and report both the corrected scope and any dependent effects.

## 5. Change isolation, backups and rollback

- Never edit the public default branch directly as a development workspace.
- Keep changes narrow and isolated; do not bundle unrelated requests unless the owner explicitly requests a pack.
- Before deployment, preserve the exact pre-change state and a verified backup of the deployment candidate/current production state as appropriate.
- Record backup branch/tag, SHA, archive manifest, changed paths and rollback procedure.
- Rollback must restore a known verified commit or revert the scoped change. Never force-push a public branch as a routine rollback.
- If a backup cannot be verified or relevant machine checks fail, do not deploy.

## 6. Protected areas and existing locks

- Read `docs/operations/LOCKED-AREAS.md` before touching the classic LV / XP / Mana HUD.
- Existing feature locks remain effective. This protocol changes the deployment/acceptance sequence; it does not implicitly unlock any feature.
- Only an explicit owner request naming the locked scope opens that scope.
- Respect the UI layer safety contract, archived features, Exchange eligibility rules, virtual-only economy boundaries and all documented data/privacy constraints.

## 7. Public demo human acceptance gate (revised 2026-11-16)

This section supersedes any earlier rule that required human approval **before** a public demo deployment.

- Human testing must happen on the public demo, not a branch preview, screenshot or PR diff.
- The assistant is authorized to deploy a candidate to the public demo after relevant machine checks pass and a verified backup exists. No additional pre-deployment human confirmation is required for that demo deployment.
- The public demo is the human QA surface. Provide its URL and exact deployed commit/build.
- Human acceptance is still mandatory before a scope is recorded as owner-approved and locked.
- A candidate may be publicly deployed and remain **HUMAN-QA-PENDING**. Deployment does not imply acceptance.
- A rejection triggers a scoped correction and a new deployment/test cycle. It does not authorize unrelated redesign.
- No PR preview may substitute for the public demo.

## 8. Cross-system clarification template

When a requested edit may affect a connected system, pause and present:

1. **Option A — minimal isolated correction:** preserve the neighboring system and use a narrow adapter/compatibility change.
2. **Option B — coordinated correction:** update the requested feature and the directly dependent component together, with paired regression coverage.
3. **Option C — structural correction:** revise the shared contract/architecture, update all affected modules and migration/rollback documentation.

These are option categories, not automatic prescriptions. Adapt the three options to the actual repository dependencies and documented product scenarios, recommend one candidate, and wait for owner direction.

## 9. Verification and reporting checklist

- [ ] Owner request and scope recorded.
- [ ] Relevant project instructions, docs, locks and dependencies inspected.
- [ ] Exact files/systems and observable behavior listed.
- [ ] Minimal implementation completed on candidate branch.
- [ ] Relevant machine tests and CI checks passed.
- [ ] Full diff reviewed; unrelated changes excluded.
- [ ] Pre-change checkpoint and candidate/deployment backup verified.
- [ ] Public demo deployment confirmed by URL and deployed SHA/build.
- [ ] Post-deploy smoke checks run and results recorded.
- [ ] Human QA status clearly marked pending/partial/pass/fail.
- [ ] Owner approval and exact lock scope recorded when supplied.
- [ ] Rollback path and implementation record updated.

## 10. Canonical record

Every substantive change must have a dated implementation record with request, scope, design decisions, affected files, tests, backup refs, deployment evidence, human report/acceptance state, lock state, dependencies and rollback. This document is the canonical execution protocol; older documents that conflict with it are superseded for deployment sequencing and must be corrected when next touched.


## 11. Binding owner clarification — public demo is the human test laboratory (2026-11-17)

The owner explicitly confirms that the **public Generation 1 demo is the project's shared test laboratory and the required surface for human testing, observation, feedback and reporting**. It is not merely a showcase, optional preview, or a production-release gate.

- For every explicitly authorized, unlocked, demo-eligible implementation, the execution path is: inspect and scope → implement on an isolated candidate → machine tests/debugging → verified backup → deploy the candidate to the public demo → verify the live URL/build identity → perform available post-deploy machine smoke checks → hand the exact public build to the owner/testers for human QA → record the human report and decision.
- Do not ask the owner to reconfirm that a normal eligible candidate should be placed on the public demo. This permission is part of the standing protocol. Ask only when the target, scope, deployment path, risk, protected dependency, irreversible effect, or required authority is genuinely ambiguous or outside the recorded authorization.
- A branch preview, PR diff, screenshot, local build, or CI result is not a substitute for the public demo. Human findings must identify the exact public URL and deployed commit/build.
- The public demo may intentionally contain a candidate that is **HUMAN-QA-PENDING**. That status is expected and is not equivalent to acceptance, approval, locking, or production promotion.
- Keep the demo safe and reversible: do not deploy if relevant machine checks fail, the backup is not verified, or the change crosses a protected/locked boundary without authorization. If deployment cannot be verified, report **DEMO-DEPLOYMENT-BLOCKED** or **DEPLOYMENT-UNVERIFIED**; never imply that source changes are live.
- Human QA and owner acceptance remain real, separate gates. Only the owner (or explicitly delegated tester within scope) can supply human findings; only the owner can approve/lock scope unless authority is explicitly delegated.
- This clarification does not authorize direct edits to the default branch, bypass of PR/review protections, Generation 2 activation, or production promotion.

This section records the owner's clarification of the existing Section 7 demo-QA rule; it makes the operational meaning explicit and does not weaken any safety, backup, machine-test, protected-area or human-acceptance requirement.
