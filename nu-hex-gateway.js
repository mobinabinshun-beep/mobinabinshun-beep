/* N.U Hex Gateway — movement-first navigation for active gameplay */
(() => {
  "use strict";
  const root=document.getElementById("nu-hex-gateway");
  const scrim=document.querySelector(".nu-gateway-scrim");
  const gameView=document.getElementById("game-view");
  if(!root||!scrim||!gameView)return;

  const trigger=root.querySelector(".nu-gateway-trigger");
  const items=[...root.querySelectorAll(".nu-gateway-item")];
  const pauseButton=document.getElementById("finish-round");
  let open=false,pausedByGateway=false,selected=null,activationTimer=0,outsideSince=0;
  let suppressClickUntil=0,suppressTriggerClickUntil=0;

  function syncGatewayScope(){
    const active=gameView.classList.contains("active");
    document.body.classList.toggle("nu-gateway-enabled",active);
    document.body.classList.toggle("nu-main-game-page",active);
    document.body.classList.toggle("nu-game-active",active);
  }
  syncGatewayScope();
  new MutationObserver(syncGatewayScope).observe(gameView,{attributes:true,attributeFilter:["class"]});

  function layoutItems(){
    const compact=window.matchMedia("(max-width: 600px)").matches;
    const radius=compact?100:112,step=items.length>1?144/(items.length-1):0;
    items.forEach((item,index)=>{
      item.tabIndex=open?0:-1;
      const angle=(112+index*step)*Math.PI/180;
      item.style.setProperty("--gx",String(Math.cos(angle)*radius)+"px");
      item.style.setProperty("--gy",String(Math.sin(angle)*radius)+"px");
    });
  }
  layoutItems();
  window.addEventListener("resize",layoutItems,{passive:true});
  window.addEventListener("orientationchange",layoutItems,{passive:true});

  function goHome(){
    const back=document.getElementById("back-home");
    if(back)back.click();else window.location.href="./index.html";
  }
  const routes={
    back:goHome,
    menu:()=>document.getElementById("menu-open")?.click(),
    profile:()=>document.getElementById("menu-profile")?.click()
  };

  function pauseGame(){
    if(gameView.classList.contains("active")&&pauseButton&&pauseButton.textContent.trim()==="PAUSE ROUND"){
      pauseButton.click();pausedByGateway=true;
    }
  }
  function resumeGame(){
    if(pausedByGateway&&pauseButton&&pauseButton.textContent.trim()==="RESUME ROUND")pauseButton.click();
    pausedByGateway=false;
  }
  function releaseHeldState(){
    if(open)return;
    window.dispatchEvent(new Event("nu:gateway-close"));
    if(gameView.classList.contains("active"))resumeGame();
    else pausedByGateway=false;
  }
  function setOpen(next,shouldResume=true){
    if(open===next)return;
    open=next;outsideSince=0;
    root.classList.toggle("is-open",open);
    document.body.classList.toggle("nu-gateway-open",open);
    trigger.setAttribute("aria-expanded",String(open));
    trigger.setAttribute("aria-label",open?"Close N.U navigation gateway":"Open N.U navigation gateway");
    items.forEach(item=>{item.tabIndex=open?0:-1;});
    if(open){
      pauseGame();
      window.dispatchEvent(new Event("nu:gateway-open"));
      trigger.focus({preventScroll:true});
    }else{
      clearTimeout(activationTimer);activationTimer=0;selected=null;
      items.forEach(item=>item.classList.remove("is-selected","is-confirming"));
      if(shouldResume)releaseHeldState();
    }
    layoutItems();
  }
  function select(item){
    if(selected&&selected!==item)selected.classList.remove("is-selected","is-confirming");
    selected=item;item.classList.add("is-selected");
  }
  function activate(item){
    const key=item.dataset.action,action=routes[key];
    if(!action||!open||item.classList.contains("is-confirming"))return;
    clearTimeout(activationTimer);
    item.classList.add("is-selected","is-confirming");
    activationTimer=window.setTimeout(()=>{
      setOpen(false,false);
      action();
    },90);
  }

  // Primary mode: mouse/pen hover opens the gate; touch contact opens it immediately.
  trigger.addEventListener("pointerenter",event=>{
    if(["mouse","pen"].includes(event.pointerType))setOpen(true);
  });
  trigger.addEventListener("pointerdown",event=>{
    if(event.pointerType!=="touch")return;
    event.preventDefault();
    suppressTriggerClickUntil=Date.now()+900;
    setOpen(!open);
  });
  trigger.addEventListener("click",event=>{
    event.preventDefault();
    if(Date.now()<suppressTriggerClickUntil)return;
    // A pointer click is not needed after hover-open; detail 0 preserves keyboard activation.
    if(event.detail>0&&open)return;
    setOpen(!open);
  });

  items.forEach(item=>{
    item.addEventListener("pointerenter",event=>{
      if(!open)return;
      if(["mouse","pen","touch"].includes(event.pointerType)){
        if(event.pointerType==="touch")suppressClickUntil=Date.now()+900;
        activate(item);
      }
    });
    item.addEventListener("focus",()=>select(item));
    item.addEventListener("pointerup",event=>{
      if(event.pointerType!=="touch"||!open)return;
      event.preventDefault();event.stopPropagation();
      suppressClickUntil=Date.now()+900;
      activate(item);
    });
    item.addEventListener("click",event=>{
      event.preventDefault();event.stopPropagation();
      if(Date.now()<suppressClickUntil)return;
      activate(item);
    });
  });

  // Keep page/game event handlers from receiving input while Gateway owns the paused state.
  document.addEventListener("pointerdown",event=>{if(open)event.stopPropagation();});
  document.addEventListener("pointerup",event=>{if(open)event.stopPropagation();});
  document.addEventListener("wheel",event=>{
    if(open&&!root.contains(event.target)){event.preventDefault();event.stopPropagation();}
  },{capture:true,passive:false});
  document.addEventListener("contextmenu",event=>{
    if(open&&!root.contains(event.target)){event.preventDefault();event.stopPropagation();}
  },true);
  window.addEventListener("resize",event=>{
    if(open){layoutItems();event.stopImmediatePropagation();}
  },true);
  window.addEventListener("orientationchange",event=>{
    if(open){layoutItems();event.stopImmediatePropagation();}
  },true);

  // The scrim blocks every game/page control while the Gateway is paused.
  scrim.addEventListener("click",()=>setOpen(false));
  document.addEventListener("pointermove",event=>{
    if(!open||!["mouse","touch","pen"].includes(event.pointerType))return;
    // Touch browsers may capture the pointer on pointerdown; hit-test coordinates so a finger drag can still enter an option.
    if(event.pointerType==="touch"&&typeof document.elementFromPoint==="function"){
      const hit=document.elementFromPoint(event.clientX,event.clientY);
      const item=hit?.closest?.(".nu-gateway-item");
      if(item&&root.contains(item)){
        suppressClickUntil=Date.now()+900;
        activate(item);
      }
    }
    const tolerance=10,rect=root.getBoundingClientRect();
    const orbit=window.matchMedia("(max-width: 600px)").matches?112:126;
    const inside=event.clientX>=rect.left-orbit-tolerance&&event.clientX<=rect.right+tolerance&&
      event.clientY>=rect.top-orbit-tolerance&&event.clientY<=rect.bottom+orbit+tolerance;
    if(inside)outsideSince=0;
    else if(!outsideSince)outsideSince=performance.now();
    else if(performance.now()-outsideSince>110)setOpen(false);
    event.stopPropagation();
  },{passive:true});

  document.addEventListener("keydown",event=>{
    if(!open)return;
    if(event.key==="Escape"){event.preventDefault();event.stopPropagation();setOpen(false);return;}
    if(event.key==="Tab"){
      const first=items[0],last=items[items.length-1],active=document.activeElement;
      if(event.shiftKey&&active===trigger){event.preventDefault();last?.focus();}
      else if(event.shiftKey&&active===first){event.preventDefault();trigger.focus();}
      else if(!event.shiftKey&&active===last){event.preventDefault();trigger.focus();}
      else if(!root.contains(active)){event.preventDefault();trigger.focus();}
      event.stopPropagation();
      return;
    }
    event.stopPropagation();
  },true);
  window.addEventListener("blur",()=>{if(open)setOpen(false);});
  window.addEventListener("pagehide",()=>{if(open)setOpen(false);});
  window.addEventListener("nu:menu-dismissed",releaseHeldState);
  window.addEventListener("nu:player-overlay-close",releaseHeldState);
  window.addEventListener("nu:game-view-exit",()=>{pausedByGateway=false;});

  const initialView=new URLSearchParams(window.location.search).get("view");
  if(["store","wallet","profile"].includes(initialView))document.getElementById("menu-"+initialView)?.click();
})();