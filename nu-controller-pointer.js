/* N.U Controller Pointer — shared simulated-mouse adapter for launcher modules.
 * D-pad / four directions move only. Confirm performs the separate click.
 * Gateway navigation temporarily maps vertical directions to its ordered list.
 * Physical mouse and touch remain native browser input.
 */
(function(root){
 "use strict";
 function create(options){
  options=options||{};
  const doc=options.document||root.document,win=options.window||root;
  let enabled=false,frame=0,lastMove=0,confirmDown=false,cancelDown=false,primed=false,lastTarget=null,x=0,y=0,padIndex=null,gatewayNavigation=false,gatewayBlockedUntilNeutral=false;
  let cursor=null,style=null;
  const step=Number(options.step)||28,repeat=Number(options.repeat)||190;
  function ensureCursor(){
   if(!doc||cursor)return;
   style=doc.createElement("style");
   style.textContent=".nu-simulated-mouse-cursor{position:fixed;z-index:2147483000;width:18px;height:18px;border:2px solid #b9f7ff;border-radius:50%;box-shadow:0 0 0 3px #0a253a99,0 0 14px #5be7ff;pointer-events:none;transform:translate(-50%,-50%);display:none}.nu-simulated-mouse-target{outline:2px solid #a8f3ff!important;outline-offset:3px!important}";
   doc.head.appendChild(style);
   cursor=doc.createElement("div");cursor.className="nu-simulated-mouse-cursor";cursor.setAttribute("aria-hidden","true");doc.body.appendChild(cursor);
   x=Math.max(1,Math.min(win.innerWidth-1,win.innerWidth/2));y=Math.max(1,Math.min(win.innerHeight-1,win.innerHeight/2));
  }
  function targetAt(){return doc&&doc.elementFromPoint?doc.elementFromPoint(x,y):null;}
  function dispatchPointerMove(target){
   if(!target||typeof target.dispatchEvent!=="function")return;
   const common={bubbles:true,cancelable:true,view:win,clientX:x,clientY:y,button:0,buttons:0};
   if(typeof win.PointerEvent==="function"){const event=new win.PointerEvent("pointermove",{...common,pointerId:1,pointerType:"mouse",isPrimary:true});event.nuSimulated=true;target.dispatchEvent(event);}
   if(typeof win.MouseEvent==="function"){const event=new win.MouseEvent("mousemove",common);event.nuSimulated=true;target.dispatchEvent(event);}
  }
  function updateTarget(){
   const next=targetAt(),previous=lastTarget;
   if(previous&&previous.classList)previous.classList.remove("nu-simulated-mouse-target");
   lastTarget=next;
   if(next&&next.classList)next.classList.add("nu-simulated-mouse-target");
   if(cursor){cursor.style.left=x+"px";cursor.style.top=y+"px";}
   if(next!==previous&&doc&&typeof win.CustomEvent==="function"){
    win.dispatchEvent(new win.CustomEvent("nu:simulated-pointer-target",{detail:{target:next,previousTarget:previous,x,y}}));
   }
   // Keep the virtual cursor and the game input layer in sync: canvas aim, hover
   // handlers and pointer-aware controls must receive movement, not just a CSS outline.
   dispatchPointerMove(next);
  }
  function direction(pad){
   const b=pad.buttons||[],a=pad.axes||[],threshold=.55;
   const up=!!(b[12]&&b[12].pressed)||Number(a[1])< -threshold;
   const down=!!(b[13]&&b[13].pressed)||Number(a[1])>threshold;
   const left=!!(b[14]&&b[14].pressed)||Number(a[0])< -threshold;
   const right=!!(b[15]&&b[15].pressed)||Number(a[0])>threshold;
   return {dx:(right?1:0)-(left?1:0),dy:(down?1:0)-(up?1:0),confirm:!!(b[0]&&b[0].pressed),cancel:!!(b[1]&&b[1].pressed)};
  }
  function emit(name,detail){if(doc&&typeof win.CustomEvent==="function")win.dispatchEvent(new win.CustomEvent(name,{detail}));}
  function movePointer(dx,dy,source){
   if(!enabled||gatewayBlockedUntilNeutral)return false;
   dx=Math.sign(Number(dx)||0);dy=Math.sign(Number(dy)||0);
   if(!dx&&!dy)return false;
   const nextX=Math.max(1,Math.min(win.innerWidth-1,x+dx*step));
   const nextY=Math.max(1,Math.min(win.innerHeight-1,y+dy*step));
   if(nextX===x&&nextY===y)return false;
   x=nextX;y=nextY;updateTarget();
   emit("nu:simulated-pointer-move",{x,y,dx,dy,source:source||"controller"});
   return true;
  }
  function onPointerDirection(event){
   const detail=event&&event.detail||{};
   if(!enabled)start(true);
   movePointer(detail.dx??detail.x,detail.dy??detail.y,detail.source||"click-controller");
  }
  // Keyboard-emulated click controllers send ordinary arrow/confirm keys, not Gamepad API events.
  // Capture them before game-level keyboard targeting; Gateway keeps exclusive ownership while open.
  function onKeyboardInput(event){
   if(!event||event.altKey||event.ctrlKey||event.metaKey||gatewayNavigation)return;
   const keys={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
   const delta=keys[event.key];
   if(delta){
    if(!enabled)start(true);
    if(movePointer(delta[0],delta[1],"keyboard-click-controller")){
     event.preventDefault&&event.preventDefault();
     event.stopImmediatePropagation&&event.stopImmediatePropagation();
    }
    return;
   }
   if(event.key==="Enter"||event.key===" "||event.key==="NumpadEnter"){
    if(enabled){
     event.preventDefault&&event.preventDefault();
     event.stopImmediatePropagation&&event.stopImmediatePropagation();
     clickTarget();
    }
   }
  }
  function clickTarget(){
   const target=targetAt();if(!target)return false;
   const common={bubbles:true,cancelable:true,view:win,clientX:x,clientY:y,button:0,buttons:1};
   if(typeof win.PointerEvent==="function"){
    const down=new win.PointerEvent("pointerdown",{...common,pointerId:1,pointerType:"mouse",isPrimary:true});down.nuSimulated=true;target.dispatchEvent(down);
    const up=new win.PointerEvent("pointerup",{...common,pointerId:1,pointerType:"mouse",isPrimary:true,buttons:0});up.nuSimulated=true;target.dispatchEvent(up);
   }
   const click=new win.MouseEvent("click",{...common,detail:1,buttons:0});click.nuSimulated=true;target.dispatchEvent(click);
   return true;
  }
  function tick(time){
   frame=0;if(!enabled)return;
   const pads=win.navigator&&win.navigator.getGamepads?Array.from(win.navigator.getGamepads()||[]):[];
   const pad=pads.find(p=>p&&p.connected!==false);
   if(pad){
    padIndex=pad.index;
    const input=direction(pad);
    if(gatewayBlockedUntilNeutral){if(!input.dx&&!input.dy){gatewayBlockedUntilNeutral=false;lastMove=time;}}
    else if((input.dx||input.dy)&&time-lastMove>=repeat){
     if(gatewayNavigation)movePointer(input.dx,input.dy,"gamepad-gateway");
     else movePointer(input.dx,input.dy,"gamepad");
     lastMove=time;
    }
    if(!primed){confirmDown=input.confirm;cancelDown=input.cancel;primed=true;}
    else{
     if(input.confirm&&!confirmDown){if(gatewayNavigation)emit("nu:gateway-confirm",{});else clickTarget();}
     if(input.cancel&&!cancelDown){if(gatewayNavigation)emit("nu:gateway-cancel",{});else doc.dispatchEvent(new win.KeyboardEvent("keydown",{key:"Escape",bubbles:true,cancelable:true}));}
     confirmDown=input.confirm;cancelDown=input.cancel;
    }
   }else{padIndex=null;confirmDown=false;cancelDown=false;primed=false;}
   if(enabled)frame=win.requestAnimationFrame(tick);
  }
  function hasConnectedGamepad(){return !!(win.navigator&&win.navigator.getGamepads&&Array.from(win.navigator.getGamepads()||[]).some(p=>p&&p.connected!==false));}
  function start(force){
   if(enabled||(!force&&!hasConnectedGamepad()))return;ensureCursor();if(!cursor)return;
   enabled=true;cursor.style.display="block";updateTarget();
   if(!frame)frame=win.requestAnimationFrame(tick);
  }
  function stop(){
   enabled=false;if(frame)win.cancelAnimationFrame(frame);frame=0;confirmDown=false;cancelDown=false;primed=false;gatewayNavigation=false;gatewayBlockedUntilNeutral=false;
   if(lastTarget&&lastTarget.classList)lastTarget.classList.remove("nu-simulated-mouse-target");
   lastTarget=null;if(cursor)cursor.style.display="none";
  }
  function onConnected(event){if(event&&event.gamepad){padIndex=event.gamepad.index;if(doc&&doc.body&&doc.body.classList.contains("nu-gateway-open")){gatewayNavigation=true;const current=direction(event.gamepad);gatewayBlockedUntilNeutral=!!(current.dx||current.dy);}start();}}
  function onDisconnected(){if(!hasConnectedGamepad())stop();}
  win.addEventListener&&win.addEventListener("gamepadconnected",onConnected);
  win.addEventListener&&win.addEventListener("keydown",onKeyboardInput,true);
  win.addEventListener&&win.addEventListener("nu:simulated-pointer-direction",onPointerDirection);
  win.addEventListener&&win.addEventListener("nu:controller-direction",onPointerDirection);
  win.addEventListener&&win.addEventListener("nu:gateway-direction",onPointerDirection);
  win.addEventListener&&win.addEventListener("gamepaddisconnected",onDisconnected);
  if(hasConnectedGamepad())start();
  return {start,stop,startClickController(){start(true);},move(dx,dy){return movePointer(dx,dy,"click-controller");},setEnabled(value){value?start():stop();},setGatewayNavigation(value){gatewayNavigation=!!value;lastMove=0;const pads=win.navigator&&win.navigator.getGamepads?Array.from(win.navigator.getGamepads()||[]):[];const pad=pads.find(p=>p&&p.connected!==false);const current=pad?direction(pad):{dx:0,dy:0};gatewayBlockedUntilNeutral=!!(current.dx||current.dy);},isEnabled(){return enabled;},getState(){return {enabled,x,y,padIndex,mode:"simulated-mouse",gatewayNavigation};},destroy(){stop();win.removeEventListener&&win.removeEventListener("gamepadconnected",onConnected);win.removeEventListener&&win.removeEventListener("keydown",onKeyboardInput,true);win.removeEventListener&&win.removeEventListener("gamepaddisconnected",onDisconnected);win.removeEventListener&&win.removeEventListener("nu:simulated-pointer-direction",onPointerDirection);win.removeEventListener&&win.removeEventListener("nu:controller-direction",onPointerDirection);win.removeEventListener&&win.removeEventListener("nu:gateway-direction",onPointerDirection);cursor&&cursor.remove();style&&style.remove();cursor=null;style=null;}};
 }
 root.NUControllerPointer=Object.assign(create(),{create,mode:"simulated-mouse",capabilities:{directionalPointer:true,separateConfirm:true,gatewayDirectionalList:true,physicalMouseDirect:true,touchDirect:true}});
})(typeof window!=="undefined"?window:globalThis);
