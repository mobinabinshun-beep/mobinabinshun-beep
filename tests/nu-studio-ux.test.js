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


test("Magnifier is an accessible view-only tool with context-owned strength and size",()=>{
 assert.match(html,/data-tool="magnifier"[^>]*aria-label="Magnifier"/);
 assert.match(runtime,/magnifier:\{icon:"🔍",label:"Magnifier"\}/);
 assert.match(runtime,/magnifier:\["magnifier"\]/);
 assert.match(runtime,/magnifierField\.dataset\.contextOwner="magnifier"/);
 assert.match(runtime,/id="magnifier-strength"/);
 assert.match(runtime,/id="magnifier-size"/);
 assert.match(runtime,/lensCtx\.imageSmoothingEnabled=false/);
 assert.match(runtime,/function updateMagnifier\(e\)/);
 assert.match(runtime,/document\.addEventListener\("pointermove",e=>\{\s*if\(tool!=="magnifier"\)return;/);
 assert.match(runtime,/if\(e\.clientX>=r\.left&&e\.clientX<=r\.right&&e\.clientY>=r\.top&&e\.clientY<=r\.bottom\)updateMagnifier\(e\)/);
 assert.match(runtime,/function hideMagnifier\(\)/);
});
test("Desktop zoom buttons, slider and wheel share one anchored zoom state",()=>{
 assert.match(html,/id="zoom-in"/);
 assert.match(html,/id="zoom-out"/);
 assert.match(runtime,/function setZoom\(next,anchor,behavior="auto"\)/);
 assert.match(runtime,/anchorScrollDelta\(before,after,anchorX,anchorY\)/);
 assert.match(runtime,/pixelAnchorScrollDelta\(before,after,anchorX,anchorY,width,height\)/);
 assert.match(runtime,/pixelAnchorCorrection\(targetPixel,actualPixel,rect,width,height\)/);
 assert.match(runtime,/for\(let attempt=0;attempt<2;attempt\+\+\)/);
 assert.match(runtime,/function scrollFrame\(frame,left,top,behavior="auto"\)/);
 assert.match(runtime,/requestAnimationFrame\(\(\)=>\{frame\.style\.scrollBehavior=previous;\}\)/);
 assert.match(runtime,/canvas\.addEventListener\("wheel",e=>\{if\(!e\.ctrlKey\)return/);
 assert.match(runtime,/setZoom\(workspace\.zoom\+25,null,"smooth"\)/);
});

test("Compass is an accessible tool with a cancellable center-radius lifecycle",()=>{
 assert.match(html,/data-tool="compass"[^>]*aria-label="Compass"/);
 assert.match(runtime,/compass:\{icon:"🧭",label:"Compass"\}/);
 assert.match(runtime,/compassState=\{center:\{\.\.\.strokeStart\},edge:\{\.\.\.strokeStart\},active:true\}/);
 assert.match(runtime,/if\(tool==="compass"\)\{compassState=null;render\(\);\}/);
 assert.match(runtime,/if\(drawing&&tool==="compass"\)\{e\.preventDefault\(\);cancelStroke\(\);\}/);
});

test("Escape closes only the active workspace drawer controller",()=>{
 assert.match(runtime,/if\(mobileWorkspaceQuery\.matches\)\{\s*if\(document\.body\.classList\.contains\("nu-mobile-tools-open"\)\)setMobileToolsOpen\(false\);\s*return;\s*\}/);
 assert.match(runtime,/if\(document\.body\.classList\.contains\("nu-desktop-tools-open"\)\)setDesktopToolsOpen\(false\)/);
 assert.doesNotMatch(runtime,/setMobileToolsOpen\(false\);setDesktopToolsOpen\(false\)/);
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

test("Public demo exposes only the approved welcome intro and accessible progressive tool categories",()=>{
 assert.match(html,/id="studio-welcome"[^>]*>Welcome to N\.U — Public Test Demo</);
 assert.doesNotMatch(html,/TEST CANDIDATE|NOT HUMAN-APPROVED|DEMO QA ONLY|GEN 01|nu-studio-test-candidate/);
 assert.match(runtime,/id="studio-tool-categories"/);
 for(const category of ["draw","shapes","selection","effects","view"])assert.ok(runtime.includes('data-tool-category="'+category+'"'),category);
 assert.match(runtime,/activeToolCategory="draw"/);
 assert.match(runtime,/b\.hidden=b\.dataset\.category!==activeToolCategory/);
 assert.match(runtime,/selectedToolButton\?\.dataset\.category/);
 assert.match(runtime,/e\.key!=="ArrowRight"&&e\.key!=="ArrowLeft"/);
 assert.match(runtime,/role="tablist" aria-label="Tool categories"/);
});
