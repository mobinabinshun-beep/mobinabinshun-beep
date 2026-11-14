/* N.U Generation 1 — activity-driven fictional market index simulator.
 * Each candle is one recorded local player transaction step. No external data.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUVirtualMarket=api;
})(typeof window!=="undefined"?window:globalThis,function(){
 "use strict";
 const ASSETS=[
  {key:"xp",label:"XP",unit:"N.U Index"},{key:"mana",label:"Mana",unit:"N.U Index"},
  {key:"casinoCredits",label:"Casino Credits",unit:"N.U Index"},{key:"hpPills",label:"HP Capsules",unit:"N.U Index"},
  {key:"manaCapsules",label:"Mana Capsules",unit:"N.U Index"}
 ];
 const BASE_INDEX=100,MAX_CANDLES=24,MAX_EVENTS=24;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function build(raw,key){
  if(!ASSETS.some(a=>a.key===key))return {asset:null,steps:[],candles:[],index:BASE_INDEX,changePct:0,volume:0,demand:0,supply:0,events:0,baseline:BASE_INDEX};
  const txs=Array.isArray(raw&&raw.transactions)?raw.transactions.slice(-MAX_EVENTS):[];
  const events=txs.map((tx,i)=>({tx,i,delta:Number(tx&&tx.deltas&&tx.deltas[key])}))
   .filter(e=>Number.isFinite(e.delta)&&e.delta!==0)
   .sort((a,b)=>String(a.tx.at||"").localeCompare(String(b.tx.at||""))||a.i-b.i);
  let price=BASE_INDEX,totalVolume=0,totalDemand=0,totalSupply=0;
  const steps=[];
  for(const e of events){
   const magnitude=Math.abs(e.delta),isDemand=e.delta<0,intensity=magnitude/(magnitude+10);
   const move=(isDemand?1:-1)*0.025*intensity,next=clamp(price*(1+move),50,200);
   const date=new Date(e.tx.at||0),time=Number.isNaN(date.getTime())?"Recorded activity":date.toISOString();
   const candle={time,open:price,high:Math.max(price,next),low:Math.min(price,next),close:next,volume:magnitude,demand:isDemand?magnitude:0,supply:isDemand?0:magnitude,events:1};
   if(isDemand)totalDemand+=magnitude;else totalSupply+=magnitude;
   totalVolume+=magnitude;price=next;
   steps.push({id:String(e.tx.id||("step-"+e.i)),time,title:String(e.tx.title||e.tx.kind||"Player asset activity"),delta:e.delta,index:price,changePct:(price/BASE_INDEX-1)*100,volume:magnitude,demand:candle.demand,supply:candle.supply,open:candle.open,high:candle.high,low:candle.low,close:candle.close});
  }
  const bounded=steps.slice(-MAX_CANDLES),last=bounded[bounded.length-1];
  return {asset:ASSETS.find(a=>a.key===key),steps:bounded,candles:bounded,index:last?last.index:BASE_INDEX,changePct:((last?last.index:BASE_INDEX)/BASE_INDEX-1)*100,volume:bounded.reduce((n,s)=>n+s.volume,0),demand:bounded.reduce((n,s)=>n+s.demand,0),supply:bounded.reduce((n,s)=>n+s.supply,0),events:bounded.length,baseline:BASE_INDEX};
 }
 function assets(){return ASSETS.slice();}
 return {ASSETS,BASE_INDEX,MAX_CANDLES,MAX_EVENTS,assets,build};
});
