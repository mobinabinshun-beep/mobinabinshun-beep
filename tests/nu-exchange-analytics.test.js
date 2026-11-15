"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const analytics=require("../nu-exchange-analytics.js");
test("market indicators are calculated from the same chart candle sequence",()=>{
 const steps=Array.from({length:30},(_,i)=>({close:100+i,open:99+i,volume:i,delta:1,time:new Date(1700000000000+i*2200).toISOString()}));
 const m=analytics.calculate(steps);
 assert.equal(m.last,129);assert.equal(m.sma5,127);assert.ok(m.ema12>m.sma5-5);assert.equal(m.rsi14,100);assert.ok(m.macd>0);assert.ok(m.bandUpper>m.bandLower);
});
test("short history reports unavailable indicators instead of fabricating values",()=>{
 const m=analytics.calculate([{close:100},{close:101}]);
 assert.equal(m.sma5,null);assert.equal(m.rsi14,100);assert.equal(m.trend,"UP");
});
test("timeline keeps recorded and simulated chart events explicitly separated",()=>{
 const events=analytics.timeline([{id:"r1",time:"2026-11-15T00:00:00Z",title:"Player exchange",open:100,close:102,delta:2,volume:4},{id:"s1",time:"2026-11-15T00:00:02Z",simulated:true,open:102,close:100,delta:-2,volume:2}],8);
 assert.equal(events.length,2);assert.equal(events[0].kind,"SIMULATED");assert.equal(events[1].kind,"RECORDED");assert.equal(events[0].direction,"DOWN");
});
test("Exchange page loads analytics before controller and exposes its timeline and indicator hosts",()=>{
 const fs=require("node:fs"),html=fs.readFileSync(require("node:path").join(__dirname,"../exchange.html"),"utf8");
 assert.ok(html.indexOf("nu-exchange-analytics.js")<html.indexOf("nu-exchange.js?v="));
 assert.match(html,/id="market-indicators"/);assert.match(html,/id="market-timeline"/);
});
