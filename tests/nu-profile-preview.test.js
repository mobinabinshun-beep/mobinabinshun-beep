const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("nu-world.css", "utf8");
const js = fs.readFileSync("nu-profile-preview.js", "utf8");

test("wallet tabs are mounted before wallet panel content at the upper edge", () => {
  const panel = html.indexOf('<div class="glass wallet-panel">');
  const tabs = html.indexOf('class="wallet-card-tabs"');
  const balances = html.indexOf('data-wallet-panel="balances"');
  assert.ok(panel >= 0 && tabs > panel && balances > tabs);
  assert.match(css, /\.wallet-card-tabs\{align-items:flex-start;margin:-22px -22px 24px/);
  assert.match(css, /\.wallet-card-tab\{border-top:0;[\s\S]*?transform:translateY\(9px\)/);
  assert.match(css, /\.wallet-card-tab:hover,[\s\S]*?transform:translateY\(0\)/);
});

test("classic profile preview keeps public and owner fields separated", () => {
  assert.match(html, /data-profile-mode="public"/);
  assert.match(html, /data-profile-mode-choice="public"/);
  assert.match(html, /data-profile-mode-choice="owner"/);
  assert.match(html, /data-profile-private hidden/);
  assert.match(html, /data-profile-public/);
  assert.match(html, /id="player-id"/);
  assert.match(html, /id="player-level"/);
  assert.match(html, /PROFILE PREVIEW ONLY/);
});

test("personal rank palette is external to the identity card and has a dedicated persistent key", () => {
  const card = html.indexOf('class="glass player-id-card classic-player-card"');
  const palette = html.indexOf('class="profile-palette-panel"');
  const cardEnd = html.indexOf('</div><div class="profile-palette-panel">', card);
  assert.ok(card >= 0 && palette > card && cardEnd > card);
  assert.match(html, /id="player-rank-hue"[^>]*type="range"/);
  assert.match(js, /nu-profile-rank-palette-v1/);
  assert.match(js, /localStorage\.setItem/);
  assert.match(js, /localStorage\.getItem/);
  assert.match(js, /DEFAULT_HUE=195/);
});

test("public demo explicitly disclaims authentication and protected private view", () => {
  assert.match(js, /does not authenticate or secure this view/);
  assert.match(html, /not an authenticated security boundary/);
  assert.match(html, /No public upload, account authentication, or secure private storage/);
});
