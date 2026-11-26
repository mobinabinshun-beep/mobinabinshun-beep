"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const js=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");
const html=fs.readFileSync(require.resolve("../pixel-art-studio.html"),"utf8");
test("main drawing tools have English labels and remain grouped inside the collapsible drawer",()=>{for(const n of ["Pencil","Eraser","Fill","Eyedropper","Line","Rectangle","Ellipse","Compass","Magnifier"])assert.ok(js.includes('label:"'+n+'"')||js.includes('aria-label="'+n+'"'));assert.match(html,/data-tool="compass"/);assert.match(js,/studio-quick-tools/);assert.match(js,/drawer\.prepend\(d\)/);assert.match(js,/studio-properties-panel/);});
test("advanced controls are accessible tabs rather than a long list",()=>{for(const k of ["palette","layers","fill","transform","adjust","compose","pro","export"])assert.ok(js.includes('data-tab="'+k+'"'));assert.match(js,/role="tablist"/);assert.match(js,/role="tabpanel"/);assert.match(js,/ArrowRight/);assert.match(js,/legacy\.open=false/);});
test("palette and context-owned tool settings remain grouped in the drawer dock",()=>{assert.match(js,/studio-brush/);assert.match(js,/studio-context-title/);assert.match(js,/contextOwners=/);assert.match(js,/panel-palette/);assert.match(js,/Extract active layer colors/);assert.match(js,/studio-properties-content/);});
test("browser edition remains local-first",()=>assert.match(html,/Processing stays local in this browser/));
test("quick tools and layers expose clear English labels and accessible names",()=>{for(const label of ["Pencil","Eraser","Fill","Eyedropper","Layers","Opacity","Visible","Locked"])assert.ok(js.includes(label));assert.match(js,/aria-label/);assert.doesNotMatch(js,/[\u0600-\u06FF]/);});

test("quick tools are progressively disclosed by five accessible categories",()=>{
 for(const category of ["draw","shapes","selection","effects","view"])assert.ok(js.includes('data-tool-category="'+category+'"'));
 assert.match(js,/grid-template-columns:repeat\(auto-fit,minmax\(74px,1fr\)\)/);
 assert.match(js,/toolCategoryRefresh=/);
 assert.match(js,/b\.hidden=b\.dataset\.category!==activeToolCategory/);
});
test("public demo welcome is clean and excludes internal QA/build labels",()=>{
 assert.match(html,/Welcome to N\.U — Public Test Demo/);
 assert.doesNotMatch(html,/TEST CANDIDATE|NOT HUMAN-APPROVED|DEMO QA ONLY|GEN 01/);
});
