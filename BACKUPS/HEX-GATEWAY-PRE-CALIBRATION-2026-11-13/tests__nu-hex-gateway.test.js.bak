const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const read = name => fs.readFileSync(name, "utf8");
const html = read("index.html");
const casino = read("casino.html");
const launcher = read("launcher.html");
const studio = read("pixel-art-studio.html");
const js = read("nu-hex-gateway.js");
const css = read("nu-hex-gateway.css");

test("gateway is present only on the main game document, not casino or utility pages", () => {
  for (const page of [html]) {
    assert.match(page, /id="nu-hex-gateway"/);
    assert.match(page, /nu-hex-gateway\.css/);
    assert.match(page, /nu-hex-gateway\.js/);
    assert.match(page, /class="nu-gateway-scrim"/);
  }
  assert.doesNotMatch(casino, /nu-hex-gateway/);
  assert.doesNotMatch(launcher, /nu-hex-gateway/);
  assert.doesNotMatch(studio, /nu-hex-gateway/);
});

test("gateway appears in the main document only while an actual game view is active", () => {
  assert.match(js, /gameView\?\.classList\.contains\("active"\)/);
  assert.match(js, /nu-gateway-enabled/);
  assert.match(js, /MutationObserver/);
  assert.match(css, /body\.nu-gateway-enabled #nu-hex-gateway/);
  assert.match(css, /body\.nu-gateway-enabled \.nu-gateway-scrim/);
});

test("game view hides duplicate navigation and pause controls", () => {
  assert.match(css, /body\.nu-game-active #menu-open/);
  assert.match(css, /body\.nu-game-active #back-home/);
  assert.match(css, /body\.nu-game-active #finish-round/);
});

test("gateway exposes eight destinations", () => {
  for (const action of ["back", "library", "store", "wallet", "profile", "launcher", "studio", "resume"]) {
    assert.match(html, new RegExp('data-action="' + action + '"'));
    assert.match(js, new RegExp(action + ":"));
  }
});

test("gateway supports hover, two-step click, keyboard escape and 10px outside exit", () => {
  assert.match(js, /pointerenter/);
  assert.match(js, /addEventListener\("click"/);
  assert.match(js, /addEventListener\("keydown"/);
  assert.match(js, /event\.key === "Escape"/);
  assert.match(js, /tolerance = 10/);
  assert.match(js, /is-confirming/);
  assert.match(js, /clickArmed === item/);
  assert.match(js, /item\.tabIndex = open \? 0 : -1/);
});

test("gameplay pause and resume stay connected to the existing game control", () => {
  assert.match(js, /pauseGame\(\)/);
  assert.match(js, /resumeGame\(\)/);
  assert.match(js, /finish-round/);
  assert.match(css, /backdrop-filter:blur\(5px\)/);
  assert.match(css, /scale\(1\.2\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("gateway remains isolated from engine and game-rule modules", () => {
  assert.doesNotMatch(js, /nu-engine\.js|nu-games\.js|nu-wallet\.js/);
});
