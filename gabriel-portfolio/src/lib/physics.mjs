export const WORLD_END = 3000;
export const obstacles = Array.from({length:5}, (_, i) => ({x:i*600+300, width:38, height:26}));
export function step(player, direction, jump, dt) {
 const t = Math.min(dt, .04);
 let vy = jump && player.y === 0 ? 410 : player.vy;
 vy -= 1000*t;
 const y = Math.max(0, player.y + vy*t);
 let x = Math.max(0, Math.min(WORLD_END, player.x + direction*250*t));
 for (const o of obstacles) {
  if (y < o.height && x+18 > o.x && x-18 < o.x+o.width) {
   x = direction > 0 ? o.x-18 : direction < 0 ? o.x+o.width+18 : player.x;
  }
 }
 return {x,y,vy:y === 0 ? 0 : vy};
}
export function chapterAt(x) { return Math.max(0, Math.min(5, Math.round(x/600))); }
