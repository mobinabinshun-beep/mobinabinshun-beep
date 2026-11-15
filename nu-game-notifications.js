/* N.U reusable game notification presets.
 * Visual signatures are sourced from the Generation 1.18 interaction feedback
 * and the existing capsule-gain / floating-change styles in nu-world.css.
 */
(function(global){
 "use strict";
 const DEFAULTS=Object.freeze({consumptionDuration:1750,consumptionOffset:4,interactionDuration:850,barDeltaDuration:1100});
 let overlay=null;
 function getOverlay(){
  if(overlay&&overlay.isConnected)return overlay;
  overlay=document.createElement("div");
  overlay.className="nu-notification-layer";
  overlay.setAttribute("aria-hidden","false");
  document.body.appendChild(overlay);
  return overlay;
 }
 function toneClass(value,fallback){return String(value||fallback).replace(/[^a-z0-9_-]/gi,"")||fallback;}
 function removeAfter(node,duration){
  const timer=setTimeout(()=>{if(node&&node.parentNode)node.parentNode.removeChild(node);},Math.max(0,duration));
  return timer;
 }
 function showInteraction(options){
  options=options||{};
  const container=options.container;
  if(!container||!document.createElement)return null;
  const node=document.createElement("span");
  node.className="nu-game-notification-interaction hit-progress"+(options.tone?" "+options.tone:"");
  node.textContent=String(options.text==null?"":options.text);
  node.style.left=(Number(options.x)||0)+"px";
  node.style.top=(Number(options.y)||0)+"px";
  container.appendChild(node);
  removeAfter(node,options.duration==null?DEFAULTS.interactionDuration:options.duration);
  return node;
 }
 function showBarDelta(options){
  options=options||{};
  const anchor=options.anchor;
  if(!anchor||!document.createElement)return null;
  const node=document.createElement("span");
  const tone=toneClass(options.tone,"xp");
  node.className="nu-game-notification-bar-delta capsule-gain "+tone;
  node.textContent=String(options.text==null?"":options.text);
  const fill=options.fill;
  const current=fill?parseFloat(fill.style.width)||0:0;
  node.style.left=Math.max(1,Math.min(99,current+(Number(options.boundaryOffset)==null?1.5:Number(options.boundaryOffset))))+"%";
  node.style.transform="translateX(-50%)";
  anchor.appendChild(node);
  removeAfter(node,options.duration==null?DEFAULTS.barDeltaDuration:options.duration);
  return node;
 }
 function showConsumption(options){
  options=options||{};
  const anchor=options.anchor;
  if(!anchor||typeof anchor.getBoundingClientRect!=="function"||!document.body)return null;
  const rect=anchor.getBoundingClientRect();
  if(!(rect.width>0&&rect.height>0))return null;
  const centerX=options.anchorCenterX!=null&&Number.isFinite(Number(options.anchorCenterX))?Number(options.anchorCenterX):rect.left+rect.width/2;
  const duration=options.duration==null?DEFAULTS.consumptionDuration:Math.max(0,Number(options.duration)||0);
  const root=document.createElement("div");
  root.className="nu-notification-pair";
  root.setAttribute("role","status");
  root.setAttribute("aria-live","polite");
  root.setAttribute("aria-atomic","true");
  root.setAttribute("aria-label",String(options.itemDelta||"")+" · "+String(options.resourceDelta||""));
  root.style.left=centerX+"px";
  root.style.top=(rect.bottom+(Number(options.offset)==null?DEFAULTS.consumptionOffset:Number(options.offset)))+"px";
  root.style.setProperty("--nu-notification-duration",duration+"ms");
  const item=document.createElement("span");
  item.className="floating-change "+toneClass(options.itemTone,"loss");
  item.textContent=String(options.itemDelta==null?"":options.itemDelta);
  const resource=document.createElement("span");
  resource.className="floating-change "+toneClass(options.resourceTone,"hp");
  resource.textContent=String(options.resourceDelta==null?"":options.resourceDelta);
  root.append(item,resource);
  getOverlay().appendChild(root);
  removeAfter(root,duration+80);
  return root;
 }
 function showFloating(options){
  options=options||{};
  const root=getOverlay();
  const rect=options.anchor&&options.anchor.getBoundingClientRect?options.anchor.getBoundingClientRect():null;
  const duration=options.duration==null?DEFAULTS.consumptionDuration:Math.max(0,Number(options.duration)||0);
  const pair=document.createElement("div");
  pair.className="nu-notification-pair";
  pair.setAttribute("role","status");
  pair.setAttribute("aria-live","polite");
  pair.setAttribute("aria-atomic","true");
  pair.style.left=rect?(rect.left+rect.width/2)+"px":"50%";
  pair.style.top=rect?(rect.bottom+(Number(options.offset)||0))+"px":"50%";
  pair.style.setProperty("--nu-notification-duration",duration+"ms");
  const node=document.createElement("span");
  node.className="floating-change "+(options.tone||"gain");
  node.textContent=String(options.text==null?"":options.text);
  pair.appendChild(node);
  root.appendChild(pair);
  removeAfter(pair,duration+80);
  return pair;
 }
 global.NUGameNotifications=Object.freeze({
  version:"1.0.0",
  defaults:DEFAULTS,
  showInteraction:showInteraction,
  showBarDelta:showBarDelta,
  showConsumption:showConsumption,
  showFloating:showFloating
 });
})(window);
