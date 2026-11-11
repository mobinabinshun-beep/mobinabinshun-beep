/* N.U Dynamic Layers Engine — optional atmosphere; independent of gameplay.
 * Animation stops when hidden, reduced-motion is enabled, or the quality budget is low.
 */
(function(g){
"use strict";
let canvas,ctx,raf=0,active=false,profile=null,last=0,particles=[];
const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
function resize(){
 if(!canvas||!profile)return;
 const b=profile.budget,dpr=Math.min(devicePixelRatio||1,b.dpr);
 const w=innerWidth,h=innerHeight,scale=Math.min(1,Math.sqrt(b.maxCanvasPixels/(w*h)));
 canvas.width=Math.max(1,Math.floor(w*scale*dpr));canvas.height=Math.max(1,Math.floor(h*scale*dpr));
 canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.setTransform(dpr*scale,0,0,dpr*scale,0,0);
 particles=Array.from({length:b.particles},()=>({x:Math.random()*w,y:Math.random()*h,r:.5+Math.random()*1.4,a:.12+Math.random()*.25,s:.08+Math.random()*.25,p:Math.random()*6.28}));
}
function draw(t){
 if(!active||!ctx)return;
 const b=profile.budget,interval=1000/b.overlayFps;
 if(t-last<interval){raf=requestAnimationFrame(draw);return;}last=t;
 const w=innerWidth,h=innerHeight;ctx.clearRect(0,0,w,h);
 for(const p of particles){p.p+=p.s*.012;const a=p.a*(.55+.45*Math.sin(p.p));ctx.fillStyle="rgba(255,190,112,"+a+")";ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
 raf=requestAnimationFrame(draw);
}
function stop(){active=false;cancelAnimationFrame(raf);if(ctx)ctx.clearRect(0,0,innerWidth,innerHeight);}
function apply(p){
 profile=p;mount();resize();
 if(reduce()||p.budget.particles===0){stop();return;}
 active=true;last=0;cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);
}
function mount(){
 if(canvas)return;canvas=document.createElement("canvas");canvas.id="nu-dynamic-layers";canvas.setAttribute("aria-hidden","true");canvas.style.cssText="position:fixed;inset:0;z-index:-1;pointer-events:none";
 const world=document.querySelector(".world");if(world)world.insertBefore(canvas,world.children[1]||null);ctx=canvas.getContext("2d",{alpha:true});
 document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();else if(profile)apply(profile);});
 addEventListener("resize",()=>{if(profile){resize();if(active){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);}}},{passive:true});
}
g.NUDynamicLayers={apply,stop};
})(window);
