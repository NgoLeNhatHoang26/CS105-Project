/**
 * collision1d.js — kinematic va chạm 1D cảnh 4.
 *
 * Hai vật trên trục x; phát hiện chạm bằng khoảng cách tâm.
 * Va chạm dùng công thức hệ số phục hồi e (solve1DCollision).
 * Ma sát: v giảm tuyến tính μ·g·dt, dừng tại 0.
 */

import { solve1DCollision } from '../calculator.js';
import { airDragAcceleration1D } from '../airDrag.js';

const REST_EPS = 0.01;

/**
 * Áp dụng ma sát trên mặt phẳng ngang cho một vật.
 * v > 0 → v = max(0, v − μ·g·dt); v < 0 → v = min(0, v + μ·g·dt).
 * @param {number} vx
 * @param {number} g
 * @param {number} mu
 * @param {number} dt
 * @returns {number}
 */
export function applyFriction1D(vx, g, mu, dt) {
  if (mu <= 0 || Math.abs(vx) < REST_EPS) return 0;
  const decel = mu * g * dt;
  if (vx > 0) return Math.max(0, vx - decel);
  return Math.min(0, vx + decel);
}

/**
 * Gia tốc ma sát (dùng cho telemetry / hiển thị vector).
 * @returns {number} ax (m/s²), ngược chiều vận tốc
 */
export function frictionDeceleration(vx, mass, g, mu) {
  if (mu <= 0 || mass <= 0 || Math.abs(vx) < REST_EPS) return 0;
  return -Math.sign(vx) * mu * g;
}

/**
 * Một bước tích phân cho hai vật trước khi va chạm.
 * @param {{ x1,v1,x2,v2 }} state
 * @param {number} m1, m2, g, mu, dt
 * @param {{ enabled?: boolean, shape1?: string, size1?: number, shape2?: string, size2?: number }} dragOpts
 * @returns {{ x1,v1,x2,v2 }}
 */
export function integrateCollision(state, m1, m2, g, mu, dt, dragOpts = null) {
  let v1 = state.v1;
  let v2 = state.v2;

  if (mu > 0) {
    v1 = applyFriction1D(v1, g, mu, dt);
    v2 = applyFriction1D(v2, g, mu, dt);
  }

  if (dragOpts?.enabled) {
    const a1 = airDragAcceleration1D(v1, m1, dragOpts.shape1, dragOpts.size1);
    const a2 = airDragAcceleration1D(v2, m2, dragOpts.shape2, dragOpts.size2);
    v1 += a1 * dt;
    v2 += a2 * dt;
    if (Math.abs(v1) < REST_EPS) v1 = 0;
    if (Math.abs(v2) < REST_EPS) v2 = 0;
  }

  return {
    x1: state.x1 + v1 * dt,
    v1,
    x2: state.x2 + v2 * dt,
    v2,
  };
}

/** Hai vật đang tiến lại gần nhau trên trục x. */
export function areApproaching(x1, x2, v1, v2) {
  const separation = x2 - x1;
  if (Math.abs(separation) < 1e-9) return Math.abs(v1 - v2) > REST_EPS;
  return separation * (v1 - v2) > 0;
}

/**
 * Kiểm tra và xử lý va chạm.
 * @param {{ x1,v1,x2,v2 }} state
 * @param {number} m1, m2   — khối lượng
 * @param {number} e        — hệ số phục hồi
 * @param {number} radius   — bán kính mỗi vật (m)
 * @returns {{ state: {x1,v1,x2,v2}, collided: boolean, v1Before, v2Before }}
 */
export function handleCollision(state, m1, m2, e, radius) {
  const minDist = 2 * radius;
  const dist = Math.abs(state.x2 - state.x1);

  if (dist > minDist) return { state, collided: false };
  if (!areApproaching(state.x1, state.x2, state.v1, state.v2)) {
    return { state, collided: false };
  }

  const v1Before = state.v1;
  const v2Before = state.v2;
  const { v1After, v2After } = solve1DCollision(m1, m2, v1Before, v2Before, e);

  const signedDist = state.x2 - state.x1;
  const overlap = minDist - Math.abs(signedDist);
  const halfOverlap = overlap / 2;
  const newX1 = signedDist >= 0 ? state.x1 - halfOverlap : state.x1 + halfOverlap;
  const newX2 = signedDist >= 0 ? state.x2 + halfOverlap : state.x2 - halfOverlap;

  return {
    state: { x1: newX1, v1: v1After, x2: newX2, v2: v2After },
    collided: true,
    v1Before,
    v2Before,
  };
}
