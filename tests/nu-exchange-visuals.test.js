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
