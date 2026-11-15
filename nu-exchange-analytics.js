/* N.U Exchange analytics: all indicators and timeline events derive from the exact chart tape.
 * Simulated entries are labelled and remain display-only; this module never writes wallet state.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUExchangeAnalytics=api;
})(typeof window!=="undefined"?window:globalThis,function(){
 "use strict";
 const num=(v)=>Number.isFinite(Number(v))?Number(v):0;
 const closes=(steps)=> (steps||[]).map(s=>num(s.close??s.index));
 function sma(values,period){if(values.length<period)return null;return values.slice(-period).reduce((a,b)=>a+b,0)/period;}
 function emaSeries(values,period){
  if(!values.length)return [];
  const k=2/(period+1),out=[values[0]];
  for(let i=1;i<values.length;i++)out.push(values[i]*k+out[i-1]*(1-k));
  return out;
 }
 function rsi(values,period=14){
  if(values.length<2)return null;
  const changes=values.slice(1).map((v,i)=>v-values[i]);
  const sample=changes.slice(-period);
  if(!sample.length)return null;
  const gains=sample.reduce((a,v)=>a+Math.max(0,v),0)/sample.length;
  const losses=sample.reduce((a,v)=>a+Math.max(0,-v),0)/sample.length;
  if(losses===0)return gains===0?50:100;
  return 100-(100/(1+gains/losses));
 }
 function calculate(steps){
  const values=closes(steps),last=values.at(-1)??null,fast=emaSeries(values,12),slow=emaSeries(values,26);
  const macd=fast.length&&slow.length?fast.map((v,i)=>v-(slow[i]??v)):[];
  const signal=emaSeries(macd,9),period=Math.min(20,values.length),mean=sma(values,period);
  const variance=mean===null?null:values.slice(-period).reduce((a,v)=>a+(v-mean)**2,0)/period;
  const deviation=variance===null?null:Math.sqrt(variance);
  return {last,sma5:sma(values,5),ema12:fast.at(-1)??null,rsi14:rsi(values,14),
   macd:macd.at(-1)??null,macdSignal:signal.at(-1)??null,
   bandUpper:mean===null?null:mean+2*deviation,bandLower:mean===null?null:mean-2*deviation,
   trend:values.length<2?"WAIT":last>values.at(-2)?"UP":last<values.at(-2)?"DOWN":"FLAT"};
 }
 function timeline(steps,limit=8){
  return (steps||[]).slice(-limit).reverse().map((s)=>{
   const delta=num(s.delta??(num(s.close??s.index)-num(s.open)));
   return {id:String(s.id||s.time||""),time:s.time||s.at||null,
    title:s.simulated?"Simulated market pulse":(s.title||"Recorded player activity"),
    kind:s.simulated?"SIMULATED":"RECORDED",delta,close:num(s.close??s.index),
    volume:num(s.volume),direction:delta>0?"UP":delta<0?"DOWN":"FLAT"};
  });
 }
 function fmt(v){return v===null||v===undefined||!Number.isFinite(v)?"—":Number(v).toFixed(2);}
 function render(steps,metricsHost,timelineHost){
  const m=calculate(steps);
  if(metricsHost)metricsHost.innerHTML=[
   ["SMA · 5",fmt(m.sma5)],["EMA · 12",fmt(m.ema12)],["RSI · 14",fmt(m.rsi14)],["MACD",fmt(m.macd)],["MACD SIGNAL",fmt(m.macdSignal)],["BAND · UPPER / LOWER",fmt(m.bandUpper)+" / "+fmt(m.bandLower)]
  ].map(([label,value])=>'<article class="exchange-card"><span>'+label+'</span><strong>'+value+'</strong></article>').join("");
  if(timelineHost)timelineHost.innerHTML=timeline(steps).map(e=>'<div class="asset-row"><div><strong>'+e.title+' · '+e.kind+'</strong><small>'+ (e.time?new Date(e.time).toLocaleString():"Time unavailable")+' · '+e.direction+' · Vol '+fmt(e.volume)+'</small></div><span class="asset-delta '+(e.delta>0?"positive":e.delta<0?"negative":"")+'">'+(e.delta>0?"+":"")+fmt(e.delta)+'</span><span class="asset-balance">'+fmt(e.close)+'</span></div>').join("")||'<p class="panel-note">No chart events yet.</p>';
  return {metrics:m,events:timeline(steps)};
 }
 return {calculate,timeline,render,sma,emaSeries,rsi};
});
