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
- document-level pointer/keyboard isolation blocks page handlers while open; wheel/context-menu and resize/orientation redraw paths are suppressed without disabling Gateway controls;
- the existing scrim, pause ownership, route, scope and renderer event contracts are preserved;
- Dynamic Layers internal `apply()` / `setMode()` redraw while frozen is a separate known issue tracked by PR #125 (CI PASS, not yet merged), intentionally not bundled into this controller-only correction.

Files changed in the product candidate: nu-hex-gateway.js, nu-hex-gateway.css, index.html, tests/nu-hex-gateway.test.js, docs/operations/NU-OPS-IMPLEMENT-01.md, docs/operations/GATEWAY-MENU-EXCHANGE-IMPLEMENTATION-2026-11-15.md, plus the implementation record and this archive. The cross-repository product rationale was also corrected in mobinabinshun-beep/Repository (commit c3f70441d7f84483acf6bf257f1e45eb05715f84). No game, HUD, wallet, save, economy or non-game runtime was changed.

Backup: backup/pre-gateway-motion-controller-2026-11-15  
Candidate: fix/gateway-motion-controller-2026-11-15

CI and human device QA must be recorded separately. No merge or deployment is authorized by this implementation record.
