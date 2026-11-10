/* N.U — Niroo Universe | Generation 1 reference-art compositor
   Static-first progressive effects. Does not touch the protected adaptive/network runtime. */
(function(){
"use strict";
const canvas=document.getElementById("nu-art-effects"),scene=document.getElementById("nu-art-scene");
if(!canvas||!scene)return;
const ctx=canvas.getContext("2d",{alpha:true});
if(!ctx)return;
const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const saveData=!!(navigator.connection&&navigator.connection.saveData);
let quality=3,raf=0,last=0,w=0,h=0,dpr=1,visible=!document.hidden,staticMode=reduced||saveData;
let stars=[],clouds=[],phase=0;
function setQuality(q){
 quality=Math.max(1,Math.min(10,Number(q)||1));
 staticMode=reduced||saveData||quality<=2;
 document.documentElement.dataset.nuArt=staticMode?"static":quality<=4?"low":"full";
 if(staticMode){if(raf)cancelAnimationFrame(raf);raf=0;draw(0);return;}
 if(visible&&!raf)raf=requestAnimationFrame(loop);
}
function resize(){
 const r=scene.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);
 dpr=Math.min(window.devicePixelRatio||1,quality>=8?1.35:1);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);
 const n=Math.round((w*h/14000)*(quality/5));
 stars=Array.from({length:Math.max(8,Math.min(90,n))},()=>({x:Math.random()*w,y:Math.random()*h*.58,r:.35+Math.random()*.9,a:.18+Math.random()*.48,s:.08+Math.random()*.22}));
 clouds=Array.from({length:quality>=6?5:2},(_,i)=>({x:(i/5)*w,y:h*(.38+Math.random()*.16),s:.4+Math.random()*.7,a:.018+Math.random()*.035}));
 draw(0);
}
function draw(dt){
 if(!w||!h)return;
 ctx.clearRect(0,0,w,h);
 const cx=w*.5,cy=h*.2,scale=Math.min(w,h);
 // Celestial astrolabe rings, echoing the reference image's golden geometry.
 ctx.save();ctx.translate(cx,cy);ctx.strokeStyle="rgba(231,165,91,"+(quality>=6?".19":".09")+")";ctx.lineWidth=1;
 for(let i=1;i<=5;i++){ctx.beginPath();ctx.arc(0,0,scale*(.045+i*.035),0,Math.PI*2);ctx.stroke();}
 ctx.beginPath();ctx.moveTo(-scale*.34,0);ctx.lineTo(scale*.34,0);ctx.moveTo(0,-scale*.22);ctx.lineTo(0,scale*.32);ctx.stroke();
 ctx.restore();
 // Small star drift; no high-cost blur filters.
 stars.forEach(p=>{ctx.globalAlpha=p.a*(.7+.3*Math.sin(phase*.8+p.x));ctx.fillStyle="#d9c6a5";ctx.fillRect(p.x,p.y,p.r,p.r);if(!staticMode)p.x=(p.x+p.s*dt*.025)%w;});
 ctx.globalAlpha=1;
 // Central golden energy shaft: subdued overlay so it never overwhelms text or artwork.
 const beam=ctx.createLinearGradient(cx, h*.28,cx,h*.73);
 beam.addColorStop(0,"rgba(245,174,92,0)");beam.addColorStop(.48,"rgba(255,194,111,"+(quality>=6?".10":".035")+")");beam.addColorStop(1,"rgba(245,174,92,0)");
 ctx.fillStyle=beam;ctx.fillRect(cx-scale*.045,h*.27,scale*.09,h*.48);
 // Slow atmospheric cloud ribbons.
 clouds.forEach((p,i)=>{const y=p.y+Math.sin(phase*.12+i)*5;const g=ctx.createRadialGradient(p.x,y,2,p.x,y,scale*.22*p.s);g.addColorStop(0,"rgba(190,177,155,"+p.a+")");g.addColorStop(1,"rgba(190,177,155,0)");ctx.fillStyle=g;ctx.fillRect(p.x-scale*.25*p.s,y-scale*.08,p.s*scale*.5,p.s*scale*.16);if(!staticMode){p.x+=dt*.003*p.s;if(p.x>w+scale*.2)p.x=-scale*.2;}});
 // Gentle water glints in the lower city/water band.
 if(quality>=4){for(let i=0;i<(quality>=8?18:7);i++){const x=(i*73+phase*1.4)%w,y=h*(.79+(i%4)*.035);ctx.globalAlpha=.08+.07*Math.sin(phase*.3+i);ctx.fillStyle="#e5b57d";ctx.fillRect(x,y,3+(i%3)*2,1);}}
 ctx.globalAlpha=1;
}
function loop(t){if(!visible||staticMode){raf=0;return;}const cap=quality<=4?1000/18:quality<=7?1000/24:1000/30;if(t-last>=cap){const dt=Math.min(50,t-last||16);last=t;phase+=dt*.001;draw(dt);}raf=requestAnimationFrame(loop);}
function wake(){visible=!document.hidden;if(!visible){if(raf)cancelAnimationFrame(raf);raf=0;}else if(!staticMode&&!raf)raf=requestAnimationFrame(loop);else draw(0);}
document.addEventListener("visibilitychange",wake);
window.addEventListener("resize",resize,{passive:true});
window.addEventListener("nu:calibrated",()=>{const m=(document.getElementById("quality-status")||{}).textContent||"";const q=Number((m.match(/Q(\d+)/)||[])[1]||3);setQuality(q);});
resize();setQuality(3);
window.NUArtBackground={setQuality,resize,staticMode:()=>staticMode};
})();