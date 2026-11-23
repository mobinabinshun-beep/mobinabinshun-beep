# N.U contributor operating rules — fast, safe, owner-directed

## Mandatory protocol-first execution order
- For software change intake, fail-closed operational assessment, continuous documentation and versioned backup/archive, follow the canonical [four execution-governance protocols](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-19/NU-FOUR-EXECUTION-GOVERNANCE-PROTOCOLS-fa.md). This is the software lifecycle overlay; product-specific locks, demo sequence and human QA remain governed by this file and the unified archive protocol.
- Start every task by reading this repository's AGENTS.md and the canonical N.U operating/change protocols in the Repository archive. Read the protocol instructions before inspecting implementation data or issuing write/deploy commands.
- Next read the relevant product specifications, owner decisions, protected-area locks, recent change records, QA reports and related Issue/PR history.
- Only then inspect repository state: actual default branch and SHA, relevant source/tests/assets, refs/backups, workflow evidence, build/deploy configuration and the identity/content of the currently running public demo.
- Execute only the explicit owner request and actions required by the applicable protocol/acceptance criteria. No speculative cleanup, refactor, redesign, migration or adjacent change.
- Before the first runtime write, preserve the currently running public demo as a versioned, decomposed Runtime Baseline Snapshot using the baskets in canonical protocol sections 18–19. Do not assume live demo == current source head. If live identity or access is unavailable, record the exact unverified/missing basket and do not claim backup completion.
- After machine checks pass, create and verify the exact candidate backup, deploy the authorized candidate to the public demo, verify the actual live build, and hand it to the owner/testers as HUMAN-QA-PENDING. Human acceptance requires the owner's explicit result.
- Canonical protocol: https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-18/NU-UNIFIED-OPERATING-PROTOCOL-fa.md (sections 18–19).

## Authority and delivery
- The project owner defines intent, scope and final human acceptance. Contributors/agents execute implementation, debugging, machine tests, backup, demo deployment, verification and documentation.
- **Speed is a binding engineering requirement.** No avoidable ceremony, duplicate approval, repeated inventory, speculative research, or process-only gate may stall an authorized task. Replace friction with the smallest useful check or automation.
- Start from the directly relevant files, interfaces, tests, current owner decisions and locks. Expand repository/cross-repository discovery only when evidence shows a shared dependency, duplicate implementation, data contract, security boundary, or cross-repository impact. Do not require reading every tracked file in every repository for a scoped change.
- If an information gap does not affect safe implementation, record it as a limitation and proceed. If it does affect correctness/safety, isolate the smallest unknown and continue independent work.
- Never create a parallel module before checking the relevant existing interface and likely reusable implementation. No broad repository census as a prerequisite for ordinary scoped work.

## Protected areas
- The classic LV / XP / Mana HUD remains locked. Do not modify, refactor, restyle, reposition, rename, remove, replace, or incidentally touch its markup, styles, labels, values, visibility, layout, responsive rules or related tests.
- Only a direct, explicit owner instruction naming the protected HUD change grants a narrow exception. Preserve all unrequested behavior and reinstate the lock after the change.
- Do not weaken security, privacy, repository permissions, branch protections, or destructive-data safeguards in the name of speed.

## No unilateral rollback / no silent regression
- Never revert, downgrade, restore an older product version, or discard newer accepted behavior on your own initiative.
- A rollback is permitted only to contain a demonstrated critical regression, using a verified checkpoint, with the incident, exact affected scope, reason, recovery evidence and owner notification recorded. Prefer a forward fix when safe.
- Do not remove, bypass or reinterpret a previously accepted requirement merely because it is inconvenient. If requirements conflict, preserve the newer explicit owner directive and document the compatibility adjustment.
- A lock applies only to the exact accepted scope. Do not silently widen, narrow, or remove it.

