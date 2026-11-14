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
      .update(Buffer.from("blob " + bytes.length + "\\0"))
      .update(bytes)
      .digest("hex");
    assert.equal(gitBlobSha, "d73afd484ef8b459c908c1942ee0f47d27f93aa5");
  }
});
test("demo page loads the image-first engine and the engine points to the local public asset", () => {
  assert.match(html, /<script src="\.\/nu-background-engine\.js(?:\?[^"]*)?"><\/script>/);
  assert.match(engine, /const ASSET="\.\/assets\/nu-celestial-city\.png"/);
  assert.match(engine, /img\.onload=/);
  assert.match(engine, /nu-image-scene-active/);
  assert.match(engine, /img\.onerror=/);
  assert.match(engine, /world\.classList\.add\("calibrated"\)/);
  assert.match(css, /\.world\{opacity:0/);
  assert.match(css, /\.world\.calibrated\{opacity:1/);
});

test("background image is the deepest world layer while scene layers remain available above it", () => {
  assert.match(engine, /z-index:0;overflow:hidden/);
  assert.match(engine, /world\.insertBefore\(node,world\.firstChild\)/);
  assert.match(engine,/className="nu-world-background"/);
  assert.match(css, /world>\.sky\{position:absolute;z-index:1!important/);
  assert.match(html, /<div class="sky"><\/div>/);
  assert.doesNotMatch(css, /world\.nu-image-scene-active[\s\S]{0,180}display:none!important/);
});

test("procedural world renderer is restored as the failure fallback", () => {
  assert.match(runtime, /if\(status\.loaded\)/);
  assert.match(runtime, /NUPixelWorld&&g\.NUPixelWorld\.setEnabled&&g\.NUPixelWorld\.setEnabled\(true\)/);
  assert.match(runtime, /NUDynamicLayers&&g\.NUDynamicLayers\.apply&&g\.NUDynamicLayers\.apply\(p\)/);
  assert.match(html, /<script src="\.\/nu-pixel-world\.js"><\/script>/);
  assert.match(runtime, /visualOverlays:status\.loaded\?"image-first":"procedural-fallback"/);
});


test("pixel-faithful review mode shows the full artwork and bounds camera exploration", () => {
  assert.match(engine, /object-fit:contain/);
  assert.match(engine, /fit:"contain"/);
  assert.match(engine, /cameraZoom=Math\.max\(1,Math\.min\(3/);
  assert.match(engine, /artworkWidth=\(img\.naturalWidth\|\|width\)\*fit/);
  assert.match(css, /object-fit:contain!important/);
  assert.match(css, /#nu-background-image:after\{display:none!important\}/);
  assert.match(css, /--nu-camera-zoom/);
});

test("public demo exposes runtime diagnostics for the world background",()=>{
 assert.match(engine,/dataset.state="loading"/);
 assert.match(engine,/dataset.state="loaded"/);
 assert.match(engine,/dataset.state="error"/);
 assert.match(engine,/naturalWidth:img/);
 assert.doesNotMatch(html,/id="nu-background-diagnostics"/);
});
