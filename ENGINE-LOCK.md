# N.U Adaptive Runtime & Network Diagnostics — Frozen Baseline

**Status:** FROZEN / READ-ONLY BASELINE  
**Freeze date:** 2026-11-09  
**Repository:** mobinabinshun-beep/mobinabinshun-beep

The approved baseline files below are not to be edited as part of routine game or visual development. Any future engine change must be proposed as a separately versioned release (for example, v0.2), tested against the baseline, and explicitly approved before replacing it.

| Component | File | Frozen blob SHA |
|---|---|---|
| Adaptive runtime / render sampler | `nu-engine.js` | `cda4f4157628aefaaac9ab95c047e4ca818c5f02` |

## Scope and honest measurement limits

- The render sampler uses a short, bounded browser-frame observation plus available browser hints such as hardware concurrency, device memory and Save-Data. It does not stress-test hardware and does not read exact CPU/GPU utilization.
- The ten quality levels are conservative presentation tiers, not a promise that every game or device can sustain a particular frame rate.
- Network diagnostics perform four small same-origin requests to the N.U site and report their response times and failed-probe ratio. This is a site-reachability diagnostic, not a general Internet speed test and not true packet-loss measurement.
- The displayed downlink estimate, when present, comes from the browser Network Information API and is not a measured throughput test.
- No benchmark or network test should generate sustained load. Keep the existing short diagnostic bounded.

## Change-control rules

1. Do not edit `nu-engine.js` in feature/game commits.
2. Keep game visuals, economy, camera, HUD and interaction logic in their own versioned files.
3. If an engine improvement becomes necessary, create a separate candidate file and version; do not overwrite this frozen baseline.
4. Test old saves and low-capability devices before considering migration.
5. Do not claim hardware safety, universal platform translation, true packet loss or measured broadband throughput.

This freeze protects the currently approved runtime while N.U moves into visual and gameplay development.
