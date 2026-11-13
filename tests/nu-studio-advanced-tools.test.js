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

test("SVG export restores the active layer even if vectorization fails",()=>{
 assert.match(js,/svgSource=function\(\)[\s\S]*?finally\{pixels=active;\}/);
 assert.doesNotMatch(js,/createHumanReport|downloadHumanReport|nu-human-report|export-human-report|adv-human-report/);
 assert.doesNotMatch(html,/export-human-report/);
});
test("PNG export uses a bounded scale and transparent visible composite",()=>{
 assert.match(html,/id="export-scale"/);
 assert.match(js,/NUStudioExport\.pngDimensions\(width,height,scale\)/);
 assert.match(js,/NUStudioExport\.toRgba\(visible,width,height\)/);
 assert.match(js,/outputContext\.imageSmoothingEnabled=false/);
});


test("download helper exposes a persistent manual link when automatic downloads are blocked",()=>{
 assert.match(html,/id="export-download-fallback"/);
 assert.match(js,/fallback\.replaceChildren\(a\)/);
 assert.match(js,/a\.download=name/);
 assert.match(js,/a\.click\(\)/);
 assert.match(js,/setTimeout\(\(\)=>\{if\(pendingDownloadUrl===url\)/);
});
test("PNG and SVG files are created before optional analytics and reward tracking",()=>{
 const svg=js.slice(js.indexOf('$("export-svg").addEventListener'),js.indexOf('$("export-ir").addEventListener'));
 const png=js.slice(js.indexOf('$("export-png").addEventListener'));
 assert.ok(svg.indexOf("download(new Blob")<svg.indexOf("analyzeArtwork()"));
 assert.ok(png.indexOf("download(blob,name)")<png.indexOf("analyzeArtwork()"));
});
test("Graphic IR reports analysis-limit errors without hiding the PNG and SVG alternatives",()=>{
 assert.match(js,/this format needs a successful graphics analysis/);
});
test("Graphic IR is clean structured analysis without a human-report attachment",()=>{
 assert.match(js,/const analysis=analyzeArtwork\(\),source=JSON\.stringify\(analysis,null,2\)/);
 assert.doesNotMatch(js,/humanReport:/);
});
