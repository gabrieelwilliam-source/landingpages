import office from "../data/office-layout.json" with { type: "json" };
export const JOURNEY_END = office.length;
export const destinations = office.centres;
export function areaAt(distance) {
 let index=0;while(index<destinations.length-1&&distance>=office.boundaries[index+1])index++;
 return index;
}
export function advance(state, input, elapsed, speed = 2.6) {
  const dt = Math.min(Math.max(elapsed, 0), 0.05);
  const length = Math.hypot(input.x, input.forward);
  const scale = length > 1 ? 1 / length : 1;
  const blend = 1 - Math.exp(-12 * dt);
  const vx = state.vx + (input.x * scale * speed - state.vx) * blend;
  const vz = state.vz + (input.forward * scale * speed - state.vz) * blend;
  let distance = Math.max(0, Math.min(JOURNEY_END, state.distance + vz * dt));
  // The continuous facade has no invisible narrow-causeway barriers.
  const x = Math.max(-office.halfWidth, Math.min(office.halfWidth, state.x + vx * dt));
  const boxes = office.colliders;
  const hit = (px, pd) => boxes.some(b => Math.abs(px-b.x)<b.w && Math.abs(pd-b.d)<b.h);
  const nextX = hit(x, state.distance) ? state.x : x;
  const nextD = hit(nextX, distance) ? state.distance : distance;
  return { x: nextX, distance: nextD, vx: nextX === state.x ? 0 : vx, vz: nextD === state.distance ? 0 : vz };

}
export function easeJourney(t) {
  const n = Math.max(0, Math.min(1, t));
  return n * n * (3 - 2 * n);
}

/** Normalize mouse wheels, trackpads and page/line devices to bounded CSS pixels. */
export function normalizeWheel(delta, mode = 0, viewport = 800) {
  if (!Number.isFinite(delta)) return 0;
  const pixels = delta * (mode === 1 ? 16 : mode === 2 ? viewport : 1);
  return Math.max(-640, Math.min(640, pixels));
}
export function scrollDestination(current, pixels) {
  return Math.max(0, Math.min(JOURNEY_END, current + pixels * 0.014));
}
export function advanceScroll(state, target, elapsed, reduced = false) {
  const bounded = Math.max(0, Math.min(JOURNEY_END, target));
  if (reduced) return { ...state, distance: bounded, vx: 0, vz: 0 };
  const dt = Math.min(Math.max(elapsed, 0), 0.05);
  const desired = Math.max(-7, Math.min(7, (bounded - state.distance) * 2));
  const vz = state.vz + (desired - state.vz) * (1 - Math.exp(-12 * dt));
  const distance = Math.max(0, Math.min(JOURNEY_END, state.distance + vz * dt));
  if (Math.abs(distance - bounded) < 0.004 && Math.abs(vz) < 0.06)
    return { ...state, distance: bounded, vx: 0, vz: 0 };
  return { ...state, distance, vx: 0, vz };
}
