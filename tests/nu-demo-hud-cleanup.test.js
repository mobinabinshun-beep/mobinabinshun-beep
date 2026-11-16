"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync("index.html","utf8");
const games=fs.readFileSync("nu-games.js","utf8");

test("player-facing game HUD omits prototype and interaction-count clutter",()=>{
  assert.doesNotMatch(html,/10 ACTIONS|N\.U · GEN 01|GENERATION 01 PROTOTYPE/);
  assert.doesNotMatch(games,/Complete 10 interactions to finish this round/);
});

test("runtime calibration does not expose site RTT, downlink or probe-loss diagnostics in player UI",()=>{
  assert.match(html,/id="quality-status">SYSTEM READY/);
  assert.doesNotMatch(games,/SITE RTT |LINK ~|FAILED SITE PROBES/);
  assert.match(games,/sampleNetwork\(\)/);
});

test("new rounds remain reachable from the game library, without an in-round NEW ROUND button",()=>{
  assert.doesNotMatch(html,/id="restart-round"|NEW ROUND/);
  assert.match(html,/id="game-library"/);
  assert.match(games,/querySelectorAll\("\[data-game\]"\)/);
  assert.doesNotMatch(games,/restart-round/);
});
