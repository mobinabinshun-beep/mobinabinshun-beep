"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("nu-world.css", "utf8");
const games = fs.readFileSync("nu-games.js", "utf8");

test("game interaction toast is polite, non-blocking and reduced-motion safe", () => {
  assert.match(html, /id="transaction-toast" class="transaction-toast" role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(css, /\.transaction-toast\{[^}]*pointer-events:none/);
  assert.match(css, /\.transaction-toast\{transition:none;transform:translate\(-50%,0\)\}/);
});

test("HP capsule icon announces success and unavailable actions", () => {
  assert.match(html, /id="hp-pill-use"[^>]*aria-label="Use HP pill"/);
  assert.match(games, /announceTransaction\("HP CAPSULE USED · \+"\+result\.restored\+" HP · −1 CAPSULE","success"\)/);
  assert.match(games, /announceTransaction\(message,"warning"\)/);
});

test("store and shield interactions reuse the shared transaction toast", () => {
  assert.match(games, /announceTransaction\("PURCHASE COMPLETE · −10 XP · \+1 CAPSULE","success"\)/);
  assert.match(games, /announceTransaction\("ARCANE SHIELD CHARGED · −10 MANA","success"\)/);
  assert.match(games, /function announceTransaction\(message,tone="success"\)/);
});
