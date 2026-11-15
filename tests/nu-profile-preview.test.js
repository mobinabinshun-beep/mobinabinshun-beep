const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("nu-world.css", "utf8");
const playerUi = fs.readFileSync("nu-player-ui.js", "utf8");

test("public profile preview remains available as a separate view", () => {
  assert.match(html, /id="profile-view" class="view"/);
  assert.match(html, /<h2>N\.U PLAYER PROFILE<\/h2>/);
  assert.match(html, /class="demo-profile-card"/);
  assert.match(html, /class="demo-profile-fields"/);
});

test("profile photo actions remain an explicitly disabled, privacy-safe demo", () => {
  assert.match(html, /id="demo-image-upload-preview"[^>]*type="button"/);
  assert.match(html, /id="demo-image-download-preview"[^>]*type="button"/);
  assert.match(html, /NO IMAGE IS READ, UPLOADED OR SAVED/);
  assert.doesNotMatch(html, /<input[^>]+type="file"/);
  assert.match(playerUi, /IMAGE UPLOAD AND RECOVERY ARE DISABLED/);
  assert.doesNotMatch(playerUi, /readAsDataURL|fetch\s*\(|XMLHttpRequest/);
});

test("profile preview keeps the compact two-action photo surface", () => {
  assert.equal((html.match(/id="demo-image-(?:upload|download)-preview"/g) || []).length, 2);
  assert.doesNotMatch(html, /data-demo-placement=/);
  assert.doesNotMatch(html, /photo-placement-grid|2x4/);
  assert.match(playerUi, /demo-image-upload-preview/);
  assert.match(playerUi, /demo-image-download-preview/);
});

test("appearance comparison controls are present and explicitly staged", () => {
  for (const id of ["demo-card-hue", "demo-card-tone", "demo-card-lightness", "demo-card-saturation"]) {
    assert.ok(html.includes('id="' + id + '"'), "missing " + id);
  }
  assert.match(html, /CARD APPEARANCE · DEMO CONTROLS/);
  assert.match(html, /confirm once to freeze appearance/);
  assert.match(playerUi, /applyAppearance\(true\)/);
  assert.match(playerUi, /--demo-card-saturation/);
});

test("privacy controls default to a private, local simulation", () => {
  assert.match(html, /All fields start private/);
  for (const id of ["demo-public-preview", "demo-private-preview", "demo-share-preview"]) {
    if (id === "demo-share-preview" && !html.includes('id="' + id + '"')) continue;
    assert.ok(html.includes('id="' + id + '"'), "missing " + id);
  }
  assert.match(playerUi, /NO DATA SENT/);
  assert.match(playerUi, /NOT AUTHENTICATED/);
});

test("wallet and player identity remain outside the display-only concept card", () => {
  assert.match(html, /id="wallet-view" class="view"/);
  assert.match(html, /id="profile-view" class="view"/);
  assert.match(playerUi, /if\(!\$\("player-id"\)\)return/);
});

test("profile preview layout remains responsive", () => {
  assert.match(css, /\.demo-profile-card\{display:grid/);
  assert.match(css, /@media\(max-width:600px\)\{\.demo-profile-card\{grid-template-columns:1fr\}/);
});
