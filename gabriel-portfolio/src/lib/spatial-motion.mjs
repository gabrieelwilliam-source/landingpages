export const JOURNEY_END = 158;
export const destinations = [0,24,49,82,112,145];
export function areaAt(distance) {return distance<12?0:distance<37?1:distance<70?2:distance<100?3:distance<130?4:5;}
export function advance(state, input, elapsed) {
  const dt = Math.min(Math.max(elapsed, 0), 0.05);
  const length = Math.hypot(input.x, input.forward);
  const scale = length > 1 ? 1 / length : 1;
  const blend = 1 - Math.exp(-12 * dt);
  const vx = state.vx + (input.x * scale * 7 - state.vx) * blend;
  const vz = state.vz + (input.forward * scale * 7 - state.vz) * blend;
  let distance = Math.max(0, Math.min(JOURNEY_END, state.distance + vz * dt));
  // The bridge is narrower than the rooms; prevent entry through its railings.
  let x = Math.max(-5, Math.min(5, state.x + vx * dt));
  if (distance > 22 && distance < 37 && Math.abs(x) > 1.65) {
    if (state.distance <= 22 || state.distance >= 37) distance = state.distance;
    else x = Math.max(-1.65, Math.min(1.65, x));
  }
  // Side plinths are solid; the middle remains a clear, accessible route.
  const boxes = [
    { x: -3.7, d: 12 },
    { x: 3.7, d: 16 },
    { x: -3.7, d: 51 },
    { x: 3.7, d: 57 },
  ];
  const hit = boxes.some(
    (b) => Math.abs(x - b.x) < 0.95 && Math.abs(distance - b.d) < 1.15,
  );
  return {
    x: hit ? state.x : x,
    distance: hit ? state.distance : distance,
    vx: hit ? 0 : vx,
    vz: hit ? 0 : vz,
  };
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
  if (reduced) return { x: 0, distance: bounded, vx: 0, vz: 0 };
  const clamp = (value) => Math.max(-1, Math.min(1, value));
  let forward = clamp((bounded - state.distance) * 2),
    x = clamp(-state.x * 3);
  if (Math.abs(state.x) > 0.04) {
    // Before joining the clear centre lane, go around an adjacent solid plinth.
    const plinth = [
      { x: -3.7, d: 12 },
      { x: 3.7, d: 16 },
      { x: -3.7, d: 51 },
      { x: 3.7, d: 57 },
    ].find(
      (b) =>
        Math.sign(b.x) === Math.sign(state.x) &&
        Math.abs(state.x) > Math.abs(b.x) &&
        Math.abs(state.distance - b.d) < 1.3,
    );
    if (plinth) {
      x = 0;
      const clearance = plinth.d + (state.distance >= plinth.d ? 1.5 : -1.5);
      forward = clamp((clearance - state.distance) * 3);
    } else {
      forward = 0;
      x = clamp(-state.x * 3);
    }
  }
  const next = advance(state, { x, forward }, elapsed);
  if (
    Math.abs(next.distance - bounded) < 0.004 &&
    Math.abs(next.x) < 0.004 &&
    Math.abs(next.vz) + Math.abs(next.vx) < 0.06
  )
    return { x: 0, distance: bounded, vx: 0, vz: 0 };
  return next;
}
