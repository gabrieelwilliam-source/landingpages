/** Radial dead zone, proportional movement and a circular travel limit.
 * @param {number} dx @param {number} dy @param {number} radius
 */
export function joystickVector(dx, dy, radius) {
  if (![dx, dy, radius].every(Number.isFinite) || radius <= 0)
    return { x: 0, forward: 0, thumbX: 0, thumbY: 0 };
  const length = Math.hypot(dx, dy), travel = Math.min(length / radius, 1);
  const strength = Math.max(0, (travel - .12) / .88);
  const nx = length ? dx / length : 0, ny = length ? dy / length : 0;
  return { x: strength ? nx * strength : 0, forward: strength ? -ny * strength : 0,
    thumbX: nx * travel * radius, thumbY: ny * travel * radius };
}
