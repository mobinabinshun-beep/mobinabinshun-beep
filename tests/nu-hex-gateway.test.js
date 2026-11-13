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

test("Gateway is detached from all live Generation 1 entry pages", () => {
  for (const page of [html, casino, launcher, studio]) {
    assert.doesNotMatch(page, /id="nu-hex-gateway"/);
    assert.doesNotMatch(page, /nu-gateway-scrim/);
    assert.doesNotMatch(page, /nu-hex-gateway\\.(?:css|js)/);
  }
});

test("archived Gateway controller retains its prior scope and observer logic", () => {
  assert.match(js, /classList\.add\("nu-gateway-enabled"\)/);
  assert.match(js, /gameView\?\.classList\.contains\("active"\)/);
  assert.match(js, /MutationObserver/);
  assert.match(css, /body\.nu-gateway-enabled #nu-hex-gateway/);
  assert.match(css, /body\.nu-gateway-enabled #menu-open/);
  assert.match(css, /body\.nu-gateway-enabled #wallet-back/);
});

test("archived Gateway controller retains touch and mouse interaction logic", () => {
  assert.match(js, /pointerType !== "touch"/);
  assert.match(js, /suppressClickUntil/);
  assert.match(js, /pointerType === "mouse"/);
  assert.match(js, /hoverTimer = window\.setTimeout/);
  assert.match(js, /clickArmed === item/);
  assert.match(js, /clearTimeout\(activationTimer\)/);
  assert.match(js, /event\.key === "Escape"/);
});

test("archived Gateway controller retains exit tolerance and gameplay restoration logic", () => {
  assert.match(js, /const tolerance = 10/);
  assert.match(js, /performance\.now\(\) - outsideSince > 110/);
  assert.match(js, /pauseGame\(\)/);
  assert.match(js, /resumeGame\(\)/);
  assert.match(css, /backdrop-filter:blur\(6px\)/);
});

test("archived Gateway styles retain responsive geometry and reduced-motion support", () => {
  assert.match(css, /position:fixed/);
  assert.match(css, /top:clamp\(118px,17vh,154px\)/);
  assert.match(css, /right:clamp\(12px,2\.4vw,28px\)/);
  assert.match(css, /scale\(1\.2\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /function layoutItems\(\)/);
  assert.match(js, /window\.addEventListener\("resize",layoutItems/);
  assert.match(js, /window\.addEventListener\("orientationchange",layoutItems/);
});

test("archived Gateway routes remain isolated from game rules", () => {
  for (const action of ["back","library","store","wallet","profile","launcher","studio","casino","resume"]) {
    assert.match(html, new RegExp('data-action="' + action + '"'));
    assert.match(js, new RegExp(action + ":"));
  }
  assert.doesNotMatch(js, /nu-engine\.js|nu-games\.js|nu-wallet\.js/);
});


test("Gateway remains visually frozen and unsupported N-BI shield UI stays absent", () => {
  assert.match(css, /#nu-hex-gateway,\.nu-gateway-scrim\{display:none!important\}/);
  assert.doesNotMatch(html, /id="nbi-shield-bar"/);
});
