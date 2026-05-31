/**
 * incline.js — tích phân kinematic cảnh 1 (Mặt phẳng nghiêng).
 *
 * Trạng thái 1D: sAlong (m dọc dốc tính từ đỉnh), vAlong (m/s).
 * Dương = xuống dốc (theo downhillDir).
 *
 * Công thức THCS:
 *   Khi trượt:  a = g·sin θ − μ·g·cos θ + F∥/m
 *   Tĩnh (|drive| ≤ f):  a = 0, v = 0
 */

import { inclineForces } from '../calculator.js';
import { stepEuler1D } from './euler1d.js';
import { airDragAcceleration1D, objectDragGeometry } from '../airDrag.js';

/**
 * Tính gia tốc dọc dốc từ tham số bài toán.
 * @param {number} mass       (kg)
 * @param {number} g          (m/s²)
 * @param {number} angleDeg   (°)
 * @param {number} mu         hệ số ma sát
 * @param {number} forceAlong lực F chiếu dọc dốc (N), dương = xuống
 * @param {number} vAlong     vận tốc hiện tại dọc dốc (để xác định hướng ma sát)
 * @returns {number} gia tốc (m/s²), dương = xuống dốc
 */
export function inclineAcceleration(mass, g, angleDeg, mu, forceAlong, vAlong) {
  const forces = inclineForces(mass, g, angleDeg, mu, forceAlong);

  // Vật đứng yên và lực chưa đủ thắng ma sát tĩnh → a = 0
  if (forces.net === 0 && Math.abs(vAlong) < 0.01) return 0;

  // Khi đang trượt, ma sát luôn ngược chiều chuyển động
  const driveMag = Math.abs(forceAlong) + forces.weightParallel;
  if (Math.abs(vAlong) < 0.01 && driveMag <= forces.friction) return 0;

  return forces.acceleration;
}

/**
 * Một bước tích phân kinematic cảnh 1.
 * @param {{ sAlong: number, vAlong: number }} state
 * @param {object} params   — sceneParams (mass, angleDeg, friction, forceMag, forceAngleDeg)
 * @param {number} g        — gia tốc trọng trường
 * @param {number} dt       — bước thời gian (s)
 * @param {number} length   — chiều dài mặt dốc (m); dừng khi sAlong >= length
 * @returns {{ sAlong: number, vAlong: number, stopped: boolean }}
 */
export function integrateIncline(state, params, g, dt, length) {
  const { mass, angleDeg, friction: mu, forceMag, forceAngleDeg } = params;

  // Chiếu F lên trục dọc dốc (0° = xuống dốc)
  const forceAlong = forceMag * Math.cos((forceAngleDeg * Math.PI) / 180);

  let a = inclineAcceleration(mass, g, angleDeg, mu, forceAlong, state.vAlong);
  if (params.airResistance) {
    const { shape, size } = objectDragGeometry(params);
    a += airDragAcceleration1D(state.vAlong, mass, shape, size);
  }
  const next = stepEuler1D({ s: state.sAlong, v: state.vAlong }, a, dt);

  // Không cho vật trượt ngược lên trên đỉnh (s < 0)
  if (next.s < 0) return { sAlong: 0, vAlong: 0, stopped: false };

  // Chạm đáy dốc
  if (next.s >= length) return { sAlong: length, vAlong: 0, stopped: true };

  return { sAlong: next.s, vAlong: next.v, stopped: false };
}
