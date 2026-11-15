"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "nu-adaptive-governor.js"), "utf8");

function harness(level, savedProfile) {
  let clock = 0;
  const timers = [];
  const frames = [];
  const listeners = {};
  const applied = [];
  const qualities = [];
  const events = [];
  const win = {
    document: { hidden: false, createEvent: function () { return { initCustomEvent: function (name, bubbles, cancelable, detail) { this.type = name; this.detail = detail; } }; } },
    performance: { now: function () { return clock; } },
    setTimeout: function (fn) { timers.push(fn); return timers.length; },
    clearTimeout: function () {},
    requestAnimationFrame: function (fn) { frames.push(fn); },
    addEventListener: function (name, fn) { listeners[name] = fn; },
    dispatchEvent: function (event) { events.push(event); },
    CustomEvent: function (name, options) { this.type = name; this.detail = options.detail; },
    localStorage: { getItem: function () { return savedProfile ? JSON.stringify(savedProfile) : null; }, setItem: function (key, value) { savedProfile = JSON.parse(value); } },
    NUGraphicsCore: { budget: function (n) { return { level: n }; } },
    NUGameRenderAdapter: { apply: function (p) { applied.push(p.level); } },
    NUPixelWorld: { setQuality: function (n) { qualities.push(n); } }
  };
  win.window = win;
  vm.runInNewContext(source, { window: win });
  listeners["nu:graphics-profile"]({ detail: { level: level, budget: { level: level }, locked: true } });

  return {
    win,
    applied,
    qualities,
    events,
    runWindow: function (step) {
      const timer = timers.shift();
      assert.equal(typeof timer, "function", "governor should schedule a measurement window");
      timer();
      while (frames.length) {
        const frame = frames.shift();
        clock += step;
        frame(clock);
      }
    }
  };
}

test("governor lowers the shared quality profile when frame pacing is poor", function () {
  const h = harness(4);
  h.runWindow(60);
  assert.equal(h.win.NUGraphicsProfile.level, 3);
  assert.deepEqual(h.applied, [3]);
  assert.deepEqual(h.qualities, [3]);
  assert.equal(h.events[0].type, "nu:graphics-adjusted");
  assert.equal(h.win.NUGraphicsProfile.adaptive.reason, "frame-pressure");
});

test("governor raises quality only after three sustained headroom windows", function () {
  const h = harness(2, { level: 2, stableLevel: 5, calibration: { memoryClassGb: 4 } });
  h.runWindow(16.7);
  h.runWindow(16.7);
  assert.equal(h.win.NUGraphicsProfile.level, 2);
  h.runWindow(16.7);
  assert.equal(h.win.NUGraphicsProfile.level, 3);
  assert.deepEqual(h.applied, [3]);
});

test("governor pauses sampling while the document is hidden", function () {
  const h = harness(3);
  h.win.document.hidden = true;
  h.runWindow(60);
  assert.equal(h.win.NUGraphicsProfile.level, 3);
  assert.deepEqual(h.applied, []);
});

test("launcher calibration seeds the runtime and remains the automatic quality ceiling", function () {
  const h = harness(5, { level: 2, stableLevel: 2, calibration: { memoryClassGb: 2 } });
  assert.equal(h.win.NUGraphicsProfile.level, 2);
  assert.equal(h.win.NUAdaptiveGovernor.getState().ceilingLevel, 2);
  assert.equal(h.win.NUAdaptiveGovernor.getState().launcherCalibrated, true);
  h.runWindow(16.7);
  h.runWindow(16.7);
  h.runWindow(16.7);
  assert.equal(h.win.NUGraphicsProfile.level, 2);
  assert.deepEqual(h.applied, [2]);
});

test("launcher calibration auto-applies by default instead of requiring a level click", function () {
  const launcher = fs.readFileSync(path.join(__dirname, "..", "nu-launcher.js"), "utf8");
  assert.match(launcher, /calibrate\(!!p\.ask\)\.catch\(fail\)/);
});
