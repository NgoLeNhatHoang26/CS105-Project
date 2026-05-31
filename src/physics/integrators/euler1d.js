/**
 * euler1d — tích phân Euler bậc một cho chuyển động 1D.
 *
 * Dùng cho mọi cảnh kinematic:
 *   v_new = v + a * dt
 *   s_new = s + v_new * dt   (semi-implicit Euler — ổn định hơn Euler explicit)
 */

/**
 * Một bước Euler 1D.
 * @param {{ s: number, v: number }} state  — vị trí và vận tốc hiện tại
 * @param {number} a   — gia tốc (m/s²), dương = chiều dương trục
 * @param {number} dt  — bước thời gian (s)
 * @returns {{ s: number, v: number }}
 */
export function stepEuler1D(state, a, dt) {
  const v = state.v + a * dt;
  const s = state.s + v * dt;
  return { s, v };
}

/**
 * Euler 3D — cập nhật {x,y,z} và {vx,vy,vz} riêng lẻ.
 * @param {{ x,y,z }} pos
 * @param {{ x,y,z }} vel
 * @param {{ x,y,z }} acc
 * @param {number} dt
 * @returns {{ pos: {x,y,z}, vel: {x,y,z} }}
 */
export function stepEuler3D(pos, vel, acc, dt) {
  const nvx = vel.x + acc.x * dt;
  const nvy = vel.y + acc.y * dt;
  const nvz = vel.z + acc.z * dt;
  return {
    pos: {
      x: pos.x + nvx * dt,
      y: pos.y + nvy * dt,
      z: pos.z + nvz * dt,
    },
    vel: { x: nvx, y: nvy, z: nvz },
  };
}
