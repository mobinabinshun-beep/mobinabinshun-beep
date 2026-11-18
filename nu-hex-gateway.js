/* N.U Hex Gateway — one navigation surface, hierarchical controller selection. */
(() => {
 "use strict";
 const root=document.getElementById("nu-hex-gateway");
 const scrim=document.querySelector(".nu-gateway-scrim");
 if(!root||!scrim)return;
 const gameView=document.getElementById("game-view");
 const utilityViews=["bag-view","wallet-view","inventory-view","profile-view"].map(id=>document.getElementById(id)).filter(Boolean);
 const trigger=root.querySelector(".nu-gateway-trigger");
 const items=[...root.querySelectorAll(".nu-gateway-item")];
 const itemList=root.querySelector(".nu-gateway-items");
 if(!trigger||!items.length)return;
 let open=false,selected=null,dwellTimer=0,activationTimer=0,outsideSince=0,suppressClickUntil=0;
 let requiresExit=false,lastPointer=null,openingSource="direct";
 const now=()=>typeof performance!=="undefined"&&performance.now?performance.now():Date.now();
 function syncGatewayScope(){
  const active=!!(gameView&&gameView.classList.contains("active"));
  const utility=utilityViews.some(view=>view.classList.contains("active"));
  const standalone=!gameView&&!utilityViews.length;
  document.body.classList.toggle("nu-gateway-enabled",active||utility||standalone);
  document.body.classList.toggle("nu-main-game-page",active);
  document.body.classList.toggle("nu-game-active",active);
  document.body.classList.toggle("nu-gateway-utility-active",utility);
  document.body.classList.toggle("nu-gateway-standalone-active",standalone);
  if(standalone){
   if(document.querySelector(".casino-shell"))document.body.classList.add("nu-casino-page");
   if(document.querySelector(".studio-stage, #studio-canvas, .studio-toolbar"))document.body.classList.add("nu-studio-page");
  }
 }
 syncGatewayScope();
 const scopeObserver=new MutationObserver(syncGatewayScope);
 [...(gameView?[gameView]:[]),...utilityViews].forEach(view=>scopeObserver.observe(view,{attributes:true,attributeFilter:["class"]}));
 function layoutItems(){
  items.forEach((item,index)=>{
   item.tabIndex=open?0:-1;
   item.style.setProperty("--gateway-index",String(index));
   item.style.transitionDelay=open?(index*35)+"ms":"0ms";
  });
 }
 layoutItems();
 function goHome(){
  const back=document.getElementById("back-home");
  if(back&&gameView&&gameView.classList.contains("active"))back.click();
  else window.location.href="./index.html";
 }
 const routes={
  back:goHome,
  menu:()=>{const menu=document.getElementById("menu-open");if(menu)menu.click();else window.location.href="./index.html#library-section";},
  profile:()=>{const profile=document.getElementById("menu-profile");if(profile)profile.click();else window.location.href="./index.html?view=profile";}
 };
 function clearDwell(){if(dwellTimer)clearTimeout(dwellTimer);dwellTimer=0;}
 function pointInside(rect,x,y,pad){
  if(!rect)return false;pad=Number(pad)||0;
  return x>=rect.left-pad&&x<=rect.right+pad&&y>=rect.top-pad&&y<=rect.bottom+pad;
 }
 function insideTrigger(x,y){return pointInside(trigger.getBoundingClientRect(),x,y,4);}
 function insideGateway(x,y){
  if(pointInside(root.getBoundingClientRect(),x,y,10))return true;
  return open&&itemList&&pointInside(itemList.getBoundingClientRect(),x,y,10);
 }
 function scheduleOpen(source,delay){
  if(open||requiresExit||dwellTimer)return;
  dwellTimer=setTimeout(()=>{
   dwellTimer=0;
   if(!open&&!requiresExit&&lastPointer&&insideTrigger(lastPointer.x,lastPointer.y))setOpen(true,source);
  },delay);
 }
 function select(item){
  if(!item)return;
  if(selected&&selected!==item){selected.classList.remove("is-selected","is-confirming");selected.setAttribute("aria-pressed","false");}
  selected=item;item.classList.add("is-selected");item.setAttribute("aria-pressed","true");
 }
 function moveSelection(direction){
  if(!items.length)return;
  const current=items.indexOf(selected);
  const start=current<0?(direction>0?-1:items.length):current;
  const next=Math.max(0,Math.min(items.length-1,start+Math.sign(direction)));
  select(items[next]);
 }
 function moveControllerSelection(direction){
  if(!open||!direction)return;
  const current=items.indexOf(selected);
  if(direction>0&&current===items.length-1){setOpen(false);return;}
  moveSelection(direction);
 }
 function setOpen(next,source){
  if(open===next)return;
  if(next){
   clearDwell();outsideSince=0;open=true;openingSource=source||"direct";
   // The pause event is synchronous: freeze completes before the option list is exposed.
   window.dispatchEvent(new Event("nu:gateway-open"));
   window.NUControllerPointer?.setGatewayNavigation(true);
   root.classList.add("is-open");document.body.classList.add("nu-gateway-open");
   trigger.setAttribute("aria-expanded","true");
   trigger.setAttribute("aria-label","N.U navigation gateway open");
   items.forEach(item=>{item.tabIndex=0;item.setAttribute("aria-pressed","false");});
   selected=null;
   if(openingSource==="simulated"||openingSource==="controller")select(items[0]);
   trigger.focus({preventScroll:true});
   layoutItems();
   return;
  }
  const wasInside=!!(lastPointer&&insideGateway(lastPointer.x,lastPointer.y));
  open=false;clearDwell();outsideSince=0;
  requiresExit=wasInside;
  window.NUControllerPointer?.setGatewayNavigation(false);
  root.classList.remove("is-open");document.body.classList.remove("nu-gateway-open");
  trigger.setAttribute("aria-expanded","false");
  trigger.setAttribute("aria-label","Open N.U navigation gateway");
  clearTimeout(activationTimer);activationTimer=0;selected=null;
  items.forEach(item=>{item.tabIndex=-1;item.classList.remove("is-selected","is-confirming");item.setAttribute("aria-pressed","false");});
  layoutItems();
  // Gateway releases only its own pause; the game remains frozen until real gameplay input.
  window.dispatchEvent(new Event("nu:gateway-close"));
 }
 function activate(item){
  if(!item||!item.dataset||!open)return;
  const action=routes[item.dataset.action];
  if(!action)return;
  clearTimeout(activationTimer);
  item.classList.add("is-confirming");
  activationTimer=window.setTimeout(()=>{
   activationTimer=0;
   setOpen(false);
   action();
  },100);
 }
 function onNativePointerMove(event){
  if(event.isTrusted===false||!["mouse","touch","pen"].includes(event.pointerType))return;
  lastPointer={x:event.clientX,y:event.clientY,source:event.pointerType};
  if(!open){
   if(requiresExit&&!insideTrigger(event.clientX,event.clientY))requiresExit=false;
   if(event.pointerType==="mouse"&&insideTrigger(event.clientX,event.clientY)&&!requiresExit)scheduleOpen("mouse",500);
   else if(!insideTrigger(event.clientX,event.clientY))clearDwell();
   return;
  }
  if(insideGateway(event.clientX,event.clientY))outsideSince=0;
  else if(!outsideSince)outsideSince=now();
  else if(now()-outsideSince>110)setOpen(false);
 }
 function onSimulatedPointerMove(event){
  const detail=event&&event.detail||{};
  const x=Number(detail.x),y=Number(detail.y);
  if(!Number.isFinite(x)||!Number.isFinite(y))return;
  lastPointer={x:x,y:y,source:detail.source||"simulated"};
  if(open)return;
  if(requiresExit&&!insideTrigger(x,y))requiresExit=false;
  if(insideTrigger(x,y)&&!requiresExit)scheduleOpen("simulated",1000);
  else if(!insideTrigger(x,y))clearDwell();
 }
 trigger.addEventListener("pointerenter",event=>{
  if(event.isTrusted===false||event.pointerType!=="mouse"||open)return;
  lastPointer={x:event.clientX,y:event.clientY,source:"mouse"};
  if(!requiresExit)scheduleOpen("mouse",500);
 });
 trigger.addEventListener("pointerleave",event=>{
  if(event.pointerType==="mouse"&&!open)clearDwell();
 });
 trigger.addEventListener("pointerdown",event=>{
  if(event.pointerType!=="touch"||open)return;
  event.preventDefault();
  lastPointer={x:event.clientX,y:event.clientY,source:"touch"};
  suppressClickUntil=Date.now()+900;
  if(!requiresExit)scheduleOpen("touch",500);
 });
 trigger.addEventListener("click",event=>{
  event.preventDefault();
  if(Date.now()<suppressClickUntil)return;
  if(event.detail===0){
   if(open)setOpen(false);
   else if(!requiresExit)setOpen(true,"keyboard");
  }else if(!open&&!requiresExit){
   lastPointer={x:event.clientX,y:event.clientY,source:"mouse"};
   scheduleOpen("mouse",500);
  }
 });
 items.forEach(item=>{
  item.addEventListener("pointerenter",event=>{
   if(event.isTrusted!==false&&event.pointerType==="mouse"&&open)select(item);
  });
  item.addEventListener("pointerup",event=>{
   if(event.pointerType!=="touch"||!open)return;
   event.preventDefault();event.stopPropagation();
   lastPointer={x:event.clientX,y:event.clientY,source:"touch"};
   suppressClickUntil=Date.now()+900;activate(item);
  });
  item.addEventListener("click",event=>{
   event.preventDefault();event.stopPropagation();
   if(Date.now()<suppressClickUntil)return;
   activate(item);
  });
 });
 scrim.addEventListener("click",event=>{
  lastPointer={x:event.clientX,y:event.clientY,source:"mouse"};
  setOpen(false);
 });
 document.addEventListener("pointermove",onNativePointerMove,{passive:true});
 window.addEventListener("nu:simulated-pointer-move",onSimulatedPointerMove);
 window.addEventListener("nu:gateway-direction",event=>{
  if(!open)return;
  const dy=Number(event.detail&&event.detail.dy)||0;
  if(dy<0)moveControllerSelection(-1);
  else if(dy>0)moveControllerSelection(1);
 });
 window.addEventListener("nu:gateway-confirm",()=>{
  if(!open)return;
  activate(selected||items[0]);
 });
 window.addEventListener("nu:gateway-cancel",()=>{if(open)setOpen(false);});
 document.addEventListener("keydown",event=>{
  if(!open)return;
  if(event.key==="Escape"){event.preventDefault();setOpen(false);trigger.focus({preventScroll:true});return;}
  if(event.key==="ArrowDown"){event.preventDefault();moveControllerSelection(1);return;}
  if(event.key==="ArrowUp"){event.preventDefault();moveControllerSelection(-1);return;}
  if(event.key==="Enter"||event.key===" "){event.preventDefault();activate(selected||items[0]);return;}
  if(event.key==="Tab"){
   const focusable=[trigger,...items].filter(item=>item.tabIndex>=0);
   const first=focusable[0],last=focusable[focusable.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 window.addEventListener("blur",()=>{if(open)setOpen(false);});
 window.addEventListener("pagehide",()=>{if(open)setOpen(false);});
 const initialView=new URLSearchParams(window.location.search).get("view");
 if(["store","profile"].includes(initialView))document.getElementById("menu-"+initialView)?.click();
 if(initialView==="bag")document.getElementById("menu-bag")?.click();
 if(initialView==="wallet"){document.getElementById("menu-bag")?.click();document.querySelector('[data-bag-destination="wallet"]')?.click();}
})();
