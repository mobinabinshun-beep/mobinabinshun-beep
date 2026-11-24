const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const home=fs.readFileSync("index.html","utf8");
const page=fs.readFileSync("sim-pixel-demo.html","utf8");
const Engine=require("../sim-pixel-engine.js");

test("SIM PIXEL remains immediately after Painting in the Games menu",()=>{
 const painting='<a class="menu-item" href="./pixel-art-studio.html"><span>PAINTING</span><kbd>A</kbd></a>';
 const simPixel='<a class="menu-item" href="./sim-pixel-demo.html"><span>SIM PIXEL</span><kbd>SP</kbd></a>';
 assert.ok(home.includes(painting+"\n     "+simPixel));
});
test("the demo loads its isolated, testable movement engine",()=>{
 assert.ok(page.includes('<script src="./sim-pixel-engine.js"></script>'));
 assert.ok(page.includes("const Engine=window.SimPixelEngine"));
 assert.doesNotMatch(page,/nu-engine\.js|NUWallet|localStorage|sessionStorage/);
});
test("the six confirmed Pixels are solid one-metre square entities",()=>{
 for(const color of ["blue","green","yellow","orange","red","purple"])assert.ok(page.includes(color));
 assert.ok(page.includes('npcs=[{id:"npc1"'));
 assert.ok(page.includes("npc5"));
 assert.ok(page.includes("ctx.fillRect(q.x-q.k/2,q.y-q.k/2,q.k,q.k)"));
 assert.ok(page.includes("1 Pixel = 1 m²"));
});
test("all four confirmed movement speeds are executable engine values",()=>{
 assert.deepEqual(Engine.SPEED,{Chill:2,Normal:1,Hurry:5,Escape:25});
 for(const mode of Object.keys(Engine.SPEED))assert.ok(page.includes("data-mode=\""+mode+"\""));
});
test("direct diagonal movement preserves each axis speed without vector normalization",()=>{
 const next=Engine.moveDirect({x:0,y:0},{x:1,y:1},"Normal",1);
 assert.equal(next.x,1);assert.equal(next.y,1);
 assert.ok(Math.abs(Engine.distance({x:0,y:0},next)-Math.SQRT2)<1e-12);
});
test("destination movement is continuous and clamps each axis independently",()=>{
 assert.deepEqual(Engine.moveToward({x:0,y:0},{x:5,y:2},"Hurry",.5),{x:2.5,y:2});
 assert.deepEqual(Engine.moveToward({x:4,y:4},{x:4.2,y:4.1},"Escape",1),{x:4.2,y:4.1});
});
test("the city viewport uses the confirmed top-down view and ten bidirectional zoom levels",()=>{
 assert.ok(page.includes("Open city · Top-down"));
 assert.ok(page.includes("Zoom \"+s.zoom+\" / 10"));
 assert.ok(page.includes("Math.min(10,s.zoom+1)"));
 assert.ok(page.includes("Math.max(1,s.zoom-1)"));
 assert.ok(page.includes("ctx.arc(c.x,c.y,20*k"));
});
test("the start flow captures first name, last name and selected Pixel color",()=>{
 for(const id of ["first-name","last-name","pixel-color","start-free","start-tutorial"])assert.ok(page.includes(id));
});
test("tutorial overlay pauses simulation and offers visual step progression",()=>{
 assert.ok(page.includes("Tutorial freezes the world and all movement."));
 assert.ok(page.includes("tutorial-next"));assert.ok(page.includes("tutorial-skip"));
 assert.ok(page.includes('if(!$("tutorial").classList.contains("hidden"))'));
});
test("NPC proximity thresholds distinguish friendly pass from full crossing encounter",()=>{
 const crossingA={start:{x:0,y:0},end:{x:2,y:2}},crossingB={start:{x:0,y:2},end:{x:2,y:0}};
 assert.equal(Engine.classifyEncounter({x:0,y:0},{x:1.5,y:0},null,null),"friendly-pass");
 assert.equal(Engine.classifyEncounter({x:0,y:0},{x:.8,y:0},crossingA,crossingB),"full");
 assert.equal(Engine.classifyEncounter({x:0,y:0},{x:.8,y:0},crossingA,{start:{x:3,y:0},end:{x:3,y:3}}),"friendly-pass");
});
test("NPC encounter lock lasts until a two-metre free gap is reached",()=>{
 const registry=new Engine.EncounterRegistry();
 assert.equal(registry.start("a","b",100),true);
 assert.equal(registry.start("b","a",101),false);
 const active=registry.update("a","b",350,2.5);
 assert.equal(active.state,"interaction");assert.equal(active.phase,1);
 const released=registry.update("a","b",400,3);
 assert.equal(released.state,"released");
 assert.equal(registry.canStart("a","b"),true);
});
test("four encounter phases fit within the confirmed one-second pause",()=>{
 assert.deepEqual([0,249,250,499,500,749,750,999,1000].map(Engine.interactionPhase),[0,0,1,1,2,2,3,3,3]);
 const registry=new Engine.EncounterRegistry();registry.start("a","b",0);
 assert.equal(registry.update("a","b",999,2).complete,false);
 assert.equal(registry.update("a","b",1000,2).complete,true);
});
test("three-person groups wait, replace departing members and stop if no replacement exists",()=>{
 const group=new Engine.GroupEncounter(["a","b","c"]);
 assert.equal(group.enqueue("d"),true);
 assert.equal(group.enqueue("e"),true);
 assert.deepEqual(group.memberLeaves("b"),{state:"replaced",outgoing:"b",incoming:"d",active:["a","d","c"],waiting:["e"]});
 const ended=group.memberLeaves("a");
 assert.equal(ended.state,"replaced");
 const noReplacement=new Engine.GroupEncounter(["x","y","z"]);
 const stop=noReplacement.memberLeaves("z");
 assert.equal(stop.state,"ended");assert.deepEqual(stop.resume,["x","y"]);
});
test("the demo does not fake player-to-NPC collision behavior absent from the confirmed interaction rules",()=>{
 assert.doesNotMatch(page,/function encounters\(\)|player-"\+n\.id|s\.interaction/);
});
test("human test report is generated locally and explicitly not uploaded",()=>{
 assert.ok(page.includes("sim-pixel-human-test-report.json"));
 assert.ok(page.includes("nothing is uploaded"));
});


test("need thresholds are evaluated independently, with strict below-30 and below-10 rules",()=>{
 assert.deepEqual(Engine.evaluateNeeds({hunger:30,energy:65}),{survivalPressure:false,escapeForced:false,affectedNeeds:[],criticalNeeds:[]});
 assert.deepEqual(Engine.evaluateNeeds({hunger:29,energy:80}),{survivalPressure:true,escapeForced:false,affectedNeeds:["hunger"],criticalNeeds:[]});
 assert.deepEqual(Engine.evaluateNeeds({hunger:65,energy:9}),{survivalPressure:true,escapeForced:true,affectedNeeds:["energy"],criticalNeeds:["energy"]});
});
test("confirmed operation priority includes survival, hourly, daily, weekly, seasonal and annual",()=>{
 assert.deepEqual(Engine.PRIORITY,["survival","hourly","daily","weekly","seasonal","annual"]);
});
test("survival interruption respects the confirmed halfway rule; non-survival tasks remain player-interruptible",()=>{
 assert.deepEqual(Engine.playerCommandPolicy("survival",.49),{playerCommandFirst:true,finishCurrentSurvival:false,deferAutoPilot:true});
 assert.deepEqual(Engine.playerCommandPolicy("survival",.5),{playerCommandFirst:false,finishCurrentSurvival:true,deferAutoPilot:false});
 assert.deepEqual(Engine.playerCommandPolicy("daily",.99),{playerCommandFirst:true,finishCurrentSurvival:false,deferAutoPilot:false});
});
test("retry spacing follows the confirmed daily, weekly and seasonal slot counts",()=>{
 assert.equal(Engine.retryDelaySlots("daily"),1);
 assert.equal(Engine.retryDelaySlots("weekly"),3);
 assert.equal(Engine.retryDelaySlots("seasonal"),5);
 assert.equal(Engine.retryDelaySlots("annual"),null);
});
test("detailed NPC rendering is limited to the confirmed 20m player-centred radius",()=>{
 assert.equal(Engine.inDisplayZone({x:0,y:0},{x:20,y:0}),true);
 assert.equal(Engine.inDisplayZone({x:0,y:0},{x:20.01,y:0}),false);
});
test("late NPCs only enter Escape in the final five metres of the 20m zone crossing",()=>{
 assert.equal(Engine.npcScheduledExitMode(true,5),"Escape");
 assert.equal(Engine.npcScheduledExitMode(true,5.01),"Normal");
 assert.equal(Engine.npcScheduledExitMode(false,1),"Normal");
});
test("the confirmed street section totals ten metres in the required garden-sidewalk-road-sidewalk-garden order",()=>{
 const section=Engine.streetCrossSection();
 assert.deepEqual(section.map(x=>[x.kind,x.meters]),[["garden",2],["sidewalk",1],["road",4],["sidewalk",1],["garden",2]]);
 assert.equal(section.reduce((sum,x)=>sum+x.meters,0),10);
});
