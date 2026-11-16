"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync("launcher.html","utf8");
const main=fs.readFileSync("index.html","utf8");
const launcher=fs.readFileSync("nu-launcher.js","utf8");
const motion=fs.readFileSync("nu-motion.js","utf8");
const games=fs.readFileSync("nu-games.js","utf8");
const css=fs.readFileSync("nu-launcher.css","utf8");

test("Launcher exposes ten accessible Reduced Motion levels",()=>{
 assert.match(html,/REDUCED MOTION · 10 COMFORT LEVELS/);
 for(let n=1;n<=10;n++)assert.match(html,new RegExp('data-motion-level="'+n+'"'));
 assert.match(html,/aria-pressed="true"/);
 assert.match(html,/aria-live="polite"/);
});

test("Reduced Motion preference is shared by launcher and main demo",()=>{
 assert.match(html,/nu-motion\.js/);
 assert.match(main,/nu-motion\.js/);
 assert.match(motion,/nu-motion-level-v1/);
 assert.match(motion,/localStorage\.setItem/);
 assert.match(launcher,/function selectMotionLevel/);
 assert.match(launcher,/window\.NUMotion\?\.setLevel/);
});

test("Level one minimizes decorative motion and gameplay logic remains separate",()=>{
 assert.match(motion,/nu-motion-minimal/);
 assert.match(motion,/animation:none!important/);
 assert.match(motion,/transition:none!important/);
 assert.match(motion,/scroll-behavior:auto!important/);
 assert.match(games,/window\.NUMotion&&window\.NUMotion\.isReduced\(\)/);
 assert.match(motion,/isReduced:\(\)=>read\(\)<=3/);
});

test("Motion selector is responsive and has visible keyboard focus",()=>{
 assert.match(css,/\.motion-level-grid/);
 assert.match(css,/\.motion-level:focus-visible/);
 assert.match(css,/@media\(max-width:620px\)/);
});
