# N.U — User Input Modes & Controller Settings Specification

**Date:** 2026-11-21  
**Status:** OWNER-DIRECTED SPECIFICATION · DOCUMENTED · RUNTIME IMPLEMENTATION NOT CLAIMED  
**Scope:** Platform-wide user input classification, interaction semantics, virtual-mouse mapping and controller settings UX.  
**Related records:** [Interaction Core & Debug Protocol](./INTERACTION-CORE-AND-DEBUG-PROTOCOL-2026-11-19.md) · [Gateway & Controller Input Contract](./GATEWAY-AND-CONTROLLER-INPUT-CONTRACT-2026-11-17.md) · [Interaction Debug Backlog](./INTERACTION-DEBUG-BACKLOG-2026-11-19.md) · [Issue #210](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/210)

## 1. Input classes

The platform input model has two top-level classes:

### 1.1 Interactive inputs
Inputs that directly point to or act on an on-screen location.

- **Touch:** direct contact, movement/drag where supported, and tap on an option or target.
- **Physical mouse:** pointer movement to hover/highlight a target, followed by mouse click to select/activate it.

### 1.2 Selective inputs
Inputs that navigate choices and issue discrete actions.

- **Keyboard:** Arrow Up, Arrow Down, Arrow Left, Arrow Right and Enter.
- **Gamepad/controller:** directional controls (D-pad or mapped stick) and a separate confirm/select control.

Selective input may be used in two distinct modes:
1. **Selective-action mode:** directions navigate lists/options; Enter/Confirm selects or activates the highlighted option.
2. **Virtual-mouse mode:** directions move a simulated pointer only in a game/screen context that requires mouse interaction; Enter/Confirm clicks at the virtual pointer position.

The active context determines which mode owns directional input. The same physical input must not be processed by two competing handlers.

## 2. Interaction semantics

| Source | Movement/navigation | Selection/activation |
|---|---|---|
| Touch | Finger movement/gesture on supported interactive surface | Tap the intended option/target |
| Physical mouse | Move pointer over the intended option/target | Mouse click |
| Keyboard — selective mode | Up / Down / Left / Right navigate choices | Enter confirms/selects |
| Gamepad — selective mode | D-pad/stick directions navigate choices | Confirm button selects/activates; Cancel is context-defined |
| Keyboard — virtual-mouse mode | Arrow keys move the virtual pointer | Enter performs a separate click |
| Gamepad — virtual-mouse mode | D-pad/stick moves the virtual pointer | Confirm performs a separate click |

Movement or highlight is never, by itself, an activation. A selection/confirmation must be a distinct action unless the specific direct-input interaction is a touch tap or physical mouse click.

## 3. Virtual-mouse mode

### 3.1 Activation scope
- Enable the virtual mouse only inside a game or screen area where mouse/pointer interaction is required.
- Do not enable it globally or on unrelated pages.
- Physical mouse and direct touch remain native direct inputs; they are not reclassified as virtual mouse.
- Use the shared controller-pointer adapter rather than per-page polling or duplicated pointer implementations.

### 3.2 Directional mapping

The virtual pointer supports eight directions plus confirmation:

| Direction | Keyboard / controller mapping |
|---|---|
| Right-Up | Right + Up |
| Up | Up |
| Left-Up | Left + Up |
| Right | Right |
| Left | Left |
| Right-Down | Right + Down |
| Down | Down |
| Left-Down | Left + Down |
| Confirm / Select | Enter / mapped controller confirm |

- A single direction moves the pointer one configured discrete step in that direction.
- Two simultaneous perpendicular directions produce a diagonal step.
- Holding a direction repeats movement according to the shared repeat policy.
- Directional movement updates pointer position and target highlight only.
- Enter/Confirm performs a separate click/confirmation at the virtual pointer location.
- One physical input must not cause duplicate movement or duplicate activation through parallel keyboard/Gamepad handlers.

### 3.3 Context and Gateway boundary
- Virtual-mouse mode is gameplay/screen interaction only.
- Gateway option traversal is a separate selective-action path, not virtual-pointer movement.
- When Gateway opens, the virtual pointer remains frozen at its exact game-space position and never moves over Gateway options.
- While Gateway is open, its own Up/Down/Confirm/Cancel ownership takes precedence; no parallel virtual-mouse or gameplay handler may consume the same input.
- After Gateway closes, existing fresh-input safeguards apply; an input held through closure must not resume gameplay.

## 4. Controller settings and user options

Add a user-facing controller options area at this navigation path:

**Settings → Games Options → Controllers**

The Controllers section should contain:

1. **Controller list**
   - Show supported/connected input devices and their availability.
   - Present the active input mode and relevant device mapping.
   - Do not imply a device is connected when connection state is unavailable.

2. **Hotkey guide**
   - Explain directional navigation, diagonal virtual-pointer movement, confirm/select and context-specific cancel.
   - Clearly distinguish selective-action mode from virtual-mouse mode.
   - Show the default mapping and the current user mapping.

3. **Hotkey configuration mode**
   - Allow users to enter a deliberate remapping mode.
   - Let the user assign supported keys/buttons to directions and confirm/select (and cancel where supported).
   - Detect and explain duplicate/conflicting assignments.
   - Provide save/apply and reset-to-default behavior.
   - Provide a safe way to cancel configuration without losing the previous mapping.
   - Do not capture ordinary gameplay or navigation keys outside this explicit configuration mode.

## 5. Recommended default hotkey map

| Action | Keyboard default | Gamepad default |
|---|---|---|
| Up | Arrow Up | D-pad Up / mapped stick Up |
| Down | Arrow Down | D-pad Down / mapped stick Down |
| Left | Arrow Left | D-pad Left / mapped stick Left |
| Right | Arrow Right | D-pad Right / mapped stick Right |
| Confirm / Select | Enter | A / primary confirm |
| Cancel / Back | Escape | B / secondary cancel, where the current context supports cancel |

For virtual-mouse mode, the same four directions combine to form the eight-way pointer map in section 3.2. Exact device-specific button identifiers and analog thresholds must be documented by the implementation and must not be guessed in the UI.

## 6. Acceptance criteria

- [ ] The platform documents exactly two top-level input classes: Interactive and Selective.
- [ ] Touch and physical mouse remain direct interactive inputs.
- [ ] Keyboard and Gamepad support selective navigation and separate confirmation.
- [ ] Keyboard and Gamepad can use virtual-mouse mode only in contexts that require pointer interaction.
- [ ] Eight-way directional mapping, including diagonal combinations, works consistently.
- [ ] Pointer movement/highlight never activates a target; Enter/Confirm is a separate activation.
- [ ] One input cannot trigger duplicate actions through parallel handlers.
- [ ] Gateway retains exclusive selective-action ownership while open; virtual pointer stays frozen.
- [ ] Settings exposes Settings → Games Options → Controllers.
- [ ] Controller list, hotkey guide and explicit hotkey-configuration mode are available.
- [ ] Remapping validates conflicts and supports apply, cancel and reset-to-default.
- [ ] Existing direct touch, physical mouse/click, gameplay pointer routing and protected HUD behavior remain unchanged.

## 7. Implementation and QA boundary

This document fixes the intended input taxonomy, interaction semantics, directional mapping and settings UX. It is a specification only. It does **not** claim that the controller settings UI, configurable hotkeys, every mapping, or the full runtime behavior has already been implemented or device-tested.

Implementation should be added to the existing translator/controller architecture and tracked in the Interaction Debug Backlog and Issue #210. Runtime changes require focused tests for each input class, keyboard and Gamepad routing, diagonal/repeat behavior, no-double-activation, Gateway ownership/freeze, and direct touch/mouse regressions. Physical-device QA remains a separate acceptance step.
