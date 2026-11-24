const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const home = fs.readFileSync("index.html", "utf8");
const page = fs.readFileSync("sim-pixel-demo.html", "utf8");

test("SIM PIXEL is listed immediately after Painting in the public demo menu", () => {
  const painting = '<a class="menu-item" href="./pixel-art-studio.html"><span>PAINTING</span><kbd>A</kbd></a>';
  const simPixel = '<a class="menu-item" href="./sim-pixel-demo.html"><span>SIM PIXEL</span><kbd>SP</kbd></a>';
  assert.ok(home.includes(painting + "\n     " + simPixel));
});

test("SIM PIXEL movement slice exposes six Pixels and four movement modes", () => {
  for (const marker of ['id="world"', "Player Pixel", "NPC 05", 'data-mode="Chill"', 'data-mode="Normal"', 'data-mode="Hurry"', 'data-mode="Escape"']) {
    assert.ok(page.includes(marker), "missing " + marker);
  }
});

test("SIM PIXEL provides a local human-test report and declares prototype limits", () => {
  assert.ok(page.includes('id="report"'));
  assert.ok(page.includes("sim-pixel-human-test-report.json"));
  assert.ok(page.includes("collision avoidance"));
  assert.ok(page.includes("Nothing is uploaded"));
});

test("SIM PIXEL remains isolated from N.U runtime and shared data systems", () => {
  assert.ok(page.includes("no changes to N.U Runtime, Manifest, Launcher, shared save, or wallet"));
  assert.doesNotMatch(page, /nu-engine\.js|NUWallet|localStorage|sessionStorage/);
});
