"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const js=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");
const html=fs.readFileSync(require.resolve("../pixel-art-studio.html"),"utf8");
test("main drawing tools have English labels and remain grouped inside the collapsible drawer",()=>{for(const n of ["Pencil","Eraser","Fill","Eyedropper","Line","Rectangle","Ellipse"])assert.ok(js.includes('label:"'+n+'"'));assert.match(js,/studio-quick-tools/);assert.match(js,/drawer\.append\(d\)/);assert.match(js,/studio-properties-panel/);});
test("advanced controls are accessible tabs rather than a long list",()=>{for(const k of ["palette","layers","fill","transform","adjust","compose","pro","export"])assert.ok(js.includes('data-tab="'+k+'"'));assert.match(js,/role="tablist"/);assert.match(js,/role="tabpanel"/);assert.match(js,/ArrowRight/);assert.match(js,/legacy\.open=false/);});
test("palette and brush remain grouped in the drawer dock",()=>{assert.match(js,/studio-brush/);assert.match(js,/panel-palette/);assert.match(js,/Extract active layer colors/);assert.match(js,/studio-properties-content/);});
test("browser edition remains local-first",()=>assert.match(html,/Processing stays local in this browser/));
test("quick tools and layers expose clear English labels and accessible names",()=>{for(const label of ["Pencil","Eraser","Fill","Eyedropper","Layers","Opacity","Visible","Locked"])assert.ok(js.includes(label));assert.match(js,/aria-label/);assert.doesNotMatch(js,/[\\u0600-\\u06FF]/);});
