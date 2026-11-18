# N.U Unified Interaction Core — 2026-11-19

**Status:** OWNER-DIRECTED ARCHITECTURE RECORDED · RUNTIME INTEGRATION NOT YET MACHINE-APPROVED · HUMAN-QA-OPEN  
**Scope:** Launcher core, Gateway, platform UI, game objects and all interactive surfaces.  
**Protected:** Classic LV / XP / Mana HUD; do not alter its markup, styling, layout, labels or values.

## 1. Goal

All input devices must be translated independently into one shared interaction contract in the launcher core. Translators must not implement game rules or duplicate each other's event polling. The core normalizes input, resolves the target, applies focus/selection semantics, and dispatches a deliberate action to the owning UI/game module.

## 2. Translator registry

| Translator | Source | Core responsibility | Must not do |
|---|---|---|---|
| Touch | Native touch/pointer events | Normalize contact, position, press/release, cancel, gesture and touch identity | Synthesize a second mouse click for the same touch |
| Physical mouse | Native mouse/pointer events | Normalize movement, hover, button down/up, wheel and target | Be switched into virtual mode or hijacked by gamepad state |
| Selective / click controllers | Gamepad buttons, keyboard-emulated click controllers, accessibility switches | Convert discrete directional/select/confirm/cancel inputs into semantic navigation and action requests | Treat direction as confirmation or execute a target while merely highlighting it |
| Virtual mouse (simulator) | D-pad / stick / directional click-controller input | Maintain virtual coordinates, hit-test, highlight, dispatch pointer movement, and expose a separate confirm operation | Conflate cursor movement with click; compete with physical mouse/touch |
| Gateway option translator | Core semantic navigation while Gateway owns focus | Traverse ordered options and submenus, select, confirm, cancel, execute, and enforce the extra-Down exit rule | Let game-level keyboard handlers consume Gateway-owned input |

The existing nu-controller-pointer.js remains the simulated-mouse adapter, not the whole interaction core. It must be consumed by the core contract rather than copied into individual games.

## 3. Canonical event pipeline

1. **Capture:** device-specific translator receives native input.
2. **Normalize:** emit a device-neutral intent with source, phase, coordinates/delta, button/key, timestamp and original-event reference where available.
3. **Resolve:** core selects the active interaction context (Gateway, platform UI, game scene, modal/dialog, or object layer).
4. **Target:** hit-test or resolve the currently focused/selected target.
5. **Preview:** hover/highlight/focus only; no side effect.
6. **Select:** explicit selection of an option/object.
7. **Confirm:** explicit confirm/click intent.
8. **Authorize:** owning context checks enabled/disabled, modal, pause, cooldown, range, game state and one-shot/re-entry guards.
9. **Execute:** invoke the target's registered action once.
10. **Observe:** record result, rejection reason, source translator and timing for debug/telemetry.

Recommended normalized intent shape (illustrative contract, not yet a runtime API):
- source: touch | mouse | selective | virtual-mouse | keyboard
- phase: move | enter | leave | down | up | select | confirm | cancel | activate
- targetContext: gateway | platform | game | overlay | unknown
- position: viewport/client coordinates when meaningful
- control: stable key/button identifier
- sequenceId: correlate down/up/confirm/execute and suppress duplicate activation
- originalEvent: optional native event for preventDefault/propagation control

## 4. Interaction coverage register

### Platform and system
- All buttons, links, tabs, menus, dialogs, form controls, sliders, lists, cards and selectable items.
- Focus, hover, selection, confirm, cancel, disabled state, modal ownership and navigation hierarchy.
- Gateway trigger, Gateway options, nested option groups, Back/Home/Exit, Profile and Menu routes.
- Prevent duplicate controls when Gateway already owns the same action.
- Gateway open pauses/freeze gameplay before options become actionable; closing keeps gameplay frozen until a fresh gameplay-space input.

### Game objects and live scenes
- Bubble Hunt: bubbles, hit targets, collectible/interactive entities and collision/click surfaces.
- Mana Collector: Mana particles, pickups, attractor/collector targets and resource interactions.
- Chaos Attack: Chaos masses/clusters, particles, targetable entities and action surfaces.
- Canvas/WebGL/game-scene objects must receive pointer coordinates or explicit semantic hit-test results; DOM-only hover is insufficient.
- Object ownership decides whether a hit is hover, selection, pickup, attack, collection or another action. Translators never infer game semantics.

### Universal behavior
- Movement/highlight is never activation.
- One physical action must produce at most one activation.
- Touch-generated compatibility mouse events must not double-fire.
- Disabled/blocked/modal-covered targets cannot execute.
- A held control across context changes must not trigger on entry/exit; require a fresh neutral-to-active transition where applicable.
- Source device and interaction outcome must be traceable in debug logs.

## 5. Debug system and durable evidence

Every interaction failure should be recorded under docs/debug/ and linked from docs/debug/README.md. Keep raw human wording, date/context, device/browser, expected behavior, actual behavior, reproduction steps, affected commit/build, evidence links, fix commit, automated checks, demo build identity and human retest result.

Do not overwrite or paraphrase away the original human report. Add a dated resolution section while retaining the report verbatim. Machine checks and human QA are separate fields; a machine pass never changes a human failure into acceptance.

## 6. Acceptance matrix

- [ ] Physical mouse movement, hover, down/up and click work without virtual-mode interference.
- [ ] Touch tap/drag/cancel work and never double-activate.
- [ ] Selective controller navigation highlights only; confirm is a separate action.
- [ ] Virtual mouse coordinates, cursor, hit-test, DOM pointer events and canvas/game input agree.
- [ ] Gateway consumes its own navigation/confirm/cancel inputs and traverses options in order.
- [ ] Down beyond the final Gateway option exits without selecting; held input cannot immediately reopen it.
- [ ] Every interactive platform component is reachable and has correct disabled/focus semantics.
- [ ] Bubble, Mana particle and Chaos mass interactions resolve to the owning game action exactly once.
- [ ] No unintended gameplay resume on Gateway close; fresh gameplay input is required.
- [ ] Automated regression passes on the exact candidate SHA.
- [ ] Exact candidate build is deployed to demo and its identity is verified.
- [ ] Human QA retests the same build; failures reopen the affected scope.

## 7. Implementation boundary and current evidence

- Existing shared simulated-mouse adapter: nu-controller-pointer.js.
- Existing runtime tests: tests/nu-controller-pointer-runtime.test.js and tests/nu-controller-pointer.test.js.
- Existing Gateway contract: docs/operations/GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md.
- Owner-reported interaction failure remains open in [Issue #210](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/210).
- This record establishes the architecture, inventory and acceptance contract. It does **not** claim that touch/mouse/selective translators have already been implemented as independent runtime modules, nor that every listed game object is currently wired to the core.
- Runtime integration must be delivered incrementally against existing shared interfaces on the existing development line; do not create a branch per translator. Add focused tests for each translator and end-to-end context routing before machine approval.
