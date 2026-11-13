/* N.U Generation 1 material renderer — source SVGs remain unmodified. */
(function(){
  "use strict";
  const files=[
    "./assets/material/Mana-icon-in-the-game-N-U.svg",
    "./assets/material/Mana-icon-in-the-game-N-U%20(1).svg",
    "./assets/material/Mana-icon-in-the-game-N-U%20(2).svg",
    "./assets/material/Mana-icon-in-the-game-N-U%20(3).svg",
    "./assets/material/Mana-icon-in-the-game-N-U%20(4).svg"
  ];
  const sprites=files.map(src=>{
    if(typeof Image==="undefined")return null;
    const img=new Image();
    img.decoding="async";
    img.src=src;
    return img;
  });
  const bursts=[];
  function prefersReducedMotion(){return typeof window.matchMedia==="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;}
  function drawSprite(ctx,img,x,y,size,rotation,alpha){
    if(!img||!img.complete||!img.naturalWidth)return;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rotation);
    ctx.globalAlpha=alpha;
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(img,-size/2,-size/2,size,size);
    ctx.restore();
  }
  function drawMana(ctx,x,y,r,phase){
    const size=Math.max(18,Math.min(34,r*1.65));
    const orbit=r*.55;
    sprites.forEach((img,i)=>{
      const reduced=prefersReducedMotion();
      const angle=(reduced?0:phase*.32)+i*(Math.PI*2/5);
      const pulse=reduced ? 0.82 : 0.72+0.22*Math.sin(phase*1.7+i*1.3);
      drawSprite(ctx,img,x+Math.cos(angle)*orbit,y+Math.sin(angle)*orbit,size,angle+Math.PI/4,pulse);
    });
  }
  function emit(x,y){
    if(prefersReducedMotion())return;
    bursts.push({x,y,start:typeof performance!=="undefined"?performance.now():Date.now()});
    if(bursts.length>18)bursts.shift();
  }
  function drawEffects(ctx){
    const now=typeof performance!=="undefined"?performance.now():Date.now();
    for(let b=bursts.length-1;b>=0;b--){
      const burst=bursts[b],age=(now-burst.start)/460;
      if(age>=1){bursts.splice(b,1);continue;}
      sprites.forEach((img,i)=>{
        const angle=i*(Math.PI*2/5)-Math.PI/2;
        const distance=5+age*27;
        drawSprite(ctx,img,burst.x+Math.cos(angle)*distance,burst.y+Math.sin(angle)*distance,12+age*9,angle+age*.8,(1-age)*.9);
      });
    }
  }
  window.NUMaterials={drawMana,emit,drawEffects,assetCount:files.length};
})();
