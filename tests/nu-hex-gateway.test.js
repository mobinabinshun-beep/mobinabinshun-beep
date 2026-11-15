"use strict";
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
const games = read("nu-games.js");

test("Gateway controller is scoped only to an active main-game view", () => {
  assert.match(html, /id="nu-hex-gateway"/);
  assert.match(html, /nu-hex-gateway\.css\?v=20261115-main-game-only-r2/);
  assert.match(html, /nu-hex-gateway\.js\?v=20261115-main-game-only-r2/);
  assert.match(js, /if \(!root \|\| !scrim \|\| !gameView\) return/);
  assert.match(js, /classList\.toggle\("nu-game-active", gameActive\)/);
  assert.doesNotMatch(js, /walletView|nu-wallet-active/);
  assert.match(css, /body\.nu-game-active #nu-hex-gateway/);
  assert.doesNotMatch(css, /nu-wallet-active/);
});

test("Gateway stays absent from home and unrelated pages while legacy navigation remains", () => {
  assert.match(css, /#nu-hex-gateway,\.nu-gateway-scrim\{display:none\}/);
  for (const page of [casino, launcher, studio]) {
    assert.match(page, /id="nu-hex-gateway"/);
  }
  assert.match(html, /id="menu-open"/);
  assert.match(html, /id="finish-round"/);
  assert.match(html, /href="\.\/casino\.html"/);
});

test("Gateway exposes only Back, Menu and Settings destinations", () => {
  for (const action of ["back", "menu", "settings"]) {
    assert.match(html, new RegExp('data-action="' + action + '"'));
    assert.match(js, new RegExp(action + ":"));
  }
  assert.doesNotMatch(html, /data-action="(profile|store|wallet|casino|studio|library)"/);
  assert.match(js, /menu-open.*click/);
  assert.match(js, /window\.location\.href = "\.\/launcher\.html"/);
  assert.match(js, /menu-home[\s\S]*?home\.click/);
});

test("Touch activates on release; mouse hover and click confirmation stay distinct", () => {
  assert.match(js, /pointerType !== "touch"/);
  assert.match(js, /suppressClickUntil/);
  assert.match(js, /pointerType === "mouse"/);
  assert.match(js, /hoverTimer = window\.setTimeout/);
  assert.match(js, /clickArmed === item/);
  assert.match(js, /event\.key === "Escape"/);
});

test("Outside exit preserves the 10px boundary tolerance and resumes the game", () => {
  assert.match(js, /const tolerance = 10/);
  assert.match(js, /performance\.now\(\) - outsideSince > 110/);
  assert.match(js, /pauseGame\(\)/);
  assert.match(js, /resumeGame\(\)/);
  assert.match(css, /body\.nu-gateway-open \.world>\.sky/);
  assert.match(css, /filter:blur\(2\.5px\)/);
  assert.match(css, /backdrop-filter:none/);
});

test("Opening Gateway pauses both the game round and ambient world renderers", () => {
  assert.match(js, /nu:gateway-open/);
  assert.match(js, /nu:gateway-close/);
  assert.match(games, /state\.engine\.pause\(\)/);
  assert.match(games, /state\.engine\.resume\(\)/);
  assert.match(games, /NUPixelWorld\.setEnabled\(false\)/);
  assert.match(games, /NUPixelWorld\.setEnabled\(true\)/);
});

test("Gateway remains compact, fixed, responsive and respects reduced motion", () => {
  assert.match(css, /position:fixed/);
  assert.match(css, /top:clamp\(118px,17vh,154px\)/);
  assert.match(css, /right:clamp\(12px,2\.4vw,28px\)/);
  assert.match(css, /scale\(1\.2\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /function layoutItems\(\)/);
  assert.match(js, /window\.addEventListener\("resize",layoutItems/);
  assert.match(js, /window\.addEventListener\("orientationchange",layoutItems/);
});

test("No unsupported shield meter is introduced", () => {
  assert.doesNotMatch(html, /id="nbi-shield-bar"/);
});
