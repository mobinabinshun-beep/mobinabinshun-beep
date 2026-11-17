"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const css=fs.readFileSync("nu-world.css","utf8");
const html=fs.readFileSync("index.html","utf8");

test("HP capsule remains docked beside the HP rail on narrow phones",()=>{
  const start=css.lastIndexOf("Owner-scoped HP rail correction");
  assert.ok(start>=0);
  const block=css.slice(start);
  assert.match(block,/@media\(max-width:520px\)/);
  assert.match(block,/min-height:48px/);
  assert.match(block,/padding:6px 48px 6px 9px/);
  assert.match(block,/right:5px/);
  assert.match(block,/top:50%/);
  assert.match(block,/bottom:auto/);
  assert.doesNotMatch(block,/padding:8px 10px 40px/);
  assert.ok(html.includes('id="hp-pill-use"'));
  assert.ok(html.includes('id="hp-bar"'));
});
