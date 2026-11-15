"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const css = read("nu-world.css");
const engine = read("nu-background-engine.js");
const runtime = read("nu-graphics-runtime.js");

test("public runtime targets the documented PNG and validates it if transferred", () => {
  assert.match(engine, /const ASSET="\.\/assets\/nu-celestial-city\.png"/);
  const assetPath = path.join(root, "assets/nu-celestial-city.png");
  if (fs.existsSync(assetPath)) {
    const bytes = fs.readFileSync(assetPath);
    assert.ok(bytes.length > 0, "canonical PNG must not be empty");
    const gitBlobSha = crypto.createHash("sha1")
      .update(Buffer.from("blob " + bytes.length + "\0"))
      .update(bytes)
      .digest("hex");
    assert.equal(gitBlobSha, "d73afd484ef8b459c908c1942ee0f47d27f93aa5");
  }
});

test("demo page loads the canonical local image engine", () => {
  assert.match(html, /<script src="\.\/nu-background-engine\.js(?:\?[^"]*)?"><\/script>/);
  assert.match(engine, /img\.onload=/);
  assert.match(engine, /nu-image-scene-active/);
  assert.match(engine, /img\.onerror=/);
  assert.match(engine, /world\.classList\.add\("calibrated"\)/);
  assert.match(css, /\.world\{opacity:0/);
  assert.match(css, /\.world\.calibrated\{opacity:1/);
});

test("the canonical image is the only mounted world background element", () => {
  assert.match(engine, /z-index:var\(--nu-layer-world-background,0\);overflow:hidden/);
  assert.match(engine, /world\.insertBefore\(node,world\.firstChild\)/);
  assert.match(engine, /className="nu-world-background"/);
  assert.doesNotMatch(html, /class="sky"|id="world-canvas"|id="pixel-world"|class="horizon"/);
  assert.doesNotMatch(html, /nu-dynamic-layers\.js|nu-pixel-world\.js/);
});

test("image failure never starts a procedural fallback or decorative layer", () => {
  assert.match(runtime, /visualOverlays:\s*"none"/);
  assert.match(runtime, /imageOnly:\s*true/);
  assert.match(runtime, /fallback:\s*status\.loaded\s*\?\s*null\s*:\s*"solid-color"/);
  assert.doesNotMatch(runtime, /NUPixelWorld\.setEnabled\(true\)/);
  assert.doesNotMatch(runtime, /NUDynamicLayers\.apply/);
  assert.doesNotMatch(html, /<canvas id="(?:pixel-world|world-canvas)"/);\n  assert.match(css, /body\\{overflow-x:hidden;background:var\\(--bg\\)\\}/);
});

test("pixel-faithful image fit preserves the complete artwork without cropping", () => {
  assert.match(engine, /object-fit:contain/);
  assert.match(engine, /fit:"contain"/);
  assert.match(css, /object-fit:contain!important/);
});

test("public demo exposes image loading diagnostics", () => {
  assert.match(engine, /dataset\.state="loading"/);
  assert.match(engine, /dataset\.state="loaded"/);
  assert.match(engine, /dataset\.state="error"/);
  assert.match(engine, /naturalWidth:img/);
  assert.doesNotMatch(html, /id="nu-background-diagnostics"/);
});

test("interactive page content remains above the isolated image", () => {
  assert.match(css, /\.world>\.nu-world-background\{[\s\S]*?z-index:var\(--nu-layer-world-background,0\)!important/);
  assert.match(css, /\.world>\.shell\{position:relative!important;z-index:var\(--nu-layer-world-content\)!important/);
  assert.match(css, /\.world>\.nu-world-background\{[^}]*pointer-events:none!important/);
});
