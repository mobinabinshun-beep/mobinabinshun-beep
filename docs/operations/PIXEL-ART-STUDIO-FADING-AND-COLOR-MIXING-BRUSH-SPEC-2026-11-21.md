# Pixel Art Studio — Separate Fading and Color-Mixing Brush Requirements

**Recorded:** 2026-11-21  
**Parent scope:** Issue #62 — Pixel Art Studio 2D tools  
**State:** REQUIREMENT CLARIFIED / MACHINE REGRESSION PENDING / HUMAN QA PENDING  
**Authority:** Owner clarification in the active conversation

## Owner's intended tool split

These are two distinct tools, not one combined "Fading Brush":

1. **Fading (محوکن)** — a dedicated fading tool. Its purpose is to fade/soften existing painted content progressively. It must not be described or implemented as the color-mixing brush. The exact visual behavior (fade toward transparency/background versus fade in pigment strength) must be confirmed in the human demo pass before final acceptance.
2. **Brush (قلم ترکیب و قاطی کردن رنگ‌ها)** — a dedicated color-mixing brush. It picks up and mixes/smears colors already present on the canvas as the user strokes. It is not merely a normal paint brush with adjustable opacity, nor the Fading tool with a renamed label.

The UI, tool identifiers, help text, settings, automated tests, and human QA checklist must keep these as separate capabilities.

## Current candidate audit

A source-level audit of the current Studio candidate found:
- A Fading Brush tool path and fadeIntensity setting are present.
- The current fading path blends the selected color against each destination pixel; focused tests cover destination-pixel underlay behavior and intensity endpoints.
- A separate user-facing Brush color-mixing/smudge tool, with its own behavior and tests, was **not found** in the audited candidate source.
- Existing layer blend modes and the internal mix(a,b,t) color interpolation helper are not equivalent to a user-facing color-mixing brush.

Therefore, prior machine PASS evidence for the 48-test candidate applies only to the code and behaviors actually present at that candidate SHA. It must not be interpreted as implementation or approval of the separate color-mixing Brush requested here.

## Implementation acceptance criteria

### Fading — محوکن
- Exists as its own selectable tool and is named distinctly from Brush.
- Applies a progressive fade/softening effect to existing canvas content.
- Brush size and fade amount/strength are independently adjustable.
- Repeated strokes produce predictable, bounded results; no stroke-origin color smear or unintended edits outside the active selection.
- Supports undo/redo and respects layer lock/visibility and selection boundaries.
- Automated tests cover minimum/midpoint/maximum settings, transparent and opaque pixels, selection clipping, and deterministic output.

### Brush — color-mixing brush
- Exists as a separate selectable tool and is named/help-described as color mixing.
- Samples existing canvas colors and mixes/smears them along the stroke; it must visibly combine neighboring colors rather than simply lay down the foreground color.
- Has independently testable brush size and mixing strength. Any additional controls (for example pickup/wetness) must be documented only if actually implemented.
- Works predictably across multiple differently colored pixels and transparent/empty regions.
- Respects active layer, layer lock, selection boundaries, and undo/redo.
- Automated tests cover two- and multi-color mixes, stroke direction/continuity, brush-size changes, selection clipping, transparent pixels, and deterministic repeatability.

## Machine gate

The existing dedicated Studio workflow checks syntax and runs:
- tests/nu-studio-pro-tools.test.js
- tests/nu-studio-layout.test.js
- tests/nu-studio-advanced-tools.test.js

A green run after this documentation change is a **documentation/regression baseline PASS only**. Full feature machine approval for the clarified two-tool requirement requires the separate Brush implementation, Fading/Brush-specific tests, and a successful workflow on the exact resulting code SHA. Do not mark the Brush feature complete before that evidence exists.

## Human QA queue — do not pre-mark PASS

Once the distinct Brush implementation is present on a candidate:
1. Verify Fading alone on opaque, semi-transparent and transparent areas, at small/medium/large sizes and low/mid/high fade settings.
2. Verify Brush color pickup/mixing on adjacent high-contrast colors, several colors in one stroke, reverse stroke direction, repeated strokes and empty/transparent boundaries.
3. Verify Fading and Brush are separately selectable and have independent controls; switching tools must not carry unintended settings or state.
4. Verify selection inside/outside, layer lock, undo/redo, zoom levels, desktop pointer and mobile touch.
5. Record actual device/browser, build SHA, steps, expected/actual result and PASS/FAIL/BLOCKED in the human test issue.

**Human status:** PENDING. No human result is inferred from CI.

## Continuation protocol

For the next session, resume from this document and the linked Human QA Handoff. First inspect current default-branch state, open PRs, candidate SHA and workflow results. Implement the missing color-mixing Brush as a separate feature on an isolated branch; add tests, run the machine gates, update the exact-SHA evidence, then leave the candidate in the human QA queue and continue from written human reports.


## Owner-directed implementation contract — Color-Mixing Brush (2026-11-23)

The implementation is a separate stroke-based pickup/smudge tool. It samples existing pigment from the active canvas/layer, carries a blended pickup color along the pointer path, and mixes that pigment into already-painted pixels. It does not use the selected foreground color as the paint source.

- The shared brush-size setting controls the footprint; the Color-Mixing Brush has its own independent 1–100 mixing-strength control.
- Pointer movement is interpolated across skipped pixel coordinates so fast pointer movement does not leave gaps.
- The active selection clips both pigment sampling and writes. The active layer lock blocks the stroke. Layer-mask edit mode blocks this tool rather than silently editing the underlying pixels.
- The tool uses the current brush shape (square, circle or diamond) and keeps pickup state only for the current stroke. Switching tools, ending a stroke or cancelling it resets pickup state.
- Transparent cells remain transparent. They do not inject the checkerboard/background color into the pickup and do not receive opaque pigment; the carried pigment remains available when the stroke reaches another painted region.
- Each pointer stroke is one undo/redo operation. Cancelled strokes restore the full layer snapshot.
- Fading remains its own tool with its own intensity setting. No Fading algorithm or identifier is reused as the Color-Mixing Brush.

Machine verification must prove two-/multi-color pickup, directional smear, continuous interpolation, brush footprint, transparent boundaries, selection clipping, locked-layer protection, independent controls and undo/redo. The browser test additionally verifies that a nonmatching foreground color does not drive the mix result.
