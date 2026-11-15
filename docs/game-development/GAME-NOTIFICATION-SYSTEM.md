# N.U Game Notification System

**Status:** Default reusable module for all current and future games  
**Runtime module:** `nu-game-notifications.js`  
**Standalone visual presets:** `nu-game-notifications.css`  
**Public API:** `window.NUGameNotifications`  
**Visual contract:** Preserve the Generation 1 notification signature by default.

## Purpose

Games should not independently invent notification layout, timing, easing, stacking, accessibility, or cleanup. They should pass event data to the shared module. The module provides three default families and one general-purpose helper:

1. Object-interaction notifications (bubbles, Mana objects, Chaos masses, and future interactive targets).
2. Resource-bar increments (for example, `+1` at the current filled/empty boundary).
3. Consumption / transaction pairs (for example, `−1 CAPSULE HEAL` and `+10 HP`).
4. Generic floating feedback for other non-blocking events.

## Historical visual source — do not redesign by default

The default visual identity is not a new design. It is recovered from the repository's earlier implementation:

- [Generation 1.18 — original anchored HP feedback](https://github.com/mobinabinshun-beep/mobinabinshun-beep/commit/655418f95cd9a33075513cb41defeb0801ee8e7a)
  - `.floating-change` card: compact dark surface, fine tone-colored border, strong monospace label, matching glow and shadow.
  - Tone presets: `.loss` (warm gold), `.gain` (green), and `.hp` (bright green HP result).
  - `@keyframes nu-floating-change`: 1.75 seconds, cubic-bezier(.2,.8,.25,1).
  - Other established signatures: `.hit-progress` / `nu-hit-pop` for object interactions and `.capsule-gain` / `capsule-rise` for bar-boundary increments.
- [Generation 1.19 — viewport-coordinate overlay correction](https://github.com/mobinabinshun-beep/mobinabinshun-beep/commit/460bc773e1e8a55a04ff42f51c52acceca52ac1d)
  - Establishes why fixed HUD notifications must be anchored from viewport rectangles rather than game-stage-relative coordinates: the stage may clip overflow while the HP rail is viewport-fixed.

The module reuses these existing CSS signatures. The current game runtime delegates both object-interaction progress and the existing XP/Mana +1 boundary pop to the shared presets. The standalone stylesheet namespaces the interaction and bar-delta selectors and matches the existing in-game bar placement, so it can be loaded by any game page without changing the protected classic resource HUD structure, values, or fill rules. It must not replace the historical appearance with generic toast styling or a new visual language.

## Default motion signature

### Floating transaction / consumption card

The legacy `nu-floating-change` animation is the canonical default:

| Keyframe | Opacity | Vertical offset | Scale | Meaning |
|---|---:|---:|---:|---|
| 0% | 0 | +18px | .82 | Enters from below, slightly reduced |
| 14% | 1 | 0px | 1.04 | Becomes fully legible with a small emphasis |
| 28% | 1 | 0px | 1 | Settles without bouncing |
| 82% | 1 | 0px | 1 | Holds readable long enough to register |
| 100% | 0 | −22px | .96 | Exits upward while fading |

Default duration is **1750ms**. Do not shorten the hold or increase the rise distance without a documented game-specific reason. The initial anchor offset is **4px below** the target frame for HP consumption. Combined with the keyframe movement, the card begins visibly below the frame, settles at its edge, then exits upward as it fades. Keep text readable during the hold and exit.

### Object interaction

Use the existing `.hit-progress` / `nu-hit-pop` visual signature. Default duration: **850ms**. Anchor to the actual interaction point in the game-stage coordinate system. The module does not decide whether an interaction is valid or award a resource.

### Resource-bar increment

Use the existing `.capsule-gain` / `capsule-rise` visual signature. Default duration: **1100ms**. Place the label at the actual current fill boundary (plus a small configurable offset), not at a fixed screen location. The module does not modify the bar's value, fill, thresholds, or economy.

## API and data contract

All methods are visual-only. They never change game state, resource balances, wallet inventory, saves, score, or interaction outcomes.

### `showInteraction(options)`

Required: `container`, `x`, `y`, `text`.

Optional: `tone`, `duration`.

Use for a confirmed interaction with a bubble, Mana object, mass, target, or other game object. Call only after the game has accepted the interaction.

### `showBarDelta(options)`

Required: `anchor`, `text`.

Optional: `fill`, `tone` (a sanitized CSS tone class; built-in defaults are `xp` and `mana`), `boundaryOffset`, `duration`. Games may add a small namespaced tone rule without changing the shared animation.

Use for changes such as `+1` at the current fill boundary. The caller supplies the already-updated fill element and its containing rail. The module only renders the notification.

### `showConsumption(options)`

Required: `anchor`, `itemDelta`, `resourceDelta`.

Optional: `duration` (default 1750ms), `offset` (default 4px), `itemTone` (default `loss`), and `resourceTone` (default `hp`). Custom tones may be supplied by a game-specific CSS class while retaining the shared card geometry and motion.

Use for successful consumption or exchange. It creates a paired legacy-style notification: item cost in gold (`.loss`) and resulting resource change in green (`.hp`). For HP capsule use, the exact copy is `−1 CAPSULE HEAL` and `+N HP`, where N must be the actual restored amount returned by the wallet (including any cap). Do not infer, recalculate, or hard-code the amount.

### `showFloating(options)`

Required: `text`.

Optional: `anchor`, `tone`, `duration`, `offset`.

Use for a single non-blocking notification when a paired preset is not appropriate.

## Positioning, stacking, and lifecycle

- For fixed HUD elements, always call `getBoundingClientRect()` at the moment the event is accepted and position in viewport coordinates. Do not reuse stale positions captured before state persistence or a rerender.
- Use the HP rail's lower edge as the consumption pair's origin. Default pair offset is 4px; the cards rise and fade using the legacy curve.
- Load both shared files on each game entry page: `nu-game-notifications.css` for the visual presets and `nu-game-notifications.js` before the game runtime. The main game hub and Casino page are wired as examples. The overlay is fixed, pointer-transparent, and outside clipping game stages. It must not intercept clicks, alter layout, move the HP rail, or change the capsule drawer width.
- Notifications are transient and removed after their animation. Do not leave hidden nodes accumulating.
- Reduced-motion users receive the same message and tone without the movement animation.
- Use polite live-region semantics for transaction pairs. Do not make decorative particle bursts a prerequisite for semantic feedback.
- If multiple notifications overlap, queue or offset them deliberately; do not let them obscure one another or block the game.

## Per-game extension policy

The shared module is the default for each game. A game may pass its own:
- message text and resource labels;
- semantic tone;
- anchor element / interaction coordinates;
- small timing or offset adjustments when justified by the game's pace and viewport.

A game must not fork the animation or duplicate the CSS as its first response. Any departure from the default must include a short rationale, a named preset/override, and focused tests. Keep the base module stable so new games normally only supply the missing event data.

## Example

```js
// Confirmed object interaction
NUGameNotifications.showInteraction({
  container: gameStage,
  x: target.x,
  y: target.y,
  text: "+1"
});

// Resource increment at the current fill boundary
NUGameNotifications.showBarDelta({
  anchor: manaTrack,
  fill: manaFill,
  text: "+1",
  tone: "mana"
});

// Successful HP capsule use — use the wallet's actual result
NUGameNotifications.showConsumption({
  anchor: hpBar,
  itemDelta: "−1 CAPSULE HEAL",
  resourceDelta: "+" + result.restored + " HP"
});
```

## Non-goals and invariants

- Notifications do not authorize or execute an interaction.
- Notifications do not grant or consume resources.
- A failed action must not show a success notification.
- The default visual signature is stable; game-specific customization is an explicit exception, not an unrecorded redesign.
- The classic LV / XP / Mana HUD remains governed by `docs/operations/LOCKED-AREAS.md`; this specification does not unlock or redesign it.

## Acceptance checklist

- [ ] Correct event and actual data supplied by the game.
- [ ] Correct anchor measured at event time.
- [ ] Legacy visual preset used by default.
- [ ] Text remains legible during the hold.
- [ ] Motion and fade follow the documented timing.
- [ ] Fixed overlays are not clipped and do not intercept input.
- [ ] Reduced-motion fallback preserves message content.
- [ ] Notification nodes are cleaned up.
- [ ] No game-state or wallet mutation occurs inside the notification module.
