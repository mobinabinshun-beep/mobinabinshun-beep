const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const html = fs.readFileSync("index.html", "utf8");
const js = fs.readFileSync("nu-hex-gateway.js", "utf8");
const css = fs.readFileSync("nu-hex-gateway.css", "utf8");

test("gateway is mounted as a persistent platform-level navigation control", () => {
  assert.match(html, /id="nu-hex-gateway"/);
  assert.match(html, /class="nu-gateway-trigger"/);
  assert.match(html, /nu-hex-gateway\.css/);
  assert.match(html, /nu-hex-gateway\.js/);
  assert.match(html, /class="nu-gateway-scrim"/);
});

test("gateway exposes the seven requested destinations", () => {
  for (const action of ["back", "library", "store", "wallet", "profile", "launcher", "studio"]) {
    assert.match(html, new RegExp('data-action="' + action + '"'));
    assert.match(js, new RegExp(action + ":"));
  }
});

test("gateway supports hover, click confirmation, keyboard escape and outside exit", () => {
  assert.match(js, /pointerenter/);
  assert.match(js, /addEventListener\("click"/);
  assert.match(js, /addEventListener\("keydown"/);
  assert.match(js, /event\.key === "Escape"/);
  assert.match(js, /tolerance = 10/);
  assert.match(js, /is-confirming/);
  assert.match(js, /clickArmed === item/);
  assert.match(js, /item\.tabIndex = open \? 0 : -1/);
});

test("opening the gateway pauses an active round and restores it on dismissal", () => {
  assert.match(js, /pauseGame\(\)/);
  assert.match(js, /resumeGame\(\)/);
  assert.match(js, /finish-round/);
  assert.match(css, /backdrop-filter:blur\(5px\)/);
  assert.match(css, /scale\(1\.2\)/);
});

test("gateway remains isolated from frozen engine and game-rule modules", () => {
  assert.doesNotMatch(js, /nu-engine\.js|nu-games\.js|nu-wallet\.js/);
  assert.match(css, /prefers-reduced-motion/);
});
