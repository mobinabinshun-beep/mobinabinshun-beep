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

test("stable transaction IDs produce deterministic wick bounds",()=>{
 const save={transactions:[{id:"stable-1",at:"2026-11-14T12:00:00.000Z",deltas:{xp:14}}]};
 const first=market.build(save,"xp").steps[0],second=market.build(save,"xp").steps[0];
 assert.deepEqual(first,second);
 assert.ok(first.high>=Math.max(first.open,first.close));
 assert.ok(first.low<=Math.min(first.open,first.close));
});
test("HP is never a market asset and market building is read-only",()=>{
 const save={hp:8,transactions:[{id:"hp-event",at:"2026-11-14T12:00:00.000Z",deltas:{hp:-1,xp:2}}]};
 const before=JSON.stringify(save);
 assert.equal(market.build(save,"hp").asset,null);
 assert.ok(!market.assets().some(asset=>asset.key==="hp"));
 market.build(save,"xp");
 assert.equal(JSON.stringify(save),before);
});
