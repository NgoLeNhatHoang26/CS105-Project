import { stepEuler1D } from './euler1d.js';
import { airDragAcceleration3D, objectDragGeometry } from '../airDrag.js';

/**
 * Tính gia tốc ngang từ tham số bài toán.
 * Trả về { ax, az } (m/s²).
 * @param {number} mass
 * @param {number} g
 * @param {number} mu       hệ số ma sát
 * @param {{ x, z }} force  lực F ngang (N)
 * @param {{ x, z }} vel    vận tốc hiện tại (để tính hướng ma sát)
 * @returns {{ ax: number, az: number }}
 */
export function horizontalAcceleration(mass, g, mu, force, vel) {
  if (mass <= 0) return { ax: 0, az: 0 };

  const frictionMag = mu * mass * g;
  const speed = Math.hypot(vel.x, vel.z);
  const driveMag = Math.hypot(force.x, force.z);

  let frictionX = 0;
  let frictionZ = 0;

  if (speed > 0.02) {
    // Động ma sát: ngược chiều vận tốc
    const s = -frictionMag / speed;
    frictionX = vel.x * s;
    frictionZ = vel.z * s;
  } else if (driveMag <= frictionMag) {
    // Tĩnh: đủ ma sát để giữ vật
    return { ax: 0, az: 0 };
  } else {
    // Sắp bắt đầu trượt: lực ngược chiều drive
    const s = -frictionMag / driveMag;
    frictionX = force.x * s;
    frictionZ = force.z * s;
  }

  return {
    ax: (force.x + frictionX) / mass,
    az: (force.z + frictionZ) / mass,
  };
}

/**
 * Một bước tích phân kinematic cảnh 3.
 * @param {{ x, z, vx, vz }} state
 * @param {object} params   — sceneParams (mass, friction, forceMag, forceAngleDeg)
 * @param {number} g
 * @param {number} dt
 * @param {number} arenaHalf — giới hạn arena; clamp khi vượt
 * @returns {{ x, z, vx, vz }}
 */
export function integrateHorizontal(state, params, g, dt, arenaHalf) {
  const { mass, friction: mu, forceMag, forceAngleDeg } = params;
  const rad = ((forceAngleDeg ?? 0) * Math.PI) / 180;
  const force = {
    x: forceMag * Math.cos(rad),
    z: forceMag * Math.sin(rad),
  };

  let { ax, az } = horizontalAcceleration(mass, g, mu, force, { x: state.vx, z: state.vz });
  if (params.airResistance) {
    const { shape, size } = objectDragGeometry(params);
    const drag = airDragAcceleration3D({ x: state.vx, y: 0, z: state.vz }, mass, shape, size);
    ax += drag.ax;
    az += drag.az;
  }

  const nx = stepEuler1D({ s: state.x, v: state.vx }, ax, dt);
  const nz = stepEuler1D({ s: state.z, v: state.vz }, az, dt);

  // Clamp tường arena
  const limit = arenaHalf - 0.5;
  return {
    x: Math.max(-limit, Math.min(limit, nx.s)),
    z: Math.max(-limit, Math.min(limit, nz.s)),
    vx: Math.abs(nx.s) >= limit ? 0 : nx.v,
    vz: Math.abs(nz.s) >= limit ? 0 : nz.v,
  };
}
