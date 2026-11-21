# Pixel Art Studio — Mobile Touch UX + Gateway Cross-page Audit

**Date:** 2026-11-21  
**State:** REQUIREMENTS DOCUMENTED / IMPLEMENTATION NOT STARTED  
**Origin:** Owner's human QA report from a touch-screen phone, Pixel Art Studio demo  
**Related work:** Repository `mobinabinshun-beep/mobinabinshun-beep`; deferred Studio work tracked by [Repository Issue #62](https://github.com/mobinabinshun-beep/Repository/issues/62).

## 1. Owner-reported findings (preserved as requirements)

1. The Studio does not allocate enough of the screen to the actual drawing/work area.
2. Tools and panels are not sufficiently grouped into compact, collapsible edge bars/tabs; they occupy too much space and visually crowd the work.
3. The owner wants a quiet, readable icon to identify the current tool without persistent verbose labels.
4. The operational canvas/view needs a circular rotation control for one-axis rotation, with zoom-in and zoom-out available in the same viewport-control family.
5. Device orientation must adapt to portrait, landscape, and the physical bottom edge of the phone; rotation should work through all supported orientations, not assume one fixed portrait/landscape direction.
6. Artwork rotation must support an active selection and be documented as a distinct operation from rotating the viewport/device presentation.

## 2. Source inspection — facts and boundaries

### Pixel Art Studio
- The current `pixel-art-studio.html` has a desktop-oriented `.layout` grid with a fixed 290px side panel, a `.stage` with a 440px minimum height, and a four-column `.tools` grid.
- The page has a basic `width=device-width,initial-scale=1` viewport declaration and canvas `touch-action:none`; this alone does not establish a full-screen mobile workspace or correct touch UX.
- This source inspection is static. It does not prove runtime behavior on any phone/browser.

### Gateway cross-page inventory
A repository-root HTML source scan found seven HTML pages. The shared Gateway stylesheet/script are present on exactly these four:
- `index.html`
- `launcher.html`
- `casino.html`
- `pixel-art-studio.html`

The following root HTML pages do not currently include the shared Gateway assets:
- `404.html`
- `background-candidates.html`
- `exchange.html`

The four Gateway-enabled pages inspected all declare a viewport meta tag. Current shared touch trigger source contains pointerdown/pointerup handling and an immediate open on touch release, with the 500 ms hold path retained. This is a source-level finding only; it is not a verified result for real mobile devices.

**Important:** This inventory is limited to root-level HTML pages. Before implementation, inspect nested HTML documents, embedded webviews/iframes, and route-generated pages. Do not add Gateway to excluded pages automatically; first confirm whether they are intended Gateway surfaces.

## 3. Target mobile Studio experience

### 3.1 Full-screen operational workspace
- On supported phones, use the available visual viewport for the work surface, respecting safe-area insets, browser chrome changes, notches, and home indicators.
- Drawing workspace/canvas is the primary surface and receives the maximum available area.
- Header, status, and tool controls must not permanently consume the majority of the viewport.
- Prevent accidental page-level scrolling/zoom gestures only inside the active canvas interaction region; retain normal page accessibility and scrolling in menus/panels.
- Handle virtual keyboard appearance, visualViewport resize, and browser toolbar collapse/expand without clipping the canvas or trapping controls.

### 3.2 Compact edge toolbars and collapsible groups
- Organize tools into named functional groups (e.g. Draw, Select, Transform, Layers, Guides, Color, Import/Export, History).
- Present each group as a narrow edge rail/tab with a clear, unobtrusive icon.
- Opening a group reveals its controls in a compact panel/drawer; closing it returns the space to the canvas.
- Keep one active tool visibly identifiable. Icon-only controls must have accessible names, tooltips/long-press hints, and a selected state; do not rely on color alone.
- On small screens, avoid simultaneous permanent left and right full-height panels. Prefer one contextual drawer at a time, with predictable close/back behavior.
- Preserve desktop layout and existing tool semantics unless separately approved; responsive layout must not remove capabilities.

### 3.3 Viewport transform controls (not artwork transform)
- Provide a circular/dial-style viewport controller for rotation around one defined axis (the canvas/view plane rotation); show the current angle and a one-tap reset-to-zero.
- Provide zoom-in, zoom-out, and a readable zoom percentage in the same compact viewport-control cluster.
- Define and test sensible zoom minimum/maximum, step size, center/anchor behavior, and reset behavior.
- Viewport rotation/zoom must be non-destructive: it must not change pixel coordinates, selection pixels, layer content, exports, or undo history for artwork edits.
- Keep pan/fit/reset accessible and avoid gesture conflicts with drawing, selection, and two-finger manipulation.

### 3.4 Device orientation and physical bottom-edge handling
- Adapt layout for portrait, landscape-left, and landscape-right. Do not assume that landscape always means the same physical edge is the device bottom.
- Use Screen Orientation API / orientation angle where available, and resize/orientationchange as fallback. Treat DeviceOrientation events as optional enhancement only; handle iOS permission requirements and unavailable sensors without blocking the editor.
- Determine control placement from the actual orientation state/angle and safe-area insets; ensure the primary tool rail and navigation affordances remain reachable relative to the physical lower edge.
- Do not force a global screen-orientation lock. Respect user/device rotation settings and gracefully support browsers that refuse orientation lock.
- Avoid unexpected rotation when the user rotates the artwork or rotates the viewport manually; distinguish device orientation from canvas viewport rotation.

### 3.5 Rotate selected artwork
- Add/document a dedicated selection transform operation for rotating only the selected pixels/region.
- Show a non-destructive preview before commit; cancel restores the exact pre-transform pixels.
- Commit must be a single undoable action; Undo/Redo restores exact before/after states.
- Define behavior for transparent pixels, selection masks, pixels outside the selection, canvas-edge overflow, and whether bounds expand, clip, or require explicit confirmation.
- Use pixel-art-appropriate resampling (nearest-neighbor/no unintended blur) and deterministic results at supported angles.
- Keep this distinct from (a) viewport rotation and (b) device orientation. The UI and help text must name which layer of rotation is active.

## 4. Gateway mobile audit — all intended pages

Audit the shared Gateway implementation on each intended surface, starting with the four confirmed root pages above:
- Trigger can be opened by short touch tap and by the supported hold gesture.
- A tap on an option after opening activates exactly one route/action.
- Touch scrolling/dragging does not accidentally open or select.
- Pointer cancel, interrupted gestures, multi-touch, repeated taps, and orientation changes leave no stuck open/closed state.
- Outside tap, Escape/back navigation, focus return, and aria-expanded/aria-label stay synchronized.
- Home, Game Library, Store, Wallet, Profile, Launcher, Creative Studio, Casino, and Resume routes are checked for correct destination on every page where they apply.
- Safe-area placement, reachability, touch target size, clipping, overlay stacking, and scroll locking are checked in portrait and both landscape directions.
- No duplicate Gateway listeners/overlays are installed when navigating or reinitializing.
- Desktop mouse, keyboard, virtual pointer/controller, and existing regression boundaries remain intact.

## 5. Device/browser test matrix (required before machine approval)

At minimum, test:
- Android phone: Chrome, portrait, landscape-left, landscape-right; touch tap/hold, two-finger gestures, browser chrome collapse.
- iPhone: Safari, portrait and both landscape orientations; safe areas, orientation permission/fallback, visual viewport and home-indicator clearance.
- One smaller-screen and one large-screen phone; tablet if the product supports it.
- Pixel Art Studio: drawing, selection, grouped tool drawer, viewport rotate/zoom/pan, device rotation, selected-artwork rotation, undo/redo, import/export.
- Gateway: all route actions on all four confirmed pages and every additional intended Gateway surface found by nested-route inspection.
- Keyboard/screen-reader basics: accessible names, focus order, visible focus, Escape/back behavior, and non-color tool selection cues.

Record device model, OS/browser version, viewport dimensions, orientation angle, touch scenario, expected/actual result, and PASS/FAIL/BLOCKED. A static code review or CI test is not a substitute for physical-device QA.

## 6. Acceptance gates

- [ ] Full-screen workspace gives the canvas the dominant usable viewport area in portrait and landscape.
- [ ] Tool groups collapse into compact edge rails and reopen without losing tool state.
- [ ] Icons are quiet but legible, with accessible names and current-tool indication.
- [ ] Circular single-axis viewport rotation, zoom in/out, pan, fit and reset behave independently of artwork.
- [ ] Device orientation supports portrait, landscape-left/right and physical bottom-edge adaptation without forced orientation lock.
- [ ] Selected-artwork rotation is isolated, previewable, undoable, and documented.
- [ ] Gateway touch behavior and route destinations pass on every intended page and all supported phone orientations.
- [ ] Existing desktop, keyboard, virtual-controller, export, and project regression tests pass.
- [ ] Human QA report is recorded against the exact demo build SHA.

## 7. Scope and authority

This document records requirements and the audit plan only. **No Studio or Gateway source code was changed as part of this documentation step.** Implementation must begin on an isolated working branch after rechecking current refs, locks, baseline and backup, and must follow the repository's change/demo protocol. Demo deployment is only for human QA. It is not a product release; any action beyond the demo requires human acceptance of the exact candidate and a separate explicit owner instruction.
