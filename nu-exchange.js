(function(){
"use strict";
const $=id=>document.getElementById(id),CACHE_KEY="nu_exchange_cache_v2",MAX_CHART_STEPS=24,MAX_TEXT_HISTORY=5;
let selected="xp",marketSelected="xp",replayMode="24s",replayStart=Date.now(),replayTimer=0;
const guard=NUExchangeGuard.create(window.localStorage),maintenance=NUExchangeLock.create(window.localStorage);
function format(n){return new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(Number(n)||0);}
function dateLabel(value){const d=new Date(value);return Number.isNaN(d.getTime())?"Recorded":new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function readCache(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||"null");}catch(_){return null;}}
function snapshot(save,rows){
 const out={version:2,updatedAt:new Date().toISOString(),assets:{},market:{}};
 rows.forEach(r=>{const all=NUWallet.assetHistory(save,r.key);out.assets[r.key]={chart:all.slice(-(MAX_CHART_STEPS+1)),recent:all.slice(1).slice(-MAX_TEXT_HISTORY)};});
 NUVirtualMarket.assets().forEach(a=>{const steps=NUVirtualMarket.build(save,a.key).steps.slice(-MAX_CHART_STEPS);out.market[a.key]={steps,recent:steps.slice(-MAX_TEXT_HISTORY)};});
 return out;
}
function drawBalance(points){
 const canvas=$("asset-chart"),ctx=canvas.getContext("2d"),w=canvas.clientWidth||600,h=280,dpr=Math.min(window.devicePixelRatio||1,2);
 canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 if(points.length<2){canvas.hidden=true;$("chart-empty").hidden=false;return;}
 canvas.hidden=false;$("chart-empty").hidden=true;
 const pad={l:52,r:16,t:18,b:34},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,vals=points.map(p=>Number(p.balance)||0),min=Math.min(0,...vals),max=Math.max(1,...vals),span=Math.max(1,max-min);
 const y=v=>pad.t+ph-(v-min)/span*ph,x=i=>pad.l+i/(points.length-1)*pw;
 ctx.font="11px system-ui";ctx.textAlign="right";ctx.textBaseline="middle";
 for(let i=0;i<=4;i++){const v=min+span*i/4,yy=y(v);ctx.strokeStyle="rgba(160,205,224,.18)";ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.fillStyle="#91aab9";ctx.fillText(format(v),pad.l-9,yy);}
 for(let i=0;i<=4;i++){const xx=pad.l+pw*i/4;ctx.strokeStyle="rgba(160,205,224,.09)";ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,pad.t+ph);ctx.stroke();}
 ctx.strokeStyle="#78d7e8";ctx.lineWidth=2.5;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(x(i),y(p.balance)):ctx.moveTo(x(i),y(p.balance)));ctx.stroke();
 ctx.fillStyle="rgba(120,215,232,.12)";ctx.beginPath();ctx.moveTo(x(0),y(points[0].balance));points.forEach((p,i)=>ctx.lineTo(x(i),y(p.balance)));ctx.lineTo(x(points.length-1),pad.t+ph);ctx.lineTo(x(0),pad.t+ph);ctx.closePath();ctx.fill();
 points.forEach((p,i)=>{ctx.beginPath();ctx.fillStyle="#d8f7ff";ctx.arc(x(i),y(p.balance),3.5,0,Math.PI*2);ctx.fill();});
 ctx.textAlign="center";ctx.textBaseline="top";ctx.fillStyle="#91aab9";[...new Set([0,Math.floor((points.length-1)/2),points.length-1])].forEach(i=>ctx.fillText(dateLabel(points[i].at),x(i),h-pad.b+10));
}
function drawMarket(steps){
 const canvas=$("market-chart"),ctx=canvas.getContext("2d"),w=canvas.clientWidth||700,h=330,dpr=Math.min(window.devicePixelRatio||1,2);
 canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 if(!steps.length){canvas.hidden=true;$("market-empty").hidden=false;return;}
 canvas.hidden=false;$("market-empty").hidden=true;
 const pad={l:58,r:18,t:20,b:42},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,lo=Math.min(...steps.map(s=>s.low)),hi=Math.max(...steps.map(s=>s.high)),spread=Math.max(1,hi-lo),min=lo-spread*.15,max=hi+spread*.15,span=max-min;
 const y=v=>pad.t+(max-v)/span*ph,slot=pw/steps.length,cw=Math.max(4,Math.min(18,slot*.52));
 ctx.font="11px system-ui";ctx.textAlign="right";ctx.textBaseline="middle";
 for(let i=0;i<=4;i++){const v=min+span*i/4,yy=y(v);ctx.strokeStyle="rgba(160,205,224,.18)";ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.fillStyle="#91aab9";ctx.fillText(v.toFixed(2),pad.l-9,yy);}
 for(let i=0;i<=4;i++){const xx=pad.l+pw*i/4;ctx.strokeStyle="rgba(160,205,224,.09)";ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,pad.t+ph);ctx.stroke();}
 const maxVol=Math.max(1,...steps.map(s=>s.volume));
 steps.forEach((s,i)=>{const cx=pad.l+slot*(i+.5),up=s.close>=s.open,color=up?"#70dfaa":"#ff8b91";ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,y(s.high));ctx.lineTo(cx,y(s.low));ctx.stroke();const top=Math.min(y(s.open),y(s.close)),body=Math.max(2,Math.abs(y(s.open)-y(s.close)));ctx.fillStyle=color;ctx.fillRect(cx-cw/2,top,cw,body);ctx.globalAlpha=.35;ctx.fillRect(cx-cw/2,h-pad.b+7,cw,s.volume/maxVol*30);ctx.globalAlpha=1;});
 ctx.textAlign="center";ctx.textBaseline="top";ctx.fillStyle="#91aab9";[...new Set([0,Math.floor((steps.length-1)/2),steps.length-1])].forEach(i=>ctx.fillText(dateLabel(steps[i].time),pad.l+slot*(i+.5),h-pad.b+12));
}
function renderHistory(items,id){
 $(id).innerHTML=items.slice().reverse().map(p=>'<div class="asset-row"><div><strong>'+esc(p.title)+'</strong><small>'+esc(dateLabel(p.at||p.time))+'</small></div><span class="asset-delta '+(p.delta>0?"positive":p.delta<0?"negative":"")+'">'+(p.delta>0?"+":"")+format(p.delta)+'</span><span class="asset-balance">'+format(p.balance??p.index??0)+'</span></div>').join("")||'<p class="panel-note">No recorded player activity for this asset yet.</p>';
}
function updateMarket(steps){
 const last=steps[steps.length-1],index=last?last.index:100,supply=steps.reduce((n,s)=>n+s.supply,0),demand=steps.reduce((n,s)=>n+s.demand,0);
 $("market-index").textContent=index.toFixed(2);$("market-change").textContent=(index>100?"+":"")+((index/100-1)*100).toFixed(2)+"%";$("market-change").className=index>100?"positive":index<100?"negative":"";
 $("market-volume").textContent=format(steps.reduce((n,s)=>n+s.volume,0));$("market-demand").textContent=format(demand);$("market-supply").textContent=format(supply);$("market-events").textContent=steps.length+" / 24 PLAYER STEPS";
 const bias=supply>demand?"SUPPLY-LEANING":demand>supply?"DEMAND-LEANING":"BALANCED";$("market-bias").textContent=bias;$("market-bias").className="bias-indicator "+(supply>demand?"positive":demand>supply?"negative":"");$("market-bias").dataset.direction=supply>demand?"up":demand>supply?"down":"flat";
 drawMarket(steps);renderHistory(steps.slice(-MAX_TEXT_HISTORY).map(s=>({title:s.title,time:s.time,delta:s.delta,index:s.index})),"market-history");
}
function frame(cache,rows){
 const mode=NUExchangeReplay.getMode(replayMode),elapsed=Date.now()-replayStart,asset=cache.assets[selected]||{chart:[],recent:[]},points=asset.chart||[];
 const ai=NUExchangeReplay.frameIndex(elapsed,points.length,mode.durationMs),shown=NUExchangeReplay.visibleSteps(points,ai),row=rows.find(r=>r.key===selected);
 $("asset-balance").textContent=format(row?row.value:0)+(row?row.unit:"");
 const net=shown.length>1?shown[shown.length-1].balance-shown[0].balance:0;$("asset-change").textContent=(net>0?"+":"")+format(net);$("asset-change").className=net>0?"positive":net<0?"negative":"";
 $("history-count").textContent+="";
 $("history-count").textContent=Math.max(0,shown.length-1)+" / 24 STEPS";drawBalance(shown);
 renderHistory((asset.recent||[]).filter(p=>shown.some(v=>v.id===p.id)).slice(-MAX_TEXT_HISTORY),"asset-transactions");
 const market=(cache.market[marketSelected]||{steps:[]}).steps||[],mi=NUExchangeReplay.frameIndex(elapsed,market.length,mode.durationMs),visible=NUExchangeReplay.visibleSteps(market,mi);
 updateMarket(visible);$("replay-mode-label").textContent=mode.label.toUpperCase()+" · REPLAYING SAVED ACTIVITY";$("replay-progress").textContent+="";
 $("replay-progress").textContent=Math.max(0,shown.length-1)+" / 24";
}
function updateGuard(){
 const s=guard.state(),el=$("exchange-cooldown-status");
 el.textContent=s.locked?"EXCHANGE CLOSED · REOPENING IN "+Math.ceil(s.remainingMs/1000)+"s":"READY · "+s.successes+"/10 SUCCESSFUL ACTIONS THIS VISIT";
 el.classList.toggle("cooldown-active",s.locked);
 $("exchange-lock-status").textContent=maintenance.isLocked()?"TRANSFER MODULE LOCKED":"TRANSFER MODULE UNLOCKED";
 $("exchange-lock-status").className=maintenance.isLocked()?"pending-tag":"sim-tag";
}
function refresh(){
 const save=NUWallet.normalizeSave(NU.load()),rows=NUWallet.assetRows(save).filter(r=>r.key!=="hp");
 if(!rows.some(r=>r.key===selected))selected=rows[0]?.key||"xp";
 $("asset-select").innerHTML=rows.map(r=>'<option value="'+r.key+'">'+esc(r.label)+'</option>').join("");$("asset-select").value=selected;
 $("market-asset").innerHTML=NUVirtualMarket.assets().map(a=>'<option value="'+a.key+'">'+esc(a.label)+'</option>').join("");$("market-asset").value=marketSelected;
 const next=snapshot(save,rows);try{localStorage.setItem(CACHE_KEY,JSON.stringify(next));}catch(_){}
 const cache=readCache()||next;frame(cache,rows);
 const games=NUExchangeCore.listGames();$("change-from").innerHTML=games.map(g=>'<option value="'+g.id+'">'+esc(g.name)+'</option>').join("");
 $("change-to").innerHTML=games.map(g=>'<option value="'+g.id+'">'+esc(g.name)+'</option>').join("");
 $("change-asset").innerHTML=NUExchangeCore.listAssets().map(a=>'<option value="'+a.id+'">'+esc(a.label)+'</option>').join("");
 $("change-empty").hidden=games.length>0;$("change-submit").disabled=true;updateGuard();
}
function unlockOne(){const r=maintenance.begin($("unlock-phrase").value);$("unlock-feedback").textContent=r.ok?"مرحله اول ثبت شد؛ مرحله دوم را تأیید کن.":"عبارت تأیید نادرست است.";}
function unlockTwo(){const r=maintenance.confirm($("unlock-phrase").value);$("unlock-feedback").textContent=r.ok?"قفل ماژول انتقال باز شد.":"تأیید دوم ناموفق بود؛ از مرحله اول شروع کن.";updateGuard();}
$("asset-select").addEventListener("change",e=>{selected=e.target.value;replayStart=Date.now();refresh();});
$("market-asset").addEventListener("change",e=>{marketSelected=e.target.value;replayStart=Date.now();refresh();});
$("chart-time-scale").innerHTML=NUExchangeReplay.MODES.map(m=>'<option value="'+m.id+'">'+m.label+'</option>').join("");
$("chart-time-scale").value=replayMode;$("chart-time-scale").addEventListener("change",e=>{replayMode=e.target.value;replayStart=Date.now();refresh();});
$("unlock-step-one").addEventListener("click",unlockOne);$("unlock-step-two").addEventListener("click",unlockTwo);$("relock-module").addEventListener("click",()=>{maintenance.relock();$("unlock-feedback").textContent="Transfer module re-locked.";updateGuard();});
window.NUExchangeAttempt=async function(commit){
 if(maintenance.isLocked())return {ok:false,reason:"MODULE_LOCKED"};
 const gate=guard.beforeAttempt();if(!gate.allowed){updateGuard();return gate;}
 if(typeof commit!=="function")return {ok:false,reason:"NO_APPROVED_TRANSFER_ADAPTER"};
 const result=await commit();if(result&&result.ok)guard.recordSuccess();updateGuard();return result;
};
window.addEventListener("nu:exchange:registry-change",refresh);
window.addEventListener("storage",e=>{if(e.key===NU.storageKey)refresh();});
window.addEventListener("pageshow",()=>{replayStart=Date.now();refresh();});
window.addEventListener("resize",()=>{const rows=NUWallet.assetRows(NU.load()).filter(r=>r.key!=="hp"),cache=readCache();if(cache)frame(cache,rows);});
refresh();replayTimer=window.setInterval(()=>{const cache=readCache();if(cache)frame(cache,NUWallet.assetRows(NU.load()).filter(r=>r.key!=="hp"));updateGuard();},250);
window.addEventListener("pagehide",()=>{clearInterval(replayTimer);guard.leaveVisit();});
})();