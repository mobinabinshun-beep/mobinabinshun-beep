/* N.U SVG Vectorizer v1.0 — pure local raster-to-vector path builder. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.NUSVGVectorizer=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function safeColor(value){
    if(typeof value!=="string"||!/^#[0-9a-f]{6}$/i.test(value)) throw new TypeError("Expected a six-digit hex color.");
    return value.toLowerCase();
  }
  function key(x,y){return x+","+y;}
  function contourPaths(pixels,width,height,color){
    const edges=[],outgoing=new Map();
    const add=(x1,y1,x2,y2,dir)=>{
      const edge={x1,y1,x2,y2,dir,used:false};
      const index=edges.push(edge)-1, k=key(x1,y1);
      if(!outgoing.has(k)) outgoing.set(k,[]);
      outgoing.get(k).push(index);
    };
    for(let y=0;y<height;y++) for(let x=0;x<width;x++){
      if(pixels[y*width+x]!==color) continue;
      if(y===0||pixels[(y-1)*width+x]!==color) add(x,y,x+1,y,0);
      if(x===width-1||pixels[y*width+x+1]!==color) add(x+1,y,x+1,y+1,1);
      if(y===height-1||pixels[(y+1)*width+x]!==color) add(x+1,y+1,x,y+1,2);
      if(x===0||pixels[y*width+x-1]!==color) add(x,y+1,x,y,3);
    }
    const turnRank=[1,0,3,2];
    const paths=[];
    for(let seed=0;seed<edges.length;seed++){
      if(edges[seed].used) continue;
      const points=[],first=edges[seed];let current=seed,guard=0,closed=false;
      while(current!==undefined&&!edges[current].used&&guard++<=edges.length+1){
        const edge=edges[current];edge.used=true;
        if(!points.length) points.push([edge.x1,edge.y1]);
        points.push([edge.x2,edge.y2]);
        if(edge.x2===first.x1&&edge.y2===first.y1){closed=true;break;}
        const candidates=(outgoing.get(key(edge.x2,edge.y2))||[]).filter(i=>!edges[i].used);
        if(!candidates.length) break;
        candidates.sort((a,b)=>{
          const da=(edges[a].dir-edge.dir+4)%4,db=(edges[b].dir-edge.dir+4)%4;
          return turnRank.indexOf(da)-turnRank.indexOf(db);
        });
        current=candidates[0];
      }
      if(!closed||points.length<4) continue;
      const simplified=[];
      for(let i=0;i<points.length-1;i++){
        const prev=points[(i-1+points.length-1)%(points.length-1)],cur=points[i],next=points[(i+1)%(points.length-1)];
        const cross=(cur[0]-prev[0])*(next[1]-cur[1])-(cur[1]-prev[1])*(next[0]-cur[0]);
        if(Math.abs(cross)>0) simplified.push(cur);
      }
      if(simplified.length<3) continue;
      paths.push("M"+simplified.map(p=>p[0]+" "+p[1]).join("L")+"Z");
    }
    return paths;
  }
  function runPaths(pixels,width,height,color){
    const paths=[];
    for(let y=0;y<height;y++){
      let x=0;
      while(x<width){
        if(pixels[y*width+x]!==color){x++;continue;}
        const start=x;
        while(x<width&&pixels[y*width+x]===color)x++;
        paths.push("M"+start+" "+y+"h"+(x-start)+"v1h-"+(x-start)+"Z");
      }
    }
    return paths;
  }
  function vectorize(pixels,width,height,options){
    if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>1048576) throw new RangeError("Artwork dimensions must be positive and within the one-megapixel vectorization limit.");
    if(!pixels||pixels.length!==width*height) throw new TypeError("Pixel buffer length does not match artwork dimensions.");
    const opts=options||{},mode=opts.mode==="runs"?"runs":"contours";
    const colors=[...new Set(pixels.filter(Boolean).map(safeColor))];
    const groups=colors.map(color=>{
      const paths=mode==="runs"?runPaths(pixels,width,height,color):contourPaths(pixels,width,height,color);
      return {color,paths};
    }).filter(group=>group.paths.length);
    const body=groups.map((group,i)=>'<path id="color-'+(i+1)+'" fill="'+group.color+'" fill-rule="evenodd" d="'+group.paths.join("")+'"/>').join("\n");
    const pathCount=groups.reduce((n,g)=>n+g.paths.length,0);
    const source='<?xml version="1.0" encoding="UTF-8"?>\n'+
      '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'" role="img" aria-labelledby="nu-title nu-desc">\n'+
      '<title id="nu-title">N.U Vector Artwork</title>\n'+
      '<desc id="nu-desc">Editable vector paths generated locally by N.U Pixel Art Studio.</desc>\n'+
      '<g shape-rendering="geometricPrecision">'+body+'</g>\n</svg>\n';
    return {source,pathCount,colorCount:groups.length,mode};
  }
  return {vectorize};
});
