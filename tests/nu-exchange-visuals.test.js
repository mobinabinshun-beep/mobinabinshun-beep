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
