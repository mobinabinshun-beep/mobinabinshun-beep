"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const js=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");
const html=fs.readFileSync(require.resolve("../pixel-art-studio.html"),"utf8");
test("image import defaults to exact source dimensions",()=>{
 assert.match(html,/<option value="original" selected>Original file size/);
 assert.match(js,/requested==="original"\?Math\.max\(sourceWidth,sourceHeight\)/);
});
test("Studio has no product pixel, edge, file-size, or Launcher-profile import ceiling",()=>{
 assert.match(js,/function cellLimit\(\)\{return Infinity;\}/);
 assert.doesNotMatch(js,/requestedCells>safeCells|requestedCells>maxPixels|safe editing budget|25\*1024\*1024|16,384 px per edge|MAX_RASTER_PIXELS|current Launcher\/device budget/);
 assert.doesNotMatch(html,/id="image-width"[^>]*max=/);
 assert.doesNotMatch(html,/id="image-height"[^>]*max=/);
});
test("file import delegates format validation to browser decoding and uses an explicit picker button",()=>{
 assert.match(js,/isSupportedImageFile\(file\)/);
 assert.match(html,/id="import-image" type="button"/);
 assert.ok(html.includes('accept="*/*"'));
 assert.match(js,/decodeImage\(file\)/);
});
test("reduced import detail is an explicit user choice and source remains separate",()=>{
 assert.match(html,/value="256">256 px · compact/);
 assert.match(js,/Explicit reduced-detail working copy created/);
 assert.match(js,/originalImportFile=file/);
 assert.match(js,/sourcePreviewUrl=URL\.createObjectURL\(file\)/);
});
test("high-resolution rendering and history management remain enabled",()=>{
 assert.match(js,/ctx\.createImageData\(width,height\)/);
 assert.match(js,/function historyLimitFor\(state\)/);
 assert.match(js,/trimHistory\(redoStack,current\)/);
 assert.match(js,/trimHistory\(undoStack,current\)/);
});
test("resize controls are not clamped to a fixed 2048-pixel edge",()=>{
 assert.doesNotMatch(js,/nextW=clamp\(Math\.round\(nextW\),1,2048\)/);
 assert.doesNotMatch(js,/nextH=clamp\(Math\.round\(nextH\),1,2048\)/);
});
