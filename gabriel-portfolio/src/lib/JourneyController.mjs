import { JOURNEY_END, areaAt } from "./spatial-motion.mjs";
export function journeyFrame(distance, anchor, mode) {
  const d = Math.max(0, Math.min(JOURNEY_END, distance));
  return {
    progress: d / JOURNEY_END,
    area: areaAt(d),
    worldZ: mode === "scroll" ? d - anchor : 0,
    avatarZ: mode === "scroll" ? -anchor : -d,
    cameraDistance: mode === "scroll" ? anchor : d,
  };
}
