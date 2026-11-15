# N.U UI Layer, Rendering Isolation & Extension Safety Protocol

**Protocol ID:** NU-ARCH-UI-001  
**Version:** 1.0.0  
**Effective date:** 2026-11-15  
**Status:** Mandatory engineering standard; applies to Generation 1 and all future generations  
**Authority:** Project owner approval is required for exceptions. No visual or technical contributor may waive the hard prohibitions below.

## 1. Non-negotiable project law — foreground safety

> **BACKGROUND AND DECORATIVE LAYERS MUST NEVER COVER, MOVE, RECOLOUR, DIM, BLUR, HIDE, RESIZE, REORDER, CAPTURE INPUT FROM, OR OTHERWISE ALTER THE PRESENTATION OR OPERATION OF FOREGROUND CONTENT.**

This is an absolute prohibition, not a design preference. It applies even when the background contains thousands of image layers, video, parallax, particles, canvas, WebGL, shaders, animation, dynamic lighting, or future rendering engines.

Foreground content includes, without limitation:
- Navigation, menus, lists, labels, text, links, buttons and form controls.
- Game controls, HUD, player information, status indicators and gameplay interaction surfaces.
- Gateway and future navigation/extension controls.
- Dialogs, notices, modal content, accessibility/focus surfaces and system messages.

A background effect that visually obscures one foreground pixel, intercepts a foreground pointer/touch/keyboard action, or changes the geometry/readability of a foreground control is a protocol violation. It is forbidden even if the feature is optional, temporary, animated, or enabled only on a high-performance device.

Only an explicitly designated foreground UI component may cover another foreground component (for example, an approved modal over the page). A background or decorative component can never claim that exception.

## 2. Canonical world stack

The .world element is an isolated stacking context. Its child layers use one shared token scale defined in nu-world.css:

| Token | Value | Permitted responsibility |
|---|---:|---|
| --nu-layer-world-background | 0 | Canonical background image / base colour only |
| --nu-layer-world-atmosphere | 1 | Non-interactive sky and atmospheric backdrop |
| --nu-layer-world-effects | 2 | Non-interactive world canvas, pixel scenery, horizon and decorative effects |
| --nu-layer-world-content | 3 | Main page shell and all normal foreground content |

The page shell must remain above all world scenery. Never increase background/effect z-index to solve a foreground layout problem. Correct the foreground's own layout or its documented UI layer.

The application-level foreground stack is separate from the world stack. Existing menu, intro, error and Gateway surfaces retain their own documented application-level tokens. A new modal or system overlay must be a foreground UI component and must declare its relationship to these surfaces.

**Important:** z-index is scoped by stacking contexts. A large child z-index cannot escape a lower parent stacking context. Before assigning z-index, inspect the entire ancestor chain for isolation, positioned z-index, transform, filter, opacity, contain, will-change, clipping and flex/grid stacking behavior.

## 3. Background and visual-layer contract

Every background, atmosphere, parallax, particle, canvas, image, shader, world-effect and decorative layer MUST:
1. Be visual-only and use pointer-events: none.
2. Be non-focusable and absent from the accessibility interaction tree where decorative (for example, aria-hidden="true").
3. Never contain, wrap, reparent, clone, or mutate foreground controls or foreground DOM.
4. Never change foreground inline styles, classes, text, dimensions, visibility, opacity, transforms, focus, tab order, event handlers or application state.
5. Stay inside its assigned world/effect host and its assigned layer token.
6. Avoid full-screen opaque overlays, filters, blend modes or blur that reduce foreground contrast/readability.
7. Load asynchronously without blocking, hiding, replacing, or delaying usable foreground UI.
8. Fail closed: on load/render failure, disable the failing effect and retain the last known-good foreground and a safe background/fallback. Never blank or cover the interface.
9. Respect reduced-motion, page visibility and the selected performance profile.
10. Never promote itself above foreground content to make an effect more visible.

The canonical background image is the visual base. Optional effects decorate it; they do not own or replace the UI. A fallback renderer is also a background renderer and is bound by the same rules.

## 4. Extension, plugin and Gateway isolation

Future Gateway destinations, plugins, panels, game modes, HUD additions and other extensions MUST be additive and isolated.

- Each extension has a unique namespace, a documented mount point, explicit lifecycle (mount, update, suspend, unmount) and a narrow public API.
- Extensions may read only the state and events explicitly granted by their host contract. They may not reach into or rewrite unrelated modules' DOM, CSS, storage, timers, loops or state.
- CSS must be scoped to the extension root. Global selectors, global resets and broad element selectors from an extension are prohibited.
- Untrusted or independently supplied UI must use an isolated document boundary (sandboxed iframe or an equivalently reviewed sandbox). Shadow DOM may isolate styles, but is not by itself a security sandbox.
- An extension may add a foreground UI surface only through the approved foreground host/registry. It may not insert UI into the background renderer or use a background layer to display controls.
- Gateway navigation must remain a lightweight navigation surface. It may not become a full-screen rendering layer, take ownership of the world scene, or mutate the visual hierarchy of unrelated views.
- Removing, disabling or archiving an extension must not alter another feature's data, layout, runtime, storage, or ability to launch.
- Extensions communicate through versioned events/API contracts, not direct DOM surgery or shared mutable globals.

## 5. Museum / archive lifecycle and feature independence

A feature moved to a museum/archive state is preserved as a versioned, read-only artifact with provenance, dependencies and a restore procedure. It is not automatically loaded into the active runtime.

