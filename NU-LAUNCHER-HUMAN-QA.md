# N.U Launcher — human test checklist

## Before starting
- Confirm the test is on the launcher preview branch/site and note browser + OS (no personal identifiers).
- Verify the home page links to Launcher Calibration.

## Loading gate
- [ ] Launcher opens in the calm loading state.
- [ ] No game, plug-in, canvas scene, or heavy animation starts during calibration.
- [ ] Calibration completes with network available.
- [ ] Calibration completes with network unavailable.
- [ ] Browser with WebGL disabled receives a conservative fallback.
- [ ] Browser with deviceMemory/hardwareConcurrency hidden receives a conservative, low-confidence profile.
- [ ] Reduced-motion and Save-Data preferences are respected.

## Levels and settings
- [ ] Ten levels are selectable; level 10 is labelled the calibrated stable ceiling.
- [ ] Lower levels visibly lower optional effect/canvas budgets.
- [ ] Apply saves the selected profile and opens the demo separately.
- [ ] Saved-profile mode skips recalibration.
- [ ] Ask-every-launch shows the chooser each new session.
- [ ] Silent mode recalibrates without showing the chooser.
- [ ] Refresh runs calibration again.
- [ ] Reset clears the saved profile and restarts calibration.
- [ ] Settings close asks Yes/No; No stays in settings, Yes applies and returns.
- [ ] Settings path text explains how to reopen and change preferences.

## Human experience
- [ ] Check whether the loading wait feels calm and understandable.
- [ ] Check contrast, font scaling, keyboard navigation, touch target sizes and mobile layout.
- [ ] Check that no scary failure language appears for unavailable browser signals.
- [ ] Export the JSON report and verify it contains no personal identifiers.\n- [ ] Submit a test through the GitHub human-test issue form; optionally attach/paste the reviewed JSON report.

## Known gaps to report, not silently pass
- Per-game calibration preference is visible but not yet connected to the existing game entry points.
- Reports are exported locally; there is no server-side collection endpoint.
- This branch is not yet a deployed public Pages release.
- Native installers, signed extension packages, sandboxing and rollback are future work.


## Cross-generation package and data-boundary checks

These checks apply to the future operational launcher; mark them NOT IMPLEMENTED rather than passing them against the browser preview.

- [ ] Install one game package without reinstalling or modifying the launcher core.
- [ ] Install two independent games and verify each has a separate package identity, version and data namespace.
- [ ] Update one game and confirm the other game, shared player identity and all saves remain unchanged.
- [ ] Uninstall one game; verify its payload is removed but its save is preserved unless the user separately confirms data deletion.
- [ ] Confirm package discovery/manifest inspection never executes module entry points.
- [ ] Confirm unknown required capabilities block activation with a clear message; unknown optional fields do not break discovery.
- [ ] Confirm a module cannot raise the central resource ceiling or access another module's private storage.
- [ ] Confirm signature/hash validation, staging, atomic activation and last-known-good rollback on a deliberately failed package update.
- [ ] Confirm installed content, launcher settings, shared identity, per-game saves, canonical wallet, derived caches and user-created content remain separate.
- [ ] Confirm migrations are versioned, backed up, validated and recoverable; package updates do not reset player saves.
- [ ] Confirm Offline Browser is not described as Downloadable Launcher, and browser cache is not described as durable save backup.
- [ ] Confirm the same launcher contract can host a later-generation module without generation-specific launcher redesign, provided declared capabilities are supported.
- [ ] Confirm a core launcher update is not required for ordinary game/content updates.

### Current preview honesty checks

- [ ] UI/report says this branch is a browser preview, not a native installer/package manager.
- [ ] No claim of native Windows/macOS/Linux/Android/iOS package installation.
- [ ] No claim of a complete offline launcher; current manifest says offlineLauncher=false.
- [ ] Browser cache status is distinct from player-save persistence and backup.
- [ ] Human QA results are recorded separately from automated CI and production approval.
