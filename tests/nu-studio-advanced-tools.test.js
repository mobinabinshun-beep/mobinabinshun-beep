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
 assert.ok(png.includes("download(blob,name)"));
 assert.doesNotMatch(png,/analyzeArtwork/);
});
test("Graphic IR reports analysis-limit errors without hiding the PNG and SVG alternatives",()=>{
 assert.match(js,/function graphicIRSource\(\)/);
 assert.doesNotMatch(js,/this format needs a successful graphics analysis/);
});
test("Graphic IR is compact machine-readable data without a human-report attachment",()=>{
 assert.match(js,/format:"NU-GFX-IR\/2"/);
 assert.match(js,/encoding:"row-major-rle"/);
 assert.match(js,/instructions:\[\{op:"set-palette"/);
 assert.doesNotMatch(js,/humanReport:/);
});

test("advanced export exposes PNG, SVG, SVG source code and compact machine-readable IR",()=>{
 for(const id of ["adv-png","adv-svg","adv-svg-code","adv-ir","adv-export-downloads"])assert.ok(js.includes('id="'+id+'"'),id);
 assert.match(js,/format:"NU-GFX-IR\/2"/);
 assert.match(js,/encoding:"row-major-rle"/);
});
test("advanced SVG export downloads before any optional analysis",()=>{
 const start=js.indexOf('$("adv-svg").onclick='),end=js.indexOf('layerUI();',start),block=js.slice(start,end);
 assert.ok(block.indexOf("download(new Blob")<block.indexOf("analyzeArtwork()")||!block.includes("analyzeArtwork()"));
});
test("SVG export has a raster-embedded SVG fallback for vectorizer size limits",()=>{
 assert.match(js,/function rasterSvgSource\(\)/);
 assert.match(js,/embedded-raster-fallback/);
});
test("download fallback is visible in the advanced export tab and does not force a new tab",()=>{
 assert.match(js,/\$\("adv-export-downloads"\)\|\|\$\("export-download-fallback"\)/);
 assert.doesNotMatch(js,/a\.target="_blank"/);
});
test("PNG export supports toBlob and a data URL fallback",()=>{
 assert.match(js,/typeof out\.toBlob==="function"/);
 assert.match(js,/out\.toDataURL\("image\/png"\)/);
});


test("2D Studio adds filled shapes and symmetry painting controls",()=>{
 for(const tool of ["rect-fill","ellipse-fill"])assert.match(html,new RegExp('data-tool="'+tool+'"'));
 assert.match(js,/adv\.symmetry==="both"/);
 assert.match(js,/id="adv-symmetry"/);
});
test("SVG vectorization consumes the active visible composite snapshot and rejects blank artwork",()=>{
 assert.match(js,/vectorize\(pixels,width,height/);
 assert.match(js,/The artwork is empty/);
 assert.match(js,/data:image\/png;base64,/);
 assert.ok(js.includes("?>\\n<svg"),"SVG fallback must use a JavaScript newline escape");
 assert.ok(!js.includes("?>\\\\n<svg"),"SVG fallback must not emit a literal backslash-n outside the root element");
});
test("ICO export is wired to both the main and advanced export panels",()=>{
 assert.match(html,/id="export-ico"/);
 assert.match(js,/id="adv-ico"/);
 assert.match(html,/nu-ico-export\.js/);
});

test("selection clipping also constrains clear, replace, chroma key, image overlay and text",()=>{
 assert.match(js,/pixels=pixels\.map\(\(c,i\)=>c===old&&\(!adv\.selection\|\|adv\.selection\[i\]\)\?n:c\)/);
 assert.match(js,/pixels=pixels\.map\(\(c,i\)=>!adv\.selection\|\|adv\.selection\[i\]\?null:c\)/);
 assert.match(js,/\(!adv\.selection\|\|adv\.selection\[i\]\)&&dist\(c,key\)<=t\?null:c/);
 assert.match(js,/d\[i\*4\+3\]>20&&\(!adv\.selection\|\|adv\.selection\[i\]\)/);
 assert.match(js,/d\[i\*4\+3\]>128&&\(!adv\.selection\|\|adv\.selection\[i\]\)/);
});

test("fading brush blends against each destination pixel rather than the stroke origin pixel",()=>{
 const start=js.indexOf("const paintAdv=paintBrush;paintBrush=function");
 const end=js.indexOf("const floodAdv=flood;",start);
 const block=js.slice(start,end);
 assert.match(block,/fadePixel\(pixels\[key\],v,fadeIntensity\)/);
 assert.doesNotMatch(block,/fadePixel\(pixels\[y\*width\+x\],v,fadeIntensity\)/);
});

test("Studio page visibly identifies the Fading and Color-Mixing human-QA-only candidate",()=>{
 assert.match(html,/TEST CANDIDATE — NOT HUMAN-APPROVED/);
 assert.match(html,/DEMO QA ONLY/);
 assert.match(html,/FADING \+ COLOR-MIXING BRUSH/);
 assert.doesNotMatch(html,/PR #238/);
});
