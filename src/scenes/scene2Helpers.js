/** Helpers Scene 2 — độ cao đáy vật, công thức rơi tự do THCS (F = 0). */

export const GROUND_EPS = 0.02;

export function getObjectRadius(params) {
  if (params.shape === 'sphere') return params.sphereRadius ?? 0.4;
  return (params.boxSize ?? 0.6) / 2;
}

/** initialHeight = độ cao đáy so với mặt đất (y = 0). */
export function centerYFromBottomHeight(bottomHeight, radius) {
  return bottomHeight + radius;
}

export function bottomYFromCenterY(centerY, radius) {
  return centerY - radius;
}

export function minCenterYAtGround(radius) {
  return radius + GROUND_EPS;
}

/** Công thức rơi tự do thuần (không lực cản, thả từ nghỉ). h = độ cao đáy ban đầu. */
export function theoreticalFreeFall(g, t, h) {
  if (g <= 0) {
    return {
      yBottom: h,
      vy: 0,
      speed: 0,
      tGround: null,
      vGround: null,
    };
  }
  const yBottom = Math.max(0, h - 0.5 * g * t * t);
  const vy = -g * t;
  const tGround = Math.sqrt((2 * h) / g);
  const vGround = Math.sqrt(2 * g * h);
  return {
    yBottom,
    vy,
    speed: g * t,
    tGround,
    vGround,
  };
}
