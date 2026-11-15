# Change Safety & Feature Preservation Protocol

**Status:** Mandatory project-wide engineering rule  
**Applies to:** Every project area, UI surface, gameplay system, wallet flow, content view, accessibility behavior, and shared component.

## 1. Core rule: visual refactors do not authorize feature removal

A request to change layout, styling, responsiveness, animation, performance, or visual hierarchy is not permission to remove, suppress, relocate off-screen, or silently alter an existing user-facing capability.

Treat these as separate dimensions:
- **Presentation:** geometry, spacing, color, typography, animation, responsive behavior.
- **Behavior:** actions, state transitions, business rules, persistence, feedback, accessibility, keyboard/touch interaction.
- **Communication:** success/failure notices, counts, labels, status announcements, and transaction summaries.

Changing one dimension must preserve the others unless the user explicitly approves a behavior change.

## 2. Mandatory pre-change inventory

Before editing a component:
1. Identify the component's visible elements and all event listeners.
2. Trace every user action from input to state mutation, persistence, and feedback.
3. Record success and failure states, empty/full states, and boundary conditions.
4. Identify related capabilities rendered outside the component (toasts, live regions, dialogs, counters, wallet ledger).
5. Classify each behavior as **preserve**, **explicitly requested change**, or **approved removal**.
6. If the effect of a proposed deletion is uncertain, do not delete it; ask or preserve it.

## 3. Change-impact contract

Every change request must be translated into:
- **Requested outcomes** — what must change.
- **Invariants** — what must remain true.
- **Non-goals** — what must not be changed.
- **Dependencies** — other components and state flows affected.
- **Acceptance checks** — observable tests for each outcome and invariant.

A visual cleanup must not be used as a reason to remove a notification, accessibility affordance, interaction target, validation, persistence call, or error path.

## 4. Required transaction-feedback invariant

Any operation that consumes, spends, grants, restores, deletes, or transfers a resource must retain clear, timely feedback showing:
- the resource/item delta (for example, −1 CAPSULE HEAL);
- the resulting resource delta (for example, +10 HP, or the actual capped amount);
- success versus failure;
- no false success message when persistence fails.

For HP capsule use specifically, successful feedback is displayed on/anchored to the HP HUD and reports the actual restored amount. Drawer open/close animation must not remove, cover, or suppress this notice. The notice is separate from the capsule icon animation and from generic global toasts.

## 5. Implementation rules

- Keep presentation code and business/state logic separable.
- Do not delete a function, DOM node, CSS rule, event listener, toast, live region, or test merely because it appears visually redundant. Trace its callers and purpose first.
- Prefer removing duplicate decoration over removing semantic feedback.
- Use actual state/result values; never hard-code an expected reward when the operation can be capped.
- Preserve keyboard, pointer, touch, focus, and reduced-motion behavior.
- Avoid unnecessary particles, repeated floating labels, and forced synchronous layout reads; this performance rule does not apply to essential user feedback.
- If feedback is moved, ensure exactly one clear, accessible destination remains and test it.

## 6. Regression-test requirements

For every touched feature, test both the requested change and preserved invariants:
- primary success path;
- failure path and persistence failure;
- boundary/empty/full state;
- keyboard and touch/pointer activation;
- responsive/mobile layout;
- accessibility announcement (role=status / aria-live where appropriate);
- interaction between animation and feedback;
- no unintended regressions in adjacent features.

Tests must assert user-observable behavior, not only the presence of implementation strings. Where a real browser test is unavailable, state that limitation and do not claim visual verification.

## 7. Review and completion checklist

- [ ] Did I inventory existing behavior before editing?
- [ ] Is every deletion explicitly requested or demonstrably safe and approved?
- [ ] Are all existing user-visible feedback paths preserved?
- [ ] Are success and failure states still communicated?
- [ ] Are actual values and capped results displayed?
- [ ] Did I add/update regression tests for changed and preserved behavior?
- [ ] Did I run the relevant tests and report failures honestly?
- [ ] Did I verify the final diff and cache/version references?
- [ ] Did I distinguish code committed, PR merged, and deployment verified?

## 8. Change log requirement

When a change intentionally removes or changes a capability, document:
- the capability and prior behavior;
- why the change is necessary;
- user impact;
- replacement behavior, if any;
- explicit approval/reference;
- tests proving the intended new behavior.

**Default decision:** preserve behavior. No silent feature deletion.
