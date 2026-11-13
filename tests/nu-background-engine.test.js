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

test("public runtime ships the byte-identical canonical Material background", () => {
  const assetPath = path.join(root, "assets/backgrounds/niroo-universe-background.svg");
  assert.ok(fs.statSync(assetPath).size > 0, "canonical SVG must exist in the public repository");
  const bytes = fs.readFileSync(assetPath);
  const gitBlobSha = crypto.createHash("sha1")
    .update(Buffer.from("blob " + bytes.length + "\0"))
    .update(bytes)
    .digest("hex");
  assert.equal(gitBlobSha, "63dd85a479354406cc5739f4603ccc1d0989e5b0");
  const svg = bytes.toString("utf8");
  assert.match(svg, /<svg\b/);
  assert.match(svg, /data:image\/png;base64,/);
});

test("demo page loads the image-first engine and the engine points to the local public asset", () => {
  assert.match(html, /<script src="\.\/nu-background-engine\.js"><\/script>/);
  assert.match(engine, /const ASSET="\.\/assets\/backgrounds\/niroo-universe-background\.svg"/);
  assert.match(engine, /img\.onload=/);
  assert.match(engine, /nu-image-scene-active/);
  assert.match(engine, /img\.onerror=/);
  assert.match(engine, /world\.classList\.add\("calibrated"\)/);
  assert.match(css, /\.world\{opacity:0/);
  assert.match(css, /\.world\.calibrated\{opacity:1/);
});

test("background image paints above the decorative sky but below foreground content", () => {
  assert.match(engine, /z-index:-3/);
  assert.match(css, /\.sky\{z-index:-4!important\}/);
  assert.match(html, /<div class="sky"><\/div>/);
});

test("procedural visual overlays remain quarantined from the public runtime", () => {
  assert.match(runtime, /NUDynamicLayers&&g\.NUDynamicLayers\.stop/);
  assert.match(runtime, /NUPixelWorld&&g\.NUPixelWorld\.setEnabled&&g\.NUPixelWorld\.setEnabled\(false\)/);
  assert.match(runtime, /visualOverlays:"quarantined"/);
  assert.doesNotMatch(html, /<script src="\.\/nu-pixel-world\.js/);
  assert.ok(fs.existsSync(path.join(root, "archive/visual-layers/nu-pixel-world.js")));
  assert.ok(fs.existsSync(path.join(root, "archive/visual-layers/nu-dynamic-layers.js")));
});
