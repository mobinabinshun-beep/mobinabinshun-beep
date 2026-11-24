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


  // Deterministic, explicit-goal multi-agent movement. One grid edge is one simulation tick.
  // Real-time speed integration and NPC schedules remain separate, documented follow-up work.
  function createMultiAgentSimulation(options) {
    options=options||{};
    const width=options.width||20,height=options.height||12;
    const blocked=(options.blocked||[]).map(p=>({x:p.x,y:p.y}));
    const agents=new Map(),routes=new Map(),reservations=createReservationTable();
    let tick=0;
    const validPoint=p=>p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.y>=0&&p.x<width&&p.y<height;
    for(const input of (options.agents||[])){
      if(!input||typeof input.id!=="string"||!input.id||!validPoint(input.position)||agents.has(input.id)||blocked.some(p=>p.x===input.position.x&&p.y===input.position.y))throw new TypeError("Invalid or duplicate agent");
      agents.set(input.id,{id:input.id,x:input.position.x,y:input.position.y});
      routes.set(input.id,[]);
    }
    function snapshot(){
      return {tick,agents:[...agents.values()].map(a=>({id:a.id,x:a.x,y:a.y,goal:routes.get(a.id).goal?{...routes.get(a.id).goal}:null,path:routes.get(a.id).path.map(p=>({...p}))}))};
    }
    function plan(agentId,goal){
      const agent=agents.get(agentId);
      if(!agent||!validPoint(goal)||blocked.some(p=>p.x===goal.x&&p.y===goal.y))return false;
      const occupied=[...agents.values()].filter(a=>a.id!==agentId).map(a=>({x:a.x,y:a.y}));
      const path=findPath(agent,goal,{width,height,blocked,occupied});
      if(path===null)return false;
      if(!reservations.reservePath(agentId,{x:agent.x,y:agent.y},path,{startTick:tick}))return false;
      routes.set(agentId,{goal:{x:goal.x,y:goal.y},path:path.map(p=>({...p}))});
      return true;
    }
    function step(){
      tick++;
      for(const [id,route] of routes){
        if(!route.path.length)continue;
        const next=route.path[0];
        const agent=agents.get(id);
        agent.x=next.x;agent.y=next.y;
        route.path.shift();
        if(!route.path.length)route.goal=null;
      }
      return snapshot();
    }
    return Object.freeze({plan,step,snapshot});
  }

  const api={findPath,createReservationTable,createMultiAgentSimulation};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(root)root.SIMPIXEL=api;
})(typeof globalThis!=="undefined"?globalThis:this);
