/* N.U Controller Pointer — shared simulated-mouse adapter.
 * Direction moves the virtual pointer; confirm is a separate click.
 * While Gateway is open, directional input is routed to its vertical option list.
 * Physical mouse and touch remain native browser input.
 */
(function(root){
 "use strict";
 function create(options){
  options=options||{};
  const doc=options.document||root.document,win=options.window||root;
  let enabled=false,gatewayNavigation=false,frame=0,primed=false,lastDirectionX=0,lastDirectionY=0;
  let confirmDown=false,cancelDown=false,lastMove=0,lastTarget=null,x=0,y=0,cursor=null,style=null,pointerVisible=false,padIndex=null;
  const step=Number(options.step)||28,repeat=Number(options.repeat)||170;
  function emit(type,detail){
   if(!win||typeof win.dispatchEvent!=="function")return;
   const event=typeof win.CustomEvent==="function"?new win.CustomEvent(type,{detail:detail||{}}):new win.Event(type);
   win.dispatchEvent(event);
  }
  function ensureCursor(){
   if(!doc||cursor)return;
   style=doc.createElement("style");
   style.textContent=".nu-simulated-mouse-cursor{position:fixed;z-index:105;width:18px;height:18px;border:2px solid #b9f7ff;border-radius:50%;box-shadow:0 0 0 3px #0a253a99,0 0 14px #5be7ff;pointer-events:none;transform:translate(-50%,-50%);display:none}.nu-simulated-mouse-target{outline:2px solid #a8f3ff!important;outline-offset:3px!important}";
   doc.head.appendChild(style);
   cursor=doc.createElement("div");
   cursor.className="nu-simulated-mouse-cursor";
   cursor.setAttribute("aria-hidden","true");
   doc.body.appendChild(cursor);
   x=Math.max(1,Math.min((Number(win.innerWidth)||1)-1,(Number(win.innerWidth)||2)/2));
   y=Math.max(1,Math.min((Number(win.innerHeight)||1)-1,(Number(win.innerHeight)||2)/2));
   cursor.style.left=x+"px";
   cursor.style.top=y+"px";
  }
  function targetAt(){return doc&&typeof doc.elementFromPoint==="function"?doc.elementFromPoint(x,y):null;}
  function updateTarget(source){
   const next=targetAt();
   const common={bubbles:true,cancelable:true,view:win,clientX:x,clientY:y,pointerId:1,pointerType:"mouse",isPrimary:true,buttons:0};
   if(lastTarget&&lastTarget!==next){
    if(typeof win.PointerEvent==="function"){
     lastTarget.dispatchEvent(new win.PointerEvent("pointerout",Object.assign({},common,{relatedTarget:next})));
     lastTarget.dispatchEvent(new win.PointerEvent("pointerleave",Object.assign({},common,{bubbles:false,relatedTarget:next})));
    }
    if(lastTarget.classList)lastTarget.classList.remove("nu-simulated-mouse-target");
   }
   if(next&&lastTarget!==next&&typeof win.PointerEvent==="function"){
    next.dispatchEvent(new win.PointerEvent("pointerover",Object.assign({},common,{relatedTarget:lastTarget})));
    next.dispatchEvent(new win.PointerEvent("pointerenter",Object.assign({},common,{bubbles:false,relatedTarget:lastTarget})));
   }
   lastTarget=next;
   if(next&&next.classList&&String(next.tagName||"").toUpperCase()!=="CANVAS")next.classList.add("nu-simulated-mouse-target");
   if(cursor){cursor.style.left=x+"px";cursor.style.top=y+"px";cursor.style.display=pointerVisible?"block":"none";}
   if(next&&typeof win.PointerEvent==="function")next.dispatchEvent(new win.PointerEvent("pointermove",common));
   else if(next&&typeof win.MouseEvent==="function")next.dispatchEvent(new win.MouseEvent("mousemove",Object.assign({},common,{detail:0})));
   emit("nu:simulated-pointer-move",{x:x,y:y,target:next,source:source||"controller"});
  }
  function start(){
   if(!doc)return false;
   ensureCursor();
   enabled=!!cursor;
   return enabled;
  }
  function move(dx,dy,source){
   if(gatewayNavigation)return false;
   const sx=Math.sign(Number(dx)||0),sy=Math.sign(Number(dy)||0);
   if(!sx&&!sy)return false;
   if(!enabled&&!start())return false;
   pointerVisible=true;
   const width=Math.max(2,Number(win.innerWidth)||2),height=Math.max(2,Number(win.innerHeight)||2);
   x=Math.max(1,Math.min(width-1,x+sx*step));
   y=Math.max(1,Math.min(height-1,y+sy*step));
   updateTarget(source||"click-controller");
   return true;
  }
  function clickTarget(source){
   const target=targetAt();
   if(!target||typeof target.dispatchEvent!=="function")return false;
   const common={bubbles:true,cancelable:true,view:win,clientX:x,clientY:y,button:0,buttons:1};
   if(typeof win.PointerEvent==="function"){
    target.dispatchEvent(new win.PointerEvent("pointerdown",Object.assign({},common,{pointerId:1,pointerType:"mouse",isPrimary:true})));
    target.dispatchEvent(new win.PointerEvent("pointerup",Object.assign({},common,{pointerId:1,pointerType:"mouse",isPrimary:true,buttons:0})));
   }else if(typeof win.MouseEvent==="function"){
    target.dispatchEvent(new win.MouseEvent("mousedown",common));
    target.dispatchEvent(new win.MouseEvent("mouseup",Object.assign({},common,{buttons:0})));
   }
   if(typeof win.MouseEvent==="function")target.dispatchEvent(new win.MouseEvent("click",Object.assign({},common,{detail:1,buttons:0})));
   emit("nu:simulated-pointer-click",{x:x,y:y,target:target,source:source||"controller"});
   return true;
  }
  function click(source){
   if(gatewayNavigation){emit("nu:gateway-confirm",{source:source||"controller"});return true;}
   if(!enabled&&!start())return false;
   if(!pointerVisible){pointerVisible=true;updateTarget(source||"controller");}
   return clickTarget(source||"controller");
  }
  function stopGatewayPolling(){
   if(frame&&typeof win.cancelAnimationFrame==="function")win.cancelAnimationFrame(frame);
   frame=0;primed=false;lastDirectionX=0;lastDirectionY=0;confirmDown=false;cancelDown=false;padIndex=null;
  }
  function gamepadDirection(pad){
   const buttons=pad.buttons||[],axes=pad.axes||[],threshold=.55;
   const up=!!(buttons[12]&&buttons[12].pressed)||Number(axes[1])< -threshold;
   const down=!!(buttons[13]&&buttons[13].pressed)||Number(axes[1])>threshold;
   const left=!!(buttons[14]&&buttons[14].pressed)||Number(axes[0])< -threshold;
   const right=!!(buttons[15]&&buttons[15].pressed)||Number(axes[0])>threshold;
   return {dx:(right?1:0)-(left?1:0),dy:(down?1:0)-(up?1:0),confirm:!!(buttons[0]&&buttons[0].pressed),cancel:!!(buttons[1]&&buttons[1].pressed)};
  }
  function pollGatewayGamepad(time){
   frame=0;
   if(!gatewayNavigation)return;
   const pads=win.navigator&&typeof win.navigator.getGamepads==="function"?Array.from(win.navigator.getGamepads()||[]):[];
   const pad=pads.find(p=>p&&p.connected!==false);
   if(pad){
    padIndex=pad.index;
    const input=gamepadDirection(pad);
    if(!primed){
     lastDirectionX=input.dx;lastDirectionY=input.dy;confirmDown=input.confirm;cancelDown=input.cancel;primed=true;
    }else{
     const hasDirection=!!(input.dx||input.dy);
     if(hasDirection&&(input.dx!==lastDirectionX||input.dy!==lastDirectionY||time-lastMove>=repeat)){
      emit("nu:gateway-direction",{dx:input.dx,dy:input.dy,source:"gamepad"});
      lastMove=time;
     }
     if(input.confirm&&!confirmDown)emit("nu:gateway-confirm",{source:"gamepad"});
     if(input.cancel&&!cancelDown)emit("nu:gateway-cancel",{source:"gamepad"});
     lastDirectionX=input.dx;lastDirectionY=input.dy;confirmDown=input.confirm;cancelDown=input.cancel;
    }
   }else{
    padIndex=null;primed=false;lastDirectionX=0;lastDirectionY=0;confirmDown=false;cancelDown=false;
   }
   if(gatewayNavigation&&typeof win.requestAnimationFrame==="function")frame=win.requestAnimationFrame(pollGatewayGamepad);
  }
  function setGatewayNavigation(value){
   gatewayNavigation=!!value;
   if(gatewayNavigation){
    if(!enabled)start();
    primed=false;lastMove=0;
    if(!frame&&typeof win.requestAnimationFrame==="function")frame=win.requestAnimationFrame(pollGatewayGamepad);
   }else stopGatewayPolling();
   return gatewayNavigation;
  }
  function onControllerDirection(event){
   const detail=event&&event.detail||{},dx=Number(detail.dx)||0,dy=Number(detail.dy)||0;
   if(!dx&&!dy)return;
   if(gatewayNavigation)emit("nu:gateway-direction",{dx:dx,dy:dy,source:detail.source||"click-controller"});
   else move(dx,dy,detail.source||"click-controller");
  }
  function onControllerConfirm(event){
   if(gatewayNavigation)emit("nu:gateway-confirm",{source:"click-controller"});
   else click("click-controller");
  }
  function onControllerCancel(){
   if(gatewayNavigation)emit("nu:gateway-cancel",{source:"click-controller"});
  }
  win.addEventListener&&win.addEventListener("nu:controller-direction",onControllerDirection);
  win.addEventListener&&win.addEventListener("nu:controller-confirm",onControllerConfirm);
  win.addEventListener&&win.addEventListener("nu:controller-cancel",onControllerCancel);
  function stop(){
   enabled=false;gatewayNavigation=false;stopGatewayPolling();pointerVisible=false;
   if(lastTarget&&lastTarget.classList)lastTarget.classList.remove("nu-simulated-mouse-target");
   lastTarget=null;if(cursor)cursor.style.display="none";
  }
  function destroy(){
   stop();
   win.removeEventListener&&win.removeEventListener("nu:controller-direction",onControllerDirection);
   win.removeEventListener&&win.removeEventListener("nu:controller-confirm",onControllerConfirm);
   win.removeEventListener&&win.removeEventListener("nu:controller-cancel",onControllerCancel);
   if(cursor&&cursor.remove)cursor.remove();if(style&&style.remove)style.remove();cursor=null;style=null;
  }
  return {
   start:start,
   startClickController:start,
   stop:stop,
   setEnabled:function(value){return value?start():stop();},
   isEnabled:function(){return enabled;},
   move:move,
   click:click,
   setGatewayNavigation:setGatewayNavigation,
   isGatewayNavigation:function(){return gatewayNavigation;},
   getState:function(){return {enabled:enabled,visible:pointerVisible,gatewayNavigation:gatewayNavigation,x:x,y:y,padIndex:padIndex,mode:"simulated-mouse"};},
   destroy:destroy
  };
 }
 root.NUControllerPointer=Object.assign(create(),{create:create,mode:"simulated-mouse",capabilities:{directionalPointer:true,separateConfirm:true,physicalMouseDirect:true,touchDirect:true,gatewayHierarchicalNavigation:true}});
})(typeof window!=="undefined"?window:globalThis);
