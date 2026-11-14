# Background source-of-truth reconciliation
Date: 2026-11-14
Repository: `mobinabinshun-beep/mobinabinshun-beep`
Base branch: `Official-public-information-and-discovery-hub-for-N.U-(Niroo-Universe),-its-publishing-network,-projects,-publications-and-related-creative-works`
Base commit: `ef0ef2dff57cfde833e977e5b072597731d63ceb`
Working branch: `fix/background-source-of-truth-2026-11-14`

## Request and acceptance criteria
Reconcile the Material background copies, explain why the public demo can fail visual acceptance despite a successful file copy, preserve legacy overlays, and keep the graphics core unlocked pending human approval.

## Findings
- Canonical source: `mobinabinshun-beep/Repository/Material/Background.svg`, blob `63dd85a479354406cc5739f4603ccc1d0989e5b0`.
- Public runtime copy: `assets/backgrounds/niroo-universe-background.svg`, same blob SHA (byte-identical).
- Original PNG reference already exists at `assets/Original reference image file for Niroo Universe (N.U).png`, blob `d73afd484ef8b459c908c1942ee0f47d27f93aa5`.
- The active engine loads the SVG from a same-origin relative URL. An older README incorrectly described a missing PNG runtime copy and contradicted the active implementation.
- Legacy procedural sources are retained in `archive/visual-layers/`; the active runtime stops/disables them.
- The engine exposes `nu:background-ready`, `nu:background-missing`, and `NUBackgroundEngine.getStatus()`. Browser pixel-level acceptance cannot be proven by Git or static CI alone.

## Backup
Pre-change documentation archived under `archive/pre-change/2026-11-14-background-source-of-truth/` before documentation edits.

## Changes
- Reconciled `assets/README.md` with the actual canonical SVG runtime.
- Expanded `docs/background-assets-inventory-2026-11-14.md` to list the source SVG, public SVG, original PNG, candidate gallery, active engine, and archived procedural layers.
- Extended the background regression test to reject the stale missing-PNG instruction.
- No artwork bytes, engine behavior, UI overlays, or engine-lock files changed.

## Verification
- Source/public SVG blob SHA equality: verified from Git tree metadata.
- Public original PNG blob SHA: verified from Git tree metadata.
- Existing default-branch graphics preview smoke check: passed on base commit.
- Existing default-branch Pages deployment: succeeded on base commit.
- New branch automated CI: pending.
- Human desktop/mobile browser visual acceptance: pending; must be performed against the deployed public demo before engine lock.

## Release decision
Candidate A (canonical SVG image-first scene) is the only approved test candidate. Do not merge/promote or lock the graphics core until new CI passes and human visual acceptance is explicitly recorded.
