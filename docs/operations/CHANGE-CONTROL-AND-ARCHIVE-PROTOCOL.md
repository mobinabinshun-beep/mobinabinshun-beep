# N.U Change-Control, Debugging, Backup and Archive Protocol

**Protocol ID:** NU-OPS-CHANGE-001  
**Version:** 1.0.0  
**Recorded:** 2026-11-13  
**Applies to:** N.U Generation 1 browser runtime and its UI, game, launcher, drawing/studio and Casino surfaces  
**Status:** ACTIVE  
**Authority:** Owner-directed changes only

## 1. Purpose

Apply changes in a narrow, reversible and evidence-backed way. A request to apply, debug, optimize, calibrate, fix, back up or archive invokes this protocol. These words do not authorize unrelated redesign, feature expansion, destructive cleanup, publication or changes to protected runtime modules.

## 2. Mandatory sequence

1. **Read / baseline:** identify the live repository, default branch, latest commit, relevant files, dependencies, existing tests and current UI behavior. Distinguish implemented behavior from proposals and human-test requirements.
2. **Scope:** translate the request into explicit in-scope and out-of-scope items. Preserve existing layout, gameplay, controls, saves and visual identity unless the request specifically changes them.
3. **Backup:** before editing, create a timestamped backup branch or equivalent recoverable snapshot from the exact starting commit. Record the branch and starting SHA.
4. **Plan:** list the exact files to change, expected behavior, risk, acceptance criteria and rollback path. Prefer isolated working branches; do not force-push or overwrite unrelated work.
5. **Implement:** make the smallest coherent patch. Do not refactor adjacent systems merely because they are nearby.
6. **Debug:** inspect selectors, event paths, state transitions, error paths, responsive behavior, reduced-motion behavior, keyboard/touch/mouse handling and persistence boundaries relevant to the change.
7. **Optimize / calibrate:** optimize only measured or clearly identified bottlenecks. Preserve conservative device budgets, avoid unnecessary listeners/animations/reflows, and test viewport/orientation breakpoints. Do not claim benchmark results without measurements.
8. **Verify:** run or trigger the available automated tests and CI. Record exact checks and results. Static source assertions are not runtime or device testing.
9. **Human QA:** when browser/device behavior matters, mark it HUMAN-QA-PENDING until a human test report records device, OS, browser, viewport, input mode, steps and outcomes.
10. **Archive / document:** record request, baseline SHA, backup branch, changed files, commit SHA, test evidence, known limitations, human QA status and rollback instructions. Update the relevant README/register only where appropriate.

## 3. Scope and preservation rules

- Focused change means only the requested component and necessary dependencies may change.
- Do not replace a page, redesign the HUD, rename unrelated controls, change game balance, modify save schemas or alter art direction unless explicitly requested.
- Preserve existing behavior by default. A feature not implemented must not be represented as active.
- A missing resource must remain absent; in particular, do not render an N-BI shield bar when no shield is owned or available.
- Do not edit protected runtime files (including `nu-engine.js`) without explicit authorization and a separate impact review.
- Never claim deployment, production availability or successful real-device testing based only on a source commit.

## 4. Frozen components — owner approval lock

The following are **FROZEN** until the owner explicitly asks to unfreeze or change them:

- Shared Hex Gateway icon, trigger, overlay, radial options and controller.
- Gateway presence on the main/home screen and main menu.
- Gateway presence on game screens.
- Gateway presence on drawing / Creative Studio screens.
- Gateway presence on Casino screens.
- Gateway options, routes, interaction timing, animations, placement and visual design.

The freeze is a preservation lock, not a deletion request. Keep the implementation source and history archived. Do not mount it, import its live assets, expose its icon or re-enable its runtime listeners. Unfreezing requires explicit owner approval; do not infer approval from a general debugging or optimization request.

## 5. Backup, rollback and archive requirements

- Create a backup branch from the exact baseline before source changes.
- Work on a separate branch and preserve the original history.
- Never delete archived implementation files as part of a freeze.
- Record a rollback reference to the backup branch and baseline commit.
- If a patch fails validation, stop and correct or revert only the scoped patch; do not stack speculative fixes.
- Keep generated reports and change records free of secrets, credentials and personal data.

## 6. Verification and calibration checklist

- [ ] HTML entrypoints do not mount frozen components.
- [ ] No live page imports the frozen component's controller or stylesheet.
- [ ] Existing navigation and game entrypoints still work.
- [ ] Game rules, HP, XP, Mana and local-save behavior are unchanged unless explicitly in scope.
- [ ] Missing/empty inventory states do not render unsupported resource meters.
- [ ] Responsive layout checked at narrow and wide viewports.
- [ ] Touch, mouse, keyboard and reduced-motion behavior checked where relevant.
- [ ] Automated tests and CI results recorded.
- [ ] Human QA is explicitly marked pending or passed with evidence.
- [ ] Backup branch, baseline SHA, working branch and final commit are recorded.

## 7. Current application record — 2026-11-13

**Repository:** `mobinabinshun-beep/mobinabinshun-beep`  
**Backup branch:** `backup/pre-gateway-freeze-2026-11-13`  
**Working branch:** `fix/freeze-gateway-cleanly-2026-11-13`  
**Baseline commit:** preserved by the backup branch created before edits.

### Changes in this application

- Removed Gateway stylesheet imports, overlay markup, navigation markup and controller script imports from `index.html`, `launcher.html`, `casino.html` and `pixel-art-studio.html`.
- Preserved `nu-hex-gateway.js` and `nu-hex-gateway.css` as archived source; the CSS-level hard freeze remains.
- Updated `tests/nu-hex-gateway.test.js` to assert that all live entrypoints remain detached and the unsupported shield UI remains absent.
- Updated the project README to point to this protocol.
- No changes to `nu-engine.js`, game rules, wallet logic, save data or gameplay layout are included in this patch.

### QA boundary

Source-level regression assertions are recorded in the test file. Automated CI and browser/device human QA must be checked after the branch is pushed or merged; no deployment or live-device pass is claimed by this record.

## 8. Change log

| Date | Version | Change |
|---|---|---|
| 2026-11-13 | 1.0.0 | Establish focused change-control, backup, freeze, verification and archive protocol; detach the frozen Gateway from live pages. |
