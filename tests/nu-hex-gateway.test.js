"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const read=name=>fs.readFileSync(name,"utf8");
const html=read("index.html"),casino=read("casino.html"),launcher=read("launcher.html"),studio=read("pixel-art-studio.html");
const js=read("nu-hex-gateway.js"),css=read("nu-hex-gateway.css"),worldCss=read("nu-world.css");
const games=read("nu-games.js"),playerUI=read("nu-player-ui.js"),graphics=read("nu-graphics-runtime.js"),exchange=read("nu-exchange.js"),dynamic=read("nu-dynamic-layers.js");

test("Gateway controller is scoped only to active main-game view",()=>{
 assert.match(html,/id="nu-hex-gateway"/);
 assert.match(js,/if\(!root\|\|!scrim\|\|!gameView\)return/);
 assert.match(js,/classList\.toggle\("nu-game-active",active\)/);
 assert.match(css,/body\.nu-game-active #nu-hex-gateway/);
 assert.match(css,/body\.nu-game-active #menu-open/);
 assert.match(css,/body\.nu-game-active #back-home/);
 for(const page of [casino,launcher,studio])assert.match(page,/id="nu-hex-gateway"/);
});

test("Gateway exposes exactly Back, Menu and Profile as one-click actions",()=>{
 for(const action of ["back","menu","profile"]){assert.match(html,new RegExp('data-action="'+action+'"'));assert.match(js,new RegExp(action+":"));}
 assert.doesNotMatch(html,/data-action="(settings|store|wallet|exchange|casino|studio|library)"/);
 assert.doesNotMatch(js,/settings:/);
 assert.match(js,/activate\(item\)/);
 assert.doesNotMatch(js,/clickArmed|hoverTimer|two-step|confirm\(item\)/);
});

test("Opening Gateway freezes the game and all ambient renderers until a decision",()=>{
 assert.match(js,/nu:gateway-open/);assert.match(js,/nu:gateway-close/);
 assert.match(games,/state\.engine\[shouldFreeze\?"pause":"resume"\]/);
 assert.match(games,/setFrozen\(shouldFreeze\)/);
 assert.match(games,/setEnabled\(!shouldFreeze/);
 assert.match(games,/NUBackgroundEngine\.setFrozen/);
 assert.match(games,/NUDynamicLayers\.setFrozen/);
 assert.match(games,/NUPixelWorld\.setEnabled/);
 assert.match(graphics,/nu-gateway-open/);
 assert.match(graphics,/NUDynamicLayers&&g\.NUDynamicLayers\.setFrozen/);
 assert.match(js,/setOpen\(false,false\)/);
 assert.match(js,/nu:menu-dismissed/);
 assert.match(js,/nu:player-overlay-close/);
});

test("Menu is a centered, concise module directory with player modules before games",()=>{
 const items=html.slice(html.indexOf('<div class="menu-backdrop"'),html.indexOf('<div class="intro"'));
 const order=["menu-store","menu-profile","./exchange.html","menu-bag","./pixel-art-studio.html","menu-random","menu-bubble","menu-mana","menu-chaos"].map(x=>items.indexOf(x));
 assert.ok(order.every(x=>x>=0));
 assert.deepEqual(order.slice().sort((a,b)=>a-b),order);
 assert.match(items,/N\.U MENU/);
 assert.match(items,/<kbd>S<\/kbd>/);
 assert.match(items,/<kbd>P<\/kbd>/);
 assert.match(items,/<kbd>E<\/kbd>/);
 assert.match(items,/<kbd>G<\/kbd>/);
 assert.doesNotMatch(items,/<small>|Choose a destination|System profile|Original source/);
 assert.match(worldCss,/\.menu-panel\{width:min\(390px,100%\)/);
});


test("Bag provides Inventory and Wallet destinations with shared shortcuts",()=>{
 assert.match(html,/id="bag-view"/);
 assert.match(html,/id="inventory-view"/);
 assert.match(html,/id="menu-bag"/);
 assert.match(html,/data-bag-destination="inventory"/);
 assert.match(html,/data-bag-destination="wallet"/);
 assert.match(html,/data-wallet-tab="mana"/);
 assert.match(js,/nu-gateway-utility-active/);
 assert.match(css,/nu-gateway-utility-active #nu-hex-gateway/);
});

test("Painting leads the game list and Random Game selects only the three core prototypes",()=>{
 assert.ok(html.indexOf("./pixel-art-studio.html")<html.indexOf('id="menu-random"'));
 assert.ok(html.indexOf('id="menu-random"')<html.indexOf('id="menu-bubble"'));
 assert.match(games,/function chooseGame\(id\)/);
 assert.match(games,/id\|\|games\[Math\.floor\(Math\.random\(\)\*games\.length\)\]\.id/);
 assert.match(games,/data-random-game/);
 assert.doesNotMatch(html,/id="start-random"/);
});

test("Gateway blur and animation pause stay limited to decorative background layers",()=>{
 assert.match(css,/body\.nu-gateway-open \.world>\.sky/);
 assert.match(css,/filter:blur\(2\.5px\)/);
 assert.match(css,/backdrop-filter:none/);
 assert.doesNotMatch(css,/body\.nu-gateway-open \.world,body\.nu-gateway-open/);
 assert.doesNotMatch(css,/body\.nu-gateway-open \.world \*/);
});

test("Gateway keeps responsive geometry, touch, keyboard and reduced-motion support",()=>{
 assert.match(css,/position:fixed/);assert.match(css,/prefers-reduced-motion/);
 assert.match(js,/function layoutItems\(\)/);
 assert.match(js,/window\.addEventListener\("resize",layoutItems/);
 assert.match(js,/window\.addEventListener\("orientationchange",layoutItems/);
 assert.match(js,/pointerType!=="touch"/);
 assert.match(js,/event\.key==="Escape"/);
 assert.match(js,/const tolerance=10/);
});

test("Gateway replaces the duplicate gameplay pause control and hides legacy navigation in-game",()=>{
 assert.match(html,/id="menu-open"/);assert.match(html,/id="back-home"/);
 assert.doesNotMatch(html,/id="finish-round"/);
 assert.match(css,/body\.nu-game-active #menu-open/);
 assert.match(css,/body\.nu-game-active #back-home/);
 assert.match(games,/window\.addEventListener\("nu:gateway-open"/);
 assert.match(games,/window\.addEventListener\("nu:gateway-close"/);
});

test("No unsupported shield meter is introduced",()=>assert.doesNotMatch(html,/id="nbi-shield-bar"/));

test("Gateway orbit exit bounds include the full vertical fan",()=>{
 assert.match(js,/event\.clientY>=rect\.top-orbit-tolerance&&event\.clientY<=rect\.bottom\+orbit\+tolerance/);
});

test("A hidden tab cannot restart frozen game or ambient renderers",()=>{
 assert.match(games,/gatewayOpen=document\.body\.classList\.contains\("nu-gateway-open"\)/);
 assert.match(dynamic,/function resume\(\)\{if\(!profile\|\|!active\|\|frozen\|\|document\.hidden\)return/);
});


test("Main menu traps keyboard focus and restores its opener",()=>{
 assert.match(games,/function openMenu\(\)/);
 assert.match(games,/menuRoot\.addEventListener\("keydown"/);
 assert.match(games,/focusable\[focusable\.length-1\]/);
 assert.match(games,/menuReturnFocus/);
 assert.match(games,/restoreMenuFocus\(\)/);
});

test("Player views manage focus, wallet tabs support arrow navigation, and Enter does not dismiss profile",()=>{
 assert.match(playerUI,/const viewStack=\[\]/);
 assert.match(playerUI,/viewStack\.push\(\{view:activeView,focus:document\.activeElement\}\)/);
 assert.match(playerUI,/const previous=viewStack\.pop\(\)/);
 assert.match(playerUI,/heading\.focus\(\{preventScroll:true\}\)/);
 assert.match(playerUI,/event\.key==="Escape"&&profileView\.classList\.contains\("active"\)/);
 assert.doesNotMatch(playerUI,/event\.key==="Enter"&&profileView\.classList\.contains\("active"\)/);
 assert.match(playerUI,/ArrowLeft/);assert.match(playerUI,/ArrowRight/);assert.match(playerUI,/event\.key==="Home"/);assert.match(playerUI,/event\.key==="End"/);
});

test("Gateway focus loop wraps in both directions and Escape restores the trigger",()=>{
 assert.match(js,/event\.key==="Escape"\)\{event\.preventDefault\(\);setOpen\(false\);trigger\.focus/);
 assert.match(js,/event\.shiftKey&&document\.activeElement===first/);
 assert.match(js,/!event\.shiftKey&&document\.activeElement===last/);
 assert.match(css,/#nu-hex-gateway button:focus-visible/);
});
