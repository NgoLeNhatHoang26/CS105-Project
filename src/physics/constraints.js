import { ARENA_HALF } from '../constants.js';

/** Ràng buộc biên arena (scene 3 & 4) */
export function clampToArena(position, half = ARENA_HALF) {
  position.x = Math.max(-half, Math.min(half, position.x));
  position.z = Math.max(-half, Math.min(half, position.z));
  return position;
}

/** Kiểm tra vật đã đi hết chiều dài mặt phẳng nghiêng */
export function distanceAlongRamp(position, origin, angleRad) {
  const dx = position.x - origin.x;
  const dy = position.y - origin.y;
  return dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
}
