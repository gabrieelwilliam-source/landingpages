import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advance,
  advanceScroll,
  normalizeWheel,
  scrollDestination,
  areaAt,
  easeJourney,
  JOURNEY_END,
} from "../src/lib/spatial-motion.mjs";
const start = () => ({ x: 0, distance: 0, vx: 0, vz: 0 });
test("forward and back traverse both environments with bounded depth", () => {
  let p = start();
  for (let i = 0; i < 6000; i++) p = advance(p, { x: 0, forward: 1 }, 0.016);
  assert.equal(p.distance, JOURNEY_END);
  assert.equal(areaAt(p.distance), 5);
  for (let i = 0; i < 6000; i++) p = advance(p, { x: 0, forward: -1 }, 0.016);
  assert.equal(p.distance, 0);
  assert.equal(areaAt(p.distance), 0);
});
test("diagonal input does not increase speed", () => {
  let a = start(),
    b = start();
  for (let i = 0; i < 30; i++) {
    a = advance(a, { x: 0, forward: 1 }, 0.016);
    b = advance(b, { x: 1, forward: 1 }, 0.016);
  }
  assert.ok(Math.abs(Math.hypot(b.x, b.distance) - a.distance) < 0.0001);
});
test("causeway boundaries and workstation collisions match the rebuilt spaces", () => {
  let p = { ...start(), x: 4, distance: 12 };
  p = advance(p, { x: 1, forward: 0 }, 0.016);
  assert.equal(p.x, 2.1);
  p = { ...start(), x: 4.5, distance: 42.95 };
  for (let i = 0; i < 100; i++) p = advance(p, { x: 0, forward: 1 }, 0.016);
  assert.ok(p.distance <= 43.05);
  assert.ok(p.distance > 42.95);
});
test("release decelerates and delta cap prevents tab-resume jumps", () => {
  let p = start();
  for (let i = 0; i < 20; i++) p = advance(p, { x: 0, forward: 1 }, 0.016);
  const v = p.vz;
  for (let i = 0; i < 60; i++) p = advance(p, { x: 0, forward: 0 }, 0.016);
  assert.ok(p.vz < v * 0.001);
  assert.ok(advance(start(), { x: 0, forward: 1 }, 20).distance < 0.2);
});
test("cinematic easing has stable endpoints and a symmetric midpoint", () => {
  assert.equal(easeJourney(-1), 0);
  assert.equal(easeJourney(2), 1);
  assert.equal(easeJourney(0.5), 0.5);
});
test("entry into a narrow connector blocks an off-centre walker without teleporting", () => {
  const p = { ...start(), x: 4, distance: 10.25, vz: 7 };
  const next = advance(p, { x: 0, forward: 1 }, 0.016);
  assert.equal(next.distance, p.distance);
  assert.equal(next.x, 4);
});
test("wheel normalization treats pixel, line and page devices consistently", () => {
  assert.equal(normalizeWheel(16, 0), normalizeWheel(1, 1));
  assert.equal(normalizeWheel(1, 2, 500), 500);
  assert.equal(normalizeWheel(99999), 640);
  assert.equal(normalizeWheel(Infinity), 0);
  assert.equal(scrollDestination(157, 640), 158);
  assert.equal(scrollDestination(1, -640), 0);
});
test("scroll converges, reverses and honours the endpoints without overshoot", () => {
  let p = start();
  for (let i = 0; i < 700; i++) p = advanceScroll(p, 49, 0.016);
  assert.equal(p.distance, 49);
  assert.equal(p.vz, 0);
  for (let i = 0; i < 6000; i++) p = advanceScroll(p, -100, 0.016);
  assert.equal(p.distance, 0);
  for (let i = 0; i < 6000; i++) p = advanceScroll(p, 999, 0.016);
  assert.equal(p.distance, 158);
});
test("scroll progress preserves lateral stance and does not simulate a walking avatar", () => {
  let p = { ...start(), x: 4.9, distance: 12 };
  for (let i = 0; i < 1400; i++) p = advanceScroll(p, 49, 0.016);
  assert.equal(p.distance, 49);
  assert.equal(p.x, 4.9);
  assert.equal(p.vx, 0);
});
test("reduced-motion scroll goes directly to the selected point", () => {
  assert.deepEqual(advanceScroll({ ...start(), x: 1 }, 49, 0.016, true), {
    x: 1,
    distance: 49,
    vx: 0,
    vz: 0,
  });
});
test("scroll transforms all chapters around an anchored avatar; walking translates the avatar", async () => {
  const { journeyFrame } = await import("../src/lib/JourneyController.mjs");
  for (const d of [0, 24, 49, 82, 112, 145, 158]) {
    assert.equal(journeyFrame(d, 7, "scroll").avatarZ, -7);
    assert.equal(journeyFrame(d, 7, "scroll").worldZ, d - 7);
    assert.equal(journeyFrame(d, 7, "walk").avatarZ, -d);
    assert.equal(journeyFrame(d, 7, "walk").worldZ, 0);
  }
});
