/* N.U Generation 1 game prototypes. Each selected round is fixed for 10 interactions. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const state={save:NUWallet.normalizeSave(NU.load()),game:null,turn:0,active:false,paused:false,quality:5,engine:null,roundSeed:0,targets:[],shots:0,raf:0,lastFrame:0};
const games=[
 {id:"bubble",name:"Bubble Hunt",desc:"Find the rain-glass droplets and collect XP.",status:"PLAYABLE"},
 {id:"mana",name:"Mana Collector",desc:"Collect luminous hexagonal Mana particles.",status:"PLAYABLE"},
 {id:"chaos",name:"Chaos Attack",desc:"Spot Chaos masses; the N-BI cannon fires from outside your view.",status:"PLAYABLE"}
];
const canvas=$("game-canvas"),ctx=canvas.getContext("2d");
state.save.hp=Number.isFinite(state.save.hp)?state.save.hp:10;state.save.hpPills=Number.isFinite(state.save.hpPills)?Math.max(0,state.save.hpPills):0;state.save.manaCapsules=Number.isFinite(state.save.manaCapsules)?Math.max(1,Math.min(10,state.save.manaCapsules)):1;state.save.mana=Math.max(0,Math.min(state.save.mana,state.save.manaCapsules*10));
function save(){const ok=NU.save(state.save);if(ok){renderWallet();window.dispatchEvent(new CustomEvent("nu:save-updated"));}return ok;}function persistWalletState(next){const previous=state.save;state.save=next;if(!save()){state.save=previous;renderWallet();announceTransaction("SAVE FAILED · WALLET WAS NOT CHANGED","warning");return false;}return true;}function awardXP(amount,source){const result=NUWallet.grantXP(state.save,amount,{title:source||"Game reward"});if(!result.ok)return false;return persistWalletState(result.state);}
function renderGameAssetProfile(){
 const root=$("game-asset-profile");if(!root||!state.game)return;
 const names={bubble:"BUBBLE HUNT · ASSET PROFILE",mana:"MANA COLLECTOR · ASSET PROFILE",chaos:"CHAOS ATTACK · ASSET PROFILE"};
 const rows=NUWallet.gameAssetRows(state.save,state.game);
 root.innerHTML='<strong>'+names[state.game]+'</strong><small>SHARED WALLET · GAME-SCOPED VIEW</small><div class="game-asset-rows">'+rows.map(row=>'<span>'+row.label+'</span><b>'+row.value+row.unit+'</b>').join("")+'</div>';
}
let assetProfilePinned=false;
function setAssetProfileExpanded(value){
 document.querySelectorAll(".bar-wrap,#hp-bar").forEach(el=>el.setAttribute("aria-expanded",String(value)));
}
function positionGameAssetProfile(trigger){
 const root=$("game-asset-profile");if(!root||!trigger)return;
 const rect=trigger.getBoundingClientRect(),width=root.offsetWidth||300,height=root.offsetHeight||110;
 const top=rect.top>innerHeight*.5?rect.top-height-10:rect.bottom+10;
 const left=rect.left+rect.width/2-width/2;
 root.style.left=Math.max(8,Math.min(innerWidth-width-8,left))+"px";
 root.style.top=Math.max(8,Math.min(innerHeight-height-8,top))+"px";
 root.style.transform="none";
}
function showGameAssetProfile(trigger){
 const root=$("game-asset-profile");if(!root)return;
 renderGameAssetProfile();root.hidden=false;setAssetProfileExpanded(true);positionGameAssetProfile(trigger);
}
function toggleGameAssetProfile(trigger){
 assetProfilePinned=!assetProfilePinned;
 if(assetProfilePinned){showGameAssetProfile(trigger);setAssetProfileExpanded(true);}
 else{$("game-asset-profile").hidden=true;setAssetProfileExpanded(false);}
}
function bindGameAssetProfiles(){
 const triggers=[...document.querySelectorAll(".bar-wrap"),$("hp-bar")].filter(Boolean),root=$("game-asset-profile");
 triggers.forEach(el=>{
  el.tabIndex=0;el.setAttribute("role","group");el.setAttribute("aria-label","Show game asset profile");el.setAttribute("aria-describedby","game-asset-profile");el.setAttribute("aria-expanded","false");
  el.addEventListener("pointerenter",()=>{if(!assetProfilePinned)showGameAssetProfile(el);});
  el.addEventListener("pointerleave",()=>{if(!assetProfilePinned){root.hidden=true;setAssetProfileExpanded(false);}});
  el.addEventListener("focus",()=>showGameAssetProfile(el));
  el.addEventListener("blur",()=>{if(!assetProfilePinned){root.hidden=true;setAssetProfileExpanded(false);}});
  // Resource bars are HUD controls, never gameplay hit targets or camera gestures.
  el.addEventListener("pointerdown",e=>e.stopPropagation());
  el.addEventListener("pointerup",e=>e.stopPropagation());
  el.addEventListener("click",e=>{e.stopPropagation();if(e.target.closest("#hp-pill-use"))return;toggleGameAssetProfile(el);});
  el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();e.stopPropagation();toggleGameAssetProfile(el);}});
 });
 document.addEventListener("pointerdown",e=>{
  if(assetProfilePinned&&!e.target.closest(".bar-wrap,#hp-bar")){assetProfilePinned=false;root.hidden=true;setAssetProfileExpanded(false);}
 });
 window.addEventListener("resize",()=>{if(!root.hidden){const active=document.activeElement;if(active&&active.matches(".bar-wrap,#hp-bar"))positionGameAssetProfile(active);}});
}
function renderWallet(){renderGameAssetProfile();const pill=$("hp-pill-use");if(pill){pill.hidden=state.save.hpPills<1;const count=pill.querySelector("#hp-pill-count");if(count)count.textContent="×"+state.save.hpPills;const reason=state.save.hp>=10?"HP is already full.":state.save.hpPills<1?"No HP capsule in inventory.":"Use one HP capsule to restore up to 10 HP.";pill.setAttribute("aria-label",reason);pill.title=reason;pill.classList.toggle("unavailable",state.save.hp>=10||state.save.hpPills<1);}const xp=state.save.xp%100,mana=state.save.mana%10;$("xp-fill").style.width=xp+"%";$("mana-fill").style.width=(mana*10)+"%";$("xp-fill").parentElement.style.setProperty("--capsule-boundary",xp+"%");$("mana-fill").parentElement.style.setProperty("--capsule-boundary",(mana*10)+"%");$("xp-fill").setAttribute("aria-valuenow",String(xp));$("mana-fill").setAttribute("aria-valuenow",String(mana));$("xp-value").textContent=state.save.xp?state.save.xp+" / 100":"";$("mana-value").textContent=state.save.mana?state.save.mana+" / 10":"";$("level-chip").textContent="LV "+state.save.level;$("hp-value").textContent=state.save.hp+"/10";$("hp-fill").style.width=(state.save.hp*10)+"%";$("mana-capsules").innerHTML=Array.from({length:state.save.manaCapsules},(_,i)=>{const amount=Math.max(0,Math.min(10,state.save.mana-i*10));return '<span class="mana-slot" title="Mana capsule '+(i+1)+' · '+amount+'/10"><i style="width:'+(amount*10)+'%"></i></span>';}).join("");}
function showFloat(){} // N.U policy: no floating XP/Mana/reward text on interactive objects.
function announceTransaction(message,tone="success"){const el=$("transaction-toast");if(!el)return;el.textContent=message;el.className="transaction-toast "+tone+" visible";clearTimeout(el._hideTimer);el._hideTimer=setTimeout(()=>el.classList.remove("visible"),2200);}function showFloatingChange(message,tone="gain"){const root=$("floating-notifications");if(!root)return;const item=document.createElement("div");item.className="floating-change "+tone;item.textContent=message;root.appendChild(item);setTimeout(()=>item.remove(),1800);}
function showHpGain(amount){const track=$("hp-fill").parentElement;track.classList.remove("hp-restored");void track.offsetWidth;track.classList.add("hp-restored");const el=document.createElement("span");el.className="hp-gain";el.textContent="+"+amount+" HP";track.appendChild(el);setTimeout(()=>{el.remove();track.classList.remove("hp-restored");},1100);}
function useHpPill(e){if(e){e.preventDefault();e.stopPropagation();}const result=NUWallet.useHpPill(state.save);if(!result.ok){const message=result.reason==="HP_FULL"?"HP is already full · no capsule consumed.":"No HP capsule available · earn or purchase one first.";announceTransaction(message,"warning");return;}if(!persistWalletState(result.state))return;assetProfilePinned=false;const profile=$("game-asset-profile");if(profile)profile.hidden=true;setAssetProfileExpanded(false);showHpGain(result.restored);showFloatingChange("+"+result.restored+" HP","hp");showFloatingChange("−1 Capsule","loss");announceTransaction("HP CAPSULE USED · +"+result.restored+" HP · −1 CAPSULE","success");}
function showCapsuleGain(text,type){const fill=type==="xp"?$("xp-fill"):$("mana-fill");const bar=fill.parentElement;const el=document.createElement("span");el.className="capsule-gain "+type;el.textContent=text;el.style.left=Math.max(1,Math.min(99,(parseFloat(fill.style.width)||0)+1.5))+"%";el.style.transform="translateX(-50%)";bar.appendChild(el);setTimeout(()=>el.remove(),1100);}
function showHitProgress(x,y){const el=document.createElement("span");el.className="hit-progress";el.textContent=state.turn+"/10";el.style.left=x+"px";el.style.top=y+"px";$("game-stage").appendChild(el);setTimeout(()=>el.remove(),850);}
function renderRoundProgress(){} // Round count is shown only on the interacted object.
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,state.quality>=8?1.5:1);canvas.width=Math.floor(r.width*d);canvas.height=Math.floor(r.height*d);ctx.setTransform(d,0,0,d,0,0);}
function rnd(min,max){return min+Math.random()*(max-min);}
function initTargets(){
 const w=canvas.clientWidth,h=canvas.clientHeight;if(w<80||h<120)return;
 const count=10,points=[],reading=document.querySelector("#article-view.active"),readingRect=reading?reading.getBoundingClientRect():null;
 const download=document.documentElement.dataset.delivery==="download";
 const minGap=Math.max(26,Math.min(54,w*.075));
 let attempts=0;
 while(points.length<count&&attempts++<2400){
  const margin=state.game==="chaos"?34:Math.max(26,Math.min(44,h*.08));
  const x=rnd(margin,w-margin),y=state.game==="chaos"?rnd(70,Math.max(90,h*.43)):rnd(70,h-margin);
  if(!download&&x>w*.22&&x<w*.78)continue;
  if(readingRect&&x>readingRect.left-18&&x<readingRect.right+18&&y>readingRect.top-18&&y<readingRect.bottom+18)continue;
  if(points.some(p=>Math.hypot(p.x-x,p.y-y)<minGap))continue;
  points.push({x,y});
 }
 // Narrow online viewports may not fit ten widely spaced targets; fill remaining slots
 // only in the allowed side lanes, with reduced spacing rather than placing over reading content.
 let fallback=0;
 while(points.length<count&&fallback++<1600){
  const margin=22,side=Math.random()<.5?"left":"right";
  const x=download?rnd(margin,w-margin):(side==="left"?rnd(margin,w*.21):rnd(w*.79,w-margin));
  const y=rnd(70,Math.max(90,h-38));
  if(readingRect&&x>readingRect.left-18&&x<readingRect.right+18&&y>readingRect.top-18&&y<readingRect.bottom+18)continue;
  if(points.some(p=>Math.hypot(p.x-x,p.y-y)<minGap*.48))continue;
  points.push({x,y});
 }
 state.targets=points.map((p,i)=>({x:p.x,y:p.y,r:state.game==="bubble"?rnd(25,39):state.game==="mana"?rnd(4,6):rnd(15,23),hp:1,phase:Math.random()*6,vx:rnd(-.34,.34),vy:rnd(-.26,.26),speed:state.game==="chaos"?Math.min(8,Math.pow(2,i)):1,alive:true,damaged:false}));
}
function animateGame(t){if(!state.active)return;const minFrame=state.quality<=3?70:state.quality<=6?45:30;if(t-state.lastFrame>=minFrame){state.lastFrame=t;const w=canvas.clientWidth,h=canvas.clientHeight;state.targets.forEach(o=>{if(!state.active||!o.alive)return;o.x+=o.vx;if(state.game==="chaos"){o.y+=o.speed;if(o.x<o.r+8||o.x>w-o.r-8)o.vx*=-1;if(!o.damaged&&o.y>h-92){o.damaged=true;o.alive=false;state.save.hp=Math.max(0,state.save.hp-1);announceTransaction("CHAOS BREACH · −1 HP","warning");if(state.save.hp===0){state.save.xp=Math.floor(state.save.xp/100)*100;state.save.hp=10;state.targets.forEach(t=>t.alive=false);$("game-info").textContent="YOU DIED · 0 HP.";save();state.active=false;cancelAnimationFrame(state.raf);return;}save();}}else{o.y+=o.vy;if(o.y<55||o.y>h-o.r-40)o.vy*=-1;}});drawGame();}state.raf=requestAnimationFrame(animateGame);}
function chooseGame(id){if(window.NUPixelWorld)window.NUPixelWorld.setWeatherMode("game");if(state.raf)cancelAnimationFrame(state.raf);state.game=id||games[Math.floor(Math.random()*games.length)].id;state.turn=0;state.active=true;state.paused=false;state.shots=0;initTargets();$("home-view").classList.remove("active");$("article-view").classList.remove("active");$("game-view").classList.add("active");$("game-title").textContent=games.find(g=>g.id===state.game).name;renderRoundProgress();$("game-info").textContent=state.game==="chaos"?"Tap a Chaos mass to mark it. N-BI fires automatically and consumes one full 10-Mana capsule per mass.":"Complete 10 interactions to finish this round.";renderWallet();$("finish-round").textContent="PAUSE ROUND";requestAnimationFrame(()=>{resize();initTargets();drawGame();state.lastFrame=0;state.raf=requestAnimationFrame(animateGame);});}
function closeGame(){if(window.NUPixelWorld)window.NUPixelWorld.setWeatherMode("sleep");state.active=false;state.paused=false;if(state.raf)cancelAnimationFrame(state.raf);$("game-view").classList.remove("active");$("home-view").classList.add("active");document.body.classList.remove("article-mode");}
function drawGame(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;ctx.clearRect(0,0,w,h);ctx.save();ctx.globalAlpha=.22;for(let i=0;i<30;i++){let x=(i*97+Date.now()*.004)%w,y=(i*61)%h;ctx.fillStyle="#9cddff";ctx.fillRect(x,y,1,1);}ctx.restore();state.targets.forEach((o,i)=>{if(!o.alive)return;o.phase+=.015;const bob=Math.sin(o.phase)*2;ctx.save();if(state.game==="bubble"){const g=ctx.createRadialGradient(o.x-o.r*.3,o.y-o.r*.4,1,o.x,o.y,o.r*1.4);g.addColorStop(0,"rgba(255,255,255,.7)");g.addColorStop(.3,"rgba(255,180,210,.18)");g.addColorStop(.75,"rgba(96,185,255,.13)");g.addColorStop(1,"rgba(255,196,95,.03)");ctx.fillStyle=g;ctx.strokeStyle="rgba(255,202,111,.85)";ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(o.x,o.y+bob,o.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.strokeStyle="rgba(255,255,255,.52)";ctx.lineWidth=Math.max(1,o.r*.035);ctx.arc(o.x-o.r*.22,o.y-o.r*.24+bob,o.r*.22,-Math.PI*.78,Math.PI*.18);ctx.stroke();}else if(state.game==="mana"){ctx.translate(o.x,o.y+bob);ctx.rotate(Math.PI/6);ctx.fillStyle="rgba(64,190,255,.16)";ctx.strokeStyle="#68dfff";ctx.lineWidth=1.5;ctx.shadowBlur=5;ctx.shadowColor="#43cfff";ctx.beginPath();ctx.moveTo(0,-o.r);for(let j=1;j<6;j++)ctx.lineTo(Math.cos(j*Math.PI/3)*o.r,Math.sin(j*Math.PI/3)*o.r);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle="#d9faff";ctx.fillRect(-1,-2,2,4);if(window.NUMaterials)window.NUMaterials.drawMana(ctx,0,0,o.r,o.phase);}else{ctx.translate(o.x,o.y+bob);ctx.fillStyle="rgba(255,54,85,.16)";ctx.strokeStyle="#ff526c";ctx.lineWidth=1.5;ctx.shadowBlur=13;ctx.shadowColor="#ff3658";ctx.beginPath();for(let j=0;j<9;j++){const a=j*Math.PI*2/9,rr=o.r*(j%2?.78:1);if(!j)ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle="#ffd6df";ctx.font="10px sans-serif";ctx.textAlign="center";}ctx.restore();});if(window.NUMaterials)window.NUMaterials.drawEffects(ctx);if(state.game==="chaos"){ctx.save();ctx.strokeStyle="rgba(255,174,96,.5)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w-18,h-18);ctx.lineTo(w-90,h-75);ctx.stroke();ctx.fillStyle="#ffca75";ctx.shadowBlur=12;ctx.shadowColor="#ffb44e";ctx.beginPath();ctx.arc(w-18,h-18,4,0,Math.PI*2);ctx.fill();ctx.restore();}}
function interact(e){if(!state.active||state.paused||state.turn>=10)return;const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;let target=null,best=Infinity;state.targets.forEach(o=>{if(!o.alive)return;const d=Math.hypot(o.x-x,o.y-y);if(d<o.r+(state.game==="mana"?8:state.game==="bubble"?10:15)&&d<best){best=d;target=o;}});if(!target)return;if(state.game==="mana"&&state.save.mana>=state.save.manaCapsules*10){$("game-info").textContent="Mana storage is full. Upgrade or spend a capsule first.";return;}if(state.game==="chaos"&&state.save.mana<10){$("game-info").textContent="N-BI cannot fire: one complete Mana Capsule (10 Mana) is required.";return;}state.turn++;renderRoundProgress();showHitProgress(target.x,target.y);if(state.game==="bubble"){target.alive=false;awardXP(1,"Bubble Hunt reward");showCapsuleGain("+1","xp");$("game-info").textContent="";}else if(state.game==="mana"){target.alive=false;if(window.NUMaterials)window.NUMaterials.emit(target.x,target.y);state.save.mana++;save();showCapsuleGain("+1","mana");$("game-info").textContent="";}else{state.save.mana-=10;state.shots++;target.alive=false;save();awardXP(3,"Chaos Attack reward");$("game-info").textContent="";}drawGame();if(state.turn>=10){state.active=false;state.paused=false;cancelAnimationFrame(state.raf);state.save.hp=Math.min(10,state.save.hp+1);save();$("finish-round").textContent="ROUND COMPLETE";$("game-info").textContent="Round complete.";renderWallet();}}
function syncWorldTime(){const hour=new Date().getHours();const phase=hour>=6&&hour<10?"dawn":hour>=10&&hour<17?"day":hour>=17&&hour<20?"dusk":"night";document.documentElement.dataset.worldTime=phase;}
syncWorldTime();setInterval(syncWorldTime,60000);
let mouseCameraReady=false,touchCameraReady=false,touchMoved=false,touchStart=null,touchLast=null,cameraX=0,cameraY=0,cameraQueued=false,lastCamera=0;
function applyCamera(){if(cameraQueued)return;cameraQueued=true;requestAnimationFrame(t=>{cameraQueued=false;if(t-lastCamera<24)return;lastCamera=t;document.documentElement.style.setProperty("--camera-x",cameraX.toFixed(1)+"px");document.documentElement.style.setProperty("--camera-y",cameraY.toFixed(1)+"px");if(window.NUPixelWorld)window.NUPixelWorld.setCamera(cameraX,cameraY);});}
function mouseMove(e){if(e.pointerType!=="mouse"||NU.clamp(state.quality,1,10)<=1)return;cameraX=((e.clientX/(innerWidth||1)-.5)*22);cameraY=((e.clientY/(innerHeight||1)-.5)*16);applyCamera();}
function touchDown(e){if(e.pointerType!=="touch"||NU.clamp(state.quality,1,10)<=1||e.target.closest("button,a,input,textarea,select,[role=button]"))return;touchStart={x:e.clientX,y:e.clientY,id:e.pointerId};touchLast={x:e.clientX,y:e.clientY};touchMoved=false;if(window.NUPixelWorld)window.NUPixelWorld.lastTouchWasDrag=false;if(!touchCameraReady){touchCameraReady=true;window.addEventListener("pointermove",touchMove,{passive:true});window.addEventListener("pointerup",touchUp,{passive:true});window.addEventListener("pointercancel",touchUp,{passive:true});}}
function touchMove(e){if(!touchStart||e.pointerId!==touchStart.id)return;const dx=e.clientX-touchLast.x,dy=e.clientY-touchLast.y;if(Math.hypot(e.clientX-touchStart.x,e.clientY-touchStart.y)>7)touchMoved=true;if(touchMoved){cameraX=NU.clamp(cameraX-dx*.75,-28,28);cameraY=NU.clamp(cameraY-dy*.75,-20,20);applyCamera();}touchLast={x:e.clientX,y:e.clientY};}
function touchUp(e){if(!touchStart||e.pointerId!==touchStart.id)return;const wasDrag=touchMoved;touchStart=null;touchLast=null;touchMoved=false;if(window.NUPixelWorld)window.NUPixelWorld.lastTouchWasDrag=wasDrag;}
function mouseCameraBootstrap(e){if(e.pointerType!=="mouse")return;mouseCameraReady=true;window.removeEventListener("pointermove",mouseCameraBootstrap);window.addEventListener("pointermove",mouseMove,{passive:true});mouseMove(e);}
window.addEventListener("pointermove",mouseCameraBootstrap,{passive:true});window.addEventListener("pointerdown",e=>{if(e.pointerType==="touch")touchDown(e);},{passive:true});
document.addEventListener("visibilitychange",()=>{if(document.hidden){if(state.raf)cancelAnimationFrame(state.raf);if(state.engine)state.engine.pause();}else{if(state.engine)state.engine.resume();if(state.active&&!state.paused)state.raf=requestAnimationFrame(animateGame);}});
window.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse"||e.target.closest("button,a,input,textarea,select,[role=button]"))return;if(state.active&&!state.paused)interact(e);},{passive:true});window.addEventListener("pointerup",e=>{if(e.pointerType!=="touch"||touchMoved||(window.NUPixelWorld&&window.NUPixelWorld.lastTouchWasDrag)){if(window.NUPixelWorld)window.NUPixelWorld.lastTouchWasDrag=false;return;}if(e.target.closest("button,a,input,textarea,select,[role=button]"))return;if(state.active&&!state.paused)interact(e);},{passive:true});window.addEventListener("resize",()=>{if($("game-view").classList.contains("active")){resize();initTargets();drawGame();}});
window.addEventListener("pageshow",()=>{state.save=NUWallet.normalizeSave(NU.load());renderWallet();});
window.addEventListener("storage",e=>{if(e.key==="nu-world-save-v1"){state.save=NUWallet.normalizeSave(NU.load());renderWallet();}});
window.addEventListener("nu:identity-updated",e=>{const detail=e.detail||{};state.save.playerId=detail.playerId||state.save.playerId;state.save.displayName=detail.displayName||"";state.save.callsign=detail.callsign||"";});
let playerOverlayPaused=false;window.addEventListener("nu:player-overlay-open",()=>{if(state.active){state.active=false;state.paused=true;playerOverlayPaused=true;cancelAnimationFrame(state.raf);$("finish-round").textContent="RESUME ROUND";}});window.addEventListener("nu:player-overlay-close",()=>{if(playerOverlayPaused&&state.paused&&state.turn<10){playerOverlayPaused=false;state.active=true;state.paused=false;$("finish-round").textContent="PAUSE ROUND";state.raf=requestAnimationFrame(animateGame);}});
function openArticle(title,url){$("article-title").textContent=title;$("article-frame-link").href=url;chooseGame();if(window.NUPixelWorld)window.NUPixelWorld.setWeatherMode("study");$("game-view").classList.add("active");$("article-view").classList.add("active");document.body.classList.add("article-mode");resize();initTargets();drawGame();$("game-info").textContent="Background encounter active outside the reading column."; }
function showHome(){closeGame();$("article-view").classList.remove("active");$("shop-view").classList.remove("active");$("wallet-view").classList.remove("active");$("profile-view").classList.remove("active");$("home-view").classList.add("active");}

function renderShop(feedback=""){
 const items=[],canBuy=state.save.xp>=NUWallet.HP_PILL_COST,owned=state.save.hpPills>0,hpFull=state.save.hp>=NUWallet.MAX_HP;
 items.push('<article class="shop-item"><img class="hp-pill-icon" src="./assets/nu-hp-pill-golden-pixel.svg" alt="Golden pixel HP capsule"><div><strong>Golden HP Capsule</strong><p>Costs 10 XP · Restores up to 10 missing HP · One use per capsule</p></div><button class="btn primary" data-buy-hp-pill '+(canBuy?'':'disabled')+'>'+(canBuy?'BUY · 10 XP':'NEED 10 XP')+'</button></article>');
 items.push('<article class="shop-item shop-use-item"><img class="hp-pill-icon" src="./assets/nu-hp-pill-golden-pixel.svg" alt="Owned HP capsule"><div><strong>Use owned capsule</strong><p>'+(owned?(hpFull?'HP is full. Your capsule remains in inventory.':'Owned: '+state.save.hpPills+' · Restores '+Math.min(10,10-state.save.hp)+' HP'):'No HP capsules currently owned.')+'</p></div><button class="btn" data-use-hp-pill '+(!owned||hpFull?'disabled':'')+'><img class="shop-use-icon" src="./assets/nu-hp-pill-golden-pixel.svg" alt=""> USE · '+state.save.hpPills+'</button></article>');
 $("shop-items").innerHTML=items.join("");
 $("shop-status").textContent=feedback||(canBuy?"Purchase uses the shared N.U XP balance.": "Earn XP in Bubble Hunt or from eligible Studio exports to unlock a capsule.");
 $("shop-items").querySelectorAll("[data-buy-hp-pill]").forEach(b=>b.addEventListener("click",()=>{
  const result=NUWallet.buyHpPill(state.save);
  if(!result.ok){renderShop("Purchase unavailable: "+(result.reason==="INSUFFICIENT_XP"?"not enough XP.":"please try again."));announceTransaction("PURCHASE FAILED · NOT ENOUGH XP","warning");return;}
  if(!persistWalletState(result.state))return;
  renderShop("−10 XP · +1 HP Capsule added to your wallet.");
  showFloatingChange("−10 XP","loss");showFloatingChange("+1 Capsule","gain");
  announceTransaction("PURCHASE COMPLETE · −10 XP · +1 CAPSULE","success");
 }));
 $("shop-items").querySelectorAll("[data-use-hp-pill]").forEach(b=>b.addEventListener("click",e=>useHpPill(e)));
}function showShop(){ $("home-view").classList.remove("active");$("game-view").classList.remove("active");$("article-view").classList.remove("active");$("shop-view").classList.add("active");document.body.classList.remove("article-mode");const seen=localStorage.getItem("nu-shop-guide-seen")==="1";$("shop-quest").classList.toggle("hidden",seen);$("shop-empty").classList.toggle("hidden",!seen);renderShop();}
function closeShop(){ $("shop-view").classList.remove("active");$("home-view").classList.add("active");}


function renderLibrary(){$("game-library").innerHTML=games.map(g=>'<article class="glass game-card"><span class="tag ready">GEN 1 · PLAYABLE</span><h3>'+g.name+'</h3><p>'+g.desc+'</p><div class="card-actions"><span class="tag">'+g.id.toUpperCase()+'</span><button class="text-btn" data-game="'+g.id+'">Launch →</button></div></article>').join("")+'<article class="glass game-card"><span class="tag ready">GEN 1 · CREATIVE TOOL</span><h3>Pixel Art &amp; Vector Studio</h3><p>Import images, tune color palettes and transparency, trace compact SVG contours, and export editable vector artwork locally.</p><div class="card-actions"><span class="tag">SVG VECTOR</span><a class="text-btn" href="./pixel-art-studio.html">Open Studio →</a></div></article>';$("game-library").querySelectorAll("[data-game]").forEach(b=>b.addEventListener("click",()=>chooseGame(b.dataset.game)));}
$("start-random").addEventListener("click",()=>chooseGame());$("back-home").addEventListener("click",showHome);$("finish-round").addEventListener("click",()=>{if(state.active){state.active=false;state.paused=true;cancelAnimationFrame(state.raf);$("finish-round").textContent="RESUME ROUND";$("game-info").textContent="Round paused. Your targets and progress are frozen.";}else if(state.paused&&state.turn<10){state.paused=false;state.active=true;$("finish-round").textContent="PAUSE ROUND";$("game-info").textContent="Round resumed.";state.raf=requestAnimationFrame(animateGame);}});$("restart-round").addEventListener("click",()=>chooseGame(state.game));$("menu-open").addEventListener("click",()=>$("menu").classList.add("open"));$("menu-close").addEventListener("click",()=>$("menu").classList.remove("open"));$("menu-store").addEventListener("click",()=>{$("menu").classList.remove("open");showShop();});$("shop-back").addEventListener("click",closeShop);$("quest-open-store").addEventListener("click",()=>{localStorage.setItem("nu-shop-guide-seen","1");$("shop-quest").classList.add("hidden");$("shop-empty").classList.remove("hidden");renderShop();});
let hpPillPointerHandledAt=0;const hpPillButton=$("hp-pill-use");hpPillButton.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();});hpPillButton.addEventListener("pointerup",e=>{e.preventDefault();e.stopPropagation();hpPillPointerHandledAt=performance.now();useHpPill(e);});hpPillButton.addEventListener("click",e=>{e.stopPropagation();if(performance.now()-hpPillPointerHandledAt<800)return;useHpPill(e);});$("quest-continue").addEventListener("click",()=>{localStorage.setItem("nu-shop-guide-seen","1");closeShop();});$("menu-library").addEventListener("click",()=>{$("menu").classList.remove("open");$("library-section").scrollIntoView({behavior:"smooth"});});$("menu-home").addEventListener("click",()=>{$("menu").classList.remove("open");showHome();});document.querySelectorAll("[data-article]").forEach(b=>b.addEventListener("click",()=>openArticle(b.dataset.title,b.dataset.article)));$("article-back").addEventListener("click",showHome);
renderLibrary();renderWallet();bindGameAssetProfiles();renderRoundProgress();resize();
NU.samplePerformance().then(async info=>{state.quality=info.level;state.engine=NU.create($("world-canvas"));state.engine.setQuality(info.level);if(window.NUPixelWorld)window.NUPixelWorld.setQuality(info.level);$("quality-status").textContent="CALIBRATED · Q"+info.level;const net=await NU.sampleNetwork();const speed=net.estimatedDownlinkMbps===null?"LINK ?":("LINK ~"+net.estimatedDownlinkMbps+" Mbps");const rtt=net.siteRttMs===null?"SITE RTT N/A":("SITE RTT "+net.siteRttMs+" ms");$("quality-status").textContent="N.U Q"+info.level+" · "+rtt+" · "+speed;$("calibration-status").textContent="READY · RENDER Q"+info.level+" · "+rtt+" · "+net.probeLossPercent+"% FAILED SITE PROBES";$("intro-start").disabled=false;$("intro-start").textContent="ENTER WORLD";document.querySelector(".world").classList.add("calibrated");window.dispatchEvent(new CustomEvent("nu:calibrated",{detail:{performance:info}}));}).catch(()=>{$("quality-status").textContent="RUNTIME SAFE MODE";$("calibration-status").textContent="READY · BASIC MODE";$("intro-start").disabled=false;$("intro-start").textContent="ENTER WORLD";document.querySelector(".world").classList.add("calibrated");window.dispatchEvent(new Event("nu:calibrated"));});
$("intro-start").addEventListener("click",()=>{$("intro").classList.add("hidden");});
$("intro-close").addEventListener("click",()=>{$("intro").classList.add("hidden");});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("intro").classList.add("hidden");$("menu").classList.remove("open");}});
})();