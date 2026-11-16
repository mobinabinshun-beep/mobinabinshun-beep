"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync(require.resolve("../pixel-art-studio.html"),"utf8");
const js=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");
const moduleSource=fs.readFileSync(require.resolve("../nu-studio-pro-tools.js"),"utf8");
test("Studio loads the pro tools module before the editor runtime",()=>{
 assert.ok(html.indexOf("nu-studio-pro-tools.js")<html.indexOf("nu-pixel-art-studio.js"));
});
test("professional selection, move, gradient, texture and curve tools are exposed",()=>{
 for(const tool of ["select-rect","select-lasso","move-selection","gradient","texture","bezier"])assert.match(html,new RegExp('data-tool="'+tool+'"'));
 for(const id of ["pro-select-all","pro-deselect","pro-invert-selection","pro-scale-selection","pro-gradient-color","pro-texture","pro-curve"])assert.ok(js.includes(id),id);
});
test("selection gestures are isolated from normal canvas paint events",()=>{
 assert.match(js,/canvas\.addEventListener\("pointerdown",proPointerStart,true\)/);
 assert.match(js,/e\.stopImmediatePropagation\(\)/);
 assert.match(js,/rectSelection\(width,height/);
 assert.match(js,/lassoSelection\(width,height/);
});
test("selection clipping is respected by brush, fill and color adjustments",()=>{
 assert.match(js,/if\(adv\.selection&&!adv\.selection\[key\]\)continue/);
 assert.match(js,/!adv\.selection\[i\]\|\|!match\(pixels\[i\]\)/);
 assert.match(js,/adv\.selection\[i\]\)\?hexRGB/);
});
test("layer masks and blend/group metadata participate in snapshots and compositing",()=>{
 assert.match(js,/mask:l\.mask\?l\.mask\.slice\(\):null/);
 assert.match(js,/blendPixel\(out\[i\],l\.pixels\[i\],l\.blend/);
 for(const id of ["pro-mask-add","pro-mask-invert","pro-mask-apply","pro-mask-remove","pro-mask-edit"])assert.ok(js.includes(id),id);
 assert.match(js,/groupSelect/);
});
test("pro geometry module is pure and has no network dependency",()=>{
 assert.match(moduleSource,/function rectSelection/);
 assert.match(moduleSource,/function gradient/);
 assert.match(moduleSource,/function bezier/);
 assert.doesNotMatch(moduleSource,/\bfetch\s*\(/);
});