Adding, removing, disabling, restoring or replacing a feature MUST be isolated:
- No unrelated feature files or save data are rewritten as a side effect.
- Feature-specific data is namespaced and schema-versioned.
- Migration is explicit, reversible and backed up before execution.
- Feature registration and navigation are separate from feature implementation.
- Rollback removes the feature's registration/runtime mount and restores only its own data; it does not roll back unrelated systems.
- Archived source is not silently edited to make a current feature work.

## 6. Performance and rendering budget

New visual capabilities must reduce total system burden, not expand it without bounds.

- One capability profile is sampled and shared; extensions must not start competing device benchmarks.
- Effects are optional and budgeted. Under load, reduce particle count, update frequency, resolution, blur and secondary motion before touching core UI or gameplay.
- Foreground interaction, readability and frame scheduling take priority over decorative fidelity.
- No unbounded animation loops, duplicate observers/listeners, redundant full-screen canvases, repeated layout reads/writes or uncontrolled GPU layers.
- Pause nonessential rendering when the document is hidden; honor reduced-motion.
- Prefer transform/opacity animation only when measured and appropriate; avoid promoting every element to its own compositor layer.
- No effect may consume input events intended for foreground controls. Global pointer delegation must explicitly exclude UI controls.
- Performance degradation must degrade optional effects gracefully, never remove or obscure controls.

## 7. Change-control and protected surfaces

Before any layer/extension change:
1. Read this protocol, the visual architecture record, the incident archive, the current source and relevant test history.
2. Identify the exact DOM host, stacking-context ancestors, layer token, lifecycle and ownership boundaries.
3. Create an immutable backup from the verified base and work on a separate feature branch.
4. Change the smallest responsible surface. Do not mix unrelated gameplay, wallet, profile, background-asset, Gateway redesign or generation migration.
5. Add or update automated regression tests and CI gates in the same change.
6. Record files, commit, tests, risks, rollback and public deployment status.
7. Do not claim completion from source edits or CI alone. Browser/device testing and project-owner visual acceptance are required.

Protected/frozen engines remain protected. No module may be edited merely to work around a presentation defect owned by another layer.

## 8. Mandatory regression gates

Every graphics/UI pull request must prove:
- Background host uses the background token and cannot receive pointer input.
- Atmosphere/effects use only their assigned tokens and cannot receive pointer input.
- Main shell is above all world scenery.
- Menus, Gateway and modal controls remain visible and interactive in all relevant views.
- Initial load, image-loading, successful image load, image failure, procedural fallback, reduced-motion, hidden-tab resume, desktop and mobile states are checked.
- Keyboard focus, screen-reader semantics, pointer, touch and click/tap still reach the intended foreground control.
- Extensions can mount/unmount without changing unrelated UI, storage or runtime state.
- Performance degradation disables/reduces optional effects before affecting foreground operation.

A failing invariant blocks merge. A waiver requires a written, specific project-owner authorization and must never waive Section 1.

## 9. Incident response and release lock

If any background/decorative layer covers or alters foreground UI:
- Stop feature work and preserve the last known-good commit.
- Record the incident and source evidence in the archive.
- Revert or isolate the offending layer before adding more effects.
- Fix the responsible layer boundary, not by stacking arbitrary z-index values.
- Add a regression test reproducing the failure.
- Keep the release in test state until the project owner tests and explicitly accepts it.
- "Lock" means the owner-approved implementation, tests, source commit and package/release artifacts are recorded as immutable; no lock is implied by merge or CI success.

## 10. Current implementation mapping

- World root: .world, isolated stacking context.
- Background: .nu-world-background, created by nu-background-engine.js, assigned background token 0.
- Atmosphere: .sky, token 1.
- World effects: #world-canvas, #pixel-world, .horizon, .world-effects, token 2 and pointer-transparent.
- Foreground shell: .world > .shell, token 3.
- Application foreground surfaces: menu, intro, error and Gateway have distinct application-level tokens.
- Gateway CSS and JavaScript remain an independent extension surface; this protocol does not authorize a Gateway redesign.

## 11. Adoption and enforcement

This protocol is mandatory for all contributors, agents, automation, branches, releases and future extensions. The automated checks in tests/nu-layer-contract.test.js and .github/workflows/graphics-ci.yml enforce the source-level invariants. Any future change to the layer model must update this protocol, the tokens, tests and architecture record together.

**No feature priority, visual ambition, schedule pressure or performance tier overrides the foreground-safety law.**


## 12. Per-stage human acceptance — mandatory release invariant

Every independently reviewable UI, visual, background, interaction, accessibility or rendering change stage MUST pass the repository's public-Demo human acceptance gate before the next independent stage proceeds.

- Automated tests, source inspection, screenshots, local previews and CI are technical evidence only; none constitutes human acceptance.
- Human testing is requested only against the exact revision deployed and verified on the public Demo.
- Record the change ID, candidate SHA, deployed SHA, Demo URL, deployment time, scenarios and the project owner's explicit decision in a dated human-test report.
- The stage is blocked while its status is HUMAN-QA-PENDING or REJECTED. Do not stack the next independent change, merge, lock or promote it.
- Every fix or follow-up revision starts a fresh backup/change record and repeats automated checks, Demo deployment and human retest. Acceptance never transfers from an earlier SHA.
- If the public Demo is unavailable, mark the stage NOT VERIFIED / HUMAN-QA-PENDING and stop progression.
- Only the project owner can explicitly authorize a documented exception or a pre-declared bundled stage.

This section is enforced together with CHANGE-AND-DEMO-PROTOCOL.md and docs/PUBLIC-DEMO-HUMAN-ACCEPTANCE-GATE.md. No CI status or contributor judgment can waive this requirement.
