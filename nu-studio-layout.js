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
    if(width<1||height<1||zoom<1||gutter<0)throw new RangeError("Artwork dimensions and zoom must be positive.");
    if(frameWidth<=0||frameHeight<=0)return {scale:0,width:1,height:1,overflowX:false,overflowY:false};
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
  function anchorScrollDelta(beforeRect,afterRect,anchorX,anchorY){
    if(!beforeRect||!afterRect||!Number.isFinite(anchorX)||!Number.isFinite(anchorY)||beforeRect.width<=0||beforeRect.height<=0||afterRect.width<=0||afterRect.height<=0)return {x:0,y:0};
    const rx=Math.max(0,Math.min(1,(anchorX-beforeRect.left)/beforeRect.width));
    const ry=Math.max(0,Math.min(1,(anchorY-beforeRect.top)/beforeRect.height));
    return {x:afterRect.left+rx*afterRect.width-anchorX,y:afterRect.top+ry*afterRect.height-anchorY};
  }
  function pixelAnchorScrollDelta(beforeRect,afterRect,anchorX,anchorY,width,height){
    if(!beforeRect||!afterRect||!Number.isFinite(anchorX)||!Number.isFinite(anchorY)||beforeRect.width<=0||beforeRect.height<=0||afterRect.width<=0||afterRect.height<=0||!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1)return {x:0,y:0};
    const pixel=pixelAt(anchorX,anchorY,beforeRect,width,height),oldCellWidth=beforeRect.width/width,oldCellHeight=beforeRect.height/height,newCellWidth=afterRect.width/width,newCellHeight=afterRect.height/height;
    const offsetX=(anchorX-(beforeRect.left+(pixel.x+.5)*oldCellWidth))/oldCellWidth,offsetY=(anchorY-(beforeRect.top+(pixel.y+.5)*oldCellHeight))/oldCellHeight;
    const nextCenterX=afterRect.left+(pixel.x+.5)*newCellWidth,nextCenterY=afterRect.top+(pixel.y+.5)*newCellHeight;
    const desiredCenterX=anchorX-offsetX*newCellWidth,desiredCenterY=anchorY-offsetY*newCellHeight;
    return {x:nextCenterX-desiredCenterX,y:nextCenterY-desiredCenterY};
  }
  function pixelAnchorCorrection(targetPixel,actualPixel,rect,width,height){
    if(!targetPixel||!actualPixel||!rect||rect.width<=0||rect.height<=0||!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1)return {x:0,y:0};
    return {x:(targetPixel.x-actualPixel.x)*rect.width/width,y:(targetPixel.y-actualPixel.y)*rect.height/height};
  }
  return {fit,pixelAt,anchorScrollDelta,pixelAnchorScrollDelta,pixelAnchorCorrection};
});
