"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validatePerspectiveQuad,
  perspectiveQuadFromDepthAngle,
  perspectiveTransformPixels
} = require("../nu-studio-pro-tools.js");

const rect = (x, y, width, height) => [
  { x, y },
  { x: x + width, y },
  { x: x + width, y: y + height },
  { x, y: y + height }
];

test("validates ordered convex perspective quadrilaterals", () => {
  assert.deepEqual(validatePerspectiveQuad(rect(0, 0, 4, 3)), rect(0, 0, 4, 3));
  assert.throws(() => validatePerspectiveQuad([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]), /four ordered corner/);
  assert.throws(() => validatePerspectiveQuad([{ x: 0, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }, { x: 4, y: 0 }]), /convex quadrilateral/);
  assert.throws(() => validatePerspectiveQuad([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 1 }, { x: 0, y: 4 }]), /convex quadrilateral/);
  assert.throws(() => validatePerspectiveQuad([{ x: 0, y: 0 }, { x: 0.5, y: 0 }, { x: 0.5, y: 0.5 }, { x: 0, y: 0.5 }]), /area is too small/);
  assert.throws(() => validatePerspectiveQuad([{ x: 0, y: 0 }, { x: Infinity, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }]), /finite coordinates/);
});

test("depth and angle generate a deterministic perspective quad", () => {
  const source = { x: 2, y: 3, width: 8, height: 6 };
  const identity = perspectiveQuadFromDepthAngle(source, 0, 0);
  assert.deepEqual(identity, rect(2, 3, 8, 6));
  const angled = perspectiveQuadFromDepthAngle(source, 60, 25);
  assert.notDeepEqual(angled, identity);
  assert.deepEqual(angled, perspectiveQuadFromDepthAngle(source, 60, 25));
  assert.equal(validatePerspectiveQuad(angled).length, 4);
  assert.throws(() => perspectiveQuadFromDepthAngle(source, 101, 0), /depth must be between/);
  assert.throws(() => perspectiveQuadFromDepthAngle(source, 0, 61), /angle must be between/);
});

test("identity perspective transform preserves every pixel and transparency", () => {
  const pixels = ["#ff0000", null, "#00ff00", "#0000ff"];
  const result = perspectiveTransformPixels(pixels, 2, 2, rect(0, 0, 2, 2));
  assert.deepEqual(result.pixels, pixels);
  assert.equal(result.changed, false);
  assert.equal(result.reason, "no-op");
  assert.equal(result.selection, null);
  assert.equal(result.mask, null);
  assert.deepEqual(pixels, ["#ff0000", null, "#00ff00", "#0000ff"], "input must not be mutated");
});

test("perspective transform uses inverse nearest-neighbor sampling and clips to canvas", () => {
  const pixels = Array(16).fill(null);
  pixels[0] = "#ff0000";
  pixels[5] = "#00ff00";
  const shifted = [{ x: 1, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 4 }, { x: 1, y: 4 }];
  const result = perspectiveTransformPixels(pixels, 4, 4, shifted);
  assert.equal(result.pixels[1], "#ff0000");
  assert.equal(result.pixels[6], "#00ff00");
  assert.equal(result.pixels[0], null);
  assert.equal(result.pixels.length, 16);
  assert.equal(result.changed, true);
});

test("selection transform preserves outside pixels and moves selection and layer mask", () => {
  const pixels = ["#0000ff", "#ff0000", null, null, null, null, null, null];
  const selection = new Uint8Array([0, 1, 0, 0, 0, 0, 0, 0]);
  const mask = new Uint8Array([1, 1, 1, 1, 1, 0, 1, 1]);
  const target = rect(2, 0, 1, 1);
  const result = perspectiveTransformPixels(pixels, 4, 2, target, selection, mask);
  assert.equal(result.pixels[0], "#0000ff", "unselected source pixels remain untouched");
  assert.equal(result.pixels[1], null, "selected source pixels are cleared");
  assert.equal(result.pixels[2], "#ff0000", "selected pixels move to the destination quad");
  assert.deepEqual(Array.from(result.selection), [0, 0, 1, 0, 0, 0, 0, 0]);
  assert.deepEqual(Array.from(result.mask), [1, 0, 1, 1, 1, 0, 1, 1]);
  assert.deepEqual(pixels, ["#0000ff", "#ff0000", null, null, null, null, null, null], "input pixels must not be mutated");
});

test("empty selection is a safe no-op", () => {
  const pixels = ["#ff0000", null, null, null];
  const selection = new Uint8Array(4);
  const result = perspectiveTransformPixels(pixels, 2, 2, rect(0, 0, 2, 2), selection);
  assert.equal(result.changed, false);
  assert.equal(result.reason, "empty-selection");
  assert.deepEqual(result.pixels, pixels);
  assert.deepEqual(Array.from(result.selection), [0, 0, 0, 0]);
});

test("invalid geometry and mismatched raster state are rejected without mutation", () => {
  const pixels = ["#ff0000", null, null, null];
  const original = pixels.slice();
  assert.throws(() => perspectiveTransformPixels(pixels, 2, 2, [{ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }, { x: 2, y: 0 }]), /convex quadrilateral/);
  assert.throws(() => perspectiveTransformPixels(pixels, 2, 2, rect(0, 0, 2, 2), [1, 0]), /selection does not match/);
  assert.throws(() => perspectiveTransformPixels(pixels, 2, 2, rect(0, 0, 2, 2), null, [1, 0]), /layer mask does not match/);
  assert.deepEqual(pixels, original);
});
