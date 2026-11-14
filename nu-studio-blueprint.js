/* N.U Blueprint Guide — non-destructive center-pixel and subdivision overlay. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUStudioBlueprint=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 function centerCell(width,height){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1)throw new RangeError("Positive integer dimensions are required.");
  return {x:Math.floor(width/2),y:Math.floor(height/2)};
 }
 function draw(ctx,width,height,options){
  if(!ctx||!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1)throw new TypeError("A drawing context and positive artwork dimensions are required.");
  const opts=options||{},divisions=Math.max(1,Math.min(16,Math.floor(Number(opts.divisions)||4)));
  ctx.clearRect(0,0,width,height);
  if(opts.enabled===false)return centerCell(width,height);
  const center=centerCell(width,height);
  ctx.save();
  ctx.lineWidth=Math.max(.08,Math.min(.22,Math.min(width,height)/900));
  ctx.strokeStyle="rgba(101,220,255,.82)";
  ctx.setLineDash([Math.max(.5,Math.min(2,Math.min(width,height)/80)),Math.max(.35,Math.min(1.2,Math.min(width,height)/120)]);
  ctx.beginPath();
  ctx.moveTo(center.x+.5,0);ctx.lineTo(center.x+.5,height);
  ctx.moveTo(0,center.y+.5);ctx.lineTo(width,center.y+.5);
  for(let i=1;i<divisions;i++){
   const x=width*i/divisions,y=height*i/divisions;
   if(Math.abs(x-(center.x+.5))>.75){ctx.moveTo(x,0);ctx.lineTo(x,height);}
   if(Math.abs(y-(center.y+.5))>.75){ctx.moveTo(0,y);ctx.lineTo(width,y);}
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle="rgba(255,200,107,.98)";
  ctx.lineWidth=Math.max(.12,Math.min(.3,Math.min(width,height)/700));
  ctx.strokeRect(center.x+.08,center.y+.08,.84,.84);
  ctx.restore();
  return center;
 }
 return {centerCell,draw};
});
