/* N.U Studio workspace geometry — deterministic helpers for fit and pixel mapping. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.NUStudioLayout=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function fit(width,height,frameWidth,frameHeight,zoom=100,gutter=28){
    for(const [name,value] of Object.entries({width,height,frameWidth,frameHeight,zoom,gutter})){
      if(!Number.isFinite(value))throw new TypeError(name+" must be finite.");
    }
    if(width<1||height<1||frameWidth<1||frameHeight<1||zoom<1||gutter<0)throw new RangeError("Workspace and artwork dimensions must be positive.");
    const availableWidth=Math.max(1,frameWidth-gutter),availableHeight=Math.max(1,frameHeight-gutter);
    const fitScale=Math.min(availableWidth/width,availableHeight/height);
    const scale=fitScale*zoom/100;
    return {scale,width:Math.max(1,Math.floor(width*scale)),height:Math.max(1,Math.floor(height*scale)),overflowX:width*scale>availableWidth,overflowY:height*scale>availableHeight};
  }
  function pixelAt(clientX,clientY,rect,width,height){
    if(!rect||!Number.isFinite(rect.width)||!Number.isFinite(rect.height)||rect.width<=0||rect.height<=0)throw new RangeError("Canvas bounds must have a positive size.");
    if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1)throw new RangeError("Artwork dimensions must be positive integers.");
    const x=Math.floor((clientX-rect.left)/rect.width*width),y=Math.floor((clientY-rect.top)/rect.height*height);
    return {x:Math.max(0,Math.min(width-1,x)),y:Math.max(0,Math.min(height-1,y))};
  }
  return {fit,pixelAt};
});
