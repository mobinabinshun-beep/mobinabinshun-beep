/* N.U Hex Gateway — single-gate navigation with delayed entry and selective input. */
(() => {
  "use strict";
  const root=document.getElementById("nu-hex-gateway");
  const scrim=document.querySelector(".nu-gateway-scrim");
  const gameView=document.getElementById("game-view");
  const utilityViews=["bag-view","wallet-view","inventory-view","profile-view"].map(id=>document.getElementById(id)).filter(Boolean);
  if(!root||!scrim||!gameView)return;

  const trigger=root.querySelector(".nu-gateway-trigger");
  const items=[...root.querySelectorAll(".nu-gateway-item")];
  let open=false,selected=null,activationTimer=0,entryTimer=0,outsideSince=0,suppressClickUntil=0;
  let controllerFrame=0,lastControllerMove=0,controllerConfirmDown=false,controllerCancelDown=false;
  let entryPointerId=null,virtualInside=false,requireVirtualLeave=false;
  const core=window.NUControllerInputCore?window.NUControllerInputCore.create({
    mode:"physical-mouse",bounds:{left:0,top:0,right:Math.max(1,innerWidth),bottom:Math.max(1,innerHeight)},
    x:trigger.getBoundingClientRect().left+trigger.getBoundingClientRect().width/2,
    y:trigger.getBoundingClientRect().top+trigger.getBoundingClientRect().height/2,
    step:24,onMove:updateVirtualPointer,onConfirm:()=>activate(selected||items[0]),onCancel:()=>closeGateway()
  }):null;
  const virtualPointer=document.createElement("span");
  virtualPointer.className="nu-gateway-virtual-pointer";
  virtualPointer.setAttribute("aria-hidden","true");
  Object.assign(virtualPointer.style,{position:"fixed",left:"0",top:"0",width:"14px",height:"14px",border:"2px solid #d9f6ff",borderRadius:"50%",boxShadow:"0 0 12px rgba(80,220,255,.9)",pointerEvents:"none",zIndex:"10000",transform:"translate(-50%,-50%)",display:"none"});
  document.body.appendChild(virtualPointer);

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
  window.addEventListener("resize",()=>{if(core)core.setPosition(Math.min(innerWidth,core.getState().x),Math.min(innerHeight,core.getState().y));},{passive:true});
  window.addEventListener("orientationchange",layoutItems,{passive:true});

  function goHome(){
    const home=document.getElementById("back-home");
    if(home){home.click();return;}
    window.location.href="./index.html";
  }
  const routes={back:goHome,menu:()=>document.getElementById("menu-open")?.click(),profile:()=>document.getElementById("menu-profile")?.click()};
  function clearEntry(){if(entryTimer){clearTimeout(entryTimer);entryTimer=0;}entryPointerId=null;}
  function scheduleEntry(delay,pointerId=null){
    clearEntry();
    entryPointerId=pointerId;
    entryTimer=window.setTimeout(()=>{entryTimer=0;entryPointerId=null;setOpen(true);},delay);
  }
  function setOpen(next){
    if(open===next)return;
    if(next)window.dispatchEvent(new Event("nu:gateway-open"));
    open=next;outsideSince=0;
    if(!open&&core&&core.getState().mode==="simulated-mouse")requireVirtualLeave=true;
    root.classList.toggle("is-open",open);
    document.body.classList.toggle("nu-gateway-open",open);
    trigger.setAttribute("aria-expanded",String(open));
    trigger.setAttribute("aria-label",open?"Close N.U navigation gateway":"Open N.U navigation gateway");
    items.forEach(item=>{item.tabIndex=open?0:-1;});
    if(open){
      clearEntry();
      trigger.focus({preventScroll:true});
      startController();
    }else{
      clearTimeout(activationTimer);activationTimer=0;
      selected=null;
      items.forEach(item=>{item.classList.remove("is-selected","is-confirming");item.setAttribute("aria-pressed","false");});
      controllerConfirmDown=false;controllerCancelDown=false;
      stopController();
      window.dispatchEvent(new Event("nu:gateway-close"));
    }
    layoutItems();
  }
  function closeGateway(){setOpen(false);}
  function select(item){
    if(!item)return;
    if(selected&&selected!==item){selected.classList.remove("is-selected","is-confirming");selected.setAttribute("aria-pressed","false");}
    selected=item;item.classList.add("is-selected");item.setAttribute("aria-pressed","true");
    if(core&&core.getState().mode==="simulated-mouse"){
      const rect=item.getBoundingClientRect();
      core.setPosition(rect.left+rect.width/2,rect.top+rect.height/2);
    }
  }
  function moveSelection(direction,exitAtEnd=false){
    if(!items.length)return;
    const current=items.indexOf(selected);
    if(exitAtEnd&&direction>0&&current===items.length-1){closeGateway();trigger.focus({preventScroll:true});return;}
    const next=current<0?(direction>0?0:items.length-1):Math.max(0,Math.min(items.length-1,current+direction));
    select(items[next]);items[next].focus({preventScroll:true});
  }
  function moveControllerSelection(direction,exitAtEnd=false){moveSelection(direction,exitAtEnd);}
  function pollController(timestamp){
    controllerFrame=0;if(!open)return;
    const pads=navigator.getGamepads?Array.from(navigator.getGamepads()||[]):[];
    const pad=pads.find(Boolean);
    if(pad){
      const buttons=pad.buttons||[],axes=pad.axes||[];
      const up=!!(buttons[12]&&buttons[12].pressed)||(Number(axes[1])<-.55);
      const down=!!(buttons[13]&&buttons[13].pressed)||(Number(axes[1])>.55);
      const left=!!(buttons[14]&&buttons[14].pressed)||(Number(axes[0])<-.55);
      const right=!!(buttons[15]&&buttons[15].pressed)||(Number(axes[0])>.55);
      const direction=down?1:up?-1:right?1:left?-1:0;
      if(direction&&timestamp-lastControllerMove>220){moveControllerSelection(direction,down&&!up);lastControllerMove=timestamp;}
      const confirm=!!(buttons[0]&&buttons[0].pressed),cancel=!!(buttons[1]&&buttons[1].pressed);
      if(confirm&&!controllerConfirmDown)activate(selected||items[0]);
      if(cancel&&!controllerCancelDown)closeGateway();
      controllerConfirmDown=confirm;controllerCancelDown=cancel;
    }
    if(open)controllerFrame=requestAnimationFrame(pollController);
  }
  function startController(){if(open&&!controllerFrame)controllerFrame=requestAnimationFrame(pollController);}
  function stopController(){if(controllerFrame)cancelAnimationFrame(controllerFrame);controllerFrame=0;}
  function activate(item){
    if(!item||!item.dataset||!open)return;
    const action=routes[item.dataset.action];if(!action)return;
    clearTimeout(activationTimer);item.classList.add("is-confirming");
    activationTimer=window.setTimeout(()=>{item.classList.remove("is-confirming");setOpen(false);action();},120);
  }
  function updateVirtualPointer(position){
    if(!core)return;
    const {x,y}=position;
    virtualPointer.style.left=x+"px";virtualPointer.style.top=y+"px";
    const target=document.elementFromPoint(x,y);
    const onTrigger=!!(target&&(target===trigger||trigger.contains(target)));
    const bounds=root.getBoundingClientRect(),orbit=window.matchMedia("(max-width: 600px)").matches?112:126;
    const inGatewayBounds=x>=bounds.left-orbit&&x<=bounds.right+orbit&&y>=bounds.top-orbit&&y<=bounds.bottom+orbit;
    if(requireVirtualLeave){if(!inGatewayBounds)requireVirtualLeave=false;virtualInside=onTrigger;clearEntry();return;}
    if(onTrigger&&!open&&!virtualInside)scheduleEntry(1000);
    if(!onTrigger&&!open)clearEntry();
    virtualInside=onTrigger;
    if(open){
      const item=target&&target.closest?target.closest(".nu-gateway-item"):null;
      if(item&&items.includes(item))select(item);
    }
  }
  function setControllerMode(mode){
    if(!core||!["physical-mouse","touch","gamepad","simulated-mouse","keyboard"].includes(mode))return false;
    core.setMode(mode);
    virtualPointer.style.display=mode==="simulated-mouse"?"block":"none";
    if(mode==="simulated-mouse")updateVirtualPointer(core.getState());
    else{clearEntry();virtualInside=false;}
    return true;
  }
  window.NUGatewayControllerInput={
    setMode:setControllerMode,
    move:(dx,dy)=>{
      if(!core)return false;
      dx=Number(dx)||0;dy=Number(dy)||0;
      if(open){
        const direction=dy>0?1:dy<0?-1:dx>0?1:dx<0?-1:0;
        if(direction)moveSelection(direction,dy>0);
        if(open&&selected){const rect=selected.getBoundingClientRect();core.setPosition(rect.left+rect.width/2,rect.top+rect.height/2);}
        else{const rect=trigger.getBoundingClientRect();core.setPosition(rect.left+rect.width/2,rect.top+rect.height/2);}
        return true;
      }
      return core.move(dx,dy);
    },
    setPosition:(x,y)=>!!(core&&core.setPosition(Number(x),Number(y))),
    confirm:()=>{if(core)core.keyDown({key:"Enter"});},
    cancel:()=>{if(core)core.keyDown({key:"Escape"});},
    getState:()=>core?core.getState():null
  };
  window.addEventListener("nu:simulated-mouse-input",event=>{
    if(!core||core.getState().mode!=="simulated-mouse")return;
    const detail=event.detail||{};
    if(detail.dx||detail.dy)window.NUGatewayControllerInput.move(Number(detail.dx)||0,Number(detail.dy)||0);
    if(detail.confirm)window.NUGatewayControllerInput.confirm();
    if(detail.cancel)window.NUGatewayControllerInput.cancel();
  });
  window.addEventListener("keydown",event=>{
    if(!core||core.getState().mode!=="simulated-mouse")return;
    const directions={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
    if(directions[event.key]){
      event.preventDefault();event.stopImmediatePropagation();
      window.NUGatewayControllerInput.move(...directions[event.key]);return;
    }
    if(event.key==="Enter"){event.preventDefault();event.stopImmediatePropagation();window.NUGatewayControllerInput.confirm();return;}
    if(event.key==="Escape"||event.key==="Backspace"){event.preventDefault();event.stopImmediatePropagation();window.NUGatewayControllerInput.cancel();}
  },true);
  window.addEventListener("keyup",event=>{if(core&&core.getState().mode==="simulated-mouse")core.keyUp(event);},true);

  trigger.addEventListener("pointerenter",event=>{
    if(event.pointerType==="mouse"&&!open)scheduleEntry(500,event.pointerId);
  });
  trigger.addEventListener("pointerleave",event=>{if(event.pointerType==="mouse"&&!open)clearEntry();});
  trigger.addEventListener("pointerdown",event=>{
    if(event.pointerType==="touch"){
      event.preventDefault();suppressClickUntil=Date.now()+900;scheduleEntry(500,event.pointerId);
    }
  });
  trigger.addEventListener("pointerup",event=>{if(event.pointerType==="touch"&&!open){/* keep the 500ms contact timer running after a valid tap */}});
  trigger.addEventListener("pointercancel",clearEntry);
  trigger.addEventListener("click",event=>{
    event.preventDefault();
    if(Date.now()<suppressClickUntil)return;
    if(event.detail===0)setOpen(!open);
    else if(!open)scheduleEntry(500);
  });
  items.forEach(item=>{
    item.addEventListener("pointerenter",event=>{if(event.pointerType==="mouse"&&open)activate(item);});
    item.addEventListener("pointerleave",event=>{
      if(event.pointerType==="mouse"&&item.classList.contains("is-confirming")){
        clearTimeout(activationTimer);activationTimer=0;item.classList.remove("is-confirming");
      }
    });
    item.addEventListener("focus",()=>select(item));
    item.addEventListener("pointerup",event=>{
      if(event.pointerType!=="touch"||!open)return;
      event.preventDefault();event.stopPropagation();suppressClickUntil=Date.now()+900;activate(item);
    });
    item.addEventListener("click",event=>{
      event.preventDefault();event.stopPropagation();
      if(Date.now()<suppressClickUntil)return;
      activate(item);
    });
  });
  scrim.addEventListener("click",closeGateway);
  document.addEventListener("pointermove",event=>{
    if(!open||!["mouse","touch","pen"].includes(event.pointerType))return;
    const tolerance=10,rect=root.getBoundingClientRect(),orbit=window.matchMedia("(max-width: 600px)").matches?112:126;
    const inside=event.clientX>=rect.left-orbit-tolerance&&event.clientX<=rect.right+tolerance&&event.clientY>=rect.top-orbit-tolerance&&event.clientY<=rect.bottom+orbit+tolerance;
    if(inside)outsideSince=0;
    else if(!outsideSince)outsideSince=performance.now();
    else if(performance.now()-outsideSince>110)closeGateway();
  },{passive:true});
  document.addEventListener("keydown",event=>{
    if(!open)return;
    if(event.key==="Escape"){event.preventDefault();closeGateway();trigger.focus({preventScroll:true});return;}
    if(event.key==="ArrowDown"){event.preventDefault();moveSelection(1,true);return;}
    if(event.key==="ArrowUp"){event.preventDefault();moveSelection(-1);return;}
    if(event.key==="ArrowRight"){event.preventDefault();moveSelection(1,false);return;}
    if(event.key==="ArrowLeft"){event.preventDefault();moveSelection(-1,false);return;}
    if(event.key==="Enter"||event.key===" "){event.preventDefault();activate(selected||items[0]);return;}
    if(event.key==="Tab"){
      const focusable=[trigger,...items].filter(item=>item.tabIndex>=0),first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  window.addEventListener("blur",()=>{if(open)closeGateway();clearEntry();});
  window.addEventListener("pagehide",()=>{if(open)closeGateway();clearEntry();});
  window.addEventListener("gamepadconnected",startController);

  const initialView=new URLSearchParams(window.location.search).get("view");
  if(["store","profile"].includes(initialView))document.getElementById("menu-"+initialView)?.click();
  if(initialView==="bag")document.getElementById("menu-bag")?.click();
  if(initialView==="wallet"){document.getElementById("menu-bag")?.click();document.querySelector('[data-bag-destination="wallet"]')?.click();}
})();