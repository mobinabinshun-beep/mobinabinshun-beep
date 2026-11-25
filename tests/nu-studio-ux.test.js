"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync(require.resolve("../pixel-art-studio.html"),"utf8");
const runtime=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");

test("Studio product copy is English-only in the page and runtime UI",()=>{
 const persian=/[\u0600-\u06FF]/;
 assert.doesNotMatch(html,persian,"Static Studio page contains Persian UI copy");
 assert.doesNotMatch(runtime,persian,"Dynamic Studio UI contains Persian copy");
});

test("Every static drawing tool has a descriptive English accessible name and title",()=>{
 const buttons=html.match(/<button\b(?=[^>]*\bdata-tool=)[^>]*>/g)||[];
 assert.ok(buttons.length>=15,"Expected the complete static drawing tool set");
 for(const button of buttons){
  assert.match(button,/\baria-label="[A-Za-z][^"]*"/,button);
  assert.match(button,/\btitle="[A-Za-z][^"]*"/,button);
 }
});

test("Generated quick tools use English labels and hide decorative icons",()=>{
 assert.match(runtime,/names=\{pencil:\{icon:"✏️",label:"Pencil"/);
 assert.match(runtime,/label:"Eyedropper"/);
 assert.match(runtime,/label:"Color-mixing brush"/);
 assert.match(runtime,/b\.setAttribute\("aria-label",n\.label/);
 assert.match(runtime,/b\.innerHTML='<span class="tool-icon" aria-hidden="true">/);
 assert.match(runtime,/fadeButton\.setAttribute\("aria-label","Fading brush"\)/);
 assert.match(runtime,/mixButton\.setAttribute\("aria-label","Color-mixing brush"\)/);
});

test("Dynamic dock tabs, layer controls and guidance use English labels",()=>{
 for(const label of ["Quick tools","Canvas tools","Color","Layers","Fill","Transform","Adjust","Compose","Advanced","Export","Select all","Invert selection","Non-destructive layer mask","Layer group management","Assign layer to group"]){
  assert.ok(runtime.includes(label),label);
 }
 assert.match(runtime,/vis\.setAttribute\("aria-label","Show "\+l\.name\)/);
 assert.match(runtime,/lock\.setAttribute\("aria-label","Lock "\+l\.name\)/);
 assert.match(runtime,/Opacity · /);
 assert.match(runtime,/pick\.setAttribute\("aria-label","Select Layer "\+\(i\+1\)\)/);
});


test("active-tool context panel owns and reveals only relevant existing settings",()=>{
 assert.match(runtime,/contextTitle\.id="studio-context-title"/);
 assert.match(runtime,/toolContextRefresh=\(\)=>/);
 for(const contract of [
  'moveContextField("adv-symmetry","paint")',
  'moveContextField("adv-bucket","fill")',
  'moveContextField("adv-tol","fill")',
  'moveContextField("pro-gradient-color","gradient")',
  'moveContextField("pro-gradient-mode","gradient")',
  'moveContextField("pro-texture","texture")',
  'moveContextField("pro-texture-density","texture")',
  'moveContextField("pro-curve","bezier")'
 ]) assert.ok(runtime.includes(contract),contract);
 assert.match(runtime,/contextOwners=\{[\s\S]*?fill:\["fill"\]/);
 assert.match(runtime,/node\.hidden=!owners\.includes\(node\.dataset\.contextOwner\)/);
 assert.match(runtime,/contextPanel\.dataset\.activeTool=tool/);
});


test("Compass is an accessible tool with a cancellable center-radius lifecycle",()=>{
 assert.match(html,/data-tool="compass"[^>]*aria-label="Compass"/);
 assert.match(runtime,/compass:\{icon:"⊙",label:"Compass"\}/);
 assert.match(runtime,/compassState=\{center:\{\.\.\.strokeStart\},edge:\{\.\.\.strokeStart\},active:true\}/);
 assert.match(runtime,/if\(tool==="compass"\)\{compassState=null;render\(\);\}/);
 assert.match(runtime,/e\.key==="Escape"&&drawing&&tool==="compass"/);
});

test("Blueprint and Compass guides use adaptive high-contrast render overlays",()=>{
 assert.match(runtime,/guideHighContrast=true/);
 assert.match(runtime,/const screenScale=Math\.max/);
 assert.match(runtime,/strokeGuide/);
 assert.match(runtime,/data-guide-contrast checked/);
 assert.match(runtime,/Object\.values\(guideState\)\.some\(Boolean\)\|\|compassState\?\.active/);
 assert.match(runtime,/function rasterSvgSource\(\)[\s\S]*?toRgba\(pixels,width,height\)/);
 assert.match(runtime,/function graphicIRSource\(\)[\s\S]*?const visible=composite\(\)/);
});

test("English download and Fill feedback remains wired",()=>{
 for(const phrase of ["The file is ready.","PNG ready · ","SVG ready · ","SVG source code is ready to download.","Layer is locked. Unlock it to use Fill.","This area already uses the selected color."]){
  assert.ok(runtime.includes(phrase),phrase);
 }
});
