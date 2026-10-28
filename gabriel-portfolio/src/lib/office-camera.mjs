/** Camera-relative movement in the office's X / positive-distance coordinates. */
export function cameraInput(input, yaw) {
  return {
    x: input.x * Math.cos(yaw) - input.forward * Math.sin(yaw),
    forward: input.forward * Math.cos(yaw) + input.x * Math.sin(yaw),
  };
}

/** Clip the focus-to-camera segment against the facade and actual furniture heights. */
export function safeCamera(origin, wanted, office) {
  const target = {
    x: Math.max(-office.halfWidth, Math.min(office.halfWidth, wanted.x)),
    y: Math.max(1.15, Math.min(office.cameraCeiling ?? 5.2, wanted.y)),
    d: Math.max(office.boundaries[0] + .4, Math.min(office.boundaries.at(-1) - .4, wanted.d)),
  };
  const delta = { x: target.x-origin.x, y: target.y-origin.y, d: target.d-origin.d };
  let limit = 1;
  for (const box of office.colliders) {
    // Walking footprints include a 28cm body margin; the camera uses 12cm.
    const w = Math.max(.12, box.w-.16), h = Math.max(.12, box.h-.16);
    const low = {x: box.x-w, y: (box.bottom ?? 0)-.12, d: box.d-h};
    const high = {x: box.x+w, y: box.top+.12, d: box.d+h};
    let enter = 0, exit = 1, hit = true;
    for (const axis of ["x", "y", "d"]) {
      if (Math.abs(delta[axis]) < 1e-9) {
        if (origin[axis] < low[axis] || origin[axis] > high[axis]) { hit = false; break; }
      } else {
        const a = (low[axis]-origin[axis])/delta[axis];
        const b = (high[axis]-origin[axis])/delta[axis];
        enter = Math.max(enter, Math.min(a,b));
        exit = Math.min(exit, Math.max(a,b));
        if (enter > exit) { hit = false; break; }
      }
    }
    if (hit && exit > 0 && enter > 0)
      limit = Math.min(limit, Math.max(0, enter-.03));
  }
  return {x: origin.x+delta.x*limit, y: origin.y+delta.y*limit, d: origin.d+delta.d*limit};
}
