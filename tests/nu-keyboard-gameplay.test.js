"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync("index.html","utf8");
const games=fs.readFileSync("nu-games.js","utf8");
const css=fs.readFileSync("nu-world.css","utf8");

test("game field is keyboard focusable and exposes its keyboard instructions",()=>{
  assert.match(html,/<canvas id="game-canvas" tabindex="0" role="group"/);
  assert.match(html,/aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space"/);
  assert.match(html,/id="game-info" role="status" aria-live="polite"/);
  assert.match(css,/#game-view\.active #game-canvas:focus-visible/);
});

test("arrow keys cycle alive targets and Enter or Space performs a real game interaction",()=>{
  assert.match(games,/function moveKeyboardTarget\(direction\)/);
  assert.match(games,/event\.key==="ArrowRight"\|\|event\.key==="ArrowDown"/);
  assert.match(games,/event\.key==="ArrowLeft"\|\|event\.key==="ArrowUp"/);
  assert.match(games,/event\.key==="Enter"\|\|event\.key===" "/);
  assert.match(games,/interact\(\{clientX:rect\.left\+target\.x,clientY:rect\.top\+target\.y,keyboard:true\}\)/);
  assert.match(games,/function drawKeyboardTarget\(\)/);
  assert.match(games,/state\.keyboardMode&&document\.activeElement===canvas/);
});

test("keyboard activation reuses the existing success checks and does not bypass round rules",()=>{
  assert.match(games,/function interact\(e\)\{if\(!state\.active\|\|state\.paused\|\|state\.turn>=10\)return/);
  assert.match(games,/if\(state\.game==="mana"&&state\.save\.mana>=state\.save\.manaCapsules\*10\)/);
  assert.match(games,/if\(state\.game==="chaos"&&state\.save\.mana<10\)/);
  assert.match(games,/state\.turn\+\+/);
  assert.match(games,/state\.keyboardTargetIndex=state\.targets\.findIndex\(o=>o\.alive\)/);
});

test("starting a game moves focus to the game field and returning home restores focus to the home heading",()=>{
  assert.match(games,/canvas\.focus\(\{preventScroll:true\}\)/);
  assert.match(games,/function showHome\(\)[\s\S]*?heading\.focus\(\{preventScroll:true\}\)/);
});
