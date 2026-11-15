"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const visuals=require("../nu-exchange-visuals.js");

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

test("ambient renderer produces a labelled micro-tick tape without throwing",()=>{
 const oldDocument=global.document,oldStyle=global.getComputedStyle;
 global.document={body:{}};
 global.getComputedStyle=()=>({getPropertyValue:()=>"#70dfaa"});
 const status={textContent:""};
 const canvas={style:{},clientWidth:400,clientHeight:200,addEventListener(){},getBoundingClientRect(){return {left:0,top:0,width:400,height:200};}};
 const toolbar={querySelectorAll(){return [];},querySelector(){return status;},addEventListener(){}};
 const ctx={save(){},restore(){},setLineDash(){},fillRect(){},beginPath(){},arc(){},fill(){},stroke(){},moveTo(){},lineTo(){},strokeRect(){}};
 try{
  const drawing=visuals.create({canvas,toolbar,storage:{getItem(){return null;},setItem(){}}});
  drawing.render(ctx,400,200,[{volume:12,demand:8,supply:3}],"xp");
  assert.match(status.textContent,/BACKGROUND FLOW/);
  assert.match(status.textContent,/TICK 1/);
  assert.match(status.textContent,/±3 INDEX \/ 3 VOL MAX/);
 }finally{global.document=oldDocument;global.getComputedStyle=oldStyle;}
});

test("ambient background candles are bounded, local, and never mutate recorded activity",()=>{
 const source=[{id:"player-1",close:104,index:104,volume:8,demand:6,supply:2}],before=JSON.stringify(source);
 const flow=visuals.ambientMarket(source,"mana-test",2200*5000);
 assert.equal(JSON.stringify(source),before);
 assert.equal(flow.simulatedCount,6);
 assert.equal(flow.steps.length,7);
 assert.equal(flow.steps[0].id,"player-1");
 assert.ok(flow.steps.slice(-6).every(step=>step.simulated&&step.visualOnly&&Math.abs(step.delta)<=3&&step.volume>=0&&step.volume<=3));
});

test("idle market creates a 24-candle animated tape with the specified probability contract",()=>{
 const flow=visuals.ambientMarket([],"quiet-player-test",2200*9000);
 assert.equal(flow.simulatedCount,24);
 assert.equal(flow.steps.length,24);
 assert.ok(flow.steps.every(step=>step.simulated&&step.visualOnly&&Math.abs(step.delta)<=3&&step.volume>=0&&step.volume<=3));
 assert.deepEqual(flow.probabilities,{zero:.10,one:.30,two:.30,three:.30,positive:.50});
});

test("ambient outcomes follow the requested cumulative movement probabilities and 50/50 direction",()=>{
 const counts={0:0,1:0,2:0,3:0},directions={positive:0,negative:0};
 for(let i=0;i<500;i++){
  const flow=visuals.ambientMarket([],"probability-"+i,2200*12000);
  for(const step of flow.steps){counts[Math.abs(step.delta)]++;if(step.delta>0)directions.positive++;if(step.delta<0)directions.negative++;}
 }
 const total=Object.values(counts).reduce((a,b)=>a+b,0);
 assert.ok(Math.abs(counts[0]/total-.10)<.025);
 assert.ok(Math.abs(counts[1]/total-.30)<.035);
 assert.ok(Math.abs(counts[2]/total-.30)<.035);
 assert.ok(Math.abs(counts[3]/total-.30)<.035);
 const directional=directions.positive+directions.negative;
 assert.ok(Math.abs(directions.positive/directional-.5)<.025);
});

test("ambient candles stay stable between refreshes and advance on the next micro-tick",()=>{
 const first=visuals.ambientMarket([],"stable-animation-test",2200*20000);
 const same=visuals.ambientMarket([],"stable-animation-test",2200*20000);
 assert.deepEqual(first,same);
 const next=visuals.ambientMarket([],"stable-animation-test",2200*20001);
 assert.equal(next.simulatedCount,24);
 assert.notDeepEqual(next.steps,first.steps);
});

test("Exchange page loads the drawing and ambient visuals module before the app controller",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const html=fs.readFileSync(path.join(__dirname,"../exchange.html"),"utf8");
 const visualsAt=html.indexOf("nu-exchange-visuals.js");
 const appAt=html.indexOf("nu-exchange.js?v=");
 assert.ok(visualsAt>=0,"visuals module script must be present");
 assert.ok(appAt>visualsAt,"visuals module must load before the Exchange controller");
});
