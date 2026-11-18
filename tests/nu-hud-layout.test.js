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
  assert.doesNotMatch(html,/10 ACTIONS|N.U · GEN 01/);
  assert.ok(html.includes('<div class="bars"><span class="hud-chip" id="level-chip">LV 1</span><div class="bar-wrap">'));
  assert.ok(html.indexOf('id="level-chip"') < html.indexOf('bar-label">XP CAPSULE'));
  assert.ok(html.indexOf('bar-label">XP CAPSULE') < html.indexOf('bar-label">MANA CAPSULE'));
});

test("XP rail spans the bottom edge while Mana remains a compact left rail", () => {
  assert.ok(html.includes('bar-label">XP CAPSULE'));
  assert.ok(html.includes('bar-label">MANA CAPSULE'));
  assert.ok(html.includes('id="xp-value"'));
  assert.ok(html.includes('id="mana-value"'));
  assert.ok(css.includes("Owner-authorized restoration — XP rail spans the full bottom edge in all three Gen 1 games."));
  assert.ok(css.includes("position:fixed;left:0;right:0;bottom:0;width:100vw;"));
  assert.ok(css.includes("order:3;width:100vw;max-width:none;height:12px;flex-basis:12px;"));
  assert.ok(css.includes("order:1;width:min(232px,calc(100vw - 24px));margin-left:12px;"));
  assert.ok(css.includes("order:2;position:static;display:flex;align-self:flex-start;"));
  assert.ok(css.includes("@media(prefers-reduced-motion:reduce)"));
});

test("full-width XP rail and compact Mana rail adapt to mobile", () => {
  assert.ok(css.includes("@media(max-width:700px)"));
  assert.ok(css.includes("width:min(204px,calc(100vw - 16px));margin-left:8px;"));
  assert.ok(css.includes("width:100vw;max-width:none;margin:0;border-radius:0;"));
});

test("HP capsule dock remains state-driven and reversibly animated", () => {
  assert.ok(html.includes('id="hp-bar"'));
  assert.ok(html.includes('id="hp-pill-use"'));
  assert.ok(games.includes("function syncHpPillDock()"));
  assert.ok(games.includes('animateHpPillTravel("in")'));
  assert.ok(games.includes('animateHpPillTravel(shouldShow?"in":"out")'));
  assert.ok(games.includes("function useHpPill("));
});

test("no unsupported N-BI shield meter is introduced", () => {
  assert.ok(!html.includes('id="nbi-shield-bar"'));
});