## Fast execution path
1. Identify the exact user intent, relevant owner decisions, locked areas, dependencies and acceptance criteria.
2. Inspect only the directly affected code/docs/tests plus dependencies demonstrated by that inspection.
3. Use the existing authorized working line by default; before the first write, record the baseline and create/reuse a verified PRE-CHANGE recovery ref/tag for code/data/schema/shared-contract/structural changes. Create a candidate branch only when isolation is materially required. Implement the smallest scoped change and preserve unrelated features.
4. Run focused tests first, then relevant regression/build checks. Automate repetitive checks where practical.
5. Create and verify a recoverable checkpoint after machine checks pass.
6. For authorized demo-eligible work, deploy to the public demo without redundant pre-approval; verify the actual live build where evidence is available.
7. Report exact implementation, tests, checkpoint, deployment state, limitations and a concise human QA checklist.
8. Human acceptance is separate from machine approval. A machine-passed candidate is immediately recorded as MACHINE-APPROVED-LOCKED / HUMAN-QA-PENDING; final product acceptance and permanent scope lock still require the owner.

## Gateway and controller invariants
- Gateway is the exclusive surface for actions it provides; remove redundant duplicate controls only where Gateway is mounted.
- Gateway is the sole gameplay-pause authority; no independent/manual or player-overlay pause owner may pause or resume gameplay.
- Opening Gateway freezes active gameplay and background rendering before its options become actionable. Closing Gateway does not resume gameplay; keep the round and ambient renderers frozen until the first real gameplay-space input (mouse/touch press, gameplay keyboard input, or controller direction/confirm with a fresh input transition after return; a controller input held through Gateway closure must not release the hold).
- Reload is not a Gateway action and never runs automatically on page entry unless a future explicit module-specific owner directive says otherwise.
- Gateway Exit = Back = Home = the main/home page; do not silently restore an unrelated nested-history destination.
- Direct physical mouse and direct touch remain direct input. Stepwise cursor movement through controller buttons is simulated mouse, irrespective of cursor artwork.
- Simulated mouse is a gameplay-only controller translator, enabled only on game screens/games that require mouse interaction. It is not a Gateway controller and must not be globally enabled or activated on unrelated pages.
- In gameplay, controller directions move the virtual pointer and highlight targets; separate confirm activates. Preserve this behavior independently of Gateway.
- Gateway must never enable/disable, move, reset, or take ownership of the virtual mouse. The virtual pointer may enter the Gateway trigger to open it; once Gateway opens, it stays at its exact game-space position and is frozen. It never moves over Gateway options.
- Gateway Up/Down option traversal is a separate selective-action path: one discrete press advances one option; sustained hold repeats continuously. Direction selects/highlights; separate confirm activates. Down beyond the final option exits without selecting another item.
- Direct touch and physical mouse remain independent Gateway inputs. Touch can open Gateway, be lifted, and later tap options selectively; physical mouse movement over options activates directly, with click also available. Touch/mouse exit outside the Gateway interaction zone closes Gateway.
- Preserve currently owner-approved trigger dwell/cancellation thresholds and synthetic-click suppression; do not invent or silently alter timing. Opening dispatches pause before options become actionable.
- Touch scrolling is disabled on the active game interaction surface without breaking direct touch delivery or the protected canvas routing.
- Every Gateway exit keeps gameplay frozen until the first fresh gameplay-area interaction; held controller input cannot resume it. Full normative scenarios and regression matrix: [Gateway & simulated-mouse contract, section 12](./docs/operations/GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md#12-binding-owner-amendment--gateway-and-virtual-mouse-are-independent-2026-11-21).
- Implement simulated mouse as a shared launcher-core gameplay adapter. Game modules consume it through the shared interface; Gateway consumes only its separate selective-action controls and must never take ownership of the virtual pointer. Do not fork controller-specific pointer logic per page.
- Keep adapters extensible for future controller types through stable interfaces and documented capability references.

## Machine approval lock and human QA queue
- Every scoped candidate that passes its declared automated checks is frozen at its exact commit and recorded as `MACHINE-APPROVED-LOCKED` + `HUMAN-QA-PENDING`.
- Do not amend, rebase, regenerate, or otherwise write to that frozen candidate. Do not allow unrelated automated work to modify its locked files/scope while it is queued for human review.
- Human QA findings or a new direct owner instruction are the only normal reasons to reopen the affected scope. Preserve the prior frozen candidate as evidence. A correction uses a new successor commit on the authorized working line; create a separate branch only when isolation is materially required by a protected lock, parallel release, destructive risk or security boundary. Rerun tests and create a new exact machine-approval checkpoint before returning to human QA.
- Machine approval is not human approval, owner acceptance, production promotion, or proof of live deployment.
- The repository workflow lock is an agent/process rule unless GitHub branch protection is separately configured. Never claim technical branch protection unless verified.
- Canonical workflow record: https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-18/NU-UNIFIED-OPERATING-PROTOCOL-fa.md (section 9: Machine approval lock and human QA queue).

## Documentation
- Keep one canonical implementation contract per subject; link secondary notes rather than creating competing rules.
- The current Gateway/controller contract is [GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md](./docs/operations/GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md). The older Gateway navigation report is historical only.
- The shared input-translator architecture and durable debug evidence protocol is [INTERACTION-CORE-AND-DEBUG-PROTOCOL-2026-11-19.md](./docs/operations/INTERACTION-CORE-AND-DEBUG-PROTOCOL-2026-11-19.md); the live coverage checklist is [INTERACTION-DEBUG-BACKLOG-2026-11-19.md](./docs/operations/INTERACTION-DEBUG-BACKLOG-2026-11-19.md). `nu-interaction-core.js` is loaded before the controller/Gateway adapters on the main game, launcher, casino and studio pages.
- Record decisions, affected files, focused tests, backup/recovery, demo status and remaining risks in the relevant change record.
- Do not claim tests, backup, deployment, human acceptance or locks that were not actually verified.

## Unified operating protocol
- Canonical execution lifecycle and checklists: [NU-UNIFIED-OPERATING-PROTOCOL-fa.md](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-18/NU-UNIFIED-OPERATING-PROTOCOL-fa.md).
- Apply its scope-aware discovery, reuse-first, change-record, test, verified backup/restore, deployment, human-QA and handoff requirements to every task.
- This guide supplements these repository-specific rules; protected areas, owner decisions and exact candidate locks remain in force. For scoped work, inspect the directly affected files and demonstrated dependencies; use full cross-repository discovery for architecture, shared contracts, data, security or multi-repository changes.


## Branch discipline and failed human QA
- Prefer improving the existing default/development line and existing issue/PR record. Do not create a new branch for every defect; branch proliferation is prohibited as a routine workflow.
- Create a branch only when isolation is materially required by an existing protected lock, parallel release, or destructive-risk boundary. Explain why and reuse an existing candidate branch whenever safe.
- A human report that interaction still fails overrides a prior machine-pass label for the affected behavior: reopen the defect, preserve the machine evidence as historical, and do not claim human acceptance.
- Machine approval means automated checks passed and the exact build was deployed to the demo for human testing. It is not final acceptance.
- The exact machine-approved candidate is immutable to unrelated automation. A correction to a failed candidate must be made as a scoped forward fix on the existing working line; after re-testing, record a new exact machine-approved checkpoint and keep the human QA state open until the owner reports acceptance.
- Simulated pointer movement must deliver pointermove and mousemove to the hit-tested target in addition to updating the visible cursor and highlight. Keyboard-emulated direction repeats must continue moving; Gateway exclusively owns directional input while open.


## Shared interaction core and debug retention
- Keep direct touch, direct physical mouse, selective/action translation and simulated mouse as independent translators feeding the shared `NUInteractionCore` semantic event stream.
- Never conflate pointer movement/highlight with select, confirm, activate or execute. Gateway owns its hierarchy while open.
- Instrument system/platform controls and game objects (Bubble Hunt bubbles, Mana particles/orbs, Chaos masses/clusters) with stable object/game/action/source/outcome identifiers. Diagnostic failures must never block gameplay.
- Preserve original human findings and debug exports as linked issue/change-record evidence. A failed human report reopens the affected behavior; do not overwrite it with a later pass.


## Mandatory explicit-scope / anti-destruction lock
- The user instruction is a strict boundary: modify only the named target and proven direct dependencies; do not touch adjacent features, global styles, unrelated tests, data, architecture, or documentation as "cleanup".
- Before writing, record exact in-scope paths, forbidden areas, baseline commit/checkpoint and the minimum change budget. Inspect the complete proposed diff before committing; any unrelated path or behavior must be removed.
- If scope, dependency, ownership or recovery cannot be verified, stop before writing. Never use a whole-repository reset, force push or broad rollback to solve a scoped defect.
- A rollback request authorizes restoration only of the exact named scope from a verified checkpoint. Preserve later unrelated work and explicitly disclose any known defect contained in the checkpoint.
- Any unplanned side effect, unexpected diff, or unrelated regression triggers an immediate stop and recovery of only the affected scope.
- These rules apply to every model, agent, bot, script and contributor operating in this repository. Further development outside the current lock requires a new explicit, focused user instruction.
- Full mandatory protocol: [ANTI-DESTRUCTION-EXPLICIT-SCOPE-PROTOCOL-2026-11-19.md](./docs/operations/ANTI-DESTRUCTION-EXPLICIT-SCOPE-PROTOCOL-2026-11-19.md).
- This is a repository instruction, not a claim of platform-enforced branch protection. Do not claim GitHub ruleset/branch protection unless independently verified in repository settings.

## Protected gameplay input contract — owner accepted 2026-11-19
- Owner-confirmed working behavior: direct touch, physical mouse/click and simulated mouse. Treat this as an accepted protected behavior, not an invitation to refactor the input stack.
- Do not remove, weaken, override or globally replace these exact rules in nu-world.css:
  - #game-view.active .game-stage{pointer-events:auto}
  - #game-view.active .game-stage canvas{pointer-events:auto;touch-action:none}
- Keep index.html loading nu-world.css?v=20261119-gameplay-input-r3; if the CSS is intentionally changed, bump the key and prove the new behavior instead of reverting to a stale cached stylesheet.
- These rules route real pointer/touch events to the game canvas. The game runtime filters events by canvas target; removing pointer delivery breaks interaction. This is functional input routing, not decorative CSS.
- Any modification to these selectors, canvas touch-action, game-stage pointer routing or the CSS cache key requires a new explicit user instruction focused on gameplay input, a focused regression test, and verification of direct touch, physical mouse/click and simulated mouse. Do not bundle it with unrelated CSS/layout/controller/game work.
- Preserve HUD non-interactivity and all unrelated game/UI behavior. Never enable pointer events globally as a shortcut.
- Evidence/acceptance record: docs/operations/INTERACTION-GAME-OBJECT-PRODUCERS-CHANGE-RECORD-2026-11-19.md.

## Owner-mandated repository/data coverage principle
- For explicit owner requests to inspect all repositories or all data, follow the canonical coverage rule: https://github.com/mobinabinshun-beep/Repository/blob/main/Governance/NU-REPOSITORY-AND-DATA-COVERAGE-PRINCIPLE-fa.md
- Exhaust repository discovery and pagination, enumerate trees/paths, fetch requested and relevant files directly, inspect related branches/history/issues/PRs, and record per-repository/per-path coverage. Do not stop at code-search indexing or a failed search; use direct file/tree retrieval alternatives.
- Never respond to a global coverage request with a blanket “cannot read / did not read”. Exhaust available routes, state exact remaining path/ref/error only after alternatives, continue all independent work, and never claim full coverage without a verifiable manifest.
- This explicit owner rule overrides the ordinary scoped-task shortcut only when the owner explicitly asks for all repositories/all data; it does not authorize unrelated runtime changes.


## Pixel Art Studio 2D — mandatory task-specific checklist
- Before changing `pixel-art-studio.html` or its proven direct dependencies, read [the operational checklist](./docs/operations/PIXEL-ART-STUDIO-2D-OPERATIONAL-CHECKLIST.md), the [canonical requirements archive](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-21/PIXEL-ART-STUDIO-2D-TOOLS-UNIFIED-CHECKLIST-fa.md), and the [deferred-work record](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-21/DEFERRED-WORK-PIXEL-ART-STUDIO-2D-TOOLS-fa.md).
- Record the current default-branch SHA, candidate SHA, live-build identity and runtime-snapshot status before comparison. Re-fetch all refs; dated SHAs and workflow IDs are historical until revalidated.
- Use the checklist's PASS/FAIL/BLOCKED/NOT-TESTED vocabulary. PASS requires exact-SHA test evidence; CI is not browser/device QA, live-build proof or owner acceptance.
- Keep the Studio scope isolated. Preserve all protected HUD, Wallet/economy, Gateway/controller, gameplay-input, Library, other-game and global-style areas. Do not begin deferred animation/sprite/tile/vector/project-packaging work under this scope.
- Update the Studio Change Record with exact commands, tested SHA, workflow run IDs, environment, artifacts, failures and human-QA status. Never claim snapshot, deployment, machine approval or acceptance without evidence.


## Owner delivery boundary — demo QA only; no implied release (2026-11-21)
- The public demo is a human-test environment, not a product release or launch.
- A machine-passed, backed-up candidate may be placed on the demo only as a clearly labelled `TEST CANDIDATE — NOT HUMAN-APPROVED`, after the required runtime-baseline and deployment verification steps.
- No product release, production promotion, stable publication, package/store release or public launch is permitted unless the owner first explicitly accepts human QA for the exact demo build/scope and then gives a separate direct instruction naming that release action.
- CI PASS, demo deployment, merge, human tester PASS, owner acceptance of the demo, or silence alone never authorizes a release.


## Owner-mandated additive development and two-stage correction lock (2026-11-22)
- Canonical governance rule: https://github.com/mobinabinshun-beep/Repository/blob/main/Governance/NU-ADDITIVE-DEVELOPMENT-AND-TWO-STAGE-CORRECTION-LOCK-PROTOCOL-fa.md
- Development work is additive and preservation-first: do not delete or reduce existing capabilities, data, behavior, interfaces, contracts or documentation; the next version must not be less than its baseline.
- Keep corrections separate from development. A correction remains locked through its documented intake/scope stage and may be written only after a direct owner command explicitly opens that exact correction ID and scope. Keep machine verification and human QA as separate acceptance gates.
- Categorize and link reports/tasks in the canonical Deferred-Work registry; preserve source reports and connect dependencies, issues, PRs, commits, tests, backups and QA evidence.
- This general rule does not silently unlock a named frozen candidate, protected shared contract or correction scope. Follow the task-specific authorization and all local AGENTS/protocol requirements.


## Owner-mandated multistage package and machine-QA workflow (2026-11-23)
- Canonical workflow: https://github.com/mobinabinshun-beep/Repository/blob/main/Governance/NU-OWNER-MULTISTAGE-PACKAGE-AND-MACHINE-QA-HUMAN-QUEUE-PROTOCOL-fa.md
- Execute multi-tool packages serially: complete implementation, debugging and machine checks for the current stage before coding the next. Internal stages belong to one package and do not need separate owner responses unless a protected lock or explicit decision gate requires one.
- Machine approval is independent of human approval. Verify actual runtime behavior using focused/unit/integration/regression tests and available automated browser/platform coverage; bind all results to exact SHA/build and report actual coverage and NOT-TESTED gaps.
- Once the complete package passes machine QA, create and verify the exact backup, deploy that candidate to the demo for human QA, verify live build identity, freeze the candidate/scope and set HUMAN-QA-PENDING. Demo deployment is a QA handoff, never an implied product release.
- Owner human acceptance locks only the exact accepted scope. Preserve raw human findings and frozen prior candidates; implement fixes on a successor candidate and rerun the complete relevant machine cycle.
- Categorize findings as correction, upgrade, debug, incorrect/missing behavior, re-engineering or optimization. Re-engineer existing code in line with project goals and specifications; preserve baseline behavior and do not rewrite from zero.
- This workflow supplements all local AGENTS instructions, protected contracts, additive-development rules and two-stage correction locks; it does not open any protected scope.
