"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const js=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");
const html=fs.readFileSync(require.resolve("../pixel-art-studio.html"),"utf8");
test("advanced Studio defines four independent layers and compositing controls",()=>{
 assert.match(js,/layers:Array\.from\(\{length:4\}/);
 assert.match(js,/function composite\(\)/);
 assert.match(js,/adv\.layers\[adv\.active\]\.locked/);
 assert.match(js,/id="adv-layers"/);
});
test("bucket exposes contiguous, similar RGB and global exact-match modes",()=>{
 assert.match(js,/value="contiguous"/);
 assert.match(js,/value="similar"/);
 assert.match(js,/value="global"/);
 assert.match(js,/dist\(pixels\[i\],start\)>adv\.tol/);
});
test("source original and generated edited SVG have separate export actions",()=>{
 assert.match(js,/originalImportFile=file/);
 assert.match(js,/id="adv-original"/);
 assert.match(js,/id="adv-svg"/);
 assert.ok(html.includes('accept="*/*"'));
});
test("advanced editing includes transforms, tone, RGB, overlay, chroma key and text",()=>{
 for(const id of ["data-x","adj-apply","rgb-apply","adv-overlay","adv-chroma","adv-textadd"])assert.ok(js.includes(id),id);
});

test("human report is available and attached to the visible composite exports",()=>{
 assert.ok(html.includes('id="export-human-report"'));
 assert.match(js,/createHumanReport\(analysis\)/);
 assert.match(js,/humanReport:createHumanReport\(analysis\)/);
 assert.match(js,/id="nu-human-report"/);
 assert.match(js,/NUGraphicsAnalysis\.analyze\(composite\(\),width,height/);
 assert.match(js,/composite\(\)\.forEach\(\(c,i\)=>/);
});
