(function(){
"use strict";
const $=id=>document.getElementById(id);
const CACHE_KEY="nu_exchange_cache_v1",MAX_CHART_STEPS=24,MAX_TEXT_HISTORY=5;
const number=n=>Number.isFinite(Number(n))?Number(n):0;
let selected="xp",marketSelected="xp";
function format(n){return new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(n);}
function dateLabel(value){const d=new Date(value);return Number.isNaN(d.getTime())?"Recorded":new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",hour:"2-digit"}).format(d);}
function drawBalance(points){
 const canvas=$("asset-chart"),ctx=canvas.getContext("2d"),width=canvas.clientWidth||600,height=280,dpr=Math.min(window.devicePixelRatio||1,2);
 canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
 if(points.length<2){$("chart-empty").hidden=false;canvas.hidden=true;return;}
 $("chart-empty").hidden=true;canvas.hidden=false;
 const pad={l:52,r:16,t:18,b:34},plotW=width-pad.l-pad.r,plotH=height-pad.t-pad.b;
 const values=points.map(p=>number(p.balance)),min=Math.min(0,...values),max=Math.max(1,...values),span=Math.max(1,max-min),y=v=>pad.t+plotH-(v-min)/span*plotH,x=i=>pad.l+i/(points.length-1)*plotW;
 ctx.font="11px system-ui";ctx.textAlign="right";ctx.textBaseline="middle";
 for(let i=0;i<=4;i++){const v=min+span*i/4,yy=y(v);ctx.strokeStyle="rgba(160,205,224,.18)";ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(width-pad.r,yy);ctx.stroke();ctx.fillStyle="#91aab9";ctx.fillText(format(v),pad.l-9,yy);}
 for(let i=0;i<=4;i++){const xx=pad.l+plotW*i/4;ctx.strokeStyle="rgba(160,205,224,.09)";ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,pad.t+plotH);ctx.stroke();}
 ctx.strokeStyle="#78d7e8";ctx.lineWidth=2.5;ctx.beginPath();points.forEach((p,i)=>{if(i===0)ctx.moveTo(x(i),y(p.balance));else ctx.lineTo(x(i),y(p.balance));});ctx.stroke();
 ctx.fillStyle="rgba(120,215,232,.12)";ctx.beginPath();ctx.moveTo(x(0),y(points[0].balance));points.forEach((p,i)=>ctx.lineTo(x(i),y(p.balance)));ctx.lineTo(x(points.length-1),pad.t+plotH);ctx.lineTo(x(0),pad.t+plotH);ctx.closePath();ctx.fill();
 points.forEach((p,i)=>{ctx.beginPath();ctx.fillStyle="#d8f7ff";ctx.arc(x(i),y(p.balance),3.5,0,Math.PI*2);ctx.fill();});
 ctx.textAlign="center";ctx.textBaseline="top";ctx.fillStyle="#91aab9";[...new Set([0,Math.floor((points.length-1)/2),points.length-1])].forEach(i=>ctx.fillText(dateLabel(points[i].at),x(i),height-pad.b+10));
}
function drawMarket(model){
 const canvas=$("market-chart"),ctx=canvas.getContext("2d"),width=canvas.clientWidth||700,height=330,dpr=Math.min(window.devicePixelRatio||1,2);
 canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
 if(!model.candles.length){canvas.hidden=true;$("market-empty").hidden=false;return;}
 canvas.hidden=false;$("market-empty").hidden=true;
 const pad={l:58,r:18,t:20,b:42},pw=width-pad.l-pad.r,ph=height-pad.t-pad.b;
 const lo=Math.min(...model.candles.map(c=>c.low)),hi=Math.max(...model.candles.map(c=>c.high)),spread=Math.max(1,hi-lo),min=lo-spread*.15,max=hi+spread*.15,span=max-min;
 const y=v=>pad.t+(max-v)/span*ph,slot=pw/model.candles.length,cw=Math.max(5,Math.min(18,slot*.52));
 ctx.font="11px system-ui";ctx.textAlign="right";ctx.textBaseline="middle";
 for(let i=0;i<=4;i++){const v=min+(span*i/4),yy=y(v);ctx.strokeStyle="rgba(160,205,224,.18)";ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(width-pad.r,yy);ctx.stroke();ctx.fillStyle="#91aab9";ctx.fillText(v.toFixed(2),pad.l-9,yy);}
 for(let i=0;i<=4;i++){const xx=pad.l+pw*i/4;ctx.strokeStyle="rgba(160,205,224,.09)";ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,pad.t+ph);ctx.stroke();}
 const volMax=Math.max(1,...model.candles.map(c=>c.volume));
 model.candles.forEach((c,i)=>{const cx=pad.l+slot*(i+.5),up=c.close>=c.open,color=up?"#70dfaa":"#ff8b91";
  ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,y(c.high));ctx.lineTo(cx,y(c.low));ctx.stroke();
  const top=Math.min(y(c.open),y(c.close)),body=Math.max(2,Math.abs(y(c.open)-y(c.close)));ctx.fillStyle=color;ctx.fillRect(cx-cw/2,top,cw,body);
  const vh=(c.volume/volMax)*30;ctx.globalAlpha=.35;ctx.fillRect(cx-cw/2,height-pad.b+7,cw,vh);ctx.globalAlpha=1;
 });
 ctx.textAlign="center";ctx.textBaseline="top";ctx.fillStyle="#91aab9";[...new Set([0,Math.floor((model.candles.length-1)/2),model.candles.length-1])].forEach(i=>{const c=model.candles[i],d=new Date(c.time);ctx.fillText(Number.isNaN(d.getTime())?"Recorded":new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",hour:"2-digit"}).format(d),pad.l+slot*(i+.5),height-pad.b+12);});
}
function renderMarket(save,cache){
 const model=NUVirtualMarket.build(save,marketSelected);
 const cached=cache&&cache.market&&cache.market[marketSelected];
 if(cached)model.candles=cached.candles;
 $("market-index").textContent=model.index.toFixed(2);
 $("market-change").textContent=(model.changePct>0?"+":"")+model.changePct.toFixed(2)+"%";
 $("market-change").className=model.changePct>0?"positive":model.changePct<0?"negative":"";
 $("market-volume").textContent=format(model.volume);$("market-demand").textContent=format(model.demand);$("market-supply").textContent=format(model.supply);
 $("market-events").textContent=model.events+" YOUR EVENTS";
 drawMarket(model);
}
function readExchangeCache(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||"null");}catch(_){return null;}}
function render(){
 const save=NUWallet.normalizeSave(NU.load()),rows=NUWallet.assetRows(save).filter(r=>r.key!=="hp");
 if(!rows.some(r=>r.key===selected))selected=rows[0]?.key||"xp";
 $("asset-select").innerHTML=rows.map(r=>'<option value="'+r.key+'">'+r.label+'</option>').join("");$("asset-select").value=selected;
 const snapshot={version:1,updatedAt:new Date().toISOString(),assets:{},market:{}};
 rows.forEach(r=>{const all=NUWallet.assetHistory(save,r.key);snapshot.assets[r.key]={chart:all.slice(-(MAX_CHART_STEPS+1)),recent:all.slice(1).slice(-MAX_TEXT_HISTORY)};});
 const marketModel=NUVirtualMarket.build(save,marketSelected);
 snapshot.market[marketSelected]={candles:marketModel.candles.slice(-MAX_CHART_STEPS)};
 try{localStorage.setItem(CACHE_KEY,JSON.stringify(snapshot));}catch(_){}
 const cache=readExchangeCache()||snapshot,row=rows.find(r=>r.key===selected);
 const points=cache.assets?.[selected]?.chart||[],history=points.slice(1);
 $("asset-balance").textContent=format(row?.value||0)+(row?.unit||"");
 const net=history.reduce((sum,p)=>sum+p.delta,0);$("asset-change").textContent=(net>0?"+":"")+format(net);
 $("asset-change").className=net>0?"positive":net<0?"negative":"";
 $("history-count").textContent=history.length+" / "+MAX_CHART_STEPS+" STEPS";
 if(history.length)drawBalance(points);else{$("asset-chart").hidden=true;$("chart-empty").hidden=false;}
 const recent=cache.assets?.[selected]?.recent||[],target=$("asset-transactions");
 target.innerHTML=recent.slice().reverse().map(p=>'<div class="asset-row"><div><strong>'+escapeText(p.title)+'</strong><small>'+escapeText(dateLabel(p.at))+'</small></div><span class="asset-delta '+(p.delta>0?"positive":p.delta<0?"negative":"")+'">'+(p.delta>0?"+":"")+format(p.delta)+'</span><span class="asset-balance">'+format(p.balance)+'</span></div>').join("")||'<p class="panel-note">No saved transactions affect this asset yet.</p>';
 renderMarket(save,cache);
}
function escapeText(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("asset-select").addEventListener("change",e=>{selected=e.target.value;render();});
$("market-asset").innerHTML=NUVirtualMarket.assets().map(a=>'<option value="'+a.key+'">'+a.label+'</option>').join("");
$("market-asset").addEventListener("change",e=>{marketSelected=e.target.value;render();});
window.addEventListener("storage",e=>{if(e.key===NU.storageKey)render();});
window.addEventListener("pageshow",render);
window.addEventListener("resize",render);
render();
})();