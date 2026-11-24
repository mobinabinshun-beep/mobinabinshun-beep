(function(root) {
  "use strict";
  const DIRECTIONS = [
    [1,0,1],[-1,0,1],[0,1,1],[0,-1,1],
    [1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]
  ];
  function key(x,y){ return x + "," + y; }
  function findPath(start, goal, options) {
    options = options || {};
    const width = options.width || 20, height = options.height || 12;
    const blocked = new Set((options.blocked || []).map(p => key(p.x,p.y)));
    const occupied = new Set((options.occupied || []).map(p => key(Math.floor(p.x),Math.floor(p.y))));
    const sx=Math.floor(start.x), sy=Math.floor(start.y);
    const gx=Math.floor(goal.x), gy=Math.floor(goal.y);
    const inside=(x,y)=>x>=0&&y>=0&&x<width&&y<height;
    if(!inside(sx,sy)||!inside(gx,gy)||blocked.has(key(gx,gy))||occupied.has(key(gx,gy))) return null;
    const open=[{x:sx,y:sy,g:0,f:Math.abs(gx-sx)+Math.abs(gy-sy)}];
    const best=new Map([[key(sx,sy),0]]), parent=new Map(), closed=new Set();
    while(open.length){
      open.sort((a,b)=>a.f-b.f||a.g-b.g);
      const current=open.shift(), ck=key(current.x,current.y);
      if(closed.has(ck)) continue;
      if(current.x===gx&&current.y===gy){
        const path=[];let cursor=ck;
        while(cursor!==key(sx,sy)){const [x,y]=cursor.split(",").map(Number);path.push({x,y});cursor=parent.get(cursor);if(!cursor)return null;}
        return path.reverse();
      }
      closed.add(ck);
      for(const [dx,dy,cost] of DIRECTIONS){
        const x=current.x+dx,y=current.y+dy,k=key(x,y);
        if(!inside(x,y)||blocked.has(k)||occupied.has(k)||closed.has(k))continue;
        if(dx&&dy&&(blocked.has(key(current.x+dx,current.y))||blocked.has(key(current.x,current.y+dy))||occupied.has(key(current.x+dx,current.y))||occupied.has(key(current.x,current.y+dy))))continue;
        const g=current.g+cost;
        if(g>=(best.get(k)??Infinity))continue;
        best.set(k,g);parent.set(k,ck);
        const h=Math.max(Math.abs(gx-x),Math.abs(gy-y))+(Math.SQRT2-1)*Math.min(Math.abs(gx-x),Math.abs(gy-y));
        open.push({x,y,g,f:g+h});
      }
    }
    return null;
  }
  const api={findPath};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(root)root.SIMPIXEL=api;
})(typeof globalThis!=="undefined"?globalThis:this);
