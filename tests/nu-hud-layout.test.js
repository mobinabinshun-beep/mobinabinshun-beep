const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("nu-world.css", "utf8");
const games = fs.readFileSync("nu-games.js", "utf8");

test("N.U brand and gameplay title remain present; LV leads the classic lower resource stack", () => {
  assert.match(html, /class="brand">N\.U/);
  assert.match(html, /NIROO UNIVERSE/);
  assert.match(html, /id="game-title"/);
  assert.match(html, /<div class="hud"><span class="hud-chip">N\.U · GEN 01<\/span><span class="hud-chip">10 ACTIONS<\/span><\/div>/);
  assert.match(html, /<div class="bars"><span class="hud-chip" id="level-chip">LV 1<\/span><div class="bar-wrap">[\s\S]*?XP CAPSULE[\s\S]*?MANA CAPSULE/);
  assert.doesNotMatch(html, /<div class="hud">[^<]*<span class="hud-chip" id="level-chip"/);
});

test("XP and Mana labels and values are rendered inside their capsule rails", () => {
  assert.match(html, /bar-label">XP CAPSULE/);
  assert.match(html, /bar-label">MANA CAPSULE/);
  assert.match(html, /id="xp-value"/);
  assert.match(html, /id="mana-value"/);
  assert.match(css, /Classic resource HUD restoration — LV first, XP and Mana rails stacked beneath/);\n  assert.match(css, /flex-direction:column;align-items:stretch/);\n  assert.match(css, /\.bar-label\{\s*position:absolute;left:0;right:auto;top:auto;bottom:15px/);
  assert.match(css, /\.bar-value\{\s*position:absolute;left:50%;right:auto;top:50%/);
});

test("lower HUD uses a compact responsive three-column rail", () => {
  assert.match(css, /grid-template-columns:auto minmax\(0,1fr\) minmax\(0,1fr\)/);
  assert.match(css, /grid-template-areas:"level xp mana"/);
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /@media\(max-width:360px\)/);
});

test("HP capsule dock remains state-driven and reversibly animated", () => {
  assert.match(html, /id="hp-bar"/);
  assert.match(html, /id="hp-pill-use"/);
  assert.match(games, /function syncHpPillDock\(hp\)/);
  assert.match(games, /animateHpPillTravel\("in"\)/);
  assert.match(games, /animateHpPillTravel\("out"\)/);
  assert.match(games, /function useHpPill\(/);
});

test("no unsupported N-BI shield meter is introduced", () => {
  assert.doesNotMatch(html, /id="nbi-shield-bar"/);
});
