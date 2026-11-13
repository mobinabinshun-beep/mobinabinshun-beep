# N.U Creative Studio — Known-Good Freeze

**Freeze branch:** `freeze/studio-known-good-2026-11-13`  
**Frozen baseline commit:** `6b6184b8154af26e247447bc9ce71ef13010af84`  
**Purpose:** Preserve the working image-import and editing baseline before export/report changes.

## Change-control

1. Treat the freeze branch as a read-only recovery point. Do not push feature work to it.
2. Make future Studio changes on a feature branch and merge them only after the graphics-preview workflow passes.
3. Keep import, analysis, compositing, SVG, PNG, and Graphic IR regression tests in the workflow.
4. Do not change the protected adaptive runtime or unrelated game/economy modules for Studio work.
5. If an export regression appears, compare against this frozen branch before attempting a repair.

## Enforcement note

This branch is a preserved snapshot. Repository branch-protection settings were not changed by this task; server-enforced protection must be enabled in GitHub repository settings by an administrator if required.
