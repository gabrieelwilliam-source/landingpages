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
  destinations,
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
test("facade boundary and workstation chairs match the connected office", async () => {
  let p = { ...start(), x: 10, distance: 12 };
  p = advance(p, { x: 1, forward: 0 }, 0.016);
  assert.equal(p.x, 7.65);
  const {default:layout} = await import("../src/data/office-layout.json",{with:{type:"json"}});
  const seat=layout.seats.find(s=>s.x===4.5&&s.sourceD===19.8);
  p = { ...start(), x: 4.5, distance: seat.d-1.8 };
  for (let i = 0; i < 100; i++) p = advance(p, { x: 0, forward: 1 }, 0.016);
  assert.ok(p.distance <= seat.d-.4);
  assert.ok(p.distance > seat.d-1.8);
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
test("sector boundary allows off-centre walking without invisible causeway barriers", () => {
  const p = { ...start(), x: 4, distance: 10.25, vz: 2 };
  const next = advance(p, { x: 0, forward: 1 }, 0.016);
  assert.ok(next.distance > p.distance);
  assert.equal(next.x, 4);
});
test("central guided lane remains clear of the actual furniture footprints", async () => {
  const {default: office} = await import('../src/data/office-layout.json', {with:{type:'json'}});
  assert.equal(office.boundaries.length, 7);
  assert.ok(office.colliders.length > 30);
  for (const box of office.colliders) {
    assert.ok(Math.abs(box.x) > box.w, `${box.name} must leave the central lane clear`);
    assert.ok(Number.isFinite(box.d) && box.w > 0 && box.h > 0);
  }
});
test("wheel normalization treats pixel, line and page devices consistently", () => {
  assert.equal(normalizeWheel(16, 0), normalizeWheel(1, 1));
  assert.equal(normalizeWheel(1, 2, 500), 500);
  assert.equal(normalizeWheel(99999), 640);
  assert.equal(normalizeWheel(Infinity), 0);
  assert.equal(scrollDestination(JOURNEY_END - 1, 640), JOURNEY_END);
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
  assert.equal(p.distance, JOURNEY_END);
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
  for (const d of [...destinations, JOURNEY_END]) {
    assert.equal(journeyFrame(d, 7, "scroll").avatarZ, -7);
    assert.equal(journeyFrame(d, 7, "scroll").worldZ, d - 7);
    assert.equal(journeyFrame(d, 7, "walk").avatarZ, -d);
    assert.equal(journeyFrame(d, 7, "walk").worldZ, 0);
  }
});

test("batching Meshopt quantized furniture preserves metre-scale placement and source data", async () => {
  const {BufferGeometry, Int16BufferAttribute, Matrix4} = await import('three');
  const {furnitureGeometry} = await import('../src/lib/office-rendering.mjs');
  const source = new BufferGeometry();
  source.setAttribute('position', new Int16BufferAttribute([16384,0,0, 0,16384,0, 0,0,16384],3,true));
  const original = source.getAttribute('position').getX(0);
  const matrix = new Matrix4().makeTranslation(10,2,-26).multiply(new Matrix4().makeScale(4,4,4));
  const baked = furnitureGeometry(source,matrix);
  assert.ok(Math.abs(baked.getAttribute('position').getX(0)-(10+original*4))<.0001);
  baked.computeBoundingBox();
  assert.ok(baked.boundingBox.min.x>=10 && baked.boundingBox.max.x>12);
  assert.ok(baked.boundingBox.max.z < -23);
  assert.equal(source.getAttribute('position').getX(0),original);
  assert.equal(baked.getAttribute('position').array.constructor,Float32Array);
  source.dispose();baked.dispose();
});

test("camera-relative movement rotates forward and strafe without increasing diagonal speed", async () => {
  const {cameraInput} = await import('../src/lib/office-camera.mjs');
  const forward=cameraInput({x:0,forward:1},Math.PI/2);
  assert.ok(Math.abs(forward.x+1)<1e-10 && Math.abs(forward.forward)<1e-10);
  const diagonal=cameraInput({x:1,forward:1},.7);
  assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.forward)-Math.sqrt(2))<1e-10);
  let state=start();
  for(let i=0;i<600;i++)state=advance(state,forward,.016);
  assert.equal(state.x,-7.65);
  assert.ok(Math.abs(state.distance)<1e-8);
});
test("camera segment stops before a tall display but clears low furniture", async () => {
  const {safeCamera} = await import('../src/lib/office-camera.mjs');
  const office={halfWidth:7.65,boundaries:[-7,92],colliders:[{x:3,d:10,w:1,h:1,top:3.6}]};
  const focus={x:0,y:1.35,d:10}, wanted={x:6,y:2.4,d:10};
  const blocked=safeCamera(focus,wanted,office);
  assert.ok(blocked.x>0 && blocked.x<2.16);
  office.colliders[0].top=.6;
  assert.deepEqual(safeCamera(focus,wanted,office),wanted);
});
test("camera remains inside the building envelope and every collision has a real height", async () => {
  const {safeCamera} = await import('../src/lib/office-camera.mjs');
  const {default: office} = await import('../src/data/office-layout.json',{with:{type:'json'}});
  assert.ok(office.colliders.every(box=>Number.isFinite(box.top)&&box.top>0));
  const safe=safeCamera({x:0,y:1.35,d:40},{x:100,y:100,d:100},{...office,colliders:[]});
  assert.equal(safe.x,office.halfWidth);
  assert.equal(safe.y,office.cameraCeiling ?? 5.2);
  assert.equal(safe.d,office.boundaries.at(-1)-.4);
});
