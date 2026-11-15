(function(){
"use strict";
const $=id=>document.getElementById(id),CACHE_KEY="nu_exchange_cache_v3",MAX_CHART_STEPS=24,MAX_TEXT_HISTORY=5;
let selected="xp",marketSelected="xp",replayMode="24s",replayStart=Date.now(),replayTimer=0,lastLedgerSignature="",ledgerPulseTimer=0;
const PREF_KEY="nu_exchange_chart_preferences_v1";
let chartPrefs={zoom:24,grid:true,wicks:true,volume:true,average:true,tolerance:true,bands:true,averagePeriod:5,theme:"night",palette:"aurora"};
const guard=NUExchangeGuard.create(window.localStorage),maintenance=NUExchangeLock.create(window.localStorage);
const drawing=window.NUExchangeVisuals?window.NUExchangeVisuals.create({canvas:$("market-chart"),toolbar:$("chart-drawing-tools"),storage:window.localStorage}):null;
function format(n){return new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(Number(n)||0);}
function dateLabel(value){const d=new Date(value);return Number.isNaN(d.getTime())?"Recorded":new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function readCache(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||"null");}catch(_){return null;}}
function renderWalletConnection(snapshot){
 const host=$("wallet-connection");if(!host)return;
 if(!snapshot){host.innerHTML='<p class="panel-note">Wallet connector unavailable.</p>';return;}
 const p=snapshot.player||{};
 const assetHtml=(snapshot.assets||[]).map(a=>'<article class="exchange-card"><span>'+esc(a.label)+'</span><strong>'+format(a.value)+esc(a.unit||"")+'</strong></article>').join("");
 const txHtml=(snapshot.transactions||[]).map(tx=>'<div class="asset-row"><div><strong>'+esc(tx.title||tx.kind||"Wallet activity")+'</strong><small>'+esc(dateLabel(tx.at))+'</small></div><span class="asset-delta">'+esc(Object.entries(tx.deltas||{}).map(([k,v])=>k+": "+(Number(v)>0?"+":"")+format(v)).join(" · "))+'</span></div>').join("")||'<p class="panel-note">No recorded transactions yet.</p>';
 host.innerHTML='<div class="wallet-connection-head"><div><p class="eyebrow">CONNECTED LOCAL PLAYER PROFILE</p><h2>'+esc(p.displayName||"N.U Explorer")+'</h2><p class="panel-note">'+esc(p.id||"LOCAL-PLAYER")+(p.callsign?" · "+esc(p.callsign):"")+" · Level "+format(p.level||1)+'</p></div><span class="sim-tag">READ ONLY · LOCAL SAVE</span></div><div class="market-summary wallet-asset-grid">'+assetHtml+'</div><div class="wallet-unpriced"><strong>Unpriced / not enabled for exchange</strong><span>X Credits: '+format(snapshot.unpricedFields&&snapshot.unpricedFields.xCredits)+'</span><span>N Credits: '+format(snapshot.unpricedFields&&snapshot.unpricedFields.nCredits)+'</span></div><div class="panel-heading"><div><p class="eyebrow">SAME WALLET · NO COPIED BALANCE</p><h2>RECENT WALLET TRANSACTIONS</h2></div><span>'+format(snapshot.transactionCount||0)+' RECORDED</span></div><div class="asset-transactions">'+txHtml+'</div>';
}
function snapshot(save,rows){
 const out={version:2,updatedAt:new Date().toISOString(),assets:{},market:{}};
 rows.forEach(r=>{const all=NUWallet.assetHistory(save,r.key);out.assets[r.key]={chart:all.slice(-(MAX_CHART_STEPS+1)),recent:all.slice(1).slice(-MAX_TEXT_HISTORY)};});
 NUVirtualMarket.assets(save).forEach(a=>{const steps=NUVirtualMarket.build(save,a.key).steps.slice(-MAX_CHART_STEPS);out.market[a.key]={steps,recent:steps.slice(-MAX_TEXT_HISTORY)};});
 return out;
}
function chartColors(){
 const css=getComputedStyle(document.body);
 return {positive:css.getPropertyValue("--positive").trim()||"#70dfaa",negative:css.getPropertyValue("--negative").trim()||"#ff8b91",accent:css.getPropertyValue("--accent").trim()||"#78d7e8",analysis:css.getPropertyValue("--analysis").trim()||"#e7c77a",grid:css.getPropertyValue("--grid").trim()||"rgba(160,205,224,.14)",muted:css.getPropertyValue("--muted").trim()||"#91aab9",analysisMuted:css.getPropertyValue("--analysis-muted").trim()||"#8e9aa4"};
}
function drawBalance(points){
 const canvas=$("asset-chart"),ctx=canvas.getContext("2d"),w=canvas.clientWidth||600,h=280,dpr=Math.min(window.devicePixelRatio||1,2),visible=points.slice(-chartPrefs.zoom),colors=chartColors();
 canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 if(visible.length<2){canvas.hidden=true;$("chart-empty").hidden=false;return;}
 canvas.hidden=false;$("chart-empty").hidden=true;
 const pad={l:52,r:16,t:18,b:34},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,vals=visible.map(p=>Number(p.balance)||0),min=Math.min(0,...vals),max=Math.max(1,...vals),span=Math.max(1,max-min);
 const y=v=>pad.t+ph-(v-min)/span*ph,x=i=>pad.l+i/(visible.length-1)*pw;
 ctx.font="11px system-ui";ctx.textAlign="right";ctx.textBaseline="middle";
 for(let i=0;i<=4;i++){const v=min+span*i/4,yy=y(v);if(chartPrefs.grid){ctx.strokeStyle=colors.grid;ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();}ctx.fillStyle=colors.muted;ctx.fillText(format(v),pad.l-9,yy);}
 if(chartPrefs.grid){for(let i=0;i<=4;i++){const xx=pad.l+pw*i/4;ctx.strokeStyle=colors.grid;ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,pad.t+ph);ctx.stroke();}}
 ctx.strokeStyle=colors.accent;ctx.lineWidth=2.2;ctx.beginPath();visible.forEach((p,i)=>i?ctx.lineTo(x(i),y(p.balance)):ctx.moveTo(x(i),y(p.balance)));ctx.stroke();
 ctx.fillStyle=colors.accent+"22";ctx.beginPath();ctx.moveTo(x(0),y(visible[0].balance));visible.forEach((p,i)=>ctx.lineTo(x(i),y(p.balance)));ctx.lineTo(x(visible.length-1),pad.t+ph);ctx.lineTo(x(0),pad.t+ph);ctx.closePath();ctx.fill();
 visible.forEach((p,i)=>{ctx.beginPath();ctx.fillStyle=colors.accent;ctx.arc(x(i),y(p.balance),2.8,0,Math.PI*2);ctx.fill();});
 ctx.textAlign="center";ctx.textBaseline="top";ctx.fillStyle=colors.muted;[...new Set([0,Math.floor((visible.length-1)/2),visible.length-1])].forEach(i=>ctx.fillText(dateLabel(visible[i].at),x(i),h-pad.b+10));
}
function drawMarket(steps){
 const canvas=$("market-chart"),ctx=canvas.getContext("2d"),w=canvas.clientWidth||700,h=330,dpr=Math.min(window.devicePixelRatio||1,2),visible=steps.slice(-chartPrefs.zoom),colors=chartColors();
 canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 if(!visible.length){canvas.hidden=true;$("market-empty").hidden=false;return;}
 canvas.hidden=false;$("market-empty").hidden=true;
 const pad={l:58,r:18,t:20,b:42},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b;
 const lows=visible.map(s=>chartPrefs.tolerance?Number(s.low):Math.min(Number(s.open),Number(s.close))),highs=visible.map(s=>chartPrefs.tolerance?Number(s.high):Math.max(Number(s.open),Number(s.close)));
 const lo=Math.min(...lows),hi=Math.max(...highs),spread=Math.max(1,hi-lo),min=lo-spread*.12,max=hi+spread*.12,span=max-min;
 const y=v=>pad.t+(max-v)/span*ph,slot=pw/visible.length,cw=Math.max(4,Math.min(18,slot*.52));
 ctx.font="11px system-ui";ctx.textAlign="right";ctx.textBaseline="middle";
 for(let i=0;i<=4;i++){const v=min+span*i/4,yy=y(v);if(chartPrefs.grid){ctx.strokeStyle=colors.grid;ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();}ctx.fillStyle=colors.muted;ctx.fillText(v.toFixed(2),pad.l-9,yy);}
 if(chartPrefs.grid){for(let i=0;i<=4;i++){const xx=pad.l+pw*i/4;ctx.strokeStyle=colors.grid;ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,pad.t+ph);ctx.stroke();}}
 if(chartPrefs.bands){
  const bands=NUVirtualMarket.analysisBands(visible,chartPrefs.averagePeriod);
  if(bands.length){
   ctx.strokeStyle=colors.analysisMuted;ctx.lineWidth=1.25;ctx.setLineDash([3,5]);
   for(const edge of ["upper","lower"]){ctx.beginPath();let started=false;bands.forEach((band,i)=>{if(!Number.isFinite(band[edge]))return;const xx=pad.l+slot*(i+.5),yy=y(band[edge]);if(!started){ctx.moveTo(xx,yy);started=true;}else ctx.lineTo(xx,yy);});ctx.stroke();}
   ctx.setLineDash([]);
  }
 }
 const maxVol=Math.max(1,...visible.map(s=>Number(s.volume)||0));
 visible.forEach((s,i)=>{
  const cx=pad.l+slot*(i+.5),up=s.close>=s.open,color=up?colors.positive:colors.negative;
  if(chartPrefs.wicks){ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,y(highs[i]));ctx.lineTo(cx,y(lows[i]));ctx.stroke();}
  const top=Math.min(y(s.open),y(s.close)),body=Math.max(2,Math.abs(y(s.open)-y(s.close)));ctx.fillStyle=color;ctx.fillRect(cx-cw/2,top,cw,body);
  if(chartPrefs.volume){const vh=(Number(s.volume)||0)/maxVol*30;ctx.globalAlpha=.32;ctx.fillRect(cx-cw/2,h-pad.b+7,cw,vh);ctx.globalAlpha=1;}
 });
 if(chartPrefs.average&&visible.length>=chartPrefs.averagePeriod){
  ctx.strokeStyle=colors.analysis;ctx.lineWidth=1.8;ctx.setLineDash([5,4]);ctx.beginPath();let started=false;
  visible.forEach((s,i)=>{if(i+1<chartPrefs.averagePeriod)return;const slice=visible.slice(i+1-chartPrefs.averagePeriod,i+1),avg=slice.reduce((n,p)=>n+Number(p.close),0)/slice.length,xx=pad.l+slot*(i+.5);if(!started){ctx.moveTo(xx,y(avg));started=true;}else ctx.lineTo(xx,y(avg));});
  ctx.stroke();ctx.setLineDash([]);
 }
 ctx.textAlign="center";ctx.textBaseline="top";ctx.fillStyle=colors.muted;[...new Set([0,Math.floor((visible.length-1)/2),visible.length-1])].forEach(i=>ctx.fillText(dateLabel(visible[i].time),pad.l+slot*(i+.5),h-pad.b+12));
}
function renderHistory(items,id){
 $(id).innerHTML=items.slice().reverse().map(p=>'<div class="asset-row"><div><strong>'+esc(p.title)+'</strong><small>'+esc(dateLabel(p.at||p.time))+'</small></div><span class="asset-delta '+(p.delta>0?"positive":p.delta<0?"negative":"")+'">'+(p.delta>0?"+":"")+format(p.delta)+'</span><span class="asset-balance">'+format(p.balance??p.index??0)+'</span></div>').join("")||'<p class="panel-note">No recorded player activity for this asset yet.</p>';
}
function updateMarket(steps){
 const last=steps[steps.length-1],index=last?last.index:100,supply=steps.reduce((n,s)=>n+s.supply,0),demand=steps.reduce((n,s)=>n+s.demand,0);
 $("market-index").textContent=index.toFixed(2);$("market-change").textContent=(index>100?"+":"")+((index/100-1)*100).toFixed(2)+"%";$("market-change").className=index>100?"positive":index<100?"negative":"";
 $("market-volume").textContent=format(steps.reduce((n,s)=>n+s.volume,0));$("market-demand").textContent=format(demand);$("market-supply").textContent=format(supply);$("market-events").textContent=steps.length+" RECORDED STEPS";
 const bias=supply>demand?"SUPPLY-LEANING":demand>supply?"DEMAND-LEANING":"BALANCED";$("market-bias").textContent=bias;$("market-bias").className="bias-indicator "+(supply>demand?"positive":demand>supply?"negative":"");$("market-bias").dataset.direction=supply>demand?"up":demand>supply?"down":"flat";
 drawMarket(steps);if(drawing){drawing.setAsset(marketSelected);drawing.render($("market-chart").getContext("2d"),$("market-chart").clientWidth||700,330,steps,marketSelected);}renderHistory(steps.slice(-MAX_TEXT_HISTORY).map(s=>({title:s.title,time:s.time,delta:s.delta,index:s.index})),"market-history");
}
function frame(cache,rows){
 const mode=NUExchangeReplay.getMode(replayMode),elapsed=Date.now()-replayStart,asset=cache.assets[selected]||{chart:[],recent:[]},points=asset.chart||[];
 const ai=NUExchangeReplay.frameIndex(elapsed,points.length,mode.durationMs),shown=NUExchangeReplay.visibleSteps(points,ai),row=rows.find(r=>r.key===selected);
 $("asset-balance").textContent=format(row?row.value:0)+(row?row.unit:"");
 const net=shown.length>1?shown[shown.length-1].balance-shown[0].balance:0;$("asset-change").textContent=(net>0?"+":"")+format(net);$("asset-change").className=net>0?"positive":net<0?"negative":"";
 $("history-count").textContent=Math.max(0,shown.length-1)+" RECORDS";drawBalance(shown);
 renderHistory((asset.recent||[]).filter(p=>shown.some(v=>v.id===p.id)).slice(-MAX_TEXT_HISTORY),"asset-transactions");
 const market=(cache.market[marketSelected]||{steps:[]}).steps||[],mi=NUExchangeReplay.frameIndex(elapsed,market.length,mode.durationMs),visible=NUExchangeReplay.visibleSteps(market,mi);
 updateMarket(visible);$("replay-mode-label").textContent=mode.label.toUpperCase()+" · REPLAYING SAVED ACTIVITY";$("replay-progress").textContent=shown.length+" VISIBLE";
}
function updateGuard(){
 const s=guard.state(),el=$("exchange-cooldown-status");
 el.textContent=s.locked?"EXCHANGE CLOSED · REOPENING IN "+Math.ceil(s.remainingMs/1000)+"s":"READY · "+s.successes+"/10 SUCCESSFUL ACTIONS THIS VISIT";
 el.classList.toggle("cooldown-active",s.locked);
 $("exchange-lock-status").textContent=maintenance.isLocked()?"TRANSFER MODULE LOCKED":"TRANSFER MODULE UNLOCKED";
 $("exchange-lock-status").className=maintenance.isLocked()?"pending-tag":"sim-tag";
}
function signalLedgerChange(){
 const panel=document.querySelector(".market-panel");if(!panel)return;
 panel.classList.remove("ledger-updated");void panel.offsetWidth;panel.classList.add("ledger-updated");
 window.clearTimeout(ledgerPulseTimer);ledgerPulseTimer=window.setTimeout(()=>panel.classList.remove("ledger-updated"),720);
}
function refresh(){
 const save=NUWallet.normalizeSave(NU.load()),wallet=NUExchangeEngines.walletEngine.read(),rows=NUWallet.exchangeAssetRows(save).filter(r=>r.key!=="hp"),signature=JSON.stringify(save.transactions||[]);renderWalletConnection(wallet);NUExchangeEngines.protocolEngine.list().forEach(p=>{if(!NUExchangeCore.listGames().some(g=>g.id===p.gameId))NUExchangeCore.registerGame({id:p.gameId,name:p.displayName,assets:(p.assets||[]).map(a=>({id:a.assetId,label:a.label,unit:a.unit})),coins:(p.coins||[]).map(a=>({id:a.assetId,label:a.label,unit:a.unit})),transferEnabled:false});});
 if(lastLedgerSignature&&signature!==lastLedgerSignature){replayStart=Date.now();signalLedgerChange();}
 lastLedgerSignature=signature;
 if(!rows.some(r=>r.key===selected))selected=rows[0]?.key||"xp";
 $("asset-select").innerHTML=rows.map(r=>'<option value="'+r.key+'">'+esc(r.label)+'</option>').join("");$("asset-select").value=selected;
 const marketAssets=NUVirtualMarket.assets(save);if(!marketAssets.some(a=>a.key===marketSelected))marketSelected=marketAssets[0]?.key||"xp";$("market-asset").innerHTML=marketAssets.map(a=>'<option value="'+a.key+'">'+esc(a.label)+'</option>').join("");$("market-asset").value=marketSelected;
 const next=snapshot(save,rows);try{localStorage.setItem(CACHE_KEY,JSON.stringify(next));}catch(_){}
 const cache=readCache()||next;frame(cache,rows);
 const games=NUExchangeCore.listGames();$("change-from").innerHTML=games.map(g=>'<option value="'+g.id+'">'+esc(g.name)+'</option>').join("");
 $("change-to").innerHTML=games.map(g=>'<option value="'+g.id+'">'+esc(g.name)+'</option>').join("");
 $("change-coin").innerHTML=NUExchangeCore.listCoins().map(a=>'<option value="'+a.id+'">'+esc(a.label)+'</option>').join("");
 $("change-asset").innerHTML=NUExchangeCore.listAssets().map(a=>'<option value="'+a.id+'">'+esc(a.label)+'</option>').join("");
 $("change-empty").hidden=games.length>0;$("change-submit").disabled=true;updateGuard();
}
function loadChartPreferences(){
 try{const saved=JSON.parse(localStorage.getItem(PREF_KEY)||"null");if(saved&&typeof saved==="object")chartPrefs=Object.assign(chartPrefs,saved);}catch(_){}
 chartPrefs.zoom=Math.max(4,Math.min(24,Number(chartPrefs.zoom)||24));
 chartPrefs.averagePeriod=Math.max(3,Math.min(12,Number(chartPrefs.averagePeriod)||5));
 chartPrefs.bands=chartPrefs.bands!==false;
 chartPrefs.theme=["night","day"].includes(chartPrefs.theme)?chartPrefs.theme:"night";
 chartPrefs.palette=["aurora","emerald","rose","amber","mono"].includes(chartPrefs.palette)?chartPrefs.palette:"aurora";
}
function saveChartPreferences(){try{localStorage.setItem(PREF_KEY,JSON.stringify(chartPrefs));}catch(_){}}
function applyChartPreferences(){
 document.body.dataset.theme=chartPrefs.theme;document.body.dataset.palette=chartPrefs.palette;
 $("chart-zoom").value=String(chartPrefs.zoom);$("chart-zoom-value").textContent=String(chartPrefs.zoom);
 $("chart-grid-toggle").checked=chartPrefs.grid;$("chart-wicks-toggle").checked=chartPrefs.wicks;
 $("chart-volume-toggle").checked=chartPrefs.volume;$("chart-average-toggle").checked=chartPrefs.average;
 $("chart-tolerance-toggle").checked=chartPrefs.tolerance;$("chart-bands-toggle").checked=chartPrefs.bands;$("chart-average-period").value=String(chartPrefs.averagePeriod);
 $("chart-theme").value=chartPrefs.theme;$("chart-palette").value=chartPrefs.palette;
}
function bindChartPreferences(){
 loadChartPreferences();applyChartPreferences();
 const bind=(id,key,read)=>$(id).addEventListener("input",e=>{chartPrefs[key]=read(e.target);saveChartPreferences();applyChartPreferences();refresh();});
 const bindChange=(id,key,read)=>$(id).addEventListener("change",e=>{chartPrefs[key]=read(e.target);saveChartPreferences();applyChartPreferences();refresh();});
 bind("chart-zoom","zoom",el=>Number(el.value));
 bindChange("chart-average-period","averagePeriod",el=>Number(el.value));
 bindChange("chart-theme","theme",el=>el.value);
 bindChange("chart-palette","palette",el=>el.value);
 [["chart-grid-toggle","grid"],["chart-wicks-toggle","wicks"],["chart-volume-toggle","volume"],["chart-average-toggle","average"],["chart-tolerance-toggle","tolerance"],["chart-bands-toggle","bands"]].forEach(([id,key])=>$(id).addEventListener("change",e=>{chartPrefs[key]=e.target.checked;saveChartPreferences();applyChartPreferences();refresh();}));
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
window.addEventListener("nu:save-updated",refresh);
window.addEventListener("nu:exchange:wallet-refresh",refresh);
window.addEventListener("storage",e=>{if(e.key===NU.storageKey)refresh();});
window.addEventListener("pageshow",()=>{replayStart=Date.now();refresh();});
window.addEventListener("resize",()=>{const rows=NUWallet.exchangeAssetRows(NU.load()).filter(r=>r.key!=="hp"),cache=readCache();if(cache)frame(cache,rows);});
bindChartPreferences();refresh();replayTimer=window.setInterval(()=>{const save=NUWallet.normalizeSave(NU.load()),signature=JSON.stringify(save.transactions||[]);if(signature!==lastLedgerSignature)refresh();else{const cache=readCache();if(cache)frame(cache,NUWallet.exchangeAssetRows(save).filter(r=>r.key!=="hp"));}updateGuard();},250);
window.addEventListener("pagehide",()=>{clearInterval(replayTimer);guard.leaveVisit();});
})();