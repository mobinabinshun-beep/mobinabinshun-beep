"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html");
const css=read("nu-world.css");
const engine=read("nu-background-engine.js");
const runtime=read("nu-graphics-runtime.js");
test("background engine loads the canonical public image asset",()=>{
 assert.ok(engine.includes("./assets/backgrounds/niroo-universe-background.svg"));
 const asset=fs.readFileSync(path.join(root,"assets/backgrounds/niroo-universe-background.svg"));
 const blobSha=crypto.createHash("sha1").update(Buffer.from("blob "+asset.length+"\0")).update(asset).digest("hex");
 assert.equal(blobSha,"63dd85a479354406cc5739f4603ccc1d0989e5b0");
 assert.ok(engine.includes("object-fit:contain"));
 assert.ok(engine.includes("img.onload"));
 assert.ok(engine.includes("img.onerror"));
 assert.ok(engine.includes('world.classList.add("calibrated")'));
});
test("the active page loads the static image engine and omits decorative renderers",()=>{
 assert.ok(html.includes("./nu-background-engine.js"));
 assert.ok(!html.includes("nu-dynamic-layers.js"));
 assert.ok(!html.includes("nu-pixel-world.js"));
 assert.ok(!runtime.includes("NUDynamicLayers"));
 assert.ok(!runtime.includes("NUPixelWorld"));
});
test("background engine contains no canvas, particle or animation implementation",()=>{
 assert.ok(!engine.includes('createElement("canvas")'));
 assert.ok(!engine.includes("requestAnimationFrame"));
 assert.ok(!engine.toLowerCase().includes("particle"));
 assert.ok(engine.includes("layers:0"));
 assert.ok(engine.includes("animated:false"));
});
test("static background is non-interactive and uses only one image",()=>{
 assert.ok(engine.includes('aria-hidden","true"'));
 assert.ok(engine.includes("pointer-events:none"));
 assert.ok(engine.includes("world.insertBefore(node,world.firstChild)"));
 assert.ok(engine.includes("img.src=ASSET"));
});
test("CSS disables every legacy decorative world layer and leaves foreground above image",()=>{
 assert.ok(css.includes("N.U XP-FIRST STATIC IMAGE OVERRIDE"));
 assert.ok(css.includes(".world>.sky,"));
 assert.ok(css.includes("#nu-dynamic-layers,"));
 assert.ok(css.includes("#pixel-world,"));
 assert.ok(css.includes("display:none!important"));
 assert.ok(css.includes("z-index:var(--nu-layer-world-content,3)!important"));
});
test("runtime reports zero decorative overlays and does not activate fallback renderers",()=>{
 assert.ok(runtime.includes('visualOverlays:"none"'));
 assert.ok(runtime.includes("backgroundLayers:0"));
 assert.ok(!runtime.includes("procedural-fallback"));
 assert.ok(!runtime.includes("NUDynamicLayers"));
 assert.ok(!runtime.includes("NUPixelWorld"));
});
