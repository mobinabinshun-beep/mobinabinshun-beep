"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const css = read("nu-world.css");
const background = read("nu-background-engine.js");
const gateway = read("nu-hex-gateway.css");
const html = read("index.html");
const protocol = read("docs/architecture/NU-UI-LAYER-AND-EXTENSION-ISOLATION-PROTOCOL.md");

test("the mandatory foreground-safety law is present in the project protocol", () => {
  assert.match(protocol, /BACKGROUND AND DECORATIVE LAYERS MUST NEVER COVER/);
  assert.match(protocol, /A failing invariant blocks merge/);
  assert.match(protocol, /Museum \/ archive lifecycle/);
  assert.match(protocol, /Extension, plugin and Gateway isolation/);
});

test("the canonical world layer tokens preserve strict background-to-foreground order", () => {
  assert.match(css, /--nu-layer-world-background:\s*0/);
  assert.match(css, /--nu-layer-world-atmosphere:\s*1/);
  assert.match(css, /--nu-layer-world-effects:\s*2/);
  assert.match(css, /--nu-layer-world-content:\s*3/);
  assert.match(css, /\.world>\.nu-world-background\{[^}]*z-index:var\(--nu-layer-world-background,0\)!important/);
  assert.match(css, /\.world>\.sky\{[^}]*z-index:var\(--nu-layer-world-atmosphere,1\)!important/);
  assert.match(css, /\.world>#world-canvas,[\s\S]*?z-index:var\(--nu-layer-world-effects,2\)/);
  assert.match(css, /\.world>\.shell\{[^}]*z-index:var\(--nu-layer-world-content\)!important/);
});

test("background engine mounts only a non-interactive, hidden decorative layer", () => {
  assert.match(background, /z-index:var\(--nu-layer-world-background,0\)/);
  assert.match(background, /pointer-events:none/);
  assert.match(background, /setAttribute\("aria-hidden","true"\)/);
  assert.match(background, /world\.insertBefore\(node,world\.firstChild\)/);
  assert.doesNotMatch(background, /\.shell|#menu|#nu-hex-gateway/);
});

test("all ambient world renderers are pointer-transparent", () => {
  assert.match(css, /\.world>\.nu-world-background,[\s\S]*?#nu-dynamic-layers\{\s*pointer-events:none!important/);
  assert.match(css, /#pixel-world\{[^}]*pointer-events:none/);
});

test("application-level menu and Gateway surfaces use dedicated foreground tokens", () => {
  assert.match(css, /--nu-layer-menu:\s*10/);
  assert.match(css, /--nu-layer-intro:\s*20/);
  assert.match(css, /--nu-layer-critical:\s*30/);
  assert.match(css, /\.menu-backdrop\{z-index:var\(--nu-layer-menu\)\}/);
  assert.match(css, /\.intro\{z-index:var\(--nu-layer-intro\)\}/);
  assert.match(gateway, /z-index:var\(--nu-layer-gateway-scrim,110\)/);
  assert.match(gateway, /z-index:var\(--nu-layer-gateway,120\)/);
  assert.match(html, /id="nu-hex-gateway"/);
});

test("the main shell and interactive overlays are not nested inside the background host", () => {
  assert.match(html, /<div class="world">[\s\S]*?<div class="shell">/);
  assert.match(html, /<div class="menu-backdrop" id="menu">/);
  assert.match(html, /<div class="intro" id="intro">/);
  assert.match(html, /<nav id="nu-hex-gateway"/);
  assert.match(background, /aria-hidden","true"/);
});
