const test = require("node:test");
const assert = require("node:assert/strict");
const { createMultiAgentSimulation } = require("../sim-pixel-simulation-core.js");

test("moves an explicitly commanded agent along its reserved route", () => {
  const sim=createMultiAgentSimulation({width:6,height:4,agents:[{id:"A",position:{x:0,y:1}}]});
  assert.equal(sim.plan("A",{x:3,y:1}),true);
  assert.deepEqual(sim.step().agents[0],{id:"A",x:1,y:1,goal:{x:3,y:1},path:[{x:2,y:1},{x:3,y:1}]});
  sim.step();sim.step();
  assert.deepEqual(sim.snapshot().agents[0],{id:"A",x:3,y:1,goal:null,path:[]});
});

test("rejects a second route that conflicts with an existing time-slot reservation", () => {
  const sim=createMultiAgentSimulation({width:3,height:2,agents:[
    {id:"A",position:{x:0,y:0}},{id:"B",position:{x:1,y:1}}
  ]});
  assert.equal(sim.plan("A",{x:2,y:0}),true);
  assert.equal(sim.plan("B",{x:1,y:0}),false);
  assert.equal(sim.snapshot().agents.find(a=>a.id==="B").path.length,0);
});

test("does not allow an agent to route through another agent's occupied tile", () => {
  const sim=createMultiAgentSimulation({width:5,height:3,agents:[
    {id:"A",position:{x:0,y:1}},{id:"B",position:{x:2,y:1}}
  ]});
  assert.equal(sim.plan("A",{x:4,y:1}),true);
  assert.ok(sim.snapshot().agents.find(a=>a.id==="A").path.every(p=>!(p.x===2&&p.y===1)));
});

test("supports replanning from the agent's current position", () => {
  const sim=createMultiAgentSimulation({width:6,height:4,agents:[{id:"A",position:{x:0,y:0}}]});
  assert.equal(sim.plan("A",{x:4,y:0}),true);
  sim.step();
  assert.equal(sim.plan("A",{x:1,y:3}),true);
  assert.deepEqual(sim.snapshot().agents[0].path.at(-1),{x:1,y:3});
});

test("rejects invalid agent definitions and destinations", () => {
  assert.throws(()=>createMultiAgentSimulation({agents:[{id:"A",position:{x:0.5,y:0}}]}),TypeError);
  const sim=createMultiAgentSimulation({width:3,height:3,blocked:[{x:1,y:1}],agents:[{id:"A",position:{x:0,y:0}}]});
  assert.equal(sim.plan("A",{x:1,y:1}),false);
  assert.equal(sim.plan("missing",{x:2,y:2}),false);
});
