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
    const initialDx=Math.abs(gx-sx), initialDy=Math.abs(gy-sy);
    const initialH=Math.max(initialDx,initialDy)+(Math.SQRT2-1)*Math.min(initialDx,initialDy);
    const open=[{x:sx,y:sy,g:0,f:initialH}];
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

  function createReservationTable() {
    const vertices=new Map(), edges=new Map(), diagonals=new Map();
    const cell=(p)=>key(p.x,p.y);
    const edge=(from,to)=>cell(from)+">"+cell(to);
    const diagonal=(from,to)=>{
      if(from.x===to.x||from.y===to.y)return null;
      return Math.min(from.x,to.x)+","+Math.min(from.y,to.y);
    };
    const validPoint=p=>p&&Number.isInteger(p.x)&&Number.isInteger(p.y);
    function canReserve(agentId,start,path,options) {
      options=options||{};
      const startTick=options.startTick??0;
      if(typeof agentId!=="string"||!agentId||!validPoint(start)||!Array.isArray(path)||!Number.isInteger(startTick)||startTick<0)return false;
      let previous=start;
      const points=[start,...path];
      for(let i=0;i<points.length;i++){
        const current=points[i],tick=startTick+i;
        if(!validPoint(current))return false;
        const vertexOwner=vertices.get(tick+"|"+cell(current));
        if(vertexOwner&&vertexOwner!==agentId)return false;
        if(i===0)continue;
        const previousPoint=points[i-1],forward=edge(previousPoint,current),reverse=edge(current,previousPoint);
        const edgeOwner=edges.get(tick+"|"+forward),reverseOwner=edges.get(tick+"|"+reverse);
        if((edgeOwner&&edgeOwner!==agentId)||(reverseOwner&&reverseOwner!==agentId))return false;
        const square=diagonal(previousPoint,current);
        if(square){
          const orientation=(current.x-previousPoint.x)===(current.y-previousPoint.y)?"\\\\":"/";
          const diagonalOwner=diagonals.get(tick+"|"+square);
          if(diagonalOwner&&diagonalOwner.agentId!==agentId&&diagonalOwner.orientation!==orientation)return false;
        }
        previous=current;
      }
      return true;
    }
    function release(agentId,fromTick) {
      fromTick=fromTick??0;
      let removed=0;
      for(const [k,v] of vertices)if(v===agentId&&Number(k.split("|",1)[0])>=fromTick){vertices.delete(k);removed++;}
      for(const [k,v] of edges)if(v===agentId&&Number(k.split("|",1)[0])>=fromTick){edges.delete(k);removed++;}
      for(const [k,v] of diagonals)if(v.agentId===agentId&&Number(k.split("|",1)[0])>=fromTick){diagonals.delete(k);removed++;}
      return removed;
    }
    function reservePath(agentId,start,path,options) {
      options=options||{};
      const startTick=options.startTick??0;
      if(!canReserve(agentId,start,path,options))return false;
      release(agentId,startTick);
      const points=[start,...path];
      for(let i=0;i<points.length;i++){
        const current=points[i],tick=startTick+i;
        vertices.set(tick+"|"+cell(current),agentId);
        if(i===0)continue;
        const previous=points[i-1];
        edges.set(tick+"|"+edge(previous,current),agentId);
        const square=diagonal(previous,current);
        if(square){
          const orientation=(current.x-previous.x)===(current.y-previous.y)?"\\\\":"/";
          diagonals.set(tick+"|"+square,{agentId,orientation});
        }
      }
      return true;
    }
    return Object.freeze({canReserve,reservePath,release});
  }

  const api={findPath,createReservationTable};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(root)root.SIMPIXEL=api;
})(typeof globalThis!=="undefined"?globalThis:this);
