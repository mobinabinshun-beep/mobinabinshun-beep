"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const js=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");
const html=fs.readFileSync(require.resolve("../pixel-art-studio.html"),"utf8");
test("image import defaults to the exact source dimensions",()=>{
 assert.match(html,/<option value="original" selected>Original file size/);
 assert.match(js,/requested==="original"\?Math\.max\(sourceWidth,sourceHeight\)/);
 assert.match(js,/const nextW=Math\.max\(1,Math\.round\(sourceWidth\*scale\)\),nextH=Math\.max\(1,Math\.round\(sourceHeight\*scale\)\)/);
});
test("import never silently scales an image to fit the device budget",()=>{
 assert.doesNotMatch(js,/requestedCells>safeCells/);
 assert.match(js,/function cellLimit\(\)\{return Infinity;\}/);
 assert.doesNotMatch(js,/budgetScale/);
});
test("reduced import detail is an explicit user choice and source preview remains separate",()=>{
 assert.match(html,/value="256">256 px · compact/);
 assert.match(js,/Explicit reduced-detail working copy created/);
 assert.match(js,/originalImportFile=file/);
 assert.match(js,/sourcePreviewUrl=URL\.createObjectURL\(file\)/);
});
test("high-resolution rendering uses ImageData and history is bounded by image size",()=>{
 assert.match(js,/ctx\.createImageData\(width,height\)/);
 assert.match(js,/function historyLimitFor\(state\)/);
 assert.match(js,/trimHistory\(redoStack,current\)/);
 assert.match(js,/trimHistory\(undoStack,current\)/);
 assert.doesNotMatch(js,/maxCanvasPixels\|\|520000/);
});
test("dimension inputs are not capped by fixed Studio edge limits",()=>{
 assert.doesNotMatch(html,/id="image-width"[^>]*max=/);
 assert.doesNotMatch(html,/id="image-height"[^>]*max=/);
 assert.doesNotMatch(js,/16,384 px per edge/);
 assert.doesNotMatch(js,/25\*1024\*1024/);
});
