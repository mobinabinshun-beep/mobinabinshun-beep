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

test("Gateway is mounted only in the main game entry and enabled only during gameplay", () => {
  assert.match(html, /id="nu-hex-gateway"/);
  assert.match(html, /class="nu-gateway-scrim"/);
  for (const page of [casino, launcher, studio]) {
    assert.doesNotMatch(page, /id="nu-hex-gateway"/);
  }
  assert.match(js, /if \(!root \|\| !scrim \|\| !gameView\) return/);
  assert.match(js, /classList\.toggle\("nu-game-active", gameActive\)/);
  assert.doesNotMatch(js, /walletView|nu-wallet-active/);
  assert.match(css, /body\.nu-game-active #nu-hex-gateway/);
  assert.doesNotMatch(css, /nu-wallet-active/);
});

test("Gateway leaves Home, Library, wallet and the classic menu controls intact", () => {
  assert.match(html, /id="menu-open"/);
  assert.match(html, /id="finish-round"/);
  assert.match(js, /menu: \(\) => document\.getElementById\("menu-open"\)\?\.click\(\)/);
  assert.match(js, /back: goHome/);
  assert.doesNotMatch(css, /\.topbar\{display:none/);
  assert.match(html, /id="home-view"/);
  assert.match(html, /id="wallet-view"/);
});

test("Gateway offers only Back, Menu and Settings actions", () => {
  for (const action of ["back","menu","settings"]) {
    assert.match(html, new RegExp('data-action="' + action + '"'));
    assert.match(js, new RegExp(action + ":"));
  }
  assert.doesNotMatch(html, /data-action="(profile|store|wallet|library|launcher|studio|casino|resume)"/);
  assert.match(js, /window\.location\.href = "\.\/launcher\.html#settings-panel"/);
});

test("touch is direct; mouse hover and click confirmation are separate paths", () => {
  assert.match(js, /pointerType !== "touch"/);
  assert.match(js, /suppressClickUntil/);
  assert.match(js, /pointerType === "mouse"/);
  assert.match(js, /hoverTimer = window\.setTimeout/);
  assert.match(js, /clickArmed === item/);
  assert.match(js, /clearTimeout\(activationTimer\)/);
  assert.match(js, /event\.key === "Escape"/);
});

test("outside exit uses 10px tolerance and restores the gameplay state", () => {
  assert.match(js, /const tolerance = 10/);
  assert.match(js, /performance\.now\(\) - outsideSince > 110/);
  assert.match(js, /pauseGame\(\)/);
  assert.match(js, /resumeGame\(\)/);
});

test("Gateway is compact, fixed, responsive, grows 20 percent and pulses selected items", () => {
  assert.match(css, /position:fixed/);
  assert.match(css, /scale\(1\.2\)/);
  assert.match(css, /nuHexPulse/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /function layoutItems\(\)/);
  assert.match(js, /window\.addEventListener\("resize",layoutItems/);
  assert.match(js, /window\.addEventListener\("orientationchange",layoutItems/);
});

test("opening Gateway freezes gameplay and blurs only the background, not foreground UI", () => {
  assert.match(js, /pauseButton\.click\(\)/);
  assert.match(css, /body\.nu-gateway-open \.world>#pixel-world/);
  assert.match(css, /body\.nu-gateway-open \.world>#world-canvas/);
  assert.doesNotMatch(css, /body\.nu-gateway-open \.shell\{/);
  assert.doesNotMatch(css, /backdrop-filter/);
});

test("N-BI shield UI is absent when no real shield state exists", () => {
  assert.doesNotMatch(html, /id="nbi-shield-bar"/);
});
