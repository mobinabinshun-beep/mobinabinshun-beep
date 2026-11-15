# Conversation archive — Gateway movement-first correction (2026-11-15)

Owner reports that Gateway is still selection-first although the intended controller is movement-first: hover with mouse should enter/execute; touch contact should open the paused Gateway and moving/contacting an option should enter it without a separate selection. The user explicitly limits the change to the Gateway controller.

Source review confirmed:
- the trigger opened only on click;
- pointerenter on options only highlighted them;
- touch action was deferred to pointerup;
- the current Gateway scope and Back/Menu/Profile route contract were already present.

Implementation on an isolated candidate:
- mouse/pen pointerenter opens the Gateway;
- touch pointerdown opens it and freezes the active game;
- mouse/pen pointerenter on an option activates it directly;
- touch pointerenter activates an option; document.elementFromPoint hit-testing supports finger drags under implicit touch pointer capture, with pointerup as fallback;
- duplicate activation is guarded;
- click/Enter remain accessible fallback paths;
- the existing scrim, pause ownership, route, scope and renderer event contracts are preserved.

Files changed in the product candidate: nu-hex-gateway.js, index.html, tests/nu-hex-gateway.test.js, docs/operations/NU-OPS-IMPLEMENT-01.md, docs/operations/GATEWAY-MENU-EXCHANGE-IMPLEMENTATION-2026-11-15.md, plus the implementation record and this archive. The cross-repository product rationale was also corrected in mobinabinshun-beep/Repository (commit 39bd31f604ddb78b5a78405b0332698c4e5c3049). No game, HUD, wallet, save, economy or non-game runtime was changed.

Backup: backup/pre-gateway-motion-controller-2026-11-15  
Candidate: fix/gateway-motion-controller-2026-11-15

CI and human device QA must be recorded separately. No merge or deployment is authorized by this implementation record.
