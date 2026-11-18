/* N.U Interaction Core — normalized input translators and in-platform debug ledger.
 * Translators remain independent: direct mouse, direct touch, selective actions,
 * and the simulated mouse all publish to one semantic interaction stream.
 * This module observes and normalizes; it does not replace page/game action handlers.
 */
(function(root){
 "use strict";
 const LIMIT=240,records=[];
 const listeners=new Map();
 let sequence=0,installed=false,lastTouchAt=0,lastMouseMoveAt=0;
 const INTERACTIVE='button,a,input,select,textarea,[role="button"],[role="option"],[role="menuitem"],[tabindex],canvas,[data-nu-interactive]';
 function now(){return Date.now();}
 function describe(node){
  if(!node||node.nodeType!==1)return null;
  const el=node.closest?node.closest(INTERACTIVE):node;
  if(!el)return null;
  return {tag:String(el.tagName||"").toLowerCase(),id:el.id||"",role:el.getAttribute&&el.getAttribute("role")||"",action:el.getAttribute&&el.getAttribute("data-action")||"",label:String(el.getAttribute&& (el.getAttribute("aria-label")||el.getAttribute("title"))||el.textContent||"").trim().slice(0,100)};
 }
 function publish(action,source,target,detail){
  const record={id:++sequence,at:now(),action:String(action),source:String(source||"unknown"),target:describe(target),detail:detail||{}};
  records.push(record);if(records.length>LIMIT)records.shift();
  const eventDetail=record;
  if(typeof root.CustomEvent==="function")root.dispatchEvent(new root.CustomEvent("nu:interaction",{detail:eventDetail}));
  if(typeof root.CustomEvent==="function")root.dispatchEvent(new root.CustomEvent("nu:interaction-debug",{detail:eventDetail}));
  (listeners.get("interaction")||[]).forEach(fn=>{try{fn(record);}catch(_){/* diagnostics must not break gameplay */}});
  return record;
 }
 function on(type,fn){if(typeof fn!=="function")return()=>{};if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);return()=>listeners.set(type,(listeners.get(type)||[]).filter(x=>x!==fn));}
 function targetOf(event){return event&&event.target&&event.target.closest?event.target.closest(INTERACTIVE):event&&event.target;}
 function mouse(event){if(!event||event.nuSimulated||event.pointerType==="touch"||event.type==="click")return;if(event.type==="pointermove"){if(now()-lastMouseMoveAt>=80){lastMouseMoveAt=now();publish("hover","physical-mouse",targetOf(event),{x:event.clientX,y:event.clientY});}return;}if(event.type==="mousemove")return;publish(event.type==="pointerdown"?"press":"release","physical-mouse",targetOf(event),{button:event.button,detail:event.detail||0});}
 function touch(event){
  if(!event||event.pointerType!=="touch")return;
  if(event.type==="pointerdown"){lastTouchAt=now();publish("press","direct-touch",targetOf(event),{pointerId:event.pointerId});}
  if(event.type==="pointermove")publish("move","direct-touch",targetOf(event),{pointerId:event.pointerId,x:event.clientX,y:event.clientY});
  if(event.type==="pointerup")publish("activate","direct-touch",targetOf(event),{pointerId:event.pointerId});
  if(event.type==="pointercancel")publish("cancel","direct-touch",targetOf(event),{pointerId:event.pointerId});
 }
 function selective(event){
  if(!event)return;
  const target=targetOf(event);if(!target)return;
  if(event.type==="click"){
   if(event.nuSimulated){publish("activate","simulated-mouse",target,{detail:event.detail||0});return;}
   if(now()-lastTouchAt<850&&event.detail>0)return;
   publish("activate","selective-click",target,{detail:event.detail||0});
  }else if(event.type==="change")publish("select","selective-control",target,{value:target.value??null});
  else if(event.type==="keydown"&&(event.key==="Enter"||event.key===" "||event.key==="NumpadEnter"))publish("confirm","selective-keyboard",target,{key:event.key});
  else if(event.type==="keydown"&&event.key==="Escape")publish("cancel","selective-keyboard",target,{key:event.key});
 }
 function virtual(event){
  if(!event)return;
  if(event.type==="nu:simulated-pointer-move")publish("move","simulated-mouse",null,{x:event.detail&&event.detail.x,y:event.detail&&event.detail.y});
  else if(event.type==="nu:simulated-pointer-target")publish("hover","simulated-mouse",event.detail&&event.detail.target,{x:event.detail&&event.detail.x,y:event.detail&&event.detail.y});
  else if(event.type==="nu:gateway-confirm")publish("confirm","simulated-mouse",null,{surface:"gateway"});
  else if(event.type==="nu:gateway-direction")publish("navigate","selective-controller",null,{x:event.detail&&event.detail.x,y:event.detail&&event.detail.y});
  else if(event.type==="nu:gateway-cancel")publish("cancel","selective-controller",null,{surface:"gateway"});
 }
 function install(){
  if(installed||!root.addEventListener)return api;installed=true;
  root.addEventListener("pointerdown",event=>{mouse(event);touch(event);},true);
  root.addEventListener("pointermove",event=>{mouse(event);touch(event);},true);
  root.addEventListener("pointercancel",touch,true);
  root.addEventListener("pointerup",touch,true);
  root.addEventListener("click",event=>{mouse(event);selective(event);},true);
  root.addEventListener("change",selective,true);
  root.addEventListener("keydown",selective,true);
  ["nu:simulated-pointer-move","nu:simulated-pointer-target","nu:gateway-confirm","nu:gateway-direction","nu:gateway-cancel"].forEach(type=>root.addEventListener(type,virtual));
  return api;
 }
 function snapshot(){return records.slice();}
 function exportReport(){return JSON.stringify({schema:"nu-interaction-debug/v1",generatedAt:new Date().toISOString(),count:records.length,records:snapshot()},null,2);}
 function record(action,source,target,detail){return publish(action,source,target,detail);}
 const api={version:"1.0.0",install,on,record,snapshot,exportReport,translators:{mouse:{mode:"direct",events:["pointerdown","click"]},touch:{mode:"direct",events:["pointerdown","pointerup"],ghostClickGuardMs:850},selective:{mode:"semantic",actions:["navigate","hover","select","confirm","activate","cancel","execute"]},simulatedMouse:{mode:"virtual",events:["nu:simulated-pointer-move","nu:simulated-pointer-target","nu:gateway-confirm"]}},capabilities:{normalizedEvents:true,debugLedger:true,nonIntrusive:true}};
 root.NUInteractionCore=api;
 if(root.document)install();
})(typeof window!=="undefined"?window:globalThis);
