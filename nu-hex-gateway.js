/* N.U Hex Gateway — single-gate, single-action navigation for active gameplay */
(() => {
  "use strict";
  const root=document.getElementById("nu-hex-gateway");
  const scrim=document.querySelector(".nu-gateway-scrim");
  const gameView=document.getElementById("game-view");
  const utilityViews=["bag-view","wallet-view","inventory-view","profile-view"].map(id=>document.getElementById(id)).filter(Boolean);
  if(!root||!scrim||!gameView)return;

  const trigger=root.querySelector(".nu-gateway-trigger");
  const items=[...root.querySelectorAll(".nu-gateway-item")];
  let open=false,selected=null,activationTimer=0,outsideSince=0,suppressClickUntil=0,controllerFrame=0,lastControllerMove=0,controllerConfirmDown=false,controllerCancelDown=false;

  function syncGatewayScope(){
    const active=gameView.classList.contains("active");
    const utility=utilityViews.some(view=>view.classList.contains("active"));
    document.body.classList.toggle("nu-gateway-enabled",active||utility);
    document.body.classList.toggle("nu-main-game-page",active);
    document.body.classList.toggle("nu-game-active",active);
    document.body.classList.toggle("nu-gateway-utility-active",utility);
  }
  syncGatewayScope();
  const scopeObserver=new MutationObserver(syncGatewayScope);
  [gameView,...utilityViews].forEach(view=>scopeObserver.observe(view,{attributes:true,attributeFilter:["class"]}));

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
    const activeUtility=utilityViews.find(view=>view.classList.contains("active"));
    if(activeUtility){
      const backId=activeUtility.id==="inventory-view"?"inventory-back":activeUtility.id==="wallet-view"?"wallet-back":activeUtility.id==="profile-view"?"profile-back":"bag-back";
      document.getElementById(backId)?.click();
      return;
    }
    const back=document.getElementById("back-home");
    if(back)back.click();else window.location.href="./index.html";
  }
  const routes={
    back:goHome,
    menu:()=>document.getElementById("menu-open")?.click(),
    profile:()=>document.getElementById("menu-profile")?.click()
  };

  function releaseHeldState(){
    if(open)return;
    window.dispatchEvent(new Event("nu:gateway-close"));
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
      window.dispatchEvent(new Event("nu:gateway-open"));
      trigger.focus({preventScroll:true});
      startController();
    }else{
      clearTimeout(activationTimer);activationTimer=0;selected=null;
      items.forEach(item=>{item.classList.remove("is-selected","is-confirming");item.setAttribute("aria-pressed","false");});
      controllerConfirmDown=false;controllerCancelDown=false;
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
  function pollController(timestamp){
    controllerFrame=0;
    if(!open)return;
    const pads=navigator.getGamepads?Array.from(navigator.getGamepads()||[]):[];
    const pad=pads.find(Boolean);
    if(pad){
      const buttons=pad.buttons||[],axes=pad.axes||[];
      const up=!!(buttons[12]&&buttons[12].pressed)||(Number(axes[1])<-.55);
      const down=!!(buttons[13]&&buttons[13].pressed)||(Number(axes[1])>.55);
      const left=!!(buttons[14]&&buttons[14].pressed)||(Number(axes[0])<-.55);
      const right=!!(buttons[15]&&buttons[15].pressed)||(Number(axes[0])>.55);
      const direction=up||left?-1:down||right?1:0;
      if(direction&&timestamp-lastControllerMove>220){moveSelection(direction);lastControllerMove=timestamp;}
      const confirm=!!(buttons[0]&&buttons[0].pressed),cancel=!!(buttons[1]&&buttons[1].pressed);
      if(confirm&&!controllerConfirmDown)activate(selected||items[0]);
      if(cancel&&!controllerCancelDown){setOpen(false);trigger.focus({preventScroll:true});}
      controllerConfirmDown=confirm;controllerCancelDown=cancel;
    }
    if(open)controllerFrame=requestAnimationFrame(pollController);
  }
  function startController(){if(open&&!controllerFrame)controllerFrame=requestAnimationFrame(pollController);}
  function activate(item){
    const key=item.dataset.action,action=routes[key];
    if(!action||!open)return;
    clearTimeout(activationTimer);
    item.classList.add("is-selected","is-confirming");
    activationTimer=window.setTimeout(()=>{
      setOpen(false,false);
      action();
    },120);
  }

  trigger.addEventListener("click",event=>{
    event.preventDefault();setOpen(!open);
  });
  items.forEach(item=>{
    item.addEventListener("pointerenter",event=>{if(event.pointerType==="mouse"&&open)select(item);});
    item.addEventListener("focus",()=>select(item));
    item.addEventListener("pointerup",event=>{
      if(event.pointerType!=="touch"||!open)return;
      event.preventDefault();event.stopPropagation();
      suppressClickUntil=Date.now()+900;activate(item);
    });
    item.addEventListener("click",event=>{
      event.preventDefault();event.stopPropagation();
      if(Date.now()<suppressClickUntil)return;
      activate(item);
    });
  });

  scrim.addEventListener("click",()=>setOpen(false));
  document.addEventListener("pointermove",event=>{
    if(!open||!["mouse","touch","pen"].includes(event.pointerType))return;
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
    if(event.key==="ArrowDown"||event.key==="ArrowRight"){event.preventDefault();moveSelection(1);return;}
    if(event.key==="ArrowUp"||event.key==="ArrowLeft"){event.preventDefault();moveSelection(-1);return;}
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
  window.addEventListener("gamepadconnected",startController);
  window.addEventListener("nu:menu-dismissed",releaseHeldState);
  window.addEventListener("nu:player-overlay-close",releaseHeldState);


  const initialView=new URLSearchParams(window.location.search).get("view");
  if(["store","profile"].includes(initialView))document.getElementById("menu-"+initialView)?.click();
  if(initialView==="bag")document.getElementById("menu-bag")?.click();
  if(initialView==="wallet"){document.getElementById("menu-bag")?.click();document.querySelector('[data-bag-destination="wallet"]')?.click();}
})();