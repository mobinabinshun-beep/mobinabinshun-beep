"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const visuals=require("../nu-exchange-visuals.js");
const fs=require("node:fs");

test("ambient market pulses are deterministic and bounded to three display units",()=>{
 const steps=[{volume:18,demand:14,supply:4},{volume:7,demand:5,supply:2}];
 const a=visuals.ambientPulse(steps,2.25,4),b=visuals.ambientPulse(steps,2.25,4);
 assert.deepEqual(a,b);
 assert.ok(Math.abs(a.delta)<=3);
 assert.ok(a.volume>=0&&a.volume<=3);
 assert.ok(a.amplitude<=3);
});

test("ambient market pulses follow the player's recorded economic direction",()=>{
 const buying=[{volume:10,demand:10,supply:0}],selling=[{volume:10,demand:0,supply:10}];
 const buy=visuals.ambientPulse(buying,Math.PI/2,0),sell=visuals.ambientPulse(selling,Math.PI/2,0);
 assert.ok(buy.bias>0);
 assert.ok(sell.bias<0);
 assert.ok(buy.delta>sell.delta);
});

test("quiet player history still gets restrained ambient motion without inventing events",()=>{
 const pulse=visuals.ambientPulse([],1,2);
 assert.ok(pulse.amplitude>0&&pulse.amplitude<=3);
 assert.ok(Math.abs(pulse.delta)<=3);
 assert.equal(pulse.volume<=3,true);
 assert.deepEqual(visuals.TOOLS,new Set(["cursor","trend","horizontal","vertical","zone"]));
});

test("ambient background candles are volatile but strictly display-only and bounded to three units",()=>{
 const source=[{id:"player-1",close:104,index:104,volume:8,demand:6,supply:2}];
 const before=JSON.stringify(source),flow=visuals.ambientMarket(source,"mana",2200*5000);
 assert.equal(JSON.stringify(source),before);
 assert.equal(flow.simulatedCount,6);
 assert.equal(flow.steps.length,7);
 assert.equal(flow.steps.at(-1).simulated,true);
 assert.ok(flow.steps.slice(-6).every(step=>step.visualOnly&&Math.abs(step.delta)<=3&&step.volume>=0&&step.volume<=3));
 assert.equal(flow.steps[0].id,"player-1");
});

test("quiet player receives a full animated market tape without fabricated wallet transactions",()=>{
 const flow=visuals.ambientMarket([],"quiet-player-test",2200*9000);
 assert.equal(flow.simulatedCount,24);
 assert.equal(flow.steps.length,24);
 assert.ok(flow.steps.every(step=>step.simulated&&step.visualOnly));
 assert.ok(flow.steps.every(step=>Math.abs(step.delta)<=3&&step.volume>=0&&step.volume<=3));
 assert.deepEqual(flow.probabilities,{zero:.10,one:.30,two:.30,three:.30,positive:.50});
});

test("ambient market outcome frequencies follow the requested cumulative probabilities",()=>{
 const counts={0:0,1:0,2:0,3:0},directions={positive:0,negative:0};
 for(let i=0;i<500;i++){
  const flow=visuals.ambientMarket([],"probability-"+i,2200*12000);
  for(const step of flow.steps){
   counts[Math.abs(step.delta)]++;
   if(step.delta>0)directions.positive++;
   if(step.delta<0)directions.negative++;
  }
 }
 const total=Object.values(counts).reduce((a,b)=>a+b,0);
 assert.ok(Math.abs(counts[0]/total-.10)<.025);
 assert.ok(Math.abs(counts[1]/total-.30)<.035);
 assert.ok(Math.abs(counts[2]/total-.30)<.035);
 assert.ok(Math.abs(counts[3]/total-.30)<.035);
 const directional= directions.positive+directions.negative;
 assert.ok(Math.abs(directions.positive/directional-.5)<.025);
});

test("ambient animation is stable between frames and advances only on a new time bucket",()=>{
 const first=visuals.ambientMarket([],"stable-animation-test",2200*20000);
 const same=visuals.ambientMarket([],"stable-animation-test",2200*20000);
 assert.deepEqual(first,same);
 const next=visuals.ambientMarket([],"stable-animation-test",2200*20001);
 assert.equal(next.simulatedCount,24);
 assert.notDeepEqual(next.steps,first.steps);
});


test("ambient market API is exported for the Exchange runtime",()=>{
 assert.equal(typeof visuals.ambientMarket,"function");
});

test("Exchange loads the visuals module before the runtime that consumes it",()=>{
 const html=fs.readFileSync("exchange.html","utf8");
 const visualsAt=html.indexOf("nu-exchange-visuals.js");
 const runtimeAt=html.indexOf("nu-exchange.js");
 assert.ok(visualsAt>=0,"missing Exchange visuals script");
 assert.ok(runtimeAt>visualsAt,"visuals must load before Exchange runtime");
});
