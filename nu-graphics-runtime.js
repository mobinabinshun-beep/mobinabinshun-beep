/* N.U Graphics Runtime v1.0 — conservative game budget; static image only. */
(function(g){
"use strict";
let running=false,observer=null;
function activeClass(el){return !!(el&&el.classList.contains("active"));}
function syncPageState(){
 const intro=document.getElementById("intro"),menu=document.getElementById("menu"),profile=document.getElementById("profile-view"),wallet=document.getElementById("wallet-view"),shop=document.getElementById("shop-view");
 const gatewayOpen=!!(document.body&&document.body.classList.contains("nu-gateway-open"));
 const frozen=!!(gatewayOpen||(intro&&!intro.classList.contains("hidden"))||(menu&&menu.classList.contains("open"))||activeClass(profile)||activeClass(wallet)||activeClass(shop));
 if(g.NUBackgroundEngine)g.NUBackgroundEngine.setFrozen(frozen);
}
function watchPage(){
 if(observer||!document.body)return;
 if(typeof MutationObserver!=="undefined"){
  observer=new MutationObserver(syncPageState);
  observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"]});
 }
 syncPageState();
}
async function start(sample){
 if(running)return;
 running=true;
 try{
  const p=await g.NUGraphicsCore.start(sample);
  if(g.NUBackgroundEngine){g.NUBackgroundEngine.mount();g.NUBackgroundEngine.setQuality(p.budget);}
  if(g.NUGameRenderAdapter)g.NUGameRenderAdapter.apply(p);
  watchPage();
  const status=g.NUBackgroundEngine&&g.NUBackgroundEngine.getStatus?g.NUBackgroundEngine.getStatus():null;
  g.dispatchEvent(new CustomEvent("nu:graphics-ready",{detail:{profile:p,background:status,visualOverlays:"none",backgroundLayers:0}}));
 }catch(error){
  running=false;
  console.warn("N.U graphics runtime fallback",error);
 }
}
g.NUGraphicsRuntime={start:start,setGameActive:function(){},setMode:function(){}};
g.addEventListener("nu:calibrated",function(event){start(event&&event.detail&&event.detail.performance);},{once:true});
document.addEventListener("DOMContentLoaded",function(){if(g.NUBackgroundEngine)g.NUBackgroundEngine.mount();watchPage();},{once:true});
})(window);
