# N.U Public Demo — Human Test Report

Use one copy per test session. Do not include passwords, account identifiers, private addresses or other personal data.

## Session
- Test date/time (include timezone):
- Tester alias (optional):
- Device / model:
- OS / version:
- Browser / version:
- Viewport (width × height):
- Input: mouse / touch / keyboard
- Reduced motion: on / off
- Network profile (optional):

## Scenarios
For each scenario, record expected and actual behavior, pass/fail, and reproducibility.

| Scenario | Expected result | Actual result | Pass / Fail | Reproducible? |
|---|---|---|---|---|
| Main home | Hex gateway icon is absent | | | |
| Gameplay identity | Game title centered; N.U mark upper-left | | | |
| LV + resources | LV lower-left; XP and Mana values inside capsules | | | |
| Gateway | Only Back, Menu and Settings appear; routes work | | | |
| Gateway pause | Game pauses while gateway is open and resumes on outside exit | | | |
| HP damage | HP frame opens space and capsule slides to right dock | | | |
| HP capsule use | Capsule is usable and returns when HP is restored | | | |
| N-BI indicator | Meter collapses and recharges below HP; no claim of damage absorption | | | |
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

## Feedback
- What felt clear and responsive?
- What should be adjusted?
- Can this build be accepted for the next demo stage? yes / no / with changes

## Evidence state
Mark one: HUMAN-QA-PENDING / HUMAN-QA-PASSED

A test report is HUMAN-QA-PASSED only when device, OS, browser, viewport, input mode and scenario outcomes are recorded.


## Generation 1 Exchange — asset history chart

| Scenario | Expected result | Actual result | Pass / Fail | Reproducible? |
|---|---|---|---|---|
| Open Exchange | Exchange opens from the main N.U menu and returns to the world | | | |
| Asset selector | Lists only implemented Generation 1 assets, including Casino Credits | | | |
| Balance summary | Matches the selected asset in the local wallet | | | |
| History chart | Shows balance changes derived from saved transaction deltas only | | | |
| Transaction ledger | Signed delta, timestamp and reconstructed balance agree with wallet activity | | | |
| Casino history | A Coin Flip, Lucky Dice or Mini Slots round updates Casino Credits history only | | | |
| Store history | Buying/using an HP Capsule updates the appropriate XP / capsule / HP history | | | |
| Empty history | Clearly states there are no recorded changes; does not invent data | | | |
| Conversion guard | Swap remains disabled while pairs, rates, fees and limits are unapproved | | | |
| Refresh / local save | Recorded history persists in the same browser profile | | | |
| Mobile / accessibility | Chart remains legible; selector and links work with touch and keyboard | | | |

**Exchange chart interpretation:** this candidate plots local asset-balance history, not market prices or exchange rates. Do not report the line as a market valuation or profit/loss curve. The current ledger retains at most 40 transactions, and balances are browser-local.


## Change-stage identity (required for each independent stage)
- Change ID / stage:
- Repository / branch:
- Candidate commit SHA:
- Public Demo URL:
- Deployed commit/build SHA (must match the candidate):
- Deployment timestamp:
- Previous stage human decision / report link:
- Current decision: HUMAN-QA-PENDING / APPROVED / REJECTED / APPROVED-WITH-LIMITATIONS

## Neutral section background — four-section acceptance
| Scenario | Expected result | Actual result | Pass / Fail | Reproducible? |
|---|---|---|---|---|
| Exchange reference | Existing calm, static dark background remains intact | | | |
| Wallet backdrop | Same visual language as Exchange; only a subtle static teal cue | | | |
| Profile backdrop | Same visual language as Exchange; only a subtle static cool-violet cue | | | |
| Store backdrop | Same visual language as Exchange; only a subtle static muted-amber cue | | | |
| Entry-light cue | If enabled, exactly three brief pulses once on entry; no loop or lingering overlay | | | |
| Foreground safety | Text, cards, controls, charts and touch targets remain fully visible and interactive | | | |
| Performance | No noticeable slowdown, stutter, excess heat or persistent rendering activity | | | |
| Reduced motion | Entry cue is suppressed; all content and navigation remain usable | | | |
| Section lifecycle | Entering/leaving sections does not leave stale tint or light effects behind | | | |

**Stage progression rule:** this report belongs to one exact deployed revision. Do not advance to another independent change stage until the project owner records a decision above. Every follow-up revision needs a new report and retest.
