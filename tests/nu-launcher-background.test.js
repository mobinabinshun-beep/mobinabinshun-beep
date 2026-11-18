"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const css = fs.readFileSync("nu-launcher.css", "utf8");

test("Launcher background remains deep blue at the end of the gradient", () => {
  assert.match(css, /background-color:#0b1724/);
  assert.match(css, /#0d1b2a 48%,#0b1724 100%/);
  assert.doesNotMatch(css, /#050a11/);
});

test("Launcher background stays fixed rather than shifting with document height", () => {
  assert.match(css, /background-attachment:fixed/);
});
