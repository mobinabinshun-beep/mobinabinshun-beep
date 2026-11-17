"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const games=fs.readFileSync("nu-games.js","utf8");
const css=fs.readFileSync("nu-world.css","utf8");

test("HP capsule travel animation ends at the visible right-side dock on mobile and desktop",()=>{
  assert.ok(games.includes("const dock=mobileDock?{x:barRect.width-23,y:barRect.height/2}:{x:barRect.width-29,y:barRect.height/2};"));
  assert.ok(css.includes("right:5px;"));
  assert.ok(css.includes("right:8px;"));
  assert.ok(!games.includes("x:barRect.width/2,y:barRect.height-21"));
});
