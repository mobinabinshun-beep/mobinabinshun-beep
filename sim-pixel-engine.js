(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.SimPixelEngine=api})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
const SPEED=Object.freeze({Chill:2,Normal:1,Hurry:5,Escape:25});
const ENCOUNTER=Object.freeze({nearMeters:2,fullMeters:1,releaseGapMeters:2,interactionMs:1000,phaseCount:4});
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function axisStep(position,direction,speed,dt,min=0,max=Infinity){if(!Number.isFinite(position)||!Number.isFinite(direction)||!Number.isFinite(speed)||!Number.isFinite(dt)||dt<0)throw new TypeError("Invalid movement input");return clamp(position+Math.sign(direction)*Math.abs(direction)*speed*dt,min,max)}
function moveDirect(position,direction,mode,dt,bounds={}){const speed=SPEED[mode];if(!speed)throw new RangeError("Unknown movement mode");return{x:axisStep(position.x,direction.x,speed,dt,bounds.minX??0,bounds.maxX??Infinity),y:axisStep(position.y,direction.y,speed,dt,bounds.minY??0,bounds.maxY??Infinity)}}
function moveToward(position,target,mode,dt){const speed=SPEED[mode];if(!speed)throw new RangeError("Unknown movement mode");const step=speed*dt,dx=target.x-position.x,dy=target.y-position.y;return{x:position.x+Math.sign(dx)*Math.min(Math.abs(dx),step),y:position.y+Math.sign(dy)*Math.min(Math.abs(dy),step)}}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function orientation(a,b,c){return (b.y-a.y)*(c.x-b.x)-(b.x-a.x)*(c.y-b.y)}
function onSegment(a,b,p){return p.x<=Math.max(a.x,b.x)+1e-9&&p.x>=Math.min(a.x,b.x)-1e-9&&p.y<=Math.max(a.y,b.y)+1e-9&&p.y>=Math.min(a.y,b.y)-1e-9}
function segmentsIntersect(a,b,c,d){const o1=orientation(a,b,c),o2=orientation(a,b,d),o3=orientation(c,d,a),o4=orientation(c,d,b);if(((o1>0&&o2<0)||(o1<0&&o2>0))&&((o3>0&&o4<0)||(o3<0&&o4>0)))return true;if(Math.abs(o1)<1e-9&&onSegment(a,b,c))return true;if(Math.abs(o2)<1e-9&&onSegment(a,b,d))return true;if(Math.abs(o3)<1e-9&&onSegment(c,d,a))return true;if(Math.abs(o4)<1e-9&&onSegment(c,d,b))return true;return false}
function classifyEncounter(a,b,pathA,pathB){const d=distance(a,b);if(d<ENCOUNTER.fullMeters&&pathA&&pathB&&segmentsIntersect(pathA.start,pathA.end,pathB.start,pathB.end))return"full";if(d<ENCOUNTER.nearMeters)return"friendly-pass";return"none"}
function freeGap(centerDistance,pixelSide=1){return Math.max(0,centerDistance-pixelSide)}
class EncounterRegistry{
 constructor(){this.active=new Map()}
 key(a,b){return[a,b].sort().join("::")}
 canStart(a,b){return !this.active.has(this.key(a,b))}
 start(a,b,now){const key=this.key(a,b);if(this.active.has(key))return false;this.active.set(key,{key,members:[a,b],startedAt:now,phase:0,state:"interaction"});return true}
 update(a,b,now,centerDistance){const key=this.key(a,b),entry=this.active.get(key);if(!entry)return null;if(freeGap(centerDistance)>=ENCOUNTER.releaseGapMeters){this.active.delete(key);return{state:"released",key}}const elapsed=Math.max(0,now-entry.startedAt);if(elapsed>=ENCOUNTER.interactionMs){entry.state="cooldown";entry.phase=ENCOUNTER.phaseCount-1;return{...entry,elapsed,complete:true}}entry.phase=Math.min(ENCOUNTER.phaseCount-1,Math.floor(elapsed/(ENCOUNTER.interactionMs/ENCOUNTER.phaseCount)));return{...entry,elapsed,complete:false}}
}
class GroupEncounter{
 constructor(firstThree){if(!Array.isArray(firstThree)||firstThree.length!==3||new Set(firstThree).size!==3)throw new TypeError("A group encounter starts with exactly three unique NPCs");this.active=[...firstThree];this.waiting=[];this.closed=false}
 enqueue(npc){if(this.closed||this.active.includes(npc)||this.waiting.includes(npc))return false;this.waiting.push(npc);return true}
 passBy(npc,pathsInterfere){if(!this.waiting.includes(npc))return"not-waiting";return pathsInterfere?"join-required":"friendly-wave"}
 memberLeaves(npc){if(this.closed||!this.active.includes(npc))return{state:"not-member"};if(this.waiting.length){const index=this.active.indexOf(npc),incoming=this.waiting.shift();this.active[index]=incoming;return{state:"replaced",outgoing:npc,incoming,active:[...this.active],waiting:[...this.waiting]}}this.closed=true;const remaining=this.active.filter(x=>x!==npc);this.active=[];return{state:"ended",outgoing:npc,resume:remaining}}
 joinOnOverlap(npc,pathsInterfere){if(!pathsInterfere)return{state:"friendly-wave",npc};if(!this.waiting.includes(npc))return{state:"not-waiting"};return{state:"join-required",npc}}
}
// Prototype-only timing: four equal visual phases fit inside the confirmed 1-second pause; per-phase timing remains a design detail awaiting QA.
function interactionPhase(elapsedMs){if(elapsedMs<0)throw new RangeError("elapsedMs must be non-negative");return Math.min(3,Math.floor(Math.min(elapsedMs,ENCOUNTER.interactionMs-1)/(ENCOUNTER.interactionMs/ENCOUNTER.phaseCount)))}
return Object.freeze({SPEED,ENCOUNTER,axisStep,moveDirect,moveToward,distance,segmentsIntersect,classifyEncounter,freeGap,EncounterRegistry,GroupEncounter,interactionPhase});
});