"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const pages=["index.html","launcher.html","casino.html","pixel-art-studio.html"];
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");
const css=fs.readFileSync("nu-hex-gateway.css","utf8");

test("Every page mounting Gateway exposes only Back, Menu and Profile",()=>{
 for(const path of pages){
  const html=fs.readFileSync(path,"utf8");
  const start=html.indexOf('<nav id="nu-hex-gateway"');
  const end=html.indexOf("</nav>",start);
  assert.ok(start>=0&&end>start,path+" must mount Gateway");
  const actions=[...html.slice(start,end).matchAll(/data-action="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(actions,["back","menu","profile"],path+" must expose only the shared command set");
 }
});

test("Non-game pages initialize Gateway without requiring a game-view element",()=>{
 assert.match(gateway,/if\(!root\|\|!scrim\)return/);
 assert.match(gateway,/const pageActive=!gameView/);
 assert.match(gateway,/window\.location\.href="\.\/index\.html\?view=menu"/);
 assert.match(gateway,/window\.location\.href="\.\/index\.html\?view=profile"/);
 assert.match(gateway,/if\(initialView==="menu"\)/);
 assert.match(css,/body\.nu-gateway-page-active #nu-hex-gateway/);
});

test("Simulated pointer selection cannot recursively reposition itself",()=>{
 assert.match(gateway,/Math\.abs\(pos\.x-x\)>.5\|\|Math\.abs\(pos\.y-y\)>.5/);
});
