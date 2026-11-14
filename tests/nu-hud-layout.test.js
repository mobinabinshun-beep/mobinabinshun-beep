const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("nu-world.css", "utf8");
const games = fs.readFileSync("nu-games.js", "utf8");

test("N.U identity and game title remain unchanged; LV leads the lower resource stack", () => {
  assert.match(html, /class="brand">N\\.U/);
  assert.match(html, /NIROO UNIVERSE/);
  assert.match(html, /id="game-title"/);
  assert.match(html, /<div class="hud"><span class="hud-chip">N\\.U · GEN 01<\\/span><span class="hud-chip">10 ACTIONS<\\/span><\\/div>/);
  assert.match(html, /<div class="bars"><span class="hud-chip" id="level-chip">LV 1<\\/span><div class="bar-wrap">[\\s\\S]*?XP CAPSULE[\\s\\S]*?MANA CAPSULE/);
});

test("XP and Mana retain classic labels above their bars and values in the rails", () => {
  assert.match(html, /bar-label">XP CAPSULE/);
  assert.match(html, /bar-label">MANA CAPSULE/);
  assert.match(html, /id="xp-value"/);
  assert.match(html, /id="mana-value"/);
  assert.match(css, /Classic resource HUD restoration/);
  assert.match(css, /flex-direction:column;align-items:stretch/);
  assert.match(css, /bottom:15px;\\s*transform:none/);
  assert.match(css, /left:50%;right:auto;top:50%/);
});

test("classic lower HUD stacks LV, XP and Mana and adapts to mobile", () => {
  assert.match(css, /width:min\\(232px,calc\\(100vw - 24px\\)\\)/);
  assert.match(css, /@media\\(max-width:700px\\)/);
  assert.match(css, /width:min\\(204px,calc\\(100vw - 16px\\)\\)/);
});

test("HP capsule dock remains state-driven and reversibly animated", () => {
  assert.match(html, /id="hp-bar"/);
  assert.match(html, /id="hp-pill-use"/);
  assert.match(games, /function syncHpPillDock\\(hp\\)/);
  assert.match(games, /animateHpPillTravel\\("in"\\)/);
  assert.match(games, /animateHpPillTravel\\("out"\\)/);
  assert.match(games, /function useHpPill\\(/);
});

test("no unsupported N-BI shield meter is introduced", () => {
  assert.doesNotMatch(html, /id="nbi-shield-bar"/);
});
