/* N.U Hex Gateway — single-gate, single-action navigation for active gameplay */
(() => {
  "use strict";
  const root=document.getElementById("nu-hex-gateway");
  const scrim=document.querySelector(".nu-gateway-scrim");
  const gameView=document.getElementById("game-view");
  const utilityViews=["bag-view","wallet-view","inventory-view","profile-view"].map(id=>document.getElementById(id)).filter(Boolean);
  if(!root||!scrim)return;

  const trigger=root.querySelector(".nu-gateway-trigger");
  const items=[...root.querySelectorAll(".nu-gateway-item")];
  let open=false,selected=null,activationTimer=0,openTimer=0,outsideSince=0,suppressClickUntil=0;
  let pendingItem=null,requiresSimulatedPointerExit=false,simulatedPointerOutside=false,dwellTimer=0,dwellItem=null,touchStartX=0,touchStartY=0,touchMoved=false,touchPointerId=null;

  function syncGatewayScope(){
    const active=!!(gameView&&gameView.classList.contains("active"));
    const standalone=!gameView&&utilityViews.length===0;
    const utility=standalone||utilityViews.some(view=>view.classList.contains("active"));
    document.body.classList.toggle("nu-gateway-enabled",active||utility);
    document.body.classList.toggle("nu-main-game-page",active);
    document.body.classList.toggle("nu-game-active",active);
    document.body.classList.toggle("nu-gateway-utility-active",utility);
  }
  syncGatewayScope();
  const scopeObserver=new MutationObserver(syncGatewayScope);
  [ ...(gameView?[gameView]:[]), ...utilityViews ].forEach(view=>scopeObserver.observe(view,{attributes:true,attributeFilter:["class"]}));

  function layoutItems(){
    const compact=window.matchMedia("(max-width: 600px)").matches;
    const radius=compact?100:112,step=items.length>1?144/(items.length-1):0;
    items.forEach((item,index)=>{
      item.tabIndex=open?0:-1;
      const angle=(112+index*step)*Math.PI/180;
      item.style.setProperty("--gx",`${Math.cos(angle)*radius}px`);
      item.style.setProperty("--gy",`${Math.sin(angle)*radius}px`);
    });
  }
  layoutItems();
  window.addEventListener("resize",layoutItems,{passive:true});
  window.addEventListener("orientationchange",layoutItems,{passive:true});

  function goHome(){
    const back=document.getElementById("back-home");
    if(back&&!utilityViews.some(view=>view.classList.contains("active")))back.click();
    else window.location.href="./index.html";
  }
  const routes={
    back:goHome,
    menu:()=>{const menu=document.getElementById("menu-open");if(menu)menu.click();else window.location.href="./index.html#library-section";},
    library:()=>window.location.href="./index.html#library-section",
    store:()=>window.location.href="./index.html?view=store",
    wallet:()=>window.location.href="./index.html?view=wallet",
    profile:()=>{const profile=document.getElementById("menu-profile");if(profile)profile.click();else window.location.href="./index.html?view=profile";},
    launcher:()=>{const settings=document.getElementById("open-settings");if(settings)settings.click();else window.location.href="./launcher.html";},
    studio:()=>window.location.href="./pixel-art-studio.html",
    casino:()=>window.location.href="./casino.html",
    resume:()=>window.location.href="./index.html"
  };

  function releaseHeldState(){
    if(open)return;
    window.dispatchEvent(new Event("nu:gateway-close"));
  }
  function setOpen(next,shouldResume=true,source="direct"){
    if(open===next)return;
    if(next){
      // Pause the round and renderers before making Gateway options visible/actionable.
      window.dispatchEvent(new Event("nu:gateway-open"));
    }
    open=next;outsideSince=0;
    root.classList.toggle("is-open",open);
    document.body.classList.toggle("nu-gateway-open",open);
    trigger.setAttribute("aria-expanded",String(open));
    trigger.setAttribute("aria-label",open?"Close N.U navigation gateway":"Open N.U navigation gateway");
    items.forEach(item=>{item.tabIndex=open?0:-1;});
    if(open){
      clearTimeout(openTimer);openTimer=0;
      selected=null;
      items.forEach(item=>{item.classList.remove("is-selected","is-confirming");item.setAttribute("aria-pressed","false");});
      window.NUControllerPointer?.setEnabled(true);
      window.NUControllerPointer?.setGatewayNavigation(true);
      if(source!=="simulated-pointer")trigger.focus({preventScroll:true});
    }else{
      window.NUControllerPointer?.setGatewayNavigation(false);
      // Keep the virtual pointer alive after Gateway closes so it can leave and re-enter the trigger zone.
      clearTimeout(activationTimer);activationTimer=0;pendingItem=null;
      items.forEach(item=>{item.classList.remove("is-selected","is-confirming");item.setAttribute("aria-pressed","false");});
      if(shouldResume)releaseHeldState();
    }
    layoutItems();
  }
  function select(item){
    if(!item)return;
    if(selected&&selected!==item){selected.classList.remove("is-selected","is-confirming");selected.setAttribute("aria-pressed","false");}
    selected=item;
    item.classList.add("is-selected");
    item.setAttribute("aria-pressed","true");
  }
  function moveSelection(direction){
    if(!items.length)return;
    const current=items.indexOf(selected);
    const next=current<0?(direction>0?0:items.length-1):(current+direction+items.length)%items.length;
    select(items[next]);
    items[next].focus({preventScroll:true});
  }
  function moveGatewaySelection(direction){
    if(!items.length||!open)return;
    const current=items.indexOf(selected);
    if(direction>0){
      if(current>=items.length-1){
        // One additional downward step exits the list. Keep the pointer over Gateway;
        // a simulated pointer must leave and re-enter the hit zone before reopening.
        requiresSimulatedPointerExit=true;
        simulatedPointerOutside=false;
        setOpen(false,true,"simulated-pointer");
        return;
      }
      scheduleDwellActivation(items[current+1],"simulated-controller");
      return;
    }
    if(current<0){scheduleDwellActivation(items[0],"simulated-controller");return;}
    if(current>0)scheduleDwellActivation(items[current-1],"simulated-controller");
  }
  function cancelDwellActivation(){
    if(dwellTimer){clearTimeout(dwellTimer);dwellTimer=0;}
    if(dwellItem)dwellItem.classList.remove('is-confirming');
    dwellItem=null;
  }
  function scheduleDwellActivation(item,source){
    if(!open||!item)return;
    if(dwellItem===item&&dwellTimer)return;
    cancelDwellActivation();select(item);dwellItem=item;item.classList.add('is-confirming');
    dwellTimer=window.setTimeout(()=>{
      dwellTimer=0;const target=dwellItem;dwellItem=null;
      if(!open||selected!==target||!target)return;
      target.classList.remove('is-confirming');setOpen(false,false,'dwell-'+(source||'pointer'));
      routes[target.dataset.action]?.();
    },500);
  }
  function activate(item){
    if(!item||!item.dataset)return;
    const key=item.dataset.action,action=routes[key];
    if(!action||!open)return;
    clearTimeout(activationTimer);
    pendingItem=item;
    item.classList.add("is-confirming");
    activationTimer=window.setTimeout(()=>{
      pendingItem=null;
      item.classList.remove("is-confirming");
      setOpen(false,false);
      action();
    },120);
  }

  function scheduleOpen(delay,source){
    if(open||openTimer)return;
    openTimer=window.setTimeout(()=>{
      openTimer=0;
      if(!open)setOpen(true,true,source);
    },delay);
  }
  function cancelScheduledOpen(){
    if(openTimer){clearTimeout(openTimer);openTimer=0;}
  }

  trigger.addEventListener("pointerenter",event=>{
    if(event.pointerType==="mouse"&&!open)scheduleOpen(500,"physical-mouse");
  });
  trigger.addEventListener("pointerleave",event=>{
    if(event.pointerType==="mouse"&&!open)cancelScheduledOpen();
  });
  // Direct touch follows the owner contract: hold on the trigger for 500 ms.
  // Releasing or cancelling before the dwell completes must not open Gateway.
  trigger.addEventListener("pointerdown",event=>{
    if(event.pointerType!=="touch"||event.isPrimary===false)return;
    event.preventDefault();
    touchStartX=event.clientX;touchStartY=event.clientY;touchMoved=false;touchPointerId=event.pointerId;
    suppressClickUntil=Date.now()+1000;
    scheduleOpen(500,"touch");
  });
  trigger.addEventListener("pointerup",event=>{
    if(event.pointerType!=="touch"||event.isPrimary===false)return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickUntil=Date.now()+1000;
    if(!open)cancelScheduledOpen();
    touchPointerId=null;touchMoved=false;
  });
  trigger.addEventListener("pointercancel",event=>{
    if(event.pointerType==="touch"){cancelScheduledOpen();touchPointerId=null;touchMoved=false;}
  });
  trigger.addEventListener("click",event=>{
    event.preventDefault();
    if(Date.now()<suppressClickUntil)return;
    // Keyboard activation remains available; physical mouse/touch use the dwell threshold.
    if(event.detail===0)setOpen(!open);
  });
  items.forEach(item=>{
    item.addEventListener("pointerenter",event=>{
      if(event.pointerType==="mouse"&&open)scheduleDwellActivation(item,"physical-mouse");
    });
    item.addEventListener("pointerleave",event=>{
      if(event.pointerType==="mouse"&&dwellItem===item)cancelDwellActivation();
      if(event.pointerType==="mouse"&&pendingItem===item){
        clearTimeout(activationTimer);activationTimer=0;pendingItem=null;
        item.classList.remove("is-confirming");
      }
    });
    item.addEventListener("focus",()=>select(item));
    item.addEventListener("pointerdown",event=>{
      if(event.pointerType!=="touch"||!open)return;
      touchStartX=event.clientX;touchStartY=event.clientY;touchMoved=false;touchPointerId=event.pointerId;
      scheduleDwellActivation(item,"touch-hold");
    });
    item.addEventListener("pointerup",event=>{
      if(event.pointerType!=="touch"||!open)return;
      event.preventDefault();event.stopPropagation();
      suppressClickUntil=Date.now()+900;
      const wasMoved=touchMoved;touchPointerId=null;touchMoved=false;cancelDwellActivation();
      if(!wasMoved)activate(item);
    });
    item.addEventListener("click",event=>{
      event.preventDefault();event.stopPropagation();
      if(Date.now()<suppressClickUntil)return;
      activate(item);
    });
  });

  window.addEventListener("nu:simulated-pointer-target",event=>{
    const detail=event.detail||{};
    const target=detail.target&&detail.target.closest?detail.target.closest(".nu-gateway-trigger"):null;
    const previous=detail.previousTarget&&detail.previousTarget.closest?detail.previousTarget.closest(".nu-gateway-trigger"):null;
    if(requiresSimulatedPointerExit&&!target){
      simulatedPointerOutside=true;
      return;
    }
    if(requiresSimulatedPointerExit&&target&&simulatedPointerOutside){
      requiresSimulatedPointerExit=false;
      simulatedPointerOutside=false;
    }
    if(!open&&target&&!previous&&!requiresSimulatedPointerExit)scheduleOpen(1000,"simulated-pointer");
    if(!open&&target&&previous!==target&&!requiresSimulatedPointerExit)scheduleOpen(1000,"simulated-pointer");
    if(open&&detail.target){const item=detail.target.closest?detail.target.closest(".nu-gateway-item"):null;if(item)scheduleDwellActivation(item,"simulated-mouse");else if(dwellItem)cancelDwellActivation();}
    if(!target&&!open)cancelScheduledOpen();
  });
  window.addEventListener("nu:gateway-direction",event=>{
    if(!open)return;
    const direction=event.detail||{};
    if(direction.y>0)moveGatewaySelection(1);
    else if(direction.y<0)moveGatewaySelection(-1);
  });
  window.addEventListener("nu:gateway-confirm",()=>{if(open)activate(selected||items[0]);});
  window.addEventListener("nu:gateway-cancel",()=>{if(open)setOpen(false);});

  scrim.addEventListener("click",()=>setOpen(false));
  document.addEventListener("pointerup",event=>{
    if(event.pointerType==="touch"&&touchPointerId!==null&&event.pointerId===touchPointerId){
      touchPointerId=null;touchMoved=false;
      if(dwellItem&&(!open||!items.includes(event.target.closest?.(".nu-gateway-item"))))cancelDwellActivation();
    }
  });
  document.addEventListener("pointercancel",event=>{
    if(event.pointerType==="touch"&&(touchPointerId===null||event.pointerId===touchPointerId)){
      touchPointerId=null;touchMoved=false;cancelDwellActivation();cancelScheduledOpen();
    }
  });
  document.addEventListener("pointermove",event=>{
    if(!["mouse","touch","pen"].includes(event.pointerType))return;
    if(event.pointerType==="touch"&&touchPointerId!==null&&event.pointerId===touchPointerId){
      if(Math.hypot(event.clientX-touchStartX,event.clientY-touchStartY)>10){
        touchMoved=true;
        if(!open)cancelScheduledOpen();
      }
      if(open&&touchMoved){
        const hit=document.elementFromPoint(event.clientX,event.clientY);
        const item=hit&&hit.closest?hit.closest(".nu-gateway-item"):null;
        if(item)scheduleDwellActivation(item,"touch-drag");
        else if(dwellItem)cancelDwellActivation();
      }
    }
    if(!open)return;
    const tolerance=10,rect=root.getBoundingClientRect();
    const orbit=window.matchMedia("(max-width: 600px)").matches?112:126;
    const inside=event.clientX>=rect.left-orbit-tolerance&&event.clientX<=rect.right+tolerance&&
      event.clientY>=rect.top-orbit-tolerance&&event.clientY<=rect.bottom+orbit+tolerance;
    if(inside)outsideSince=0;
    else if(!outsideSince)outsideSince=performance.now();
    else if(performance.now()-outsideSince>110)setOpen(false);
  },{passive:true});

  document.addEventListener("keydown",event=>{
    if(!open)return;
    if(event.key==="Escape"){event.preventDefault();setOpen(false);trigger.focus({preventScroll:true});return;}
    if(event.key==="ArrowDown"||event.key==="ArrowRight"){event.preventDefault();moveGatewaySelection(1);return;}
    if(event.key==="ArrowUp"||event.key==="ArrowLeft"){event.preventDefault();moveGatewaySelection(-1);return;}
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

  window.addEventListener("nu:menu-dismissed",releaseHeldState);
  window.addEventListener("nu:player-overlay-close",releaseHeldState);

  const initialView=new URLSearchParams(window.location.search).get("view");
  if(["store","profile"].includes(initialView))document.getElementById("menu-"+initialView)?.click();
  if(initialView==="bag")document.getElementById("menu-bag")?.click();
  if(initialView==="wallet"){document.getElementById("menu-bag")?.click();document.querySelector('[data-bag-destination="wallet"]')?.click();}
})();