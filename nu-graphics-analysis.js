/* N.U Graphics Analysis / GFX-IR v1 — inspectable raster structure, not GPU machine code. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.NUGraphicsAnalysis=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function validate(pixels,width,height){
    if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>262144)throw new RangeError("Image dimensions must be positive and within the 262144-pixel analysis budget.");
    if(!pixels||pixels.length!==width*height)throw new TypeError("Pixel buffer length does not match image dimensions.");
    for(const color of pixels)if(color!==null&&color!==undefined&&!/^#[0-9a-f]{6}$/i.test(color))throw new TypeError("Pixels must be null or six-digit hexadecimal colors.");
  }
  function analyze(pixels,width,height,options){
    validate(pixels,width,height);
    const tileSize=Math.max(4,Math.min(64,Math.floor(Number(options&&options.tileSize)||8)));
    const palette=[],paletteIndex=new Map();
    for(const color of pixels)if(color&&!paletteIndex.has(color)){paletteIndex.set(color,palette.length+1);palette.push(color);}
    const indexMap=pixels.map(color=>color?paletteIndex.get(color):0);
    const rowRuns=[],edgeMap=new Array(width*height).fill(0);
    let edgePixels=0;
    for(let y=0;y<height;y++){
      let x=0;
      while(x<width){
        const value=indexMap[y*width+x];
        if(!value){x++;continue;}
        const start=x;
        while(x<width&&indexMap[y*width+x]===value)x++;
        rowRuns.push({y,x:start,length:x-start,paletteIndex:value});
      }
      for(let px=0;px<width;px++){
        const i=y*width+px,v=indexMap[i];
        if(!v)continue;
        const edge=(px===0||indexMap[i-1]!==v||px===width-1||indexMap[i+1]!==v||y===0||indexMap[i-width]!==v||y===height-1||indexMap[i+width]!==v);
        if(edge){edgeMap[i]=1;edgePixels++;}
      }
    }
    const tiles=[];
    for(let ty=0;ty<height;ty+=tileSize)for(let tx=0;tx<width;tx+=tileSize){
      const tw=Math.min(tileSize,width-tx),th=Math.min(tileSize,height-ty),runs=[];
      for(let y=0;y<th;y++){
        let x=0;
        while(x<tw){
          const value=indexMap[(ty+y)*width+tx+x];
          if(!value){x++;continue;}
          const start=x;while(x<tw&&indexMap[(ty+y)*width+tx+x]===value)x++;
          runs.push({y,x:start,length:x-start,paletteIndex:value});
        }
      }
      if(runs.length)tiles.push({x:tx,y:ty,width:tw,height:th,runs});
    }
    const visited=new Uint8Array(width*height),regions=[];
    for(let i=0;i<indexMap.length;i++){
      const value=indexMap[i];if(!value||visited[i])continue;
      const queue=[i];visited[i]=1;let head=0,minX=width,minY=height,maxX=0,maxY=0,count=0;
      while(head<queue.length){
        const at=queue[head++],x=at%width,y=Math.floor(at/width);count++;
        if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
        const neighbors=[x>0?at-1:-1,x+1<width?at+1:-1,y>0?at-width:-1,y+1<height?at+width:-1];
        for(const next of neighbors)if(next>=0&&!visited[next]&&indexMap[next]===value){visited[next]=1;queue.push(next);}
      }
      regions.push({paletteIndex:value,pixels:count,bounds:{x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1}});
    }
    const paintedPixels=indexMap.reduce((n,v)=>n+(v?1:0),0);
    const instructions=[
      {op:"set-palette",colors:palette},
      {op:"upload-index-map",format:"uint16-row-major",width,height,data:indexMap},
      {op:"draw-runs",count:rowRuns.length,runs:rowRuns}
    ];
    return {
      format:"NU-GFX-IR/1",source:"local-raster-analysis",
      dimensions:{width,height},tileSize,palette,indexMap,tiles,rowRuns,edgeMap,
      regions,metrics:{paintedPixels,colorCount:palette.length,edgePixels,regionCount:regions.length,tileCount:tiles.length,runCount:rowRuns.length},
      instructions
    };
  }
  function createHumanReport(analysis,metadata){
    if(!analysis||analysis.format!=="NU-GFX-IR/1"||!analysis.metrics||!analysis.dimensions)throw new TypeError("A valid N.U graphics analysis is required.");
    const m=analysis.metrics,d=analysis.dimensions,meta=metadata||{},name=String(meta.name||"Untitled artwork").replace(/[\r\n]+/g," ").slice(0,120);
    const lines=[
      "# N.U Human Image Report",
      "",
      "## Artwork",
      "- Name: "+name,
      "- Dimensions: "+d.width+" × "+d.height+" pixels",
      "- Painted pixels: "+m.paintedPixels.toLocaleString(),
      "- Transparent pixels: "+(d.width*d.height-m.paintedPixels).toLocaleString(),
      "- Colors used: "+m.colorCount,
      "- Connected regions: "+m.regionCount,
      "- Edge pixels: "+m.edgePixels.toLocaleString(),
      "- Tiles: "+m.tileCount,
      "- Horizontal runs: "+m.runCount,
      "",
      "## Plain-language reading",
      m.paintedPixels===0?"The canvas is empty or fully transparent.":"The artwork contains "+m.paintedPixels.toLocaleString()+" painted pixels across "+m.colorCount+" colors and "+m.regionCount+" connected regions.",
      "",
      "## خلاصه انسانی",
      m.paintedPixels===0?"بوم تصویر خالی یا کاملاً شفاف است.":"این تصویر "+d.width+" در "+d.height+" پیکسل اندازه دارد و از "+m.paintedPixels.toLocaleString()+" پیکسل رنگ‌شده، "+m.colorCount+" رنگ و "+m.regionCount+" بخش پیوسته تشکیل شده است.",
      "تعداد پیکسل‌های شفاف: "+(d.width*d.height-m.paintedPixels).toLocaleString(),
      m.regionCount===1?"The visible artwork forms one connected region.":m.regionCount>1?"The visible artwork is split into "+m.regionCount+" separate connected regions.":"No visible connected region was detected.",
      "",
      "## Palette"
    ];
    if(analysis.palette.length)analysis.palette.forEach((color,i)=>lines.push((i+1)+". "+color));else lines.push("No visible colors.");
    lines.push("","## Largest connected regions");
    const largest=(analysis.regions||[]).slice().sort((a,b)=>b.pixels-a.pixels).slice(0,20);
    if(largest.length)largest.forEach((r,i)=>lines.push((i+1)+". "+r.pixels.toLocaleString()+" pixels · palette color "+r.paletteIndex+" · bounds x="+r.bounds.x+", y="+r.bounds.y+", width="+r.bounds.width+", height="+r.bounds.height));
    else lines.push("No regions detected.");
    lines.push("","## Export notes","- This report describes the visible composite artwork at export time.","- Transparent pixels are counted separately and are not treated as a color.","- Region counts use four-direction pixel connectivity.","- Analysis is performed locally in the browser; the source image is not uploaded.","","Generated by N.U Creative Studio · NU-GFX-IR/1");
    return lines.join("\n");
  }
  return {analyze,createHumanReport};
});
