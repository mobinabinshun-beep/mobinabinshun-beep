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
- [ ] Export the JSON report and verify it contains no personal identifiers.

## Known gaps to report, not silently pass
- Per-game calibration preference is visible but not yet connected to the existing game entry points.
- Reports are exported locally; there is no server-side collection endpoint.
- This branch is not yet a deployed public Pages release.
- Native installers, signed extension packages, sandboxing and rollback are future work.
