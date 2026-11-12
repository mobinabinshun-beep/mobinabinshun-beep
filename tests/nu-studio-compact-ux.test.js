"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const js=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");
const html=fs.readFileSync(require.resolve("../pixel-art-studio.html"),"utf8");
test("main drawing tools are labeled and moved beside canvas",()=>{for(const n of ["Pencil","Eraser","Fill","Pick color","Line","Rectangle","Ellipse"])assert.ok(js.includes('"'+n+'"'));assert.match(js,/studio-quick-tools/);assert.match(js,/stage\.insertAdjacentElement\("afterend",d\)/);});
test("advanced controls are accessible tabs rather than a long list",()=>{for(const k of ["palette","layers","fill","transform","adjust","compose","export"])assert.ok(js.includes('data-tab="'+k+'"'));assert.match(js,/role="tablist"/);assert.match(js,/role="tabpanel"/);assert.match(js,/ArrowRight/);assert.match(js,/legacy\.open=false/);});
test("palette and brush are positioned next to the work surface",()=>{assert.match(js,/studio-brush/);assert.match(js,/panel-palette/);assert.match(js,/Extract active layer colors/);});
test("browser edition remains local-first",()=>assert.match(html,/Processing stays local in this browser/));
