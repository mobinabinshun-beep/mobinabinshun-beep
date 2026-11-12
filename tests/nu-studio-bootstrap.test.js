"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const source=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");

test("workspace observer queries the stage by class instead of the ID-only helper",()=>{
  assert.match(source,/const stage=document\.querySelector\("\.stage"\),frame=\$\("workspace-frame"\);/);
  assert.doesNotMatch(source,/const stage=\$\("\.stage"\)/);
});

test("workspace observer guards optional elements and ResizeObserver before observing",()=>{
  assert.match(source,/if\(typeof ResizeObserver!=="undefined"&&stage&&frame\)\{/);
  assert.match(source,/window\.addEventListener\("resize",updateCanvasDisplay/);
});

test("upload and drawing handlers remain installed after workspace observer setup",()=>{
  const observerAt=source.indexOf("observeWorkspace();");
  const uploadAt=source.indexOf('$("image-file").addEventListener("change"');
  const pointerAt=source.indexOf('canvas.addEventListener("pointerdown"');
  assert.ok(observerAt>=0&&uploadAt>observerAt&&pointerAt>observerAt);
});
