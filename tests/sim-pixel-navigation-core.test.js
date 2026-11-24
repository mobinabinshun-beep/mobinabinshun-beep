const test = require("node:test");
const assert = require("node:assert/strict");
const { findPath } = require("../sim-pixel-simulation-core.js");

const blocks = [
  ...Array.from({length:5},(_,i)=>({x:1+i,y:1})),
  ...Array.from({length:5},(_,i)=>({x:1+i,y:2})),
  ...Array.from({length:5},(_,i)=>({x:1+i,y:3}))
];

test("routes around static building footprints", () => {
  const path=findPath({x:0.5,y:2.5},{x:7.5,y:2.5},{width:20,height:12,blocked:blocks});
  assert.ok(path);
  assert.ok(path.every(p=>!blocks.some(b=>b.x===p.x&&b.y===p.y)));
  assert.deepEqual(path.at(-1),{x:7,y:2});
});

test("does not route through occupied NPC tiles", () => {
  const path=findPath({x:2.5,y:5.5},{x:6.5,y:5.5},{occupied:[{x:4.5,y:5.5}]});
  assert.ok(path);
  assert.ok(path.every(p=>!(p.x===4&&p.y===5)));
});

test("rejects blocked destinations and unreachable maps", () => {
  assert.equal(findPath({x:0,y:0},{x:1,y:1},{blocked:[{x:1,y:1}]}),null);
  const wall=Array.from({length:12},(_,y)=>({x:2,y}));
  assert.equal(findPath({x:0,y:5},{x:4,y:5},{blocked:wall}),null);
});

test("uses shortest diagonal route on an unobstructed grid", () => {
  const path=findPath({x:0,y:0},{x:3,y:3},{width:8,height:8});
  assert.deepEqual(path,[{x:1,y:1},{x:2,y:2},{x:3,y:3}]);
});

test("prevents diagonal corner cutting", () => {
  const path=findPath({x:0,y:0},{x:1,y:1},{blocked:[{x:1,y:0},{x:0,y:1}]});
  assert.equal(path,null);
});
