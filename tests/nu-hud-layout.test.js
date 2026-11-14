const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("nu-world.css", "utf8");
const games = fs.readFileSync("nu-games.js", "utf8");

test("N.U identity and game title remain unchanged; LV leads the lower resource stack", () => {
  assert.ok(html.includes('class="brand">N.U'));
  assert.ok(html.includes("NIROO UNIVERSE"));
  assert.ok(html.includes('id="game-title"'));
  assert.ok(html.includes('<div class="hud"><span class="hud-chip">N.U · GEN 01</span><span class="hud-chip">10 ACTIONS</span></div>'));
  assert.ok(html.includes('<div class="bars"><span class="hud-chip" id="level-chip">LV 1</span><div class="bar-wrap">'));
  assert.ok(html.indexOf('id="level-chip"') < html.indexOf('bar-label">XP CAPSULE'));
  assert.ok(html.indexOf('bar-label">XP CAPSULE') < html.indexOf('bar-label">MANA CAPSULE'));
});

test("XP and Mana retain classic labels above their bars and values in the rails", () => {
  assert.ok(html.includes('bar-label">XP CAPSULE'));
  assert.ok(html.includes('bar-label">MANA CAPSULE'));
  assert.ok(html.includes('id="xp-value"'));
  assert.ok(html.includes('id="mana-value"'));
  assert.ok(css.includes("Classic resource HUD restoration"));
  assert.ok(css.includes("flex-direction:column;align-items:stretch"));
  assert.ok(css.includes("bottom:15px"));
  assert.ok(css.includes("left:50%;right:auto;top:50%"));
});

test("classic lower HUD stacks LV, XP and Mana and adapts to mobile", () => {
  assert.ok(css.includes("width:min(232px,calc(100vw - 24px))"));
  assert.ok(css.includes("@media(max-width:700px)"));
  assert.ok(css.includes("width:min(204px,calc(100vw - 16px))"));
});

test("HP capsule dock remains state-driven and reversibly animated", () => {
  assert.ok(html.includes('id="hp-bar"'));
  assert.ok(html.includes('id="hp-pill-use"'));
  assert.ok(games.includes("function syncHpPillDock(hp)"));
  assert.ok(games.includes('animateHpPillTravel("in")'));
  assert.ok(games.includes('animateHpPillTravel("out")'));
  assert.ok(games.includes("function useHpPill("));
});

test("no unsupported N-BI shield meter is introduced", () => {
  assert.ok(!html.includes('id="nbi-shield-bar"'));
});
