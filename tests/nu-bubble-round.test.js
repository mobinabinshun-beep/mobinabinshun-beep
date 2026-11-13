"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const source=fs.readFileSync(require.resolve("../nu-games.js"),"utf8");

test("Bubble Hunt target body and specular highlight are drawn as circles",()=>{
  const start=source.indexOf('if(state.game==="bubble"){const g=ctx.createRadialGradient');
  const end=source.indexOf('}else if(state.game==="mana")',start);
  assert.notEqual(start,-1,"Bubble Hunt renderer exists");
  assert.notEqual(end,-1,"Bubble renderer has a closing branch");
  const bubble=source.slice(start,end);
  assert.equal((bubble.match(/ctx\.arc\(/g)||[]).length,2,"body and highlight use circular arcs");
  assert.equal(/ctx\.ellipse\(/.test(bubble),false,"oval ellipse geometry is not used");
});

test("Bubble Hunt interaction uses a circular distance check with a bounded touch margin",()=>{
  assert.match(source,/Math\.hypot\(o\.x-x,o\.y-y\)/);
  assert.match(source,/state\.game==="bubble"\?10:15/);
});
