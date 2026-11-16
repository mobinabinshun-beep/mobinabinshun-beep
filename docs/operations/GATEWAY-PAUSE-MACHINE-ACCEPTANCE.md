# Gateway pause/resume — owner decision and machine-acceptance addendum
- Date: 2026-11-16
- Status: CONFIRMED owner direction; documentation-only change
- Canonical archive decision: https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-16/GATEWAY-IS-THE-PAUSE-CONTROL-fa.md

## Binding behavior
Gateway is the intended primary pause/resume control for the active game. Opening Gateway pauses the round and nonessential background rendering. Closing Gateway releases only the pause imposed by Gateway. A manual pause that existed before Gateway opened must remain in effect after Gateway closes.

A separate, duplicate Pause/Resume control is not a required parallel path. This decision does not itself authorize unrelated HUD, game-rule, save-state, or protected-area changes.

## Narrow acceptance rule for this item
For this specific clarification and any narrowly scoped correction directly required to make the documented Gateway pause contract true, automated tests and machine-verifiable checks are sufficient to close the item. Human approval is not a prerequisite for this item. If code changes, use the normal isolated-change, debug, focused/regression-test, verified-backup and public-demo release sequence.

Record only the checks actually run. Do not mark HUMAN-QA-PASSED, OWNER-APPROVED or SCOPE-LOCKED unless the owner separately gives explicit human acceptance. This narrow machine-only closeout does not waive human QA for unrelated features or subjective visual acceptance.

## Required automated coverage
- Gateway open pauses the active round.
- Gateway close clears only the Gateway-owned pause.
- A pre-existing manual pause survives Gateway close.
- Foreground HUD and controls remain available.
- Relevant regression checks protect unrelated routes and game state.

This file records the contract; it does not claim that implementation or tests have already passed.
