/* N.U Generation 1 — activity-driven fictional market index simulator.
 * All indices are invented game-only units. No external financial data or money.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.NUVirtualMarket=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";
  const ASSETS=[
    {key:"xp",label:"XP",unit:"N.U Index"},
    {key:"mana",label:"Mana",unit:"N.U Index"},
    {key:"casinoCredits",label:"Casino Credits",unit:"N.U Index"},
    {key:"hpPills",label:"HP Capsules",unit:"N.U Index"},
    {key:"manaCapsules",label:"Mana Capsules",unit:"N.U Index"}
  ];
  const BASE_INDEX=100,MAX_CANDLES=48;
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function build(raw,key){
    if(!ASSETS.some(a=>a.key===key))return {asset:null,candles:[],index:BASE_INDEX,changePct:0,volume:0,demand:0,supply:0,events:0};
    const txs=Array.isArray(raw&&raw.transactions)?raw.transactions.slice(-40):[];
    const events=txs.map((tx,i)=>({tx,i,delta:Number(tx&&tx.deltas&&tx.deltas[key])}))
      .filter(e=>Number.isFinite(e.delta)&&e.delta!==0)
      .sort((a,b)=>String(a.tx.at||"").localeCompare(String(b.tx.at||""))||a.i-b.i);
    let price=BASE_INDEX,totalVolume=0,totalDemand=0,totalSupply=0;
    const buckets=new Map();
    for(const e of events){
      const magnitude=Math.abs(e.delta),isDemand=e.delta<0;
      const intensity=magnitude/(magnitude+10);
      const move=(isDemand?1:-1)*0.025*intensity;
      const next=clamp(price*(1+move),50,200);
      const date=new Date(e.tx.at||0);
      const bucketKey=Number.isNaN(date.getTime())?"undated":String(Math.floor(date.getTime()/3600000));
      let candle=buckets.get(bucketKey);
      if(!candle){candle={time:Number.isNaN(date.getTime())?"Recorded activity":date.toISOString(),open:price,high:price,low:price,close:price,volume:0,demand:0,supply:0,events:0};buckets.set(bucketKey,candle);}
      candle.high=Math.max(candle.high,price,next);candle.low=Math.min(candle.low,price,next);candle.close=next;
      candle.volume+=magnitude;candle.events+=1;
      if(isDemand){candle.demand+=magnitude;totalDemand+=magnitude;}else{candle.supply+=magnitude;totalSupply+=magnitude;}
      totalVolume+=magnitude;price=next;
    }
    const candles=Array.from(buckets.values()).slice(-MAX_CANDLES);
    return {asset:ASSETS.find(a=>a.key===key),candles,index:price,changePct:(price/BASE_INDEX-1)*100,volume:totalVolume,demand:totalDemand,supply:totalSupply,events:events.length,baseline:BASE_INDEX};
  }
  function assets(){return ASSETS.slice();}
  return {ASSETS,BASE_INDEX,MAX_CANDLES,assets,build};
});
