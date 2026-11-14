const assert=require("node:assert/strict");
const blueprint=require("../nu-studio-blueprint.js");
for(const size of [1,3,5,31,361]){
 const c=blueprint.centerCell(size,size);
 assert.equal(c.x,Math.floor(size/2));
 assert.equal(c.y,Math.floor(size/2));
}
assert.deepEqual(blueprint.centerCell(3,5),{x:1,y:2});
assert.throws(()=>blueprint.centerCell(0,3),RangeError);
console.log("N.U blueprint center-cell tests passed.");
