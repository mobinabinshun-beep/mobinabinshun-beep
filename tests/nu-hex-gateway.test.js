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

test("Gateway markup remains present while controller activation is limited to gameplay and wallet", () => {
  for (const page of [html, casino, launcher, studio]) {
    assert.match(page, /id="nu-hex-gateway"/);
    assert.match(page, /class="nu-gateway-scrim"/);
  }
  assert.match(html, /nu-hex-gateway\.css\?v=20261114-wallet-gateway-r1/);
  assert.match(html, /nu-hex-gateway\.js\?v=20261114-wallet-gateway-r1/);
  assert.match(js, /if \(!root \|\| !scrim \|\| !gameView \|\| !walletView\) return/);
  assert.match(js, /classList\.toggle\("nu-game-active", gameActive\)/);
  assert.match(js, /classList\.toggle\("nu-main-game-page", gameActive\)/);
  assert.match(css, /body\.nu-game-active #nu-hex-gateway/);
  assert.match(css, /body\.nu-game-active \.nu-gateway-scrim/);
  assert.match(js, /gameView\?\.classList\.contains\("active"\)/);
  assert.match(js, /walletView\?\.classList\.contains\("active"\)/);
  assert.match(css, /body\.nu-wallet-active #nu-hex-gateway/);
});

test("Gateway replaces the persistent top navigation during gameplay; wallet scope remains unchanged", () => {
  assert.match(js, /gameView\?\.classList\.contains\("active"\)/);
  assert.match(js, /MutationObserver/);
  assert.match(css, /body\.nu-wallet-active #menu-open,body\.nu-game-active \.topbar\{display:none!important\}/);
  assert.doesNotMatch(css, /#finish-round[^{}]*display:none/);
  assert.match(html, /id="menu-open"/);
  assert.match(html, /id="finish-round"/);
});

test("touch activates an item on release while mouse hover and click retain separate paths", () => {
  assert.match(js, /pointerType !== "touch"/);
  assert.match(js, /suppressClickUntil/);
  assert.match(js, /pointerType === "mouse"/);
  assert.match(js, /hoverTimer = window\.setTimeout/);
  assert.match(js, /clickArmed === item/);
  assert.match(js, /clearTimeout\(activationTimer\)/);
  assert.match(js, /event\.key === "Escape"/);
});

test("outside exit uses the 10px tolerance and returns gameplay to its prior state", () => {
  assert.match(js, /const tolerance = 10/);
  assert.match(js, /performance\.now\(\) - outsideSince > 110/);
  assert.match(js, /pauseGame\(\)/);
  assert.match(js, /resumeGame\(\)/);
  assert.match(css, /background:rgba\(3,12,20,\.28\)/);
  assert.doesNotMatch(css, /body\.nu-gateway-open \.world[^{}]*filter:blur/);
});

test("Gateway is compact, fixed, responsive and does not create boxed menu cards", () => {
  assert.match(css, /position:fixed/);
  assert.match(css, /top:14px;right:14px;width:48px;height:48px/);
  assert.match(css, /right:clamp\(12px,2\.4vw,28px\)/);
  assert.match(css, /scale\(1\.2\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /const radius = compact \? 82 : 94/);\n  assert.match(js, /function layoutItems\(\)/);
  assert.match(js, /window\.addEventListener\("resize",layoutItems/);
  assert.match(js, /window\.addEventListener\("orientationchange",layoutItems/);
});

test("Gateway destinations remain isolated from game rules and Casino stays linked", () => {
  for (const action of ["back","profile","settings"]) {
    assert.match(html, new RegExp('data-action="' + action + '"'));
    assert.match(js, new RegExp(action + ":"));
  }
  assert.match(html, /href="\.\/casino\.html"/);
  assert.match(js, /menu-profile.*click/);
  assert.match(js, /menu-store.*click/);
  assert.doesNotMatch(html, /data-action="(library|store|wallet|launcher|studio|casino|resume)"/);
  assert.doesNotMatch(js, /nu-engine\.js|nu-games\.js|nu-wallet\.js/);
});

test("unsupported N-BI shield meter is not rendered", () => {
  assert.doesNotMatch(html, /id="nbi-shield-bar"/);
});
