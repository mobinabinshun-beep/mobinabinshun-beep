# N.U Modular Graphics Runtime — 2026-11-11

## Status
Experimental integration on `feature/modular-graphics-runtime-2026-11-11`. Not merged into the public default branch. The preservation branch `preservation/public-demo-2026-11-11` was created from the same public baseline before changes.

## Architecture
The runtime is split into four independently replaceable engines plus a small orchestrator:

1. **Capability & Budget Core** — `nu-graphics-core.js`: reads the existing NU performance sample once, then applies conservative device-memory, CPU-core and Save-Data caps. It produces an immutable, locked profile with DPR, particle, background FPS and game FPS budgets. It does not inspect or change game rules.
2. **Background Engine** — `nu-background-engine.js`: owns the full-screen image surface and fallback state. It loads the approved archived reference artwork directly from `NU-INGEST-ARCHIVE/ASSETS/NU-Celestial-City/Original reference image file for Niroo Universe (N.U).png` via the raw GitHub asset URL. The archive remains the single source of truth; no second binary is required in this branch.
3. **Dynamic Layers Engine** — `nu-dynamic-layers.js`: owns low-cost atmospheric particles on a separate transparent canvas. It uses the core budget, pauses on hidden tabs, and disables itself for Reduced Motion or economy tier.
4. **Game Render Adapter** — `nu-game-render-adapter.js`: exposes display-budget CSS variables and tier metadata to the existing game stage. It does not alter pointer input, collisions, XP, Mana, HP, game timers or persistence.

`nu-graphics-runtime.js` starts the engines after the existing `nu:calibrated` event and passes one shared profile.

## Platform strategy
This is a platform-neutral web runtime with platform detection and a narrow adapter boundary. Android, iOS, desktop and other browsers currently use the same web renderer with separate budget caps. Native Android/iOS renderer implementations and native bridge integrations are not included in this first web demo step.

## Rendering strategy
- Background artwork is the visual base.
- Existing sky and pixel-world layers are retained at reduced opacity.
- Dynamic atmospheric effects are composited independently.
- Existing game canvas remains the top gameplay surface.
- Low-tier devices receive fewer/no particles, lower DPR and capped background work.
- Once sampled, the profile is locked; no continuous device benchmark loop runs.

## Known limitations / acceptance blockers
- The background references the archived PNG directly. Runtime loading still requires the archive asset URL to remain publicly readable and reachable.
- The existing Generation 1 pixel-world renderer still has its own animation loop and timer; this change does not refactor that protected engine.
- Game FPS budget is exposed to the stage but does not yet throttle the legacy game simulation loop.
- No real-device Android/iOS/browser human test has been performed.
- No production deployment has been changed.

## Preservation invariants
Do not rewrite `nu-engine.js`, `nu-pixel-world.js`, game mechanics, collision/input logic, economy state, or save formats as part of this graphics layer. Any later change requires separate regression evidence.
