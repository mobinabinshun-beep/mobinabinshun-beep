/* ARCHIVED VISUAL LAYER — retained for rollback; not loaded by public demo. */
/* N.U Dynamic Layers Engine v0.3 — independent, low-cost atmospheric compositor.
 * The reference artwork is never resized or reconstructed by this layer.
 */
(function(g){
"use strict";
let canvas=null,ctx=null,profile=null,raf=0,active=false,frozen=false,last=0,mode="ambient",particles=[];
const reduced=()=>typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function mount(){
 if(canvas)return;
 const world=document.querySelector(".world");if(!world)return;
 canvas=document.createElement("canvas");canvas.id="nu-dynamic-layers";canvas.setAttribute("aria-hidden","true");
 canvas.style.cssText="position:fixed;inset:0;width:100%;height:100%;z-index:-2;pointer-events:none";
 world.insertBefore(canvas,world.children[1]||null);ctx=canvas.getContext("2d",{alpha:true,desynchronized:true});
 document.addEventListener("visibilitychange",()=>{if(document.hidden)pause();else resume();});
 window.addEventListener("resize",()=>{if(profile){resize();renderStatic();if(active&&!frozen&&!reduced())schedule();}},{passive:true});
}
function resize(){
 if(!canvas||!ctx||!profile)return;
 const b=profile.budget,w=Math.max(1,innerWidth),h=Math.max(1,innerHeight);
 const scale=Math.min(1,Math.sqrt((b.maxCanvasPixels||520000)/(w*h))),dpr=Math.min(devicePixelRatio||1,b.dpr||1);
 canvas.width=Math.max(1,Math.floor(w*scale*dpr));canvas.height=Math.max(1,Math.floor(h*scale*dpr));
 canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.setTransform(scale*dpr,0,0,scale*dpr,0,0);
 const count=mode==="focus"?Math.floor((b.particles||0)*.22):mode==="sleep"?Math.floor((b.particles||0)*.12):mode==="game"?(b.particles||0):Math.floor((b.particles||0)*.55);
 particles=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,r:.45+Math.random()*1.25,a:.10+Math.random()*.22,vx:(Math.random()-.5)*.12,vy:-.04-Math.random()*.12,phase:Math.random()*6.28}));
}
function renderStatic(t){
 if(!ctx||!canvas)return;
 const w=innerWidth,h=innerHeight,cx=w*.5,cy=h*.205;
 ctx.clearRect(0,0,w,h);ctx.save();ctx.globalCompositeOperation="screen";
 const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(w,h)*.43);
 glow.addColorStop(0,mode==="focus"?"rgba(255,190,116,.07)":"rgba(255,181,101,.12)");glow.addColorStop(1,"rgba(255,170,90,0)");
 ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 const alpha=mode==="focus"?.055:mode==="sleep"?.035:mode==="game"?.10:.075;
 ctx.strokeStyle="rgba(242,178,105,"+alpha+")";ctx.lineWidth=1;
 for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx,cy,Math.min(w,h)*(.13+i*.075),Math.min(w,h)*(.055+i*.032),0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();}
 const beam=ctx.createLinearGradient(cx,cy,cx,h*.72);beam.addColorStop(0,"rgba(255,194,120,"+(mode==="game"?.11:.065)+")");beam.addColorStop(.45,"rgba(255,183,105,.025)");beam.addColorStop(1,"rgba(255,183,105,0)");
 ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(cx-2,cy);ctx.lineTo(cx-w*.12,h*.72);ctx.lineTo(cx+w*.12,h*.72);ctx.lineTo(cx+2,cy);ctx.closePath();ctx.fill();
 for(const p of particles){p.phase+=.012;p.x+=p.vx*(mode==="game"?2:1);p.y+=p.vy*(mode==="game"?1.6:.65);if(p.y<0){p.y=h;p.x=Math.random()*w;}if(p.x<0)p.x=w;if(p.x>w)p.x=0;const a=p.a*(.55+.45*Math.sin(p.phase));ctx.fillStyle="rgba(255,207,145,"+a+")";ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
 ctx.restore();
}
function frame(t){
 if(!active||frozen||document.hidden||!ctx)return;
 const fps=profile&&profile.budget?profile.budget.overlayFps:8,interval=1000/Math.max(1,fps);
 if(t-last>=interval){last=t;renderStatic(t);}
 if(!reduced()&&particles.length)raf=requestAnimationFrame(frame);
}
function schedule(){cancelAnimationFrame(raf);last=0;if(active&&!frozen&&!document.hidden&&!reduced()&&particles.length)raf=requestAnimationFrame(frame);}
function pause(){cancelAnimationFrame(raf);}
function resume(){if(!profile||!active)return;renderStatic();schedule();}
function apply(p){profile=p;active=true;mount();resize();renderStatic();schedule();}
function setMode(next){mode=["ambient","sleep","focus","game"].includes(next)?next:"ambient";if(profile){resize();renderStatic();schedule();}}
function setFrozen(value){frozen=!!value;if(frozen)pause();else resume();}
function stop(){active=false;pause();if(ctx&&canvas)ctx.clearRect(0,0,canvas.width,canvas.height);}
g.NUDynamicLayers={apply,setMode,setFrozen,stop,getState:()=>({active,frozen,mode,particles:particles.length})};
})(window);
