/**
 * freeFall.js — tích phân kinematic cảnh 2 (Rơi tự do / Ném).
 *
 * Hai chế độ:
 *   1. Rơi thuần (F = 0, tắt cản khí): dùng công thức analytic
 *      y(t) = h₀ − ½g·t²   vận tốc: vy = −g·t
 *   2. Có lực F hoặc cản khí: Euler 3D mỗi bước
 *
 * Công thức THCS:
 *   a_y = −g + F_y/m
 *   v_y = v_y0 + a_y·t
 *   y   = y0 + v_y·t
 */

import { stepEuler3D } from './euler1d.js';
import { airDragAcceleration3D, objectDragGeometry } from '../airDrag.js';

/**
 * Rơi thuần: analytic, khớp tuyệt đối với công thức SGK.
 * @param {number} g       (m/s²)
 * @param {number} t       thời gian đã trôi (s)
 * @param {number} h0      độ cao đáy vật ban đầu (m)
 * @param {number} radius  bán kính vật (m) để tính tâm
 * @returns {{ centerY: number, vy: number }}
 */
export function analyticFreeFall(g, t, h0, radius) {
  const yBottom = Math.max(0, h0 - 0.5 * g * t * t);
  const vy = -g * t;
  return { centerY: yBottom + radius, vy };
}

/**
 * Một bước Euler 3D cho rơi tự do có lực F.
 * @param {{ x,y,z }} pos    — tọa độ tâm vật
 * @param {{ x,y,z }} vel    — vận tốc
 * @param {number}    mass
 * @param {number}    g
 * @param {{ x,y,z }} appliedForce  — lực F người dùng (N)
 * @param {number}    dt
 * @returns {{ pos: {x,y,z}, vel: {x,y,z} }}
 */
export function integrateFreeFallStep(pos, vel, mass, g, appliedForce, dt, airDrag = false, dragShape = 'box', dragSize = 0.6) {
  const m = mass > 0 ? mass : 1;
  const acc = {
    x: appliedForce.x / m,
    y: appliedForce.y / m - g,
    z: appliedForce.z / m,
  };
  if (airDrag) {
    const drag = airDragAcceleration3D(vel, mass, dragShape, dragSize);
    acc.x += drag.ax;
    acc.y += drag.ay;
    acc.z += drag.az;
  }
  return stepEuler3D(pos, vel, acc, dt);
}

/**
 * Wrapper cho scene: trả về trạng thái mới + cờ chạm đất.
 * @param {{ pos: {x,y,z}, vel: {x,y,z} }} state
 * @param {object} params  — sceneParams (mass, forceMag, …)
 * @param {number} g
 * @param {number} dt
 * @param {number} radius
 * @param {number} groundY — y tâm tối thiểu khi chạm đất
 * @returns {{ pos, vel, hitGround: boolean }}
 */
export function integrateFreeFall(state, params, g, dt, radius, groundY) {
  const mag = params.forceMag ?? 0;
  const hRad = ((params.forceAngleHorizontal ?? 0) * Math.PI) / 180;
  const vRad = ((params.forceAngleVertical ?? 0) * Math.PI) / 180;
  const applied = {
    x: mag * Math.cos(vRad) * Math.cos(hRad),
    y: mag * Math.sin(vRad),
    z: mag * Math.cos(vRad) * Math.sin(hRad),
  };

  const { shape, size } = objectDragGeometry(params);
  const { pos, vel } = integrateFreeFallStep(
    state.pos,
    state.vel,
    params.mass,
    g,
    applied,
    dt,
    Boolean(params.airResistance),
    shape,
    size,
  );

  if (pos.y <= groundY) {
    return { pos: { ...pos, y: groundY }, vel: { x: 0, y: 0, z: 0 }, hitGround: true };
  }
  return { pos, vel, hitGround: false };
}
