const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const games = fs.readFileSync("nu-games.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");

test("network diagnostics cannot gate entry to the public world", () => {
  const unlock = games.indexOf("function unlockWorld(info,label)");
  const performance = games.indexOf("NU.samplePerformance().then");
  const network = games.indexOf("NU.sampleNetwork().then");
  assert.ok(unlock >= 0, "local world unlock helper must exist");
  assert.ok(performance >= 0 && network > performance, "performance setup must precede optional network diagnostics");
  assert.ok(unlock < network, "world unlock must be defined before network diagnostics");
  const startup = games.slice(performance, games.indexOf('$("intro-start").addEventListener', performance));
  assert.doesNotMatch(startup, /await\s+NU\.sampleNetwork\s*\(/, "startup must never await network probes");
  assert.match(startup, /unlockWorld\(info\)/, "successful local calibration unlocks the world");
  assert.match(startup, /unlockWorld\(\{level:3\}/, "failed local calibration has a safe entry fallback");
});

test("the public page loads the cache-busted non-blocking bootstrap", () => {
  assert.match(html, /nu-games\.js\?v=[^"]+/);
});
