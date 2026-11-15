# N.U Public Demo — Human Test Report

Use one copy per test session. Record observations against the exact deployed build. Do not include passwords, account identifiers, private addresses or other personal data.

## Session

- Test date/time (include timezone):
- Tester alias (optional):
- Demo URL:
- Candidate version / full commit SHA (if displayed):
- Device / model or general device class:
- OS / version:
- Browser / version:
- Viewport (width × height) and orientation:
- Input: mouse / touch / keyboard / assistive technology:
- Reduced motion: on / off:
- Network profile (optional):

## Scenario results

For each scenario, record expected and actual behavior, PASS / FAIL / BLOCKED / NOT APPLICABLE, and whether it is reproducible.

| Scenario | Expected result | Actual result | Outcome | Reproducible? |
|---|---|---|---|---|
| Home / startup | Home loads; calibration and entry work; no automatic game start | | | |
| Navigation | Home, Library and page navigation open and return correctly | | | |
| Game round | Misses do not count; successful actions advance 1/10–10/10 | | | |
| Pause / resume | Round progress and target state are preserved | | | |
| Wallet / Store | Local balances and item counts reflect the performed actions | | | |
| HP Capsule | One owned capsule is consumed; restore is capped by missing HP | | | |
| Casino | Virtual-only wager updates the local Casino Credits ledger | | | |
| Exchange | History reflects local transaction deltas; no fabricated market prices | | | |
| Profile | Temporary preview behaves as documented and clears on close | | | |
| Creative Studio | Editing and available exports work locally without implying upload | | | |
| Gateway visibility | Present only during an active Generation 1 game | | | |
| Gateway actions | Exactly Back, Menu and Profile; each route works | | | |
| Gateway pause | Round and decorative background pause; foreground remains usable | | | |
| Accessibility | Keyboard, focus and reduced-motion behavior remain usable | | | |
| Responsive layout | No clipped controls or horizontal overflow at tested viewport | | | |
| Regression | Existing game, HUD, wallet and navigation behavior remains intact | | | |

## Defects

For each failure:

- Affected page/module:
- Steps to reproduce:
- Expected:
- Actual:
- Severity: blocker / major / minor / visual
- Frequency: always / sometimes / once
- Screenshot or video reference (optional; redact personal data):

## Feedback and suggestions

- What felt clear and responsive?
- What was confusing or difficult?
- What should be adjusted?
- Additional observations:

## Tester conclusion (not release approval)

- Session result: PASS / FAIL / BLOCKED / PARTIAL
- Scenarios not tested and why:
- Retest recommended: yes / no

## Evidence and decision state

A submitted report is human-test evidence only. The overall release remains **HUMAN-QA-PENDING** until required reports are reviewed and the human owner records an explicit decision. A tester's session result does not by itself approve or reject the release.
