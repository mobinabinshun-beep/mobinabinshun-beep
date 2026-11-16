"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("nu-games.js", "utf8");

test("empty HP capsule action explains the Store path when XP is sufficient", () => {
  assert.match(source, /result\.reason==="NO_HP_CAPSULE"\?\(state\.save\.xp>=NUWallet\.HP_PILL_COST\?"0 HP Capsules · open Store to buy one\."/);
});

test("empty HP capsule action explains the XP requirement when XP is insufficient", () => {
  assert.match(source, /"0 HP Capsules · earn 10 XP to unlock Store purchase\."/);
});

test("empty HP capsule action does not call wallet consumption or persist a changed save", () => {
  const handler = source.slice(source.indexOf("function useHpPill("), source.indexOf("function showCapsuleGain("));
  assert.ok(handler.indexOf("if(!result.ok)") < handler.indexOf("persistWalletState(result.state)"));
  assert.match(handler, /if\(!result\.ok\)\{[\s\S]*?announceTransaction\(message,"warning"\);return;/);
});
