export const JOURNEY_END = 68;
export const destinations = [4, 49];
export function areaAt(distance) {
  return distance < 35 ? 0 : 1;
}
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
