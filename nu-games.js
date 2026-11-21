/* N.U Generation 1 game prototypes. Each selected round is fixed for 10 interactions. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const state={save:NUWallet.normalizeSave(NU.load()),game:null,turn:0,active:false,paused:false,quality:5,engine:null,roundSeed:0,targets:[],targetSequence:0,shots:0,raf:0,lastFrame:0,keyboardTargetIndex:-1,keyboardMode:false};
const gatewayPause=window.NUGatewayPause.create();

function syncGatewayBackgrounds(frozen){
 const shouldFreeze=!!frozen||document.hidden;
 if(state.engine&&typeof state.engine[shouldFreeze?"pause":"resume"]==="function")state.engine[shouldFreeze?"pause":"resume"]();
 if(window.NUBackgroundEngine&&typeof window.NUBackgroundEngine.setFrozen==="function")window.NUBackgroundEngine.setFrozen(shouldFreeze);
 if(window.NUDynamicLayers&&typeof window.NUDynamicLayers.setFrozen==="function")window.NUDynamicLayers.setFrozen(shouldFreeze);
 if(window.NUPixelWorld){const background=window.NUBackgroundEngine&&window.NUBackgroundEngine.getStatus?window.NUBackgroundEngine.getStatus():null;window.NUPixelWorld.setEnabled(!shouldFreeze&&!(background&&background.loaded));}
}
function handleGatewayOpen(){
 if(gatewayPause.open(state)){
  if(state.raf)cancelAnimationFrame(state.raf);
  state.raf=0;
 }
 
 syncGatewayBackgrounds(true);
}
function resumeAfterGatewayReturn(){
 if(!gatewayPause.resumeOnInteraction(state))return false;
 state.lastFrame=0;
 if(!document.hidden&&$("game-view").classList.contains("active"))state.raf=requestAnimationFrame(animateGame);
 syncGatewayBackgrounds(false);
 $("game-info").textContent="Round resumed.";
 return true;
}
function handleGatewayClose(){
 const waiting=gatewayPause.close(state);
 if(waiting&&$("game-view").classList.contains("active")){
  if(state.raf)cancelAnimationFrame(state.raf);
  state.raf=0;
 }
 syncGatewayBackgrounds(state.paused);
}
window.addEventListener("nu:gateway-open",handleGatewayOpen);
window.addEventListener("nu:gateway-close",handleGatewayClose);
window.addEventListener("nu:simulated-pointer-move",()=>{if(gatewayPause.isAwaitingInteraction())resumeAfterGatewayReturn();});
const games=[
 {id:"bubble",name:"Bubble Hunt",desc:"Find the rain-glass droplets and collect XP.",status:"PLAYABLE"},
 {id:"mana",name:"Mana Collector",desc:"Collect luminous hexagonal Mana particles.",status:"PLAYABLE"},
 {id:"chaos",name:"Chaos Attack",desc:"Spot Chaos masses; the N-BI cannon fires from outside your view.",status:"PLAYABLE"}
];
let exchangeInstalledIds=games.map(game=>game.id);
const exchangeManifests=[
 {gameId:"bubble",displayName:"Bubble Hunt",manifestVersion:"g1-2026-11-15",assets:[{assetId:"g1.xp",label:"XP",walletKey:"xp",unit:"XP",kind:"asset",valuationClass:"non-convertible",source:"nu.g1.shared-economy"},{assetId:"g1.hp",label:"HP",walletKey:"hp",unit:"HP",kind:"asset",valuationClass:"non-convertible",source:"nu.g1.shared-economy"},{assetId:"g1.hp-capsule",label:"HP Capsules",walletKey:"hpPills",unit:"capsule",kind:"asset",valuationClass:"non-convertible",source:"nu.g1.shared-economy"}]},
 {gameId:"mana",displayName:"Mana Collector",manifestVersion:"g1-2026-11-15",assets:[{assetId:"g1.mana",label:"Mana",walletKey:"mana",unit:"Mana",kind:"asset",valuationClass:"non-convertible",source:"nu.g1.shared-economy"},{assetId:"g1.mana-capsule",label:"Mana Capsules",walletKey:"manaCapsules",unit:"capsule",kind:"asset",valuationClass:"non-convertible",source:"nu.g1.shared-economy"},{assetId:"g1.hp",label:"HP",walletKey:"hp",unit:"HP",kind:"asset",valuationClass:"non-convertible",source:"nu.g1.shared-economy"}]},
 {gameId:"chaos",displayName:"Chaos Attack",manifestVersion:"g1-2026-11-15",assets:[{assetId:"g1.hp",label:"HP",walletKey:"hp",unit:"HP",kind:"asset",valuationClass:"non-convertible",source:"nu.g1.shared-economy"},{assetId:"g1.mana",label:"Mana",walletKey:"mana",unit:"Mana",kind:"asset",valuationClass:"non-convertible",source:"nu.g1.shared-economy"},{assetId:"g1.xp",label:"XP",walletKey:"xp",unit:"XP",kind:"asset",valuationClass:"non-convertible",source:"nu.g1.shared-economy"}]}
];
function syncExchangeModuleLifecycle(installedGameIds){
 if(!window.NUExchangeCore||!window.NUExchangeEngines)return {ok:false,reason:"EXCHANGE_ENGINE_UNAVAILABLE"};
 const protocol=window.NUExchangeEngines.protocolEngine;
 if(Array.isArray(installedGameIds))exchangeInstalledIds=installedGameIds.map(String);
 const installed=exchangeInstalledIds.slice(),ids=new Set(installed);
 exchangeManifests.forEach(manifest=>{
  const isInstalled=ids.has(manifest.gameId);
  if(isInstalled)protocol.discover(manifest,{installed:true});
  window.NUExchangeCore.registerGame({id:manifest.gameId,name:manifest.displayName,assets:manifest.assets.map(a=>({id:a.assetId,label:a.label,unit:a.unit})),coins:[],transferEnabled:false});
 });
 return protocol.reconcile({installedGameIds:installed});
}
window.NUExchangeModuleLifecycle={
 discover(manifest,installed){if(!window.NUExchangeEngines)return {ok:false,reason:"EXCHANGE_ENGINE_UNAVAILABLE"};return window.NUExchangeEngines.protocolEngine.discover(manifest,{installed:installed!==false});},
 reconcile(installedGameIds){return syncExchangeModuleLifecycle(installedGameIds);},
 manifests:exchangeManifests
};
window.addEventListener("nu:launcher:modules-changed",event=>{
 const detail=event.detail||{};
 if(window.NUExchangeEngines&&Array.isArray(detail.manifests))detail.manifests.forEach(manifest=>window.NUExchangeModuleLifecycle.discover(manifest,true));
 syncExchangeModuleLifecycle(Array.isArray(detail.installedGameIds)?detail.installedGameIds:games.map(game=>game.id));
});
syncExchangeModuleLifecycle(games.map(game=>game.id));
window.addEventListener("nu:save-updated",()=>syncExchangeModuleLifecycle(exchangeInstalledIds));
window.addEventListener("storage",event=>{if(event.key===NU.storageKey)syncExchangeModuleLifecycle(exchangeInstalledIds);});
const canvas=$("game-canvas"),ctx=canvas.getContext("2d");
state.save.hp=Number.isFinite(state.save.hp)?state.save.hp:10;state.save.hpPills=Number.isFinite(state.save.hpPills)?Math.max(0,state.save.hpPills):0;state.save.manaCapsules=Number.isFinite(state.save.manaCapsules)?Math.max(1,Math.min(9,state.save.manaCapsules)):1;state.save.mana=Math.max(0,Math.min(state.save.mana,state.save.manaCapsules*10));
function save(){const ok=NU.save(state.save);if(ok){renderWallet();window.dispatchEvent(new CustomEvent("nu:save-updated"));}return ok;}function persistWalletState(next){const previous=state.save;state.save=next;if(!save()){state.save=previous;renderWallet();announceTransaction("SAVE FAILED · WALLET WAS NOT CHANGED","warning");return false;}return true;}function recordGameDelta(asset,amount,category,successfulInteraction,rate){const result=NUWallet.recordWaveDelta(state.save,asset,amount,category,{successfulInteraction:!!successfulInteraction,rate});if(!result.ok)return false;return persistWalletState(result.state);}
function settleActiveWave(reason){if(!state.save.activeWave)return false;const wave=state.save.activeWave;const hpRows=Object.values(wave.aggregates||{}).filter(row=>row&&row.asset==="hp");const hpDelta=hpRows.reduce((sum,row)=>sum+Number(row.amount||0),0);const damageTaken=hpRows.reduce((sum,row)=>sum+Math.max(0,-Number(row.amount||0)),0);const result=NUWallet.settleWave(state.save,reason);if(!result.ok)return false;const saved=persistWalletState(result.state);if(saved&&window.NUHealth)window.NUHealth.recordWaveSummary({gameId:wave.gameId,waveId:wave.id,damageTaken,hpDelta,successfulInteractions:wave.successfulInteractions,reason});return saved;}
function awardXP(amount,source){return recordGameDelta("xp",amount,"GAME_REWARD",true,amount);}
function interactionSource(event){
 if(event&&event.keyboard)return "keyboard";
 if(event&&event.nuSimulated)return "simulated-mouse";
 if(event&&event.pointerType==="touch")return "direct-touch";
 if(event&&event.pointerType==="mouse")return "physical-mouse";
 return "game-input";
}
function recordGameObjectEvent(target,action,outcome,source,extra){
 const core=window.NUInteractionCore;
 if(!core||typeof core.record!=="function")return null;
 const gameId=target&&target.gameId||state.game||"unknown";
 const objectType=gameId==="bubble"?"bubble":gameId==="mana"?"mana-orb":gameId==="chaos"?"chaos-mass":"unknown";
 const detail=Object.assign({},extra||{},{
  gameId,
  waveId:target&&target.waveId||state.save.activeWave&&state.save.activeWave.id||null,
  objectType,
  objectId:target&&target.id!=null?String(target.id):null,
  action:String(action||"unknown"),
  outcome:String(outcome||"unknown")
 });
 const semanticAction=action==="target"?"hover":action==="activate"?"activate":action==="hit-test"?"select":"execute";
 try{return core.record(semanticAction,source||"game-runtime",canvas,detail);}catch(_){return null;}
}
function renderGameAssetProfile(){
 const root=$("game-asset-profile");if(!root||!state.game)return;
 const rows=NUWallet.gameAssetRows(state.save,state.game).filter(row=>Number(row.value)>0);
 if(Number(state.save.xp)>0)rows.unshift({key:"level",label:"LV",value:state.save.level,unit:""});
 if((state.game==="mana"||state.game==="chaos")&&Number(state.save.manaCapsules)>0&&!rows.some(row=>row.key==="manaCapsules")){
  rows.push({key:"manaCapsules",label:"Mana Capsules",value:state.save.manaCapsules,unit:""});
 }
 const visible=rows.filter(row=>Number.isFinite(Number(row.value))&&Number(row.value)>0);
 if(!visible.length){root.replaceChildren();root.hidden=true;return;}
 root.innerHTML='<div class="game-asset-rows">'+visible.map(row=>'<span>'+row.label+' '+row.value+row.unit+'</span>').join("")+'</div>';
}
function setAssetProfileExpanded(value){
 document.querySelectorAll(".bar-wrap,#hp-bar").forEach(el=>el.setAttribute("aria-expanded",String(value)));
}
function positionGameAssetProfile(trigger){
 const root=$("game-asset-profile");if(!root||!trigger)return;
 const rect=trigger.getBoundingClientRect(),width=root.offsetWidth||160,height=root.offsetHeight||24;
 const top=rect.top>innerHeight*.5?rect.top-height-8:rect.bottom+8;
 const left=rect.left+rect.width/2-width/2;
 root.style.left=Math.max(8,Math.min(innerWidth-width-8,left))+"px";
 root.style.top=Math.max(8,Math.min(innerHeight-height-8,top))+"px";
 root.style.transform="none";
}
function hideGameAssetProfile(){
 const root=$("game-asset-profile");if(root)root.hidden=true;
 setAssetProfileExpanded(false);
}
function showGameAssetProfile(trigger){
 const root=$("game-asset-profile");if(!root||!trigger)return;
 renderGameAssetProfile();
 if(root.hidden)return;
 setAssetProfileExpanded(true);positionGameAssetProfile(trigger);
}
function bindGameAssetProfiles(){
 const triggers=[...document.querySelectorAll(".bar-wrap"),$("hp-bar")].filter(Boolean),root=$("game-asset-profile");
 const triggerFor=target=>target&&target.closest?target.closest(".bar-wrap,#hp-bar"):null;
 const hide=()=>hideGameAssetProfile();
 triggers.forEach(el=>{
  el.tabIndex=0;el.setAttribute("role","group");el.setAttribute("aria-label","Show game asset profile");el.setAttribute("aria-describedby","game-asset-profile");el.setAttribute("aria-expanded","false");
  el.addEventListener("pointerenter",()=>showGameAssetProfile(el));
  el.addEventListener("pointerleave",hide);
  el.addEventListener("pointerdown",e=>{
   e.stopPropagation();
   if(e.pointerType==="touch")showGameAssetProfile(el);
  });
  el.addEventListener("pointerup",e=>{
   e.stopPropagation();
   if(e.pointerType==="touch")hide();
  });
  el.addEventListener("pointercancel",e=>{
   if(e.pointerType==="touch")hide();
  });
  // Resource bars remain separate from gameplay hit-testing; the HP use control keeps its own click.
  el.addEventListener("click",e=>{if(!e.target.closest("#hp-pill-use"))e.stopPropagation();});
 });
 // The virtual mouse dispatches pointermove to its hit target and publishes target transitions here.
 window.addEventListener("nu:simulated-pointer-target",event=>{
  const trigger=triggerFor(event.detail&&event.detail.target);
  if(trigger)showGameAssetProfile(trigger);else hide();
 });
 window.addEventListener("resize",()=>{
  if(root&&!root.hidden){
   const trigger=document.querySelector(".bar-wrap.nu-simulated-mouse-target,#hp-bar.nu-simulated-mouse-target");
   if(trigger)positionGameAssetProfile(trigger);
  }
 });
}
let lastRenderedHp=null,lastPillDockVisible=null,hpPillTravelAnimation=null,hpPillTravelGhost=null,hpPillTravelLayer=null,hpPillTravelDirection=null,hpPillTravelRun=0;
function animateHpPillTravel(direction){
 const bar=$("hp-bar"),button=$("hp-pill-use"),source=button&&button.querySelector("img");
 if(!bar||!button)return;
 button.hidden=true;
 const reduced=(window.NUMotion&&window.NUMotion.isReduced())||(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
 if(reduced||!source||typeof source.animate!=="function"){
  if(hpPillTravelAnimation){hpPillTravelAnimation.cancel();hpPillTravelAnimation=null;}
  if(hpPillTravelLayer){hpPillTravelLayer.remove();hpPillTravelLayer=null;hpPillTravelGhost=null;}
  hpPillTravelDirection=null;
  button.hidden=direction==="out";
  return;
 }
 // If HP changes again mid-flight, reverse the same animation from its current frame.
 // This prevents a second icon appearing while the travelling visual is still in motion.
 if(hpPillTravelAnimation&&hpPillTravelGhost&&hpPillTravelAnimation.playState==="running"){
  if(direction!==hpPillTravelDirection){hpPillTravelDirection=direction;hpPillTravelAnimation.reverse();}
  return;
 }
 if(hpPillTravelAnimation){hpPillTravelAnimation.cancel();hpPillTravelAnimation=null;}
 if(hpPillTravelLayer){hpPillTravelLayer.remove();hpPillTravelLayer=null;hpPillTravelGhost=null;}
 const run=++hpPillTravelRun;
 hpPillTravelDirection=direction;
 const barRect=bar.getBoundingClientRect();
 // The visual starts just inside the right frame edge and docks in the reserved capsule slot.
 const corner={x:barRect.width-4,y:barRect.height/2};
 const mobileDock=window.matchMedia&&window.matchMedia("(max-width:520px)").matches;
 const dock=mobileDock?{x:barRect.width-23,y:barRect.height/2}:{x:barRect.width-29,y:barRect.height/2};
 const from=direction==="in"?corner:dock,to=direction==="in"?dock:corner;
 const layer=document.createElement("span");layer.className="hp-pill-travel-layer";layer.setAttribute("aria-hidden","true");
 const ghost=document.createElement("img");ghost.className="hp-pill-travel-ghost";ghost.src=source.src;ghost.alt="";
 ghost.style.left=from.x+"px";ghost.style.top=from.y+"px";layer.appendChild(ghost);bar.appendChild(layer);hpPillTravelLayer=layer;hpPillTravelGhost=ghost;
 const dx=to.x-from.x,dy=to.y-from.y,base="translate(-50%,-50%) translate(";
 const animation=ghost.animate([
  {opacity:0,transform:base+"0px,0px) scale(.58)"},
  {offset:.2,opacity:1,transform:base+(dx*.2)+"px,"+(dy*.2)+"px) scale(1.12)"},
  {opacity:direction==="in"?1:0,transform:base+dx+"px,"+dy+"px) scale("+(direction==="in"?"1":".55")+")"}
 ],{duration:direction==="in"?680:620,easing:"cubic-bezier(.18,.72,.22,1)",fill:"forwards"});
 hpPillTravelAnimation=animation;
 animation.onfinish=()=>{
  if(run!==hpPillTravelRun)return;
  const finishedDirection=hpPillTravelDirection;
  layer.remove();hpPillTravelLayer=null;hpPillTravelGhost=null;hpPillTravelAnimation=null;hpPillTravelDirection=null;
  button.hidden=finishedDirection==="out";
 };
 animation.oncancel=()=>{layer.remove();if(run===hpPillTravelRun){hpPillTravelLayer=null;hpPillTravelGhost=null;hpPillTravelAnimation=null;hpPillTravelDirection=null;}};
}
// Show the HUD capsule only for missing HP when a capsule is owned or 10 XP can buy one.
function syncHpPillDock(){
 const next=Number.isFinite(state.save.hp)?state.save.hp:10,button=$("hp-pill-use");
 const shouldShow=next<10&&(state.save.hpPills>0||state.save.xp>=NUWallet.HP_PILL_COST);
 if(lastRenderedHp===null){
  lastRenderedHp=next;lastPillDockVisible=false;
  if(shouldShow){if(button)button.hidden=true;animateHpPillTravel("in");}
  else if(button)button.hidden=true;
  lastPillDockVisible=shouldShow;
  return;
 }
 if(lastPillDockVisible!==shouldShow){
  if(button)button.hidden=true;
  animateHpPillTravel(shouldShow?"in":"out");
 }else if(button){
  // Keep the real control hidden until the travelling image has fully docked.
  button.hidden=hpPillTravelAnimation&&hpPillTravelAnimation.playState==="running"?true:!shouldShow;
 }
 lastRenderedHp=next;lastPillDockVisible=shouldShow;
}
function renderWallet(){syncHpPillDock();renderGameAssetProfile();const pill=$("hp-pill-use");if(pill){const count=pill.querySelector("#hp-pill-count");if(count)count.textContent="×"+state.save.hpPills;const empty=state.save.hpPills<1,affordable=state.save.xp>=NUWallet.HP_PILL_COST;const reason=state.save.hp>=10?"HP is already full.":empty?(affordable?"0 HP Capsules · 10 XP available · open Store to buy.":"0 HP Capsules · earn 10 XP to unlock."):"Use one HP capsule to restore up to 10 HP.";pill.setAttribute("aria-label",reason);pill.title=reason;pill.classList.toggle("unavailable",state.save.hp>=10||(empty&&!affordable));pill.classList.toggle("is-purchasable",state.save.hp<10&&empty&&affordable);}const xp=state.save.xp%100,mana=state.save.mana%10;$("xp-fill").style.width=xp+"%";$("mana-fill").style.width=(mana*10)+"%";$("xp-fill").parentElement.hidden=state.save.xp<1;$("mana-fill").parentElement.hidden=state.save.mana<1;$("xp-fill").parentElement.style.setProperty("--capsule-boundary",xp+"%");$("mana-fill").parentElement.style.setProperty("--capsule-boundary",(mana*10)+"%");$("xp-fill").setAttribute("aria-valuenow",String(xp));$("mana-fill").setAttribute("aria-valuenow",String(mana));$("xp-value").textContent=state.save.xp?state.save.xp+" / 100":"";$("mana-value").textContent=state.save.mana?state.save.mana+" / 10":"";$("level-chip").textContent="LV "+state.save.level;$("hp-value").textContent=state.save.hp+"/10";$("hp-fill").style.width=(state.save.hp*10)+"%";$("mana-capsules").hidden=state.save.mana<1&&state.save.manaCapsules<=1;$("mana-capsules").innerHTML=Array.from({length:state.save.manaCapsules},(_,i)=>{const amount=Math.max(0,Math.min(10,state.save.mana-i*10));return '<span class="mana-slot" title="Mana capsule '+(i+1)+' · '+amount+'/10"><i style="width:'+(amount*10)+'%"></i></span>';}).join("");renderArcaneShield();}

function animateManaContainerDrain(){
 const layer=$("mana-drain-layer");if(!layer)return;
 const ghost=document.createElement("span");ghost.className="nu-mana-drain-ghost";ghost.textContent="−10 MANA";layer.appendChild(ghost);
 requestAnimationFrame(()=>ghost.classList.add("is-draining"));
 setTimeout(()=>ghost.remove(),420);
}
function renderArcaneShield(){
 const panel=$("arcane-shield-panel");if(!panel)return;
 const active=state.game==="chaos"&&$("game-view").classList.contains("active");
 panel.hidden=!active;if(!active)return;
 const charge=Math.max(0,Math.min(10,Number(state.save.arcaneShieldCharge)||0)),fill=$("arcane-shield-fill"),value=$("arcane-shield-value"),status=$("arcane-shield-status"),button=$("arcane-shield-charge");
 if(fill)fill.style.width=(charge*10)+"%";const track=panel.querySelector('[role="progressbar"]');if(track)track.setAttribute("aria-valuenow",String(charge));
 if(value)value.textContent=charge+"/10";
 const waveId=state.save.activeWave&&state.save.activeWave.id,used=!!(waveId&&state.save.arcaneShieldUsedWaveIds.includes(waveId));
 if(status)status.textContent=charge>0?"ACTIVE · "+charge+" DEFENSE":used?"CHARGE USED THIS WAVE":state.save.arcaneShieldLevel>=2?"READY · MANUAL CHARGE":"CHARGE AT STORE";
 if(button){const available=charge===0&&!used&&state.save.arcaneShieldLevel>=2;button.hidden=!available;button.disabled=!available||state.save.mana<10;button.textContent=state.save.mana>=10?"CHARGE SHIELD · 10 MANA":"NEED 10 MANA";}
}
function chargeArcaneShieldInGame(){
 const result=NUWallet.chargeArcaneShield(state.save,"in_game");
 if(!result.ok){
  const message=result.reason==="INSUFFICIENT_MANA"?"A full 10-Mana container is required.":result.reason==="WAVE_CHARGE_ALREADY_USED"?"The shield has already been charged in this Wave.":result.reason==="SHIELD_ALREADY_CHARGED"?"The shield still has charge; top-up is unavailable.":"In-game charging requires Arcane Shield level 2.";
  $("game-info").textContent=message;
  const notice=result.reason==="INSUFFICIENT_MANA"?"ARCANE SHIELD UNAVAILABLE · NEED 10 MANA":result.reason==="WAVE_CHARGE_ALREADY_USED"?"ARCANE SHIELD ALREADY USED THIS WAVE":result.reason==="SHIELD_ALREADY_CHARGED"?"ARCANE SHIELD ALREADY CHARGED":"ARCANE SHIELD CHARGE LOCKED";
  announceTransaction(notice,"warning");renderArcaneShield();return;
 }
 if(!persistWalletState(result.state))return;
 animateManaContainerDrain();
 $("game-info").textContent="ARCANE SHIELD ACTIVE · 10 DEFENSE";
 announceTransaction("ARCANE SHIELD CHARGED · −10 MANA","success");
 renderArcaneShield();
}
function resolveChaosMasses(targetIds,reason){
 const waveId=state.save.activeWave&&state.save.activeWave.id,hpBefore=state.save.hp;
 const result=NUWallet.resolveChaosHits(state.save,targetIds);
 const recordResolution=(outcome,details)=>targetIds.forEach(id=>{
  const target=state.targets.find(item=>item.id===id)||{id,gameId:"chaos",waveId};
  recordGameObjectEvent(target,"resolve",outcome,"chaos-resolution",Object.assign({reason:reason||"unspecified",resolutionBatchCount:targetIds.length},details||{}));
 });
 if(!result.ok||!result.resolvedCount){recordResolution(result.ok?"no-op":"failed",{resolvedCount:result.resolvedCount||0});return result;}
 if(!persistWalletState(result.state)){recordResolution("persist-failed",{resolvedCount:0});return {ok:false,reason:"SAVE_FAILED",resolvedCount:0};}
 recordResolution(result.hpDamage>0?"hp-damage":result.absorbed>0?"shield-absorbed":"resolved",{resolvedCount:result.resolvedCount,absorbed:result.absorbed||0,hpDamage:result.hpDamage||0,hpAfter:result.state.hp});
 if(result.hpDamage>0&&window.NUHealth)window.NUHealth.recordDamage({gameId:"chaos",waveId,amount:result.hpDamage,hpAfter:state.save.hp,reason:reason||"CHAOS_BREACH_DAMAGE"});
 if(result.died){
  if(window.NUHealth)window.NUHealth.recordDeath({gameId:"chaos",waveId,hpBefore,reason:"CHAOS_BREACH_DAMAGE"});
  state.save.xp=Math.floor(state.save.xp/100)*100;state.save.hp=10;state.targets.forEach(target=>{if(target.alive){target.alive=false;recordGameObjectEvent(target,"despawn","round-ended-by-death","chaos-engine",{reason:"PLAYER_DEATH"});}});state.active=false;
  if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;save();
  $("game-info").textContent="YOU DIED · 0 HP.";
 }else if(result.absorbed>0&&result.hpDamage===0){
  announceTransaction("ARCANE SHIELD · "+result.absorbed+" CHAOS HIT"+(result.absorbed===1?"":"S")+" ABSORBED","success");
 }else if(result.hpDamage>0){
  announceTransaction("CHAOS BREACH · −"+result.hpDamage+" HP","warning");
 }
 renderArcaneShield();return result;
}
function resolveRemainingChaosMasses(reason){
 if(!state.save.activeWave||state.save.activeWave.gameId!=="chaos")return {ok:true,resolvedCount:0};
 const remaining=state.targets.filter(target=>target.alive),ids=Array.from(new Set([...(state.save.activeWave.pendingChaosTargetIds||[]),...remaining.map(target=>target.id)]));
 if(!ids.length)return {ok:true,resolvedCount:0};
 const result=resolveChaosMasses(ids,reason||"CHAOS_EXIT_DAMAGE");
 if(!result||!result.ok)return result||{ok:false,reason:"CHAOS_RESOLUTION_FAILED"};
 remaining.forEach(target=>{target.alive=false;recordGameObjectEvent(target,"despawn","resolved-on-exit","chaos-resolution",{reason:reason||"CHAOS_EXIT_DAMAGE"});});
 drawGame();
 return result;
}
function showFloat(){} // N.U policy: no floating XP/Mana/reward text on interactive objects.
function announceTransaction(message,tone="success"){const el=$("transaction-toast");if(!el)return;el.textContent=message;el.className="transaction-toast "+tone+" visible";clearTimeout(el._hideTimer);el._hideTimer=setTimeout(()=>el.classList.remove("visible"),2200);}function showFloatingChange(message,tone="gain"){const root=$("floating-notifications");if(!root)return;const item=document.createElement("div");item.className="floating-change "+tone;item.textContent=message;root.appendChild(item);setTimeout(()=>item.remove(),1800);}
function showHpGain(amount){const track=$("hp-fill").parentElement;track.classList.remove("hp-restored");void track.offsetWidth;track.classList.add("hp-restored");const el=document.createElement("span");el.className="hp-gain";el.textContent="+"+amount+" HP";track.appendChild(el);setTimeout(()=>{el.remove();track.classList.remove("hp-restored");},1100);}
function showHpPillInteraction(anchor,amount){if(!anchor)return;const el=document.createElement("span");el.className="hp-pill-interaction-burst";el.setAttribute("aria-hidden","true");el.style.left=(anchor.left+anchor.width/2)+"px";el.style.top=(anchor.top+anchor.height/2)+"px";const ring=document.createElement("span");ring.className="hp-pill-burst-ring";el.appendChild(ring);for(let i=0;i<8;i++){const particle=document.createElement("span");const angle=(Math.PI*2*i)/8-Math.PI/2;particle.className="hp-pill-burst-particle";particle.style.setProperty("--burst-x",(Math.cos(angle)*34)+"px");particle.style.setProperty("--burst-y",(Math.sin(angle)*34)+"px");el.appendChild(particle);}const label=document.createElement("span");label.className="hp-pill-burst-label";label.textContent="+"+amount+" HP";el.appendChild(label);document.body.appendChild(el);setTimeout(()=>el.remove(),1050);}
function useHpPill(source){const event=source&&typeof source.preventDefault==="function"?source:null;const button=source&&source.nodeType===1?source:(event?source.currentTarget:null);if(event){event.preventDefault();event.stopPropagation();}const anchor=button&&button.id==="hp-pill-use"?button.getBoundingClientRect():null;const isStoreUse=!!(button&&button.matches("[data-use-hp-pill]"));const result=NUWallet.useHpPill(state.save);if(!result.ok){const message=result.reason==="HP_FULL"?"HP is already full · no capsule consumed.":result.reason==="NO_HP_CAPSULE"?(state.save.xp>=NUWallet.HP_PILL_COST?"0 HP Capsules · open Store to buy one.":"0 HP Capsules · earn 10 XP to unlock Store purchase."):"HP Capsule unavailable.";announceTransaction(message,"warning");return;}if(!persistWalletState(result.state))return;if(window.NUHealth){const gameId=state.active?state.game:"store";window.NUHealth.recordMedicationUse({gameId,waveId:state.save.activeWave&&state.save.activeWave.id,itemName:"Golden HP Capsule",itemType:"medicine",effect:"healing",effectAmount:result.restored});window.NUHealth.recordHealing({gameId,waveId:state.save.activeWave&&state.save.activeWave.id,amount:result.restored,hpAfter:result.state.hp,source:"Golden HP Capsule"});}if(isStoreUse)renderShop("−1 HP Capsule · +"+result.restored+" HP restored.");hideGameAssetProfile();showHpGain(result.restored);if(anchor)showHpPillInteraction(anchor,result.restored);showFloatingChange("+"+result.restored+" HP","hp");showFloatingChange("−1 Capsule","loss");announceTransaction("HP CAPSULE USED · +"+result.restored+" HP · −1 CAPSULE","success");}
function showCapsuleGain(text,type){const fill=type==="xp"?$("xp-fill"):$("mana-fill");const bar=fill.parentElement;const el=document.createElement("span");el.className="capsule-gain "+type;el.textContent=text;el.style.left=Math.max(1,Math.min(99,(parseFloat(fill.style.width)||0)+1.5))+"%";el.style.transform="translateX(-50%)";bar.appendChild(el);setTimeout(()=>el.remove(),1100);}
function showHitProgress(x,y){const el=document.createElement("span");el.className="hit-progress";el.textContent=state.turn+"/10";el.style.left=x+"px";el.style.top=y+"px";$("game-stage").appendChild(el);setTimeout(()=>el.remove(),850);}
function renderRoundProgress(){} // Round count is shown only on the interacted object.
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,state.quality>=8?1.5:1);canvas.width=Math.floor(r.width*d);canvas.height=Math.floor(r.height*d);ctx.setTransform(d,0,0,d,0,0);}
function rnd(min,max){return min+Math.random()*(max-min);}
function initTargets(){
 const w=canvas.clientWidth,h=canvas.clientHeight;if(w<80||h<120)return;
 const count=10,points=[],reading=document.querySelector("#article-view.active"),readingRect=reading?reading.getBoundingClientRect():null;
 const download=document.documentElement.dataset.delivery==="download",targetBatch=++state.targetSequence;
 const minGap=Math.max(26,Math.min(54,w*.075));
 let attempts=0;
 while(points.length<count&&attempts++<2400){
  const margin=state.game==="chaos"?34:Math.max(26,Math.min(44,h*.08));
  const x=rnd(margin,w-margin),y=state.game==="chaos"?rnd(70,Math.max(90,h*.43)):rnd(70,h-margin);
  if(readingRect&&x>readingRect.left-18&&x<readingRect.right+18&&y>readingRect.top-18&&y<readingRect.bottom+18)continue;
  if(points.some(p=>Math.hypot(p.x-x,p.y-y)<minGap))continue;
  points.push({x,y});
 }
 // Narrow viewports may need closer spacing; fill remaining slots across the playable canvas.
 let fallback=0;
 while(points.length<count&&fallback++<1600){
  const margin=22;
  const x=rnd(margin,w-margin);
  const y=rnd(70,Math.max(90,h-38));
  if(readingRect&&x>readingRect.left-18&&x<readingRect.right+18&&y>readingRect.top-18&&y<readingRect.bottom+18)continue;
  if(points.some(p=>Math.hypot(p.x-x,p.y-y)<minGap*.48))continue;
  points.push({x,y});
 }
 const previousTargets=state.targets.slice();
 previousTargets.forEach(target=>{if(target.alive)recordGameObjectEvent(target,"despawn","replaced","game-runtime",{reason:"target-batch-replaced"});});
 state.targets=points.map((p,i)=>({
  id:String(state.save.activeWave&&state.save.activeWave.id||"wave")+":mass:"+targetBatch+":"+i,
  gameId:state.game,waveId:state.save.activeWave&&state.save.activeWave.id||null,
  x:p.x,y:p.y,r:state.game==="bubble"?rnd(25,39):state.game==="mana"?rnd(4,6):rnd(15,23),
  hp:1,phase:Math.random()*6,vx:rnd(-.34,.34),vy:rnd(-.26,.26),
  speed:state.game==="chaos"?Math.min(8,Math.pow(2,i)):1,alive:true,damaged:false
 }));
 lastGameObjectHoverId=null;
 state.targets.forEach(target=>recordGameObjectEvent(target,"spawn","spawned","game-runtime",{x:target.x,y:target.y,radius:target.r}));
 if(state.game==="chaos"&&state.save.activeWave){const registered=NUWallet.registerChaosTargets(state.save,state.targets.map(target=>target.id));if(registered.ok)persistWalletState(registered.state);}
}
function animateGame(t){if(!state.active)return;const minFrame=state.quality<=3?70:state.quality<=6?45:30;if(t-state.lastFrame>=minFrame){state.lastFrame=t;const w=canvas.clientWidth,h=canvas.clientHeight;state.targets.forEach(o=>{if(!state.active||!o.alive)return;o.x+=o.vx;if(state.game==="chaos"){o.y+=o.speed;if(o.x<o.r+8||o.x>w-o.r-8)o.vx*=-1;if(!o.damaged&&o.y>h-92){const hit=resolveChaosMasses([o.id],"CHAOS_BREACH_DAMAGE");if(!hit||!hit.ok)return;
 recordGameObjectEvent(o,"collision",hit.hpDamage>0?"hp-damage":hit.absorbed>0?"shield-absorbed":"resolved","chaos-engine",{hpDamage:hit.hpDamage||0,shieldAbsorbed:hit.absorbed||0});
 o.damaged=true;o.alive=false;recordGameObjectEvent(o,"despawn","breached","chaos-engine",{x:o.x,y:o.y});if(hit.died)return;}}else{o.y+=o.vy;if(o.y<55||o.y>h-o.r-40)o.vy*=-1;}});drawGame();}state.raf=requestAnimationFrame(animateGame);}
function chooseGame(id){window.dispatchEvent(new Event("nu:gateway-close"));if(window.NUPixelWorld)window.NUPixelWorld.setWeatherMode("game");if(state.raf)cancelAnimationFrame(state.raf);const exitResolution=resolveRemainingChaosMasses("CHAOS_NEW_ROUND_EXIT");if(exitResolution&&exitResolution.ok===false){$("game-info").textContent="Unable to save remaining Chaos damage. Please retry.";return;}settleActiveWave("new_round");state.game=id||games[Math.floor(Math.random()*games.length)].id;const started=NUWallet.beginWave(state.save,state.game);if(started.ok)persistWalletState(started.state);state.turn=0;state.active=true;state.paused=false;state.shots=0;initTargets();$("home-view").classList.remove("active");$("article-view").classList.remove("active");$("game-view").classList.add("active");state.keyboardTargetIndex=state.targets.findIndex(target=>target.alive);state.keyboardMode=false;canvas.focus({preventScroll:true});$("game-title").textContent=games.find(g=>g.id===state.game).name;renderRoundProgress();$("game-info").textContent=state.game==="chaos"?"Tap a Chaos mass to mark it. N-BI fires automatically and consumes one full 10-Mana capsule per mass." :"Tap a target to interact.";renderWallet();requestAnimationFrame(()=>{resize();initTargets();drawGame();state.lastFrame=0;state.raf=requestAnimationFrame(animateGame);});}
function closeGame(){const exitResolution=resolveRemainingChaosMasses("CHAOS_PLAYER_EXIT");if(exitResolution&&exitResolution.ok===false){$("game-info").textContent="Unable to save remaining Chaos damage. Please retry.";return;}settleActiveWave("player_exit");window.dispatchEvent(new Event("nu:gateway-close"));window.dispatchEvent(new Event("nu:game-view-exit"));gatewayPause.reset();if(window.NUPixelWorld)window.NUPixelWorld.setWeatherMode("sleep");state.active=false;state.paused=false;if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;$("game-view").classList.remove("active");$("home-view").classList.add("active");document.body.classList.remove("article-mode");}
function drawGame(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;ctx.clearRect(0,0,w,h);ctx.save();ctx.globalAlpha=.22;for(let i=0;i<30;i++){let x=(i*97+Date.now()*.004)%w,y=(i*61)%h;ctx.fillStyle="#9cddff";ctx.fillRect(x,y,1,1);}ctx.restore();state.targets.forEach((o,i)=>{if(!o.alive)return;o.phase+=.015;const bob=Math.sin(o.phase)*2;ctx.save();if(state.game==="bubble"){const g=ctx.createRadialGradient(o.x-o.r*.3,o.y-o.r*.4,1,o.x,o.y,o.r*1.4);g.addColorStop(0,"rgba(255,255,255,.7)");g.addColorStop(.3,"rgba(255,180,210,.18)");g.addColorStop(.75,"rgba(96,185,255,.13)");g.addColorStop(1,"rgba(255,196,95,.03)");ctx.fillStyle=g;ctx.strokeStyle="rgba(255,202,111,.85)";ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(o.x,o.y+bob,o.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.strokeStyle="rgba(255,255,255,.52)";ctx.lineWidth=Math.max(1,o.r*.035);ctx.arc(o.x-o.r*.22,o.y-o.r*.24+bob,o.r*.22,-Math.PI*.78,Math.PI*.18);ctx.stroke();}else if(state.game==="mana"){ctx.translate(o.x,o.y+bob);ctx.rotate(Math.PI/6);ctx.fillStyle="rgba(64,190,255,.16)";ctx.strokeStyle="#68dfff";ctx.lineWidth=1.5;ctx.shadowBlur=5;ctx.shadowColor="#43cfff";ctx.beginPath();ctx.moveTo(0,-o.r);for(let j=1;j<6;j++)ctx.lineTo(Math.cos(j*Math.PI/3)*o.r,Math.sin(j*Math.PI/3)*o.r);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle="#d9faff";ctx.fillRect(-1,-2,2,4);if(window.NUMaterials)window.NUMaterials.drawMana(ctx,0,0,o.r,o.phase);}else{ctx.translate(o.x,o.y+bob);ctx.fillStyle="rgba(255,54,85,.16)";ctx.strokeStyle="#ff526c";ctx.lineWidth=1.5;ctx.shadowBlur=13;ctx.shadowColor="#ff3658";ctx.beginPath();for(let j=0;j<9;j++){const a=j*Math.PI*2/9,rr=o.r*(j%2?.78:1);if(!j)ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle="#ffd6df";ctx.font="10px sans-serif";ctx.textAlign="center";}ctx.restore();});if(window.NUMaterials)window.NUMaterials.drawEffects(ctx);if(state.game==="chaos"){ctx.save();ctx.strokeStyle="rgba(255,174,96,.5)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w-18,h-18);ctx.lineTo(w-90,h-75);ctx.stroke();ctx.fillStyle="#ffca75";ctx.shadowBlur=12;ctx.shadowColor="#ffb44e";ctx.beginPath();ctx.arc(w-18,h-18,4,0,Math.PI*2);ctx.fill();ctx.restore();}if(state.keyboardMode&&document.activeElement===canvas)drawKeyboardTarget();}
function interact(e){if(!state.active||state.paused||state.turn>=10)return;

 const rect=canvas.getBoundingClientRect();
 const scaleX=rect.width>0?canvas.clientWidth/rect.width:1;
 const scaleY=rect.height>0?canvas.clientHeight/rect.height:1;
 const x=(e.clientX-rect.left)*scaleX,y=(e.clientY-rect.top)*scaleY;
 let target=null,best=Infinity;
 state.targets.forEach(o=>{
  if(!o.alive)return;
  const d=Math.hypot(o.x-x,o.y-y);
  const hitRadius=state.game==="mana"?Math.max(22,o.r+8):o.r+(state.game==="bubble"?10:15);
  if(d<hitRadius&&d<best){best=d;target=o;}
 });
 const source=interactionSource(e);
 if(!target){recordGameObjectEvent(null,"hit-test","miss",source,{x,y});return;}
 lastGameObjectHoverId=target.id;
 recordGameObjectEvent(target,"hit-test","hit",source,{x,y});
 recordGameObjectEvent(target,"activate","attempted",source,{x,y});
 if(!e.keyboard)state.keyboardMode=false;
 if(state.game==="mana"&&state.save.mana>=state.save.manaCapsules*10){
  $("game-info").textContent="Mana storage is full. Upgrade or spend a capsule first.";
  announceTransaction("MANA STORAGE FULL · UPGRADE OR SPEND A CAPSULE","warning");
  recordGameObjectEvent(target,"collect","blocked",source,{reason:"MANA_STORAGE_FULL",mana:state.save.mana});
  return;
 }
 if(state.game==="chaos"&&state.save.mana<10){
  $("game-info").textContent="N-BI cannot fire: one complete Mana Capsule (10 Mana) is required.";
  announceTransaction("N-BI UNAVAILABLE · NEED 10 MANA","warning");
  recordGameObjectEvent(target,"fire","blocked",source,{reason:"INSUFFICIENT_MANA",mana:state.save.mana});
  return;
 }
 state.turn++;renderRoundProgress();showHitProgress(target.x,target.y);
 if(state.game==="bubble"){
  target.alive=false;
  const awarded=awardXP(1,"Bubble Hunt reward");
  recordGameObjectEvent(target,"pop",awarded?"rewarded":"reward-persist-failed",source,{asset:"xp",delta:awarded?1:0});
  recordGameObjectEvent(target,"despawn","popped",source,{x:target.x,y:target.y});
  if(awarded){showCapsuleGain("+1","xp");announceTransaction("BUBBLE HUNT · +1 XP","success");}
  $("game-info").textContent="";
 }else if(state.game==="mana"){
  target.alive=false;
  if(window.NUMaterials)window.NUMaterials.emit(target.x,target.y);
  const collected=recordGameDelta("mana",1,"GAME_REWARD",true,1);
  recordGameObjectEvent(target,"collect",collected?"collected":"persist-failed",source,{asset:"mana",delta:collected?1:0});
  recordGameObjectEvent(target,"despawn","collected",source,{x:target.x,y:target.y});
  if(collected){showCapsuleGain("+1","mana");announceTransaction("MANA COLLECTED · +1","success");}
  $("game-info").textContent="";
 }else{
  const shot=NUWallet.fireNbiShot(state.save,target.id);
  if(!shot.ok){
   state.turn=Math.max(0,state.turn-1);renderRoundProgress();
   recordGameObjectEvent(target,"fire","blocked",source,{reason:shot.reason||"NBI_SHOT_FAILED"});
   $("game-info").textContent=shot.reason==="INSUFFICIENT_MANA"?"N-BI requires one full 10-Mana container.":"N-BI shot could not be completed. Try again.";
   announceTransaction(shot.reason==="INSUFFICIENT_MANA"?"N-BI UNAVAILABLE · NEED 10 MANA":"N-BI SHOT FAILED","warning");return;
  }
  if(!persistWalletState(shot.state)){
   state.turn=Math.max(0,state.turn-1);renderRoundProgress();
   recordGameObjectEvent(target,"fire","persist-failed",source,{reason:"SAVE_FAILED"});
   $("game-info").textContent="N-BI shot could not be saved. Try again.";return;
  }
  animateManaContainerDrain();state.shots++;target.alive=false;$("game-info").textContent="";
  recordGameObjectEvent(target,"fire","fired",source,{asset:"mana",delta:-10,shotId:shot.shotId||null});
  recordGameObjectEvent(target,"despawn","destroyed-by-nbi",source,{x:target.x,y:target.y});
  announceTransaction("N-BI FIRED · −10 MANA","success");
 }
 if(state.keyboardMode)state.keyboardTargetIndex=state.targets.findIndex(o=>o.alive);
 drawGame();
 if(state.turn>=10){
  state.active=false;state.paused=false;cancelAnimationFrame(state.raf);
  if(state.save.hp<10){const healed=recordGameDelta("hp",1,"WAVE_HP_COMPLETION",false,1);if(healed&&window.NUHealth)window.NUHealth.recordHealing({gameId:state.game,amount:1,hpAfter:state.save.hp,source:"Wave completion reward"});}
  settleActiveWave("completed_10_successful_interactions");$("game-info").textContent="Round complete.";renderWallet();
 }
}
function syncWorldTime(){const hour=new Date().getHours();const phase=hour>=6&&hour<10?"dawn":hour>=10&&hour<17?"day":hour>=17&&hour<20?"dusk":"night";document.documentElement.dataset.worldTime=phase;}
syncWorldTime();setInterval(syncWorldTime,60000);
let mouseCameraReady=false,touchCameraReady=false,touchMoved=false,touchStart=null,touchLast=null,cameraX=0,cameraY=0,cameraQueued=false,lastCamera=0;
function applyCamera(){if(cameraQueued)return;cameraQueued=true;requestAnimationFrame(t=>{cameraQueued=false;if(t-lastCamera<24)return;lastCamera=t;document.documentElement.style.setProperty("--camera-x",cameraX.toFixed(1)+"px");document.documentElement.style.setProperty("--camera-y",cameraY.toFixed(1)+"px");if(window.NUPixelWorld)window.NUPixelWorld.setCamera(cameraX,cameraY);});}
function mouseMove(e){if(e.pointerType!=="mouse"||NU.clamp(state.quality,1,10)<=1||document.body.classList.contains("nu-gateway-open"))return;cameraX=((e.clientX/(innerWidth||1)-.5)*22);cameraY=((e.clientY/(innerHeight||1)-.5)*16);applyCamera();}
function touchDown(e){if(e.pointerType!=="touch"||NU.clamp(state.quality,1,10)<=1||document.body.classList.contains("nu-gateway-open")||e.target.closest("button,a,input,textarea,select,[role=button]"))return;if(canvas.contains(e.target)&&typeof canvas.setPointerCapture==="function"){try{canvas.setPointerCapture(e.pointerId);}catch(_){/* pointer capture is best-effort on older mobile browsers */}}touchStart={x:e.clientX,y:e.clientY,id:e.pointerId};touchLast={x:e.clientX,y:e.clientY};touchMoved=false;if(window.NUPixelWorld)window.NUPixelWorld.lastTouchWasDrag=false;if(!touchCameraReady){touchCameraReady=true;window.addEventListener("pointermove",touchMove,{passive:true});window.addEventListener("pointerup",touchUp,{passive:true});window.addEventListener("pointercancel",touchUp,{passive:true});}}
function touchMove(e){if(document.body.classList.contains("nu-gateway-open")||!touchStart||e.pointerId!==touchStart.id)return;const dx=e.clientX-touchLast.x,dy=e.clientY-touchLast.y;if(Math.hypot(e.clientX-touchStart.x,e.clientY-touchStart.y)>7)touchMoved=true;if(touchMoved){cameraX=NU.clamp(cameraX-dx*.75,-28,28);cameraY=NU.clamp(cameraY-dy*.75,-20,20);applyCamera();}touchLast={x:e.clientX,y:e.clientY};}
function touchUp(e){if(!touchStart||e.pointerId!==touchStart.id)return;const wasDrag=touchMoved;touchStart=null;touchLast=null;touchMoved=false;if(window.NUPixelWorld)window.NUPixelWorld.lastTouchWasDrag=wasDrag;}
function mouseCameraBootstrap(e){if(e.pointerType!=="mouse")return;mouseCameraReady=true;window.removeEventListener("pointermove",mouseCameraBootstrap);window.addEventListener("pointermove",mouseMove,{passive:true});mouseMove(e);}
window.addEventListener("pointermove",mouseCameraBootstrap,{passive:true});window.addEventListener("pointerdown",e=>{if(e.pointerType==="touch")touchDown(e);},{passive:true});
let lastGameObjectHoverId=null;
function traceGameObjectHover(event){
 if(!state.active||state.paused||!event||!canvas.contains(event.target))return;
 const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
 let target=null,best=Infinity;
 state.targets.forEach(item=>{if(!item.alive)return;const distance=Math.hypot(item.x-x,item.y-y);if(distance<item.r+(state.game==="mana"?8:state.game==="bubble"?10:15)&&distance<best){best=distance;target=item;}});
 const nextId=target?target.id:null;
 if(nextId===lastGameObjectHoverId)return;
 lastGameObjectHoverId=nextId;
 if(target)recordGameObjectEvent(target,"target","hit",interactionSource(event),{x,y});
}
canvas.addEventListener("pointermove",traceGameObjectHover,{passive:true});
function settleAfterPageExit(){const resolution=resolveRemainingChaosMasses("CHAOS_PAGE_UNLOAD");if(!resolution||resolution.ok===false)return false;return settleActiveWave("page_unload");}
window.addEventListener("beforeunload",()=>{settleAfterPageExit();});
document.addEventListener("visibilitychange",()=>{if(document.hidden){if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;syncGatewayBackgrounds(true);}else{const gatewayOpen=document.body.classList.contains("nu-gateway-open");if(!gatewayOpen){syncGatewayBackgrounds(state.paused||gatewayPause.isAwaitingInteraction());if(state.active&&!state.paused)state.raf=requestAnimationFrame(animateGame);}}});
window.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse"||!e.target.closest("#game-canvas")||e.target.closest("button,a,input,textarea,select,[role=button]"))return;if(state.paused&&gatewayPause.isAwaitingInteraction())resumeAfterGatewayReturn();if(state.active&&!state.paused)interact(e);},{passive:true});window.addEventListener("pointerup",e=>{if(e.pointerType!=="touch"||!e.target.closest("#game-canvas")||touchMoved||(window.NUPixelWorld&&window.NUPixelWorld.lastTouchWasDrag)){if(window.NUPixelWorld)window.NUPixelWorld.lastTouchWasDrag=false;return;}if(e.target.closest("button,a,input,textarea,select,[role=button]"))return;if(state.paused&&gatewayPause.isAwaitingInteraction())resumeAfterGatewayReturn();if(state.active&&!state.paused)interact(e);},{passive:true});window.addEventListener("resize",()=>{if($("game-view").classList.contains("active")){resize();initTargets();drawGame();}});
window.addEventListener("pageshow",()=>{state.save=NUWallet.normalizeSave(NU.load());renderWallet();});
window.addEventListener("storage",e=>{if(e.key==="nu-world-save-v1"){state.save=NUWallet.normalizeSave(NU.load());renderWallet();}});
window.addEventListener("nu:identity-updated",e=>{const detail=e.detail||{};state.save.playerId=detail.playerId||state.save.playerId;state.save.displayName=detail.displayName||"";state.save.callsign=detail.callsign||"";});
// Player overlays are opened from Gateway; they do not own or create a separate pause.
function openArticle(title,url){$("article-title").textContent=title;$("article-frame-link").href=url;chooseGame();if(window.NUPixelWorld)window.NUPixelWorld.setWeatherMode("study");$("game-view").classList.add("active");$("article-view").classList.add("active");document.body.classList.add("article-mode");resize();initTargets();drawGame();$("game-info").textContent="Background encounter active outside the reading column."; }
function drawKeyboardTarget(){
 const target=state.targets[state.keyboardTargetIndex];if(!target||!target.alive)return;
 ctx.save();ctx.strokeStyle="#e8fbff";ctx.lineWidth=2.5;ctx.setLineDash([5,4]);ctx.shadowColor="#56dfff";ctx.shadowBlur=14;ctx.beginPath();ctx.arc(target.x,target.y,target.r+8,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function moveKeyboardTarget(direction){
 const alive=state.targets.map((target,index)=>target.alive?index:-1).filter(index=>index>=0);
 if(!alive.length){state.keyboardTargetIndex=-1;state.keyboardMode=true;drawGame();return;}
 const current=alive.indexOf(state.keyboardTargetIndex),position=current<0?(direction>=0?0:alive.length-1):(current+direction+alive.length)%alive.length;
 state.keyboardTargetIndex=alive[position];state.keyboardMode=true;drawGame();
}
function activateKeyboardTarget(){
 if(!state.active||state.paused)return;
 state.keyboardMode=true;
 if(!state.targets[state.keyboardTargetIndex]||!state.targets[state.keyboardTargetIndex].alive)moveKeyboardTarget(1);
 const target=state.targets[state.keyboardTargetIndex];if(!target||!target.alive)return;
 const rect=canvas.getBoundingClientRect();
 interact({clientX:rect.left+target.x,clientY:rect.top+target.y,keyboard:true});
}
function handleGameKeydown(event){
 if(!$("game-view").classList.contains("active")||event.altKey||event.ctrlKey||event.metaKey)return;
 const gameplayKey=["ArrowRight","ArrowDown","ArrowLeft","ArrowUp","Enter"," "].includes(event.key);
 if(state.paused&&gatewayPause.isAwaitingInteraction()&&gameplayKey)resumeAfterGatewayReturn();
 if(!state.active||state.paused)return;
 if(event.key==="ArrowRight"||event.key==="ArrowDown"){event.preventDefault();moveKeyboardTarget(1);return;}
 if(event.key==="ArrowLeft"||event.key==="ArrowUp"){event.preventDefault();moveKeyboardTarget(-1);return;}
 if(event.key==="Enter"||event.key===" "){event.preventDefault();activateKeyboardTarget();}
}
document.addEventListener("keydown",event=>{
 if(!gatewayPause.isAwaitingInteraction()||!$("game-view").classList.contains("active")||event.altKey||event.ctrlKey||event.metaKey)return;
 const key=event.key;
 if(!["ArrowRight","ArrowDown","ArrowLeft","ArrowUp","Enter"," "].includes(key))return;
 event.preventDefault();event.stopImmediatePropagation();
 if(!resumeAfterGatewayReturn())return;
 if(key==="ArrowRight"||key==="ArrowDown")moveKeyboardTarget(1);
 else if(key==="ArrowLeft"||key==="ArrowUp")moveKeyboardTarget(-1);
 else activateKeyboardTarget();
},true);
canvas.addEventListener("keydown",handleGameKeydown);
function showHome(){closeGame();$("article-view").classList.remove("active");$("shop-view").classList.remove("active");$("wallet-view").classList.remove("active");$("profile-view").classList.remove("active");$("home-view").classList.add("active");const heading=document.querySelector("#home-view .hero h1");if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}

function renderShop(feedback=""){
 const items=[],canBuy=state.save.xp>=NUWallet.HP_PILL_COST,owned=state.save.hpPills>0,hpFull=state.save.hp>=NUWallet.MAX_HP;
 items.push('<article class="shop-item shop-hp-pill-item"><button class="shop-hp-pill-use" type="button" data-use-hp-pill '+(!owned||hpFull?'disabled':'')+' aria-label="Use owned HP capsule" title="'+(owned?(hpFull?'HP is full':'Use one owned HP capsule'):'No HP capsules owned')+'"><img class="hp-pill-icon '+(owned?'is-owned':'is-empty')+'" src="./assets/nu-hp-pill-golden-pixel.svg" alt=""><span class="shop-hp-pill-count" aria-live="polite">×'+state.save.hpPills+'</span></button><div class="shop-hp-pill-description"><strong>Golden HP Capsule</strong><p>Costs 10 XP · Restores up to 10 missing HP · One use per capsule</p></div><button class="btn primary shop-hp-pill-buy" data-buy-hp-pill '+(canBuy?'':'disabled')+'>'+(canBuy?'BUY · 10 XP':'NEED 10 XP')+'</button></article>');
 const shieldCanCharge=state.save.arcaneShieldCharge===0&&state.save.mana>=10;
 items.push('<article class="shop-item shop-arcane-shield-item"><div class="shop-hp-pill-description"><strong>Arcane Shield · 10 Defense</strong><p>Consumes one full Mana container · Activates immediately · No top-up</p></div><button class="btn primary" data-charge-arcane-shield '+(shieldCanCharge?'':'disabled')+'>'+(shieldCanCharge?'CHARGE · 10 MANA':state.save.arcaneShieldCharge>0?'SHIELD ALREADY CHARGED':'NEED 10 MANA')+'</button></article>');
 const canUpgradeMana=state.save.xCredits>=1&&state.save.manaCapsules<9;
 items.push('<article class="shop-item shop-mana-capacity-item"><div class="shop-hp-pill-description"><strong>Mana Capacity · '+state.save.manaCapsules+'/9 Containers</strong><p>Spend 1 X Credit · Add one permanent container · Receive its initial 10 Mana grant. Mana itself is never sold.</p></div><button class="btn primary" data-upgrade-mana-capacity '+(canUpgradeMana?'':'disabled')+'>'+(state.save.manaCapsules>=9?'MAX CAPACITY':canUpgradeMana?'UPGRADE · 1 X CREDIT':'NEED 1 X CREDIT')+'</button></article>');
 $("shop-items").innerHTML=items.join("");
 $("shop-status").textContent=feedback||(canBuy?"Click BUY to purchase with XP, or click the capsule icon to use one you own.": "Earn XP in Bubble Hunt or from eligible Studio exports to unlock a capsule.");
 $("shop-items").querySelectorAll("[data-buy-hp-pill]").forEach(b=>b.addEventListener("click",()=>{
  const result=NUWallet.buyHpPill(state.save);
  if(!result.ok){renderShop("Purchase unavailable: "+(result.reason==="INSUFFICIENT_XP"?"not enough XP.":"please try again."));announceTransaction("PURCHASE FAILED · NOT ENOUGH XP","warning");return;}
  if(!persistWalletState(result.state))return;
  renderShop("−10 XP · +1 HP Capsule added to your wallet.");
  showFloatingChange("−10 XP","loss");showFloatingChange("+1 Capsule","gain");
  announceTransaction("PURCHASE COMPLETE · −10 XP · +1 CAPSULE","success");
 }));
 $("shop-items").querySelectorAll("[data-charge-arcane-shield]").forEach(b=>b.addEventListener("click",()=>{
  const result=NUWallet.chargeArcaneShield(state.save,"store");
  if(!result.ok){renderShop(result.reason==="INSUFFICIENT_MANA"?"A full 10-Mana container is required.":"Shield charging is unavailable while charge remains.");announceTransaction("ARCANE SHIELD CHARGE FAILED","warning");return;}
  if(!persistWalletState(result.state))return;
  renderShop("Arcane Shield charged · −10 Mana · 10 defense ready for Chaos Attack.");
  announceTransaction("ARCANE SHIELD CHARGED · −10 MANA","success");
 }));
 $("shop-items").querySelectorAll("[data-upgrade-mana-capacity]").forEach(b=>b.addEventListener("click",()=>{
  const result=NUWallet.upgradeManaCapacity(state.save,{id:"mana-capacity-upgrade-"+Date.now()+"-"+Math.random().toString(36).slice(2,8)});
  if(!result.ok){
   const message=result.reason==="INSUFFICIENT_X_CREDITS"?"You need 1 X Credit.":result.reason==="MAX_MANA_CAPACITY"?"Mana capacity is already level 9.":"Capacity upgrade is unavailable right now.";
   renderShop(message);announceTransaction("MANA CAPACITY UPGRADE FAILED","warning");return;
  }
  if(!persistWalletState(result.state))return;
  renderShop("Capacity upgraded · +1 permanent container · +10 Mana grant · −1 X Credit.");
  showFloatingChange("−1 X Credit","loss");showFloatingChange("+10 Mana","gain");
  announceTransaction("CAPACITY UPGRADED · +10 MANA GRANT","success");
 }));
 $("shop-items").querySelectorAll("[data-use-hp-pill]").forEach(b=>b.addEventListener("click",e=>{
  e.preventDefault();e.stopPropagation();
  if(b.disabled)return;
  useHpPill(e);
 }));
}function showShop(){ if($("game-view").classList.contains("active"))closeGame();$("home-view").classList.remove("active");$("game-view").classList.remove("active");$("article-view").classList.remove("active");$("shop-view").classList.add("active");document.body.classList.remove("article-mode");const seen=localStorage.getItem("nu-shop-guide-seen")==="1";$("shop-quest").classList.toggle("hidden",seen);$("shop-empty").classList.toggle("hidden",!seen);renderShop();}
function closeShop(){ $("shop-view").classList.remove("active");$("home-view").classList.add("active");}


function renderLibrary(){
 const painting='<article class="glass game-card"><span class="tag ready">GEN 1 · CREATIVE</span><h3>Painting</h3><p>Pixel Art &amp; Vector Studio for local drawing, image editing and vector artwork.</p><div class="card-actions"><span class="tag">ART</span><a class="text-btn" href="./pixel-art-studio.html">Open Painting →</a></div></article>';
 const random='<article class="glass game-card"><span class="tag ready">GEN 1 · RANDOM</span><h3>Random Game</h3><p>Launch one of the three core games, selected randomly.</p><div class="card-actions"><span class="tag">RANDOM</span><button class="text-btn" data-random-game>Play Random →</button></div></article>';
 const core=games.map(g=>'<article class="glass game-card"><span class="tag ready">GEN 1 · PLAYABLE</span><h3>'+g.name+'</h3><p>'+g.desc+'</p><div class="card-actions"><span class="tag">'+g.id.toUpperCase()+'</span><button class="text-btn" data-game="'+g.id+'">Launch →</button></div></article>').join("");
 $("game-library").innerHTML=painting+random+core;
 $("game-library").querySelectorAll("[data-game]").forEach(b=>b.addEventListener("click",()=>chooseGame(b.dataset.game)));
 $("game-library").querySelectorAll("[data-random-game]").forEach(b=>b.addEventListener("click",()=>chooseGame()));
}
$("back-home").addEventListener("click",showHome);
// Gateway pause ownership is centralized in NUGatewayPause; no parallel pause state exists.
const menuRoot=$("menu"),menuPanel=menuRoot.querySelector(".menu-panel");
let menuReturnFocus=null;
if(menuPanel)menuPanel.tabIndex=-1;
function menuFocusable(){return menuPanel?[...menuPanel.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hidden):[];}
function openMenu(){if(menuRoot.classList.contains("open"))return;menuReturnFocus=document.activeElement;menuRoot.classList.add("open");const focusable=menuFocusable();(focusable[0]||menuPanel)?.focus({preventScroll:true});}
function restoreMenuFocus(){
 const target=menuReturnFocus;
 const hidden=target&&(!target.isConnected||target.closest(".view:not(.active)")||target.closest("#menu:not(.open)")||target.closest("#nu-hex-gateway:not(.is-open)")||target.closest("[hidden]"));
 if(target&&!hidden)target.focus({preventScroll:true});
 else{const fallback=$("game-view").classList.contains("active")?document.querySelector(".nu-gateway-trigger"):$("menu-open");if(fallback)fallback.focus({preventScroll:true});}
 menuReturnFocus=null;
}
function closeMenu(resume=true,restoreFocus=true){menuRoot.classList.remove("open");if(resume)window.dispatchEvent(new Event("nu:menu-dismissed"));if(restoreFocus)restoreMenuFocus();else menuReturnFocus=null;}
menuRoot.addEventListener("keydown",event=>{
 if(event.key==="Escape"){event.preventDefault();closeMenu(true);return;}
 if(event.key!=="Tab")return;
 const focusable=menuFocusable();
 if(!focusable.length){event.preventDefault();menuPanel?.focus({preventScroll:true});return;}
 const first=focusable[0],last=focusable[focusable.length-1];
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
$("menu-open").addEventListener("click",openMenu);$("menu-close").addEventListener("click",()=>closeMenu(true));$("menu").addEventListener("click",event=>{if(event.target===$("menu"))closeMenu(true);});
function focusActiveViewHeading(){const heading=document.querySelector(".view.active .view-head h2");if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
$("menu-store").addEventListener("click",()=>{closeMenu(false,false);showShop();focusActiveViewHeading();});
$("menu-random").addEventListener("click",()=>{closeMenu(false,false);chooseGame();focusActiveViewHeading();});
$("menu-bubble").addEventListener("click",()=>{closeMenu(false,false);chooseGame("bubble");focusActiveViewHeading();});
$("menu-mana").addEventListener("click",()=>{closeMenu(false,false);chooseGame("mana");focusActiveViewHeading();});
$("menu-chaos").addEventListener("click",()=>{closeMenu(false,false);chooseGame("chaos");focusActiveViewHeading();});$("shop-back").addEventListener("click",closeShop);$("arcane-shield-charge").addEventListener("click",chargeArcaneShieldInGame);$("quest-open-store").addEventListener("click",()=>{localStorage.setItem("nu-shop-guide-seen","1");$("shop-quest").classList.add("hidden");$("shop-empty").classList.remove("hidden");renderShop();});
function bindHpPillButton(){const button=$("hp-pill-use");if(!button)return;button.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();if(button.hidden)return;if(state.save.hpPills<1){announceTransaction(state.save.xp>=NUWallet.HP_PILL_COST?"0 HP CAPSULES · BUY FOR 10 XP IN STORE":"0 HP CAPSULES · EARN 10 XP TO UNLOCK","warning");return;}useHpPill(e);});}$("quest-continue").addEventListener("click",()=>{localStorage.setItem("nu-shop-guide-seen","1");closeShop();});document.querySelectorAll("[data-article]").forEach(b=>b.addEventListener("click",()=>openArticle(b.dataset.title,b.dataset.article)));$("article-back").addEventListener("click",showHome);
if(state.save.activeWave){
 const interrupted=state.save.activeWave,waveId=interrupted.id,hpBefore=state.save.hp;
 if(interrupted.gameId==="chaos"&&Array.isArray(interrupted.pendingChaosTargetIds)&&interrupted.pendingChaosTargetIds.length){
  const recovery=NUWallet.resolveChaosHits(state.save,interrupted.pendingChaosTargetIds);
  if(recovery.ok&&recovery.resolvedCount){
   state.save=recovery.state;
   if(recovery.hpDamage>0&&window.NUHealth)window.NUHealth.recordDamage({gameId:"chaos",waveId,amount:recovery.hpDamage,hpAfter:state.save.hp,reason:"CHAOS_RELOAD_RECOVERY"});
   if(recovery.died){if(window.NUHealth)window.NUHealth.recordDeath({gameId:"chaos",waveId,hpBefore,reason:"CHAOS_RELOAD_RECOVERY"});state.save.xp=Math.floor(state.save.xp/100)*100;state.save.hp=10;}
   NU.save(state.save);
  }
 }
 const recovered=NUWallet.settleWave(state.save,"reload_recovery");if(recovered.ok){state.save=recovered.state;NU.save(state.save);}
}
renderLibrary();renderWallet();bindHpPillButton();bindGameAssetProfiles();renderRoundProgress();resize();
function unlockWorld(info,label){state.quality=info&&info.level||3;try{state.engine=NU.create($("world-canvas"));state.engine.setQuality(state.quality);}catch(error){console.warn("N.U world canvas fallback",error);}if(window.NUPixelWorld)window.NUPixelWorld.setQuality(state.quality);$("quality-status").textContent="SYSTEM READY";$("calibration-status").textContent="READY · RENDER CALIBRATED";$("intro-start").disabled=false;$("intro-start").textContent="ENTER WORLD";document.querySelector(".world").classList.add("calibrated");window.dispatchEvent(new CustomEvent("nu:calibrated",{detail:{performance:info||{level:state.quality}}}));}
NU.samplePerformance().then(info=>{unlockWorld(info);NU.sampleNetwork().then(net=>{void net;$("quality-status").textContent="SYSTEM READY";$("calibration-status").textContent="READY · RENDER CALIBRATED";}).catch(()=>{$("quality-status").textContent="SYSTEM READY";});}).catch(error=>{console.warn("N.U performance calibration fallback",error);unlockWorld({level:3},"RUNTIME SAFE MODE");});
$("intro-start").addEventListener("click",()=>{$("intro").classList.add("hidden");});
$("intro-close").addEventListener("click",()=>{$("intro").classList.add("hidden");});
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("intro").classList.add("hidden");});
})();