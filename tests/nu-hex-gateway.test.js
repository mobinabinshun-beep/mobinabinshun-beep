const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const html = fs.readFileSync("index.html", "utf8");
const launcher = fs.readFileSync("launcher.html", "utf8");
const studio = fs.readFileSync("pixel-art-studio.html", "utf8");
const js = fs.readFileSync("nu-hex-gateway.js", "utf8");
const css = fs.readFileSync("nu-hex-gateway.css", "utf8");

test("gateway is mounted as a persistent navigation control on every internal page", () => {
  for (const page of [html, launcher, studio]) {
    assert.match(page, /id="nu-hex-gateway"/);
    assert.match(page, /nu-hex-gateway\.css/);
    assert.match(page, /nu-hex-gateway\.js\?v=20261113-hex-gateway-r2/);
    assert.match(page, /class="nu-gateway-scrim"/);
  }
});

test("gateway exposes eight destinations including return to game", () => {
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

test("launcher and studio destinations can route back into main views", () => {
  assert.match(js, /new URLSearchParams/);
  assert.match(js, /window\.location\.href = "\.\/index\.html\?view="/);
  assert.match(js, /openMainView\("wallet"\)/);
  assert.match(js, /openMainView\("profile"\)/);
  assert.match(js, /actionKey === "resume"/);
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


test("gateway is scoped to active game views and dedicated mini-games", () => {
  const js = read("nu-hex-gateway.js");
  const css = read("nu-hex-gateway.css");
  const index = read("index.html");
  const launcher = read("launcher.html");
  const studio = read("pixel-art-studio.html");
  const casino = read("casino.html");
  assert.match(js, /nu-gateway-enabled/);
  assert.match(js, /gameView\?\.classList\.contains\("active"\)/);
  assert.match(css, /body\.nu-gateway-enabled #nu-hex-gateway/);
  assert.match(css, /body\.nu-game-active #menu-open/);
  assert.match(index, /id="nu-hex-gateway"/);
  assert.match(casino, /id="nu-hex-gateway"/);
  assert.doesNotMatch(launcher, /nu-hex-gateway/);
  assert.doesNotMatch(studio, /nu-hex-gateway/);
});
