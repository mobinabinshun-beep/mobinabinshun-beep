# Change, Backup, Public Demo & Human QA Protocol

**Status:** Mandatory and owner-directed  
**Effective:** 2026-11-16  
**Canonical detailed directive:** [N.U Owner Directive & Demo Acceptance Backlog](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-16/OWNER-DIRECTIVE-AND-DEMO-ACCEPTANCE-BACKLOG-fa.md)

## Authority and roles
- The project owner is the idea director and final human quality/acceptance authority.
- The execution assistant/contributor is the operational arm responsible for scope analysis, implementation, debugging, machine tests, verified backups, public-demo deployment, link/build verification, reporting and documentation.
- Machine validation is evidence only for the checks actually run. It is not an absolute guarantee of zero defects and never replaces human QA.
- Public-demo deployment is specifically the environment for human testing. It is not human approval or authorization to promote beyond the demo.

## Required sequence for authorized, unlocked demo-eligible work
1. **Read and scope:** read AGENTS.md, docs/operations/LOCKED-AREAS.md, relevant architecture/feature specs and the canonical owner directive. Identify locks, dependencies, exclusions and acceptance criteria.
2. **Record:** create a dated change record with request, authority, scope, affected files, expected behavior and regression boundaries.
3. **Implement in isolation:** use a dedicated candidate branch; keep unrelated changes out.
4. **Machine test and debug:** run focused tests, syntax/build checks and relevant regression workflows. Fix failures before continuing. Record exact test names, environment and outcomes.
5. **Machine backup:** after the candidate passes required checks, create a recoverable checkpoint/backup of the pre-release state and verify its commit/file identity and restoration path. Record the candidate commit too.
6. **Publish to the public demo:** once machine checks and backup are verified, deploy the candidate to the designated public demo. **No additional human pre-approval is required** for changes already authorized and within an unlocked scope.
7. **Verify and report:** check the public URL and actual build/commit identity. If the platform does not provide sufficient evidence, mark deployment UNVERIFIED; source merge alone is not proof of live deployment.
8. **Human QA:** give the owner and invited testers the demo link, exact scope/build, test steps, expected outcomes, known limitations and rollback reference. Record device, OS, browser, orientation/input method and observed result.
9. **Accept and lock:** only an explicit owner acceptance creates a lock. The lock applies only to the named item, section or pack and the exact accepted scope/build.
10. **Correct and repeat:** rejected or failed items are corrected within the authorized scope and repeat machine tests → verified backup → public demo → link/build verification → human QA.

**Canonical order:** Code → machine tests/debugging → verified machine backup → public demo → link-check/report → human QA/owner acceptance.

## Scope locks and reopening
- Owner acceptance may lock one item, a section or a complete pack.
- A lock remains in force until the owner explicitly and directly reopens that exact scope.
- Reopening one item does not unlock adjacent components or dependencies.
- If a requested edit to an unlocked item requires changing a locked dependency, stop before changing that dependency. Explain the relationship and impact, present three practical options with trade-offs, recommend the best option against the project specifications and wait for the owner's direction.
- After the authorized correction, repeat the full release sequence and seek human acceptance again.

## Actions that still require explicit authorization
Do not infer permission to expand scope, change a protected dependency, reopen a lock, make destructive/irreversible data changes, weaken security/privacy, incur costs, expose secrets, or take unrelated external actions. The no-preapproval rule applies only to implementation and demo deployment already covered by an explicit owner request and an unlocked scope.

## Evidence states — never collapse them into “done”
Use separate states: IMPLEMENTED; AUTOMATED-QA-PASSED/FAILED; BACKUP-VERIFIED; SOURCE-MERGED; DEPLOYMENT-VERIFIED/UNVERIFIED; POST-DEPLOY-SMOKE-PASSED/FAILED/NOT-RUN; HUMAN-QA-PENDING/PARTIAL/PASSED/FAILED; OWNER-APPROVED/REJECTED; SCOPE-LOCKED; PROMOTED.

## Required change record
- Request, authority and date
- Scope, exclusions, acceptance criteria and dependencies/locks checked
- Changed files, branch and implementation commit
- Exact automated tests/build/workflows and results
- Debugging, failures, skipped checks and limitations
- Backup/checkpoint reference and restore procedure
- Public demo URL, deployment revision and live-verification evidence
- Human QA instructions and results by tester/device/browser
- Owner decision and exact lock scope
- Open risks, rollback details and next safe action

## Rollback
If the demo has a critical regression, stop further rollout, restore the verified pre-release checkpoint, verify recovery and record the incident. Do not silently rewrite or erase historical evidence.

## Documentation rule
A change is not closed until the canonical archive record and relevant repository index are updated. Do not store credentials, private keys, tokens or unnecessary personal information in project records.


## Narrow exception — Gateway pause-control clarification (2026-11-16)
The owner has explicitly confirmed that Gateway exists to serve as the game's pause/resume control. Opening Gateway pauses the active round; closing it releases only the pause owned by Gateway; any manual pause that predated Gateway must remain in force. A separate duplicate Pause/Resume control is not a required parallel path.

For this specific Gateway contract clarification and a narrowly scoped correction directly required to satisfy it, **automated validation is the acceptance gate; human approval is not required to close this item**. The contributor must inspect dependencies, implement only the scoped correction if code is demonstrably needed, debug, run focused and relevant regression tests, and record exact machine evidence. If code changes, the normal verified-backup and public-demo release requirements still apply.

This exception does not grant approval for unrelated work, does not unlock protected areas, and does not create HUMAN-QA-PASSED, OWNER-APPROVED or SCOPE-LOCKED status. Human QA remains distinct and may still be performed, but it is not a prerequisite for closing this narrow protocol item. See the [canonical owner decision](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-16/GATEWAY-IS-THE-PAUSE-CONTROL-fa.md).


## Owner clarification — Gateway-exclusive controls (2026-11-16)
The owner confirms that Gateway is the sole control surface for any action it already provides in a space or module where Gateway is mounted. In gameplay, opening Gateway pauses the round and closing it resumes only a pause that Gateway itself created; a separate Pause/Resume button must not be shown or required. In Bag, Inventory and Wallet, Gateway owns the corresponding back-navigation action; duplicate page-level back buttons are suppressed while Gateway is active. Keep distinct navigation destinations and controls that Gateway does not provide.

For this narrowly scoped Gateway-exclusive cleanup, the acceptance gate is automated debugging and regression testing. No human pre-approval is required before demo deployment. Follow code → tests/debug → verified backup → public demo → machine report. Do not mark HUMAN-QA-PASSED, OWNER-APPROVED or SCOPE-LOCKED without a separate explicit owner acceptance. Do not modify the locked LV/XP/Mana HUD or unrelated navigation/data behavior.
