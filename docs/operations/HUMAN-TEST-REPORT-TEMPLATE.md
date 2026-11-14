# N.U Public Demo — Human Test Report

Use one copy per tester and per public-demo build/session. Complete this report from the published public N.U demo (or an explicitly approved public demo preview), not from GitHub source pages, local files, localhost or developer-only environments. Do not include passwords, account identifiers, private addresses or other personal data.

## Build and public test target
- Public demo URL:
- Build / deployed commit identifier:
- Deployment date/time (include timezone):
- Test session date/time (include timezone):
- Tester alias (optional):
- Team / member group (optional):
- Device / model:
- OS / version:
- Browser / version:
- Viewport (width × height):
- Input: mouse / touch / keyboard / pen
- Reduced motion: on / off
- Network profile (optional):

**Readiness check:** Confirm the public demo is serving the build identifier above before testing. If the build cannot be verified, mark the session NOT READY / HUMAN-QA-PENDING and do not substitute source inspection or local execution.

## Scenarios
For each scenario, record expected and actual behavior, PASS / FAIL / NOT RUN, and reproducibility.

| Scenario | Expected result | Actual result | PASS / FAIL / NOT RUN | Reproducible? |
|---|---|---|---|---|
| Main home | Hex gateway icon is absent outside its approved active-game scope | | | |
| Gameplay identity | Game title centered; N.U mark upper-left | | | |
| LV + resources | LV lower-left; XP and Mana values inside capsules | | | |
| Gateway | Only approved Back, Menu and Settings actions appear; routes work | | | |
| Gateway pause | Game pauses while gateway is open and resumes on outside exit | | | |
| HP damage | HP frame opens space and capsule docks as specified | | | |
| HP capsule use | Capsule is usable and returns when HP is restored | | | |
| N-BI indicator | Meter follows implemented behavior; no unsupported claim of damage absorption | | | |
| Reduced motion | Controls remain usable without essential animation | | | |
| Responsive layout | No clipped controls or horizontal overflow | | | |
| Regression | Round, wallet, XP, Mana and other navigation still work | | | |

## Defects
- Steps to reproduce:
- Expected:
- Actual:
- Severity: blocker / major / minor / visual
- Frequency:
- Screenshot or video reference (optional):
- Related issue / report link (optional):

## Feedback
- What felt clear and responsive?
- What should be adjusted?
- Can this exact public demo build be accepted for the next demo stage? yes / no / with changes

## Session result
- Overall: PASS / FAIL / NOT RUN
- Evidence state: HUMAN-QA-PENDING / HUMAN-QA-PASSED / HUMAN-QA-FAILED
- Additional notes:

A session can support HUMAN-QA-PASSED only when the public URL and deployed build are identified and device, OS, browser, viewport, input mode and scenario outcomes are recorded. CI or source review alone cannot produce HUMAN-QA-PASSED.


## Generation 1 Exchange — asset history and market visualization

| Scenario | Expected result | Actual result | PASS / FAIL / NOT RUN | Reproducible? |
|---|---|---|---|---|
| Open Exchange | Exchange opens from the public N.U demo navigation and returns to the world | | | |
| Asset selector | Lists only implemented Generation 1 assets; HP is excluded | | | |
| Balance summary | Matches the selected asset in the local wallet | | | |
| History chart | Shows balance changes derived from saved transaction deltas only | | | |
| Market simulation | Explicitly labelled simulated/visual-only; not a real price or forecast | | | |
| Candles and wicks | Candle bodies and deterministic high/low wicks render consistently | | | |
| Index and volume | Optional index line and activity-volume bars toggle independently | | | |
| Replay / reduced motion | Replay changes presentation only; reduced-motion mode remains usable | | | |
| Ledger invariance | Chart controls and replay do not change wallet balances or transaction count | | | |
| Transfer guard | Cross-game transfer/settlement remains disabled | | | |
| Refresh / local save | Recorded history persists in the same browser profile | | | |
| Mobile / accessibility | Chart remains legible; controls work with touch and keyboard | | | |

**Exchange chart interpretation:** the asset-history chart reconstructs local balance changes from signed transaction deltas. The separate market simulation is fictional and visual-only; it is not a market valuation, order book, trading signal, or profit/loss curve. The current ledger is browser-local and is not server-authoritative or synchronized across devices.
