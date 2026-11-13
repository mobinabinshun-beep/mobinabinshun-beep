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

test("gateway is mounted on every internal Generation 1 page", () => {
  for (const page of [html, casino, launcher, studio]) {
    assert.match(page, /id="nu-hex-gateway"/);
    assert.match(page, /nu-hex-gateway\.css\?v=20261113-hex-gateway-calibration-r1/);
    assert.match(page, /nu-hex-gateway\.js\?v=20261113-hex-gateway-calibration-r1/);
    assert.match(page, /class="nu-gateway-scrim"/);
  }
});

test("gateway remains available across all views in the main world", () => {
  assert.match(js, /classList\.add\("nu-gateway-enabled"\)/);
  assert.match(js, /gameView\?\.classList\.contains\("active"\)/);
  assert.match(js, /MutationObserver/);
  assert.match(css, /body\.nu-gateway-enabled #nu-hex-gateway/);
});

test("touch activates an item on release while mouse hover and click retain separate paths", () => {
  assert.match(js, /pointerType !== "touch"/);
  assert.match(js, /suppressClickUntil/);
  assert.match(js, /pointerType === "mouse"/);
  assert.match(js, /hoverTimer = window\.setTimeout/);
  assert.match(js, /clickArmed === item/);
  assert.match(js, /event\.key === "Escape"/);
});

test("outside exit uses the 10px tolerance and returns gameplay to its prior state", () => {
  assert.match(js, /const tolerance = 10/);
  assert.match(js, /performance\.now\(\) - outsideSince > 110/);
  assert.match(js, /pauseGame\(\)/);
  assert.match(js, /resumeGame\(\)/);
  assert.match(css, /backdrop-filter:blur\(6px\)/);
});

test("gateway is compact, fixed, responsive and does not create boxed menu cards", () => {
  assert.match(css, /position:fixed/);
  assert.match(css, /top:clamp\(118px,17vh,154px\)/);
  assert.match(css, /right:clamp\(12px,2\.4vw,28px\)/);
  assert.match(css, /scale\(1\.2\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /function layoutItems\\(\\)/);
  assert.match(js, /window\\.addEventListener\\("resize",layoutItems/);
  assert.match(js, /window\\.addEventListener\\("orientationchange",layoutItems/);
});

test("gateway exposes the navigation destinations and remains isolated from game rules", () => {
  for (const action of ["back","library","store","wallet","profile","launcher","studio","casino","resume"]) {
    assert.match(html, new RegExp('data-action="' + action + '"'));
    assert.match(js, new RegExp(action + ":"));
  }
  assert.doesNotMatch(js, /nu-engine\.js|nu-games\.js|nu-wallet\.js/);
});
