export const JOURNEY_END = 158;
export const destinations = [0, 24, 49, 82, 112, 145];
export function areaAt(distance) {
  return distance < 12
    ? 0
    : distance < 37
      ? 1
      : distance < 70
        ? 2
        : distance < 100
          ? 3
          : distance < 130
            ? 4
            : 5;
}
export function advance(state, input, elapsed, speed = 2) {
  const dt = Math.min(Math.max(elapsed, 0), 0.05);
  const length = Math.hypot(input.x, input.forward);
  const scale = length > 1 ? 1 / length : 1;
  const blend = 1 - Math.exp(-12 * dt);
  const vx = state.vx + (input.x * scale * speed - state.vx) * blend;
  const vz = state.vz + (input.forward * scale * speed - state.vz) * blend;
  let distance = Math.max(0, Math.min(JOURNEY_END, state.distance + vz * dt));
  const width = destinations.some((d) => Math.abs(distance - d) <= 10.3)
    ? 5.6
    : 2.1;
  let x = Math.max(-width, Math.min(width, state.x + vx * dt));
  const priorWidth = destinations.some(
    (d) => Math.abs(state.distance - d) <= 10.3,
  )
    ? 5.6
    : 2.1;
  if (width < priorWidth && Math.abs(state.x) > width) {
    distance = state.distance;
    x = Math.max(-priorWidth, Math.min(priorWidth, state.x + vx * dt));
  }
  const boxes = [
    ...destinations.flatMap((d) => [
      { x: -5, d: d - 6, w: 1.6, h: 1 },
      { x: 5, d: d + 6, w: 1.6, h: 1 },
    ]),
    ...[-5, 1, 7].flatMap((y) =>
      [-4.5, 4.5].map((x) => ({ x, d: 49 + y, w: 1.6, h: 0.95 })),
    ),
    ...[77, 82, 87].map((d, i) => ({ x: i % 2 ? 5 : -5, d, w: 2.2, h: 0.5 })),
  ];
  const hit = boxes.some(
    (b) => Math.abs(x - b.x) < b.w && Math.abs(distance - b.d) < b.h,
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
  if (reduced) return { ...state, distance: bounded, vx: 0, vz: 0 };
  const dt = Math.min(Math.max(elapsed, 0), 0.05);
  const desired = Math.max(-7, Math.min(7, (bounded - state.distance) * 2));
  const vz = state.vz + (desired - state.vz) * (1 - Math.exp(-12 * dt));
  const distance = Math.max(0, Math.min(JOURNEY_END, state.distance + vz * dt));
  if (Math.abs(distance - bounded) < 0.004 && Math.abs(vz) < 0.06)
    return { ...state, distance: bounded, vx: 0, vz: 0 };
  return { ...state, distance, vx: 0, vz };
}
