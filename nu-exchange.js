(function(){
"use strict";
const $=id=>document.getElementById(id);
const labels={xp:"XP",mana:"Mana",hp:"HP",hpPills:"HP Capsules",manaCapsules:"Mana Capsules",casinoCredits:"Casino Credits"};
const number=n=>Number.isFinite(Number(n))?Number(n):0;
let save=NUWallet.normalizeSave(NU.load()),selected="";
function format(n){return new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(n);}
function dateLabel(value){const d=new Date(value);return Number.isNaN(d.getTime())?"Earlier":new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);}
function draw(points){
 const canvas=$("asset-chart"),ctx=canvas.getContext("2d"),width=canvas.clientWidth||600,height=280,dpr=Math.min(window.devicePixelRatio||1,2);
 canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
 if(points.length<2){$("chart-empty").hidden=false;canvas.hidden=true;return;}
 $("chart-empty").hidden=true;canvas.hidden=false;
 const pad={l:52,r:16,t:18,b:34},plotW=width-pad.l-pad.r,plotH=height-pad.t-pad.b;
 const values=points.map(p=>number(p.balance)),min=Math.min(0,...values),max=Math.max(1,...values),span=Math.max(1,max-min),y=v=>pad.t+plotH-(v-min)/span*plotH,x=i=>pad.l+i/(points.length-1)*plotW;
 ctx.font="11px system-ui";ctx.textAlign="right";ctx.textBaseline="middle";
 for(let i=0;i<=4;i++){const v=min+span*i/4,yy=y(v);ctx.strokeStyle="rgba(160,205,224,.13)";ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(width-pad.r,yy);ctx.stroke();ctx.fillStyle="#91aab9";ctx.fillText(format(v),pad.l-9,yy);}
 ctx.strokeStyle="#78d7e8";ctx.lineWidth=2.5;ctx.beginPath();points.forEach((p,i)=>{if(i===0)ctx.moveTo(x(i),y(p.balance));else ctx.lineTo(x(i),y(p.balance));});ctx.stroke();
 ctx.fillStyle="rgba(120,215,232,.12)";ctx.beginPath();ctx.moveTo(x(0),y(points[0].balance));points.forEach((p,i)=>ctx.lineTo(x(i),y(p.balance)));ctx.lineTo(x(points.length-1),pad.t+plotH);ctx.lineTo(x(0),pad.t+plotH);ctx.closePath();ctx.fill();
 points.forEach((p,i)=>{ctx.beginPath();ctx.fillStyle="#d8f7ff";ctx.arc(x(i),y(p.balance),3.5,0,Math.PI*2);ctx.fill();});
 ctx.textAlign="center";ctx.textBaseline="top";ctx.fillStyle="#91aab9";const ticks=[0,Math.floor((points.length-1)/2),points.length-1];[...new Set(ticks)].forEach(i=>ctx.fillText(dateLabel(points[i].at).replace(/,.*$/,""),x(i),height-pad.b+10));
}
function render(){
 save=NUWallet.normalizeSave(NU.load());
 const rows=NUWallet.assetRows(save);if(!selected||!rows.some(r=>r.key===selected))selected=rows[0]?.key||"xp";
 $("asset-select").innerHTML=rows.map(r=>'<option value="'+r.key+'">'+r.label+'</option>').join("");$("asset-select").value=selected;
 const row=rows.find(r=>r.key===selected),points=NUWallet.assetHistory(save,selected),history=points.slice(1);
 $("asset-balance").textContent=format(row?.value||0)+(row?.unit||"");
 const net=history.reduce((sum,p)=>sum+p.delta,0);$("asset-change").textContent=(net>0?"+":"")+format(net);
 $("asset-change").className=net>0?"positive":net<0?"negative":"";
 $("history-count").textContent=history.length+" RECORDS";
 draw(points);
 const target=$("asset-transactions");
 target.innerHTML=history.slice().reverse().map(p=>'<div class="asset-row"><div><strong>'+escapeText(p.title)+'</strong><small>'+escapeText(dateLabel(p.at))+'</small></div><span class="asset-delta '+(p.delta>0?"positive":p.delta<0?"negative":"")+'">'+(p.delta>0?"+":"")+format(p.delta)+'</span><span class="asset-balance">'+format(p.balance)+'</span></div>').join("")||'<p class="panel-note">No saved transactions affect this asset yet.</p>';
}
function escapeText(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("asset-select").addEventListener("change",e=>{selected=e.target.value;render();});
window.addEventListener("storage",e=>{if(e.key===NU.storageKey)render();});
window.addEventListener("pageshow",render);window.addEventListener("resize",()=>draw(NUWallet.assetHistory(NU.load(),selected)));
render();
})();