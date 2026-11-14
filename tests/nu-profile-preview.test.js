const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("nu-world.css", "utf8");
const playerUi = fs.readFileSync("nu-player-ui.js", "utf8");

test("wallet tabs remain mounted before wallet panel content", () => {
  const panel = html.indexOf('<div class="glass wallet-panel">');
  const tabs = html.indexOf('class="wallet-card-tabs"');
  const balances = html.indexOf('data-wallet-panel="balances"');
  assert.ok(panel >= 0 && tabs > panel && balances > tabs);
  assert.match(css, /\.wallet-card-tabs\{position:relative;z-index:0/);
});

test("classic Player ID card restores the original identity and progression layout", () => {
  assert.match(html, /<h2>PLAYER ID CARD<\/h2>/);
  assert.match(html, /class="wallet-hologram-title">PLAYER PROFILE/);
  assert.match(html, /id="player-id"/);
  assert.match(html, /id="player-display-name"/);
  assert.match(html, /id="player-callsign"/);
  assert.match(html, /id="player-level"/);
  assert.match(html, /id="player-xp"/);
  assert.match(html, /id="player-hp"/);
  assert.match(html, /id="player-mana"/);
  assert.match(html, /id="player-xp-progress"/);
  assert.match(html, /id="player-identity-save"/);
  assert.match(html, /id="player-identity-reset"/);
  assert.match(playerUi, /function renderProfile\(\)/);
});

test("restored profile no longer exposes preview-mode or palette controls", () => {
  assert.doesNotMatch(html, /profile-mode-switch|profile-palette-panel|player-rank-hue/);
  assert.doesNotMatch(html, /nu-profile-preview\.js/);
});
