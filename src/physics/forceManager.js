import { degToRad } from '../utils/helpers.js';

/** Áp lực F do người dùng (N) trên mặt phẳng ngang hoặc dốc. */
export function forceFromAngles(magnitude, angleDeg, plane = 'xz') {
  const rad = degToRad(angleDeg);
  if (plane === 'xz') {
    return {
      x: magnitude * Math.cos(rad),
      y: 0,
      z: magnitude * Math.sin(rad),
    };
  }
  if (plane === 'xy') {
    return {
      x: magnitude * Math.cos(rad),
      y: magnitude * Math.sin(rad),
      z: 0,
    };
  }
  return { x: magnitude, y: 0, z: 0 };
}
