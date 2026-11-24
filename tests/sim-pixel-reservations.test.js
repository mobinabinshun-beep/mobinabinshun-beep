const test = require("node:test");
const assert = require("node:assert/strict");
const { createReservationTable } = require("../sim-pixel-simulation-core.js");

test("reserves a path and prevents two agents occupying the same tile at the same tick", () => {
  const table=createReservationTable();
  assert.equal(table.reservePath("A",{x:0,y:0},[{x:1,y:0},{x:2,y:0}]),true);
  assert.equal(table.canReserve("B",{x:2,y:1},[{x:2,y:0}],{startTick:1}),false);
  assert.equal(table.canReserve("B",{x:3,y:1},[{x:2,y:1},{x:2,y:0}],{startTick:0}),false);
});

test("prevents agents swapping positions across the same edge in one tick", () => {
  const table=createReservationTable();
  assert.equal(table.reservePath("A",{x:0,y:0},[{x:1,y:0}]),true);
  assert.equal(table.canReserve("B",{x:1,y:0},[{x:0,y:0}]),false);
});

test("prevents crossing diagonal trajectories through the same cell square", () => {
  const table=createReservationTable();
  assert.equal(table.reservePath("A",{x:0,y:0},[{x:1,y:1}]),true);
  assert.equal(table.canReserve("B",{x:1,y:0},[{x:0,y:1}]),false);
});

test("failed reservations are atomic and do not reserve an earlier free step", () => {
  const table=createReservationTable();
  assert.equal(table.reservePath("A",{x:2,y:0},[{x:2,y:1}],{startTick:1}),true);
  assert.equal(table.reservePath("B",{x:0,y:0},[{x:1,y:0},{x:2,y:1}]),false);
  assert.equal(table.canReserve("C",{x:1,y:1},[{x:1,y:0}]),true);
});

test("releases an agent's future reservations to permit replanning", () => {
  const table=createReservationTable();
  assert.equal(table.reservePath("A",{x:0,y:0},[{x:1,y:0},{x:2,y:0}]),true);
  assert.ok(table.release("A",1)>0);
  assert.equal(table.canReserve("B",{x:1,y:1},[{x:1,y:0}],{startTick:1}),true);
});

test("allows the same agent to replace its own route without self-conflict", () => {
  const table=createReservationTable();
  assert.equal(table.reservePath("A",{x:0,y:0},[{x:1,y:0},{x:2,y:0}]),true);
  assert.equal(table.reservePath("A",{x:0,y:0},[{x:0,y:1},{x:1,y:1}]),true);
});
