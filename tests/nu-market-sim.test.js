"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const market=require("../nu-market-sim.js");
test("market index is generated only from recorded in-game asset activity",()=>{
 const result=market.build({transactions:[
  {at:"2026-11-14T10:00:00.000Z",deltas:{mana:8}},
  {at:"2026-11-14T11:00:00.000Z",deltas:{mana:-8}}
 ]},"mana");
 assert.equal(result.events,2);
 assert.equal(result.candles.length,2);
 assert.ok(result.candles[0].close<market.BASE_INDEX);
 assert.ok(result.candles[1].close>result.candles[1].open);
});
test("no player activity means no fabricated candles or price movement",()=>{
 const result=market.build({transactions:[]},"xp");
 assert.deepEqual(result.candles,[]);
 assert.equal(result.index,100);
 assert.equal(result.changePct,0);
});
test("market simulator rejects unknown and unimplemented assets",()=>{
 assert.equal(market.build({transactions:[{deltas:{xCredits:-4}}]},"xCredits").asset,null);
 assert.deepEqual(market.build({transactions:[]},"xCredits").candles,[]);
});
test("volume and demand/supply are derived from absolute recorded deltas",()=>{
 const result=market.build({transactions:[
  {at:"2026-11-14T10:10:00.000Z",deltas:{xp:12}},
  {at:"2026-11-14T10:20:00.000Z",deltas:{xp:-5}}
 ]},"xp");
 assert.equal(result.volume,17);
 assert.equal(result.supply,12);
 assert.equal(result.demand,5);
 assert.equal(result.events,2);
});
test("same-hour activity is aggregated into OHLC candle",()=>{
 const result=market.build({transactions:[
  {at:"2026-11-14T10:10:00.000Z",deltas:{casinoCredits:20}},
  {at:"2026-11-14T10:20:00.000Z",deltas:{casinoCredits:-20}}
 ]},"casinoCredits");
 assert.equal(result.candles.length,2);
 assert.ok(result.candles[0].high>=result.candles[0].open);
 assert.ok(result.candles[0].low<=result.candles[0].close);
});

test("market simulator retains only the latest 24 activity steps",()=>{
 const transactions=Array.from({length:30},(_,i)=>({at:new Date(Date.UTC(2026,10,1,i)).toISOString(),deltas:{xp:i%2? -1:1}}));
 const result=market.build({transactions},"xp");
 assert.equal(result.events,24);
 assert.ok(result.candles.length<=24);
 assert.equal(market.MAX_CANDLES,24);
});

test("display-only candle tolerance is deterministic, bounded to five, and never changes close",()=>{
 const save={transactions:[{id:"stable-event",at:"2026-11-14T12:00:00.000Z",deltas:{xp:-9}}]};
 const first=market.build(save,"xp"),second=market.build(save,"xp"),candle=first.candles[0];
 assert.equal(candle.visualTolerance,second.candles[0].visualTolerance);
 assert.ok(candle.visualTolerance>=0&&candle.visualTolerance<=5);
 assert.equal(candle.close,first.index);
 assert.ok(Math.abs(candle.close-(100*(1+0.025*(9/19))))<1e-9);
 assert.ok(candle.high>=Math.max(candle.open,candle.close));
 assert.ok(candle.low<=Math.min(candle.open,candle.close));
});

test("parametric dispersion bands are rolling, deterministic, and display-only",()=>{
 const steps=[10,12,14,16].map((close,index)=>({close,open:close-1,high:close+2,low:close-2}));
 const before=JSON.stringify(steps),bands=market.analysisBands(steps,3),mean=12;
 assert.equal(bands.length,4);assert.equal(bands[0].upper,null);assert.equal(bands[1].lower,null);
 assert.ok(Math.abs(bands[2].mean-mean)<1e-9);assert.ok(bands[2].upper>mean);assert.ok(bands[2].lower<mean);
 assert.deepEqual(market.analysisBands(steps,3),bands);assert.equal(JSON.stringify(steps),before);
});

test("store-purchased assets are excluded from market choices and chart building",()=>{
 const legacy={xp:15,hpPills:1,transactions:[{kind:"purchase",title:"Golden HP Capsule",deltas:{xp:-10,hpPills:1}}]};
 assert.ok(!market.assets(legacy).some(asset=>asset.key==="hpPills"));
 assert.equal(market.build(legacy,"hpPills").asset,null);
 assert.deepEqual(market.build(legacy,"hpPills").steps,[]);
 assert.ok(market.assets(legacy).some(asset=>asset.key==="xp"));
});
test("durable purchase exclusion survives the rolling transaction ledger",()=>{
 const save={xp:15,hpPills:1,nonExchangeableAssets:["hpPills"],transactions:[]};
 assert.ok(!market.assets(save).some(asset=>asset.key==="hpPills"));
 assert.equal(market.build(save,"hpPills").asset,null);
});

// Keep ambient Exchange flow and player chart drawing covered by the market-simulation CI run.
require("./nu-exchange-visuals.test.js");
