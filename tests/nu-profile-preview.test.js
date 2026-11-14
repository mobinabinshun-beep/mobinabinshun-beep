const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("nu-world.css", "utf8");
const playerUi = fs.readFileSync("nu-player-ui.js", "utf8");

test("restores the first Gen1 display-only profile placeholder", () => {
  assert.match(html, /<h2>N\.U PLAYER PROFILE<\/h2>/);
  assert.match(html, /class="demo-avatar"/);
  for (const id of ["demo-name","demo-call","demo-family","demo-age"]) assert.ok(html.includes('id="'+id+'"'));
  assert.match(html, /DEMO ONLY · NO UPLOAD/);
  assert.match(html, /Values are temporary and are not saved/);
});

test("the original profile uses the 150px image placeholder and two-column field grid", () => {
  assert.match(css, /\.demo-profile-card\{display:grid;grid-template-columns:150px 1fr/);
  assert.match(css, /\.demo-profile-fields\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:600px\)\{\.demo-profile-card\{grid-template-columns:1fr\}/);
});

test("the historical profile stays display-only while exposing three temporary appearance controls", () => {
  assert.doesNotMatch(html, /player-id-number|player-rank-hue|player-identity-save/);
  for (const id of ["demo-card-hue","demo-card-tone","demo-card-lightness"]) assert.ok(html.includes('id="'+id+'"'));
  assert.match(html, /CARD APPEARANCE · DEMO CONTROLS/);
  assert.ok(html.indexOf('class="demo-profile-card"') < html.indexOf('class="demo-profile-appearance"'));
  assert.match(css, /#demo-card-hue::-webkit-slider-runnable-track/);
  assert.match(css, /#demo-card-tone::-webkit-slider-runnable-track/);
  assert.match(css, /#demo-card-lightness::-webkit-slider-runnable-track/);
  assert.match(html, /saved appearance settings are available/);
  assert.match(playerUi, /if\(!\$\("player-id"\)\)return/);
  assert.match(playerUi, /demo-profile-warning/);
  assert.match(playerUi, /demo-profile-close/);
  assert.match(playerUi, /applyAppearance\(true\)/);
  assert.match(playerUi, /--demo-card-hue/);
  assert.match(playerUi, /--demo-neutral-alpha/);
});
