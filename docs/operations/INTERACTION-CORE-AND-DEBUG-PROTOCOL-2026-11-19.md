# N.U Interaction Core & Debug Data Protocol — 2026-11-19

**Status:** IMPLEMENTED ON DEFAULT LINE · AUTOMATED VALIDATION PENDING · HUMAN QA REQUIRED  
**Scope:** Shared launcher/game interaction pipeline, independent input translators, Gateway, game objects and durable debugging evidence.  
**Protected boundary:** Classic LV / XP / Mana HUD remains locked. Do not alter its markup, style, layout or semantics.

## 1. Architecture: translators are independent; the core is shared

Each physical or logical input translator owns only its source-specific interpretation. Translators publish normalized semantic events to `NUInteractionCore`; the core records and broadcasts them. Existing page/game handlers remain the action owners until explicitly migrated, so observation does not silently replace gameplay behavior.

| Translator | Input ownership | Normalized actions |
|---|---|---|
| Direct touch | Native touch/pointer events | press, activate |
| Direct physical mouse | Native mouse/pointer events | press, release; native click is observed once by the selective-action translator |
| Selective/action translator | Clicks, form changes, keyboard confirm/cancel, controller/Gateway navigation | hover, navigate, select, confirm, activate, cancel, execute |
| Virtual mouse / simulator | Gamepad or keyboard-emulated direction and confirm; consumes shared simulated-pointer events | move, hover, confirm, activate |
| Future controller translators | Source-specific mappings only | Must publish the same semantic event contract |

**Core invariants**
- Direct mouse and touch are never reclassified as simulated mouse.
- A direction/move event never implies selection, click, confirmation or execution.
- Select/highlight, confirm, activate and execute are distinct semantic stages.
- Touch-generated compatibility clicks are guarded against duplicate activation in the observation stream.
- The core is non-intrusive: a diagnostic observer exception cannot break a game action.
- Do not add per-page polling loops or duplicate controller adapters. Reuse the shared core and existing simulated pointer adapter.

## 2. Selective actions and Gateway hierarchy

The shared semantic vocabulary is:

1. `move` / `hover` — pointer movement or target focus only.
2. `navigate` — move through an ordered list, menu or hierarchy.
3. `select` — mark a choice without executing it.
4. `confirm` — explicit confirmation input.
5. `activate` — invoke a click/action target.
6. `execute` — domain operation completed or attempted; producers should include a result/outcome.
7. `cancel` — abandon the current selection/action.

Gateway remains the exclusive owner of its own option list and pause lifecycle. While Gateway is open, it owns directional navigation and confirm/cancel. A further Down after the last option follows the existing owner contract and exits without selecting. The core observes these transitions; it does not introduce a second Gateway state machine.

## 3. Interaction coverage / debug inventory

The debug inventory must cover every interactive surface, not just DOM buttons:

- **Platform/system:** navigation, links, tabs, forms, inputs, selects, dialogs, keyboard focus, pointer/touch events, launcher and utility controls.
- **Gateway:** trigger dwell, open/pause ordering, option focus, hierarchy navigation, selection, confirmation, activation, cancel/exit, re-entry guard.
- **Game controls:** start/restart, movement, aim, fire/action, inventory, upgrade, shop, wave transitions, pause-return hold and game-over/reward paths.
- **Game objects:** Bubble Hunt bubbles (spawn, pointer target, hit/click, pop, miss, despawn, score/XP result); Mana particles/orbs (spawn, target, collect, miss, despawn, Mana delta); Chaos masses/clusters (spawn, target, collision, split/merge if applicable, damage/effect, despawn).
- **Rendering/physics bridges:** canvas hit-test, pointer coordinates, object identity, collision/overlap, frame/update ownership and render pause/resume.
- **Economy and health effects:** only the event/result identifiers and deltas needed to explain the interaction; do not log secrets or unnecessary player-identifying data.

Every object-specific producer should use stable `objectType`, `objectId`, `gameId`, `action`, `source`, `outcome` and optional coordinate/result fields. Object lifecycle and game-specific semantics are not yet claimed as fully instrumented by the first core commit; add producers incrementally and test each game adapter.

## 4. Core API and debug ledger

Loaded as `nu-interaction-core.js` before the pointer/Gateway adapters on index, launcher, casino and pixel-art-studio pages.

- `window.NUInteractionCore.on("interaction", callback)` subscribes to normalized records.
- `record(action, source, target, detail)` records a semantic event from a game/system producer.
- `snapshot()` returns the recent in-memory ledger.
- `exportReport()` returns JSON with schema `nu-interaction-debug/v1`.
- Browser event stream: `nu:interaction` and `nu:interaction-debug`.

The current ledger is a bounded in-memory diagnostic buffer (last 240 records), not a permanent cloud database. Preserve valuable evidence by exporting the report and attaching it to the relevant GitHub issue/change record. Do not imply that browser memory survives refresh or that data has been uploaded automatically.

## 5. Human report retention protocol

Every human report is durable development evidence:
- Keep the original report wording, date/time, environment/device, input type, page/game, exact reproduction steps, expected result, observed result, severity and evidence attachment/reference.
- Never rewrite a failed report as passed. Add a linked resolution record while preserving the original finding.
- A human failure reopens the affected behavior even if an earlier automated check passed.
- Record the exact commit/build under test, test result, demo deployment identity, reproduction result and follow-up owner status.
- Link the record from the canonical issue and this protocol. Reuse the active interaction/Gateway issue where possible; do not create a branch or issue per individual symptom unless separate ownership is genuinely required.
- Avoid storing account secrets, credentials, personal identifiers or unrelated user data in debug exports.

## 6. Acceptance / machine validation

Focused tests must verify:
- independent translator classification for mouse, touch, selective actions and simulated mouse;
- no double semantic activation from one physical/touch interaction;
- separate move, navigate, select, confirm, activate and execute stages;
- Gateway retains exclusive navigation and confirmation ownership;
- object producers for bubbles, Mana particles and Chaos masses emit lifecycle + interaction + outcome records;
- diagnostics cannot block the underlying game action;
- debug export schema, bounded retention and report attachment workflow;
- no change to protected HUD or unrelated game/economy behavior.

**Release state:** source and focused unit tests are committed to the default line. Test execution, full game-object producer coverage, exact demo deployment/live-build identity and owner human acceptance must be reported separately; none is implied by the presence of this document or core module.
