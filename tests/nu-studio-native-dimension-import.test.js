"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const js=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");
const html=fs.readFileSync(require.resolve("../pixel-art-studio.html"),"utf8");
test("image import defaults to exact source dimensions and offers explicit reduced sizes",()=>{
 assert.match(html,/<option value="original" selected>Original file size/);
 assert.match(js,/requested==="original"\?Math\.max\(sourceWidth,sourceHeight\)/);
 assert.match(js,/const nextW=Math\.max\(1,Math\.round\(sourceWidth\*scale\)\),nextH=Math\.max\(1,Math\.round\(sourceHeight\*scale\)\)/);
 assert.match(html,/value="256">256 px · compact/);
 assert.match(js,/Explicit reduced-detail working copy created/);
});
test("import has no product-defined file, MIME, dimension, or pixel-count ceiling",()=>{
 assert.match(html,/accept="\*\/\*"/);
 assert.match(js,/isSupportedImageFile\(file\)/);
 assert.doesNotMatch(js,/file\.size\s*>/);
 assert.doesNotMatch(js,/requestedCells\s*>\s*safeCells/);
 assert.doesNotMatch(js,/safe browser canvas dimension/);
 assert.match(js,/if\(!Number\.isSafeInteger\(requestedCells\)\)/);
});
test("picker uses an explicit user-gesture button and source stays separate",()=>{
 assert.match(html,/<button class="btn primary" id="import-image" type="button">IMPORT IMAGE<\/button>/);
 assert.match(js,/\$\("import-image"\)\.addEventListener\("click",\(\)=>\$\("image-file"\)\.click\(\)\)/);
 assert.match(js,/originalImportFile=file/);
 assert.match(js,/nextPreviewUrl=URL\.createObjectURL\(file\)/);
});
test("import failure rolls back artwork, source metadata and preview before history commit",()=>{
 assert.match(js,/const before=snapshot\(\),previous=\{/);
 assert.match(js,/Image import failed without replacing your previous artwork/);
 assert.ok(js.indexOf("commitHistory(before);originalImportFile=file")>js.indexOf("renderPalette();"));
 assert.match(js,/if\(nextPreviewUrl\)URL\.revokeObjectURL\(nextPreviewUrl\)/);
});
test("high-resolution rendering still uses ImageData and bounded undo history",()=>{
 assert.match(js,/ctx\.createImageData\(width,height\)/);
 assert.match(js,/function historyLimitFor\(state\)/);
 assert.match(js,/trimHistory\(redoStack,current\)/);
 assert.match(js,/trimHistory\(undoStack,current\)/);
});
test("UI states browser and device resource limits without claiming a product cap",()=>{
 assert.match(html,/If the browser or device cannot allocate or process them, import fails without replacing your current artwork/);
 assert.match(html,/Canvas dimensions are limited by actual browser and device capabilities/);
 assert.doesNotMatch(html,/safe pixel budget|capped by the adaptive device budget/);
});
