/* N.U Exchange — local chart drawing + ambient market-flow visuals.
 * Every ambient pulse is presentation-only; annotations are local UI preferences.
 * Neither feature writes wallet data, transactions, balances, or market history.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUExchangeVisuals=api;
})(typeof window!=="undefined"?window:globalThis,function(){
 "use strict";
 const STORAGE_KEY="nu_exchange_chart_annotations_v1";
 const TOOLS=new Set(["cursor","trend","horizontal","vertical","zone"]);
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function ambientPulse(steps,phase,index){
  const sample=(steps||[]).slice(-8),volume=sample.length?sample.reduce((n,s)=>n+(Number(s.volume)||0),0)/sample.length:0;
  const demand=sample.reduce((n,s)=>n+(Number(s.demand)||0),0),supply=sample.reduce((n,s)=>n+(Number(s.supply)||0),0);
  const bias=clamp((demand-supply)/(demand+supply+1),-1,1),amplitude=Math.min(3,.35+volume/10);
  const wave=Math.sin(phase+index*.83),delta=clamp(wave*amplitude+bias*amplitude*.22,-3,3);
  const displayVolume=Math.min(3,.3+(Math.abs(Math.cos(phase*.73+index*1.17))*2.7));
  return {bias,amplitude,delta,volume:displayVolume,sampleCount:sample.length};
 }
 const AMBIENT_PROBABILITIES=Object.freeze({zero:.10,one:.30,two:.30,three:.30,positive:.50});
 function seedRandom(text){
  let seed=2166136261;
  for(let i=0;i<text.length;i++)seed=Math.imul(seed^text.charCodeAt(i),16777619)>>>0;
  return function(){seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
 }
 const ambientStates=new Map();
 function ambientMarket(recordedSteps,assetKey,now){
  const recorded=Array.isArray(recordedSteps)?recordedSteps.slice(-24):[];
  const sample=recorded.slice(-8),demand=sample.reduce((n,s)=>n+(Number(s.demand)||0),0),supply=sample.reduce((n,s)=>n+(Number(s.supply)||0),0);
  const behaviorBias=clamp((demand-supply)/(demand+supply+1),-1,1);
  const count=recorded.length?6:24,tick=Math.floor((Number(now)||Date.now())/2200),key=String(assetKey||"xp");
  const last=recorded[recorded.length-1],base=last?Number(last.close??last.index)||100:100,anchor=last?String(last.id||last.time||last.title||"recorded"): "no-player-activity";
  let state=ambientStates.get(key);
  if(!state||state.base!==base||state.anchor!==anchor||state.count!==count||tick<state.tick){
   state={base,anchor,count,price:base,tick:tick-count,steps:[]};
  }
  for(let bucket=state.tick+1;bucket<=tick;bucket++){
   const random=seedRandom(key+"|"+bucket),roll=random(),magnitude=roll<.30?3:roll<.60?2:roll<.90?1:0;
   const direction=random()<.5?1:-1,delta=magnitude*direction,open=state.price,close=clamp(open+delta,50,200);
   const behaviorFactor=1+Math.abs(behaviorBias)*.25,volume=Math.min(3,magnitude*behaviorFactor),stamp=new Date(bucket*2200).toISOString();
   state.steps.push({id:"ambient-"+key+"-"+bucket,time:stamp,title:"Simulated background flow",delta,index:close,changePct:(close/100-1)*100,volume,demand:delta>0?volume:0,supply:delta<0?volume:0,open,high:Math.max(open,close),low:Math.min(open,close),close,simulated:true,visualOnly:true});
   state.price=close;
  }
  state.tick=tick;state.steps=state.steps.slice(-count);ambientStates.set(key,state);
  const retained=recorded.slice(-Math.max(0,24-state.steps.length));
  return {steps:retained.concat(state.steps),simulatedCount:state.steps.length,behaviorBias,probabilities:AMBIENT_PROBABILITIES};
 }
 function create(options){
  options=options||{};
  const canvas=options.canvas,toolbar=options.toolbar,storage=options.storage||null;
  if(!canvas||!toolbar)return {setAsset(){},render(){},destroy(){}};
  let asset="xp",tool="cursor",annotations={},draft=null,last=null;
  function read(){
   try{const raw=JSON.parse(storage&&storage.getItem(STORAGE_KEY)||"{}");annotations=raw&&typeof raw==="object"?raw:{};}catch(_){annotations={};}
  }
  function save(){
   try{if(storage)storage.setItem(STORAGE_KEY,JSON.stringify(annotations));}catch(_){}
  }
  function current(){return Array.isArray(annotations[asset])?annotations[asset]:[];}
  function point(event){
   const r=canvas.getBoundingClientRect();
   return {x:clamp((event.clientX-r.left)/Math.max(1,r.width),0,1),y:clamp((event.clientY-r.top)/Math.max(1,r.height),0,1)};
  }
  function redraw(){
   if(!last)return;
   render(last.ctx,last.width,last.height,last.steps,last.asset);
  }
  function setTool(next){
   if(!TOOLS.has(next))return;
   tool=next;draft=null;
   toolbar.querySelectorAll("[data-draw-tool]").forEach(button=>{
    const active=button.dataset.drawTool===tool;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-pressed",String(active));
   });
   canvas.style.cursor=tool==="cursor"?"crosshair":"crosshair";
   canvas.style.touchAction=tool==="cursor"?"pan-y":"none";
   redraw();
  }
  function drawAnnotation(ctx,item,w,h,preview){
   const x1=item.a.x*w,y1=item.a.y*h,x2=item.b.x*w,y2=item.b.y*h;
   ctx.save();ctx.lineWidth=preview?2:1.7;ctx.setLineDash(item.kind==="zone"?[5,4]:[7,5]);
   ctx.strokeStyle=item.kind==="zone"?"rgba(120,215,232,.92)":"rgba(231,199,122,.96)";
   if(item.kind==="horizontal"){ctx.beginPath();ctx.moveTo(0,y1);ctx.lineTo(w,y1);ctx.stroke();}
   else if(item.kind==="vertical"){ctx.beginPath();ctx.moveTo(x1,0);ctx.lineTo(x1,h);ctx.stroke();}
   else if(item.kind==="zone"){
    const left=Math.min(x1,x2),top=Math.min(y1,y2),width=Math.abs(x2-x1),height=Math.abs(y2-y1);
    ctx.fillStyle="rgba(120,215,232,.13)";ctx.fillRect(left,top,width,height);
    ctx.strokeRect(left,top,width,height);
   }else{
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    if(item.kind==="trend"){ctx.setLineDash([]);ctx.fillStyle="rgba(231,199,122,.96)";ctx.beginPath();ctx.arc(x1,y1,2.7,0,Math.PI*2);ctx.arc(x2,y2,2.7,0,Math.PI*2);ctx.fill();}
   }
   ctx.restore();
  }
  function renderAmbient(ctx,w,h,steps){
   const phase=Date.now()/1750,base=ambientPulse(steps,phase,0),bias=base.bias,amplitude=base.amplitude;
   const positive=getComputedStyle(document.body).getPropertyValue("--positive").trim()||"#70dfaa";
   const negative=getComputedStyle(document.body).getPropertyValue("--negative").trim()||"#ff8b91";
   const baseY=h-48,slot=w/12;
   ctx.save();
   for(let i=0;i<10;i++){
    const pulse=ambientPulse(steps,phase,i),drift=pulse.delta,volume=pulse.volume;
    const barH=3+volume*3.4,xx=slot*(i+1),yy=baseY-barH;
    ctx.globalAlpha=.11+volume/22;ctx.fillStyle=drift>=0?positive:negative;
    ctx.fillRect(xx,yy,Math.max(2,slot*.22),barH);
    ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(xx+slot*.11,yy,1.7,0,Math.PI*2);ctx.fill();
   }
   ctx.restore();
   return {bias,amplitude,phase,sampleCount:base.sampleCount};
  }
  function render(ctx,width,height,steps,assetKey){
   if(!ctx)return;
   const w=width||canvas.clientWidth||600,h=height||canvas.clientHeight||330;
   last={ctx,width:w,height:h,steps:steps||[],asset:assetKey||asset};
   const ambient=renderAmbient(ctx,w,h,steps||[]);
   current().forEach(item=>drawAnnotation(ctx,item,w,h,false));
   if(draft)drawAnnotation(ctx,draft,w,h,true);
   const tape=toolbar.querySelector("[data-ambient-status]");
   if(tape){
    const direction=ambient.bias>.12?"BUY-LEANING":ambient.bias<-.12?"SELL-LEANING":"BALANCED";
    tape.textContent="BACKGROUND FLOW · "+direction+" · ±"+ambient.amplitude.toFixed(2)+" INDEX · MAX 3 UNITS · VISUAL ONLY";
   }
  }
  function commit(p){
   if(!draft)return;
   const item={kind:draft.kind,a:draft.a,b:p};
   if(item.kind==="horizontal")item.b={x:1,y:item.a.y};
   if(item.kind==="vertical")item.b={x:item.a.x,y:1};
   if(item.kind==="zone"&&Math.abs(item.a.x-item.b.x)<.008&&Math.abs(item.a.y-item.b.y)<.008){draft=null;redraw();return;}
   annotations[asset]=current().concat(item).slice(-40);draft=null;save();redraw();
  }
  canvas.addEventListener("pointerdown",event=>{
   if(tool==="cursor")return;
   event.preventDefault();const p=point(event);
   if(tool==="horizontal"||tool==="vertical"){draft={kind:tool,a:p,b:p};commit(p);return;}
   draft={kind:tool,a:p,b:p};try{canvas.setPointerCapture(event.pointerId);}catch(_){}redraw();
  });
  canvas.addEventListener("pointermove",event=>{
   if(!draft||tool==="cursor")return;
   event.preventDefault();draft.b=point(event);redraw();
  });
  function finish(event){if(!draft)return;const p=point(event);commit(p);}
  canvas.addEventListener("pointerup",finish);
  canvas.addEventListener("pointercancel",()=>{draft=null;redraw();});
  toolbar.addEventListener("click",event=>{
   const button=event.target.closest("button");if(!button)return;
   if(button.dataset.drawTool){setTool(button.dataset.drawTool);return;}
   if(button.dataset.drawAction==="undo"){annotations[asset]=current().slice(0,-1);save();redraw();}
   if(button.dataset.drawAction==="clear"){annotations[asset]=[];save();redraw();}
  });
  read();setTool("cursor");
  return {
   setAsset(key){asset=String(key||"xp");draft=null;redraw();},
   render,
   getAnnotations(){return current().slice();},
   destroy(){canvas.removeEventListener("pointerdown",()=>{});}
  };
 }
 return {create,TOOLS,STORAGE_KEY,ambientPulse};
});
