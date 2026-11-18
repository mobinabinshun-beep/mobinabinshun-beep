"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const casino=fs.readFileSync("nu-casino.js","utf8");

test("Casino round timers pause while Gateway is open and remain paused after close",()=>{
 assert.match(casino,/function scheduleGatewayTask\(callback,delay\)/);
 assert.match(casino,/window\.addEventListener\("nu:gateway-open",\(\)=>\{gatewayOpen=true;pauseGatewayTasks\(\);\}\)/);
 assert.match(casino,/window\.addEventListener\("nu:gateway-close",\(\)=>\{gatewayOpen=false;gatewayAwaitingInteraction=true;\}\)/);
 assert.match(casino,/function resumeCasinoAfterFreshInput\(event\)/);
 assert.match(casino,/gatewayAwaitingInteraction=false;resumeGatewayTasks\(\)/);
});

test("Casino outcome and result transitions use Gateway-aware timers",()=>{
 const start=casino.indexOf("function runRound");
 const run=casino.slice(start,start+1200);
 assert.match(run,/scheduleGatewayTask\(\(\)=>\{/);
 assert.match(run,/\},170\)/);
 assert.match(run,/\},360\)/);
 assert.match(casino,/scheduleGatewayTask\(\(\)=>card\.classList\.remove\("is-result"\),420\)/);
 assert.doesNotMatch(run,/window\.setTimeout/);
});
