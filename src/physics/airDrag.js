/**
 * airDrag.js — lực cản không khí cho mô phỏng kinematic.
 *
 * Công thức: F = ½·ρ·v²·Cd·A  (N), ngược chiều vận tốc.
 * ρ = 1.225 kg/m³ (điều kiện chuẩn, mực biển).
 */

export const AIR_DENSITY = 1.225;

/** Hệ số cản hình dạng (Cd) — xấp xỉ cho vật thể đơn giản. */
export const DRAG_CD = {
  sphere: 0.47,
  box: 1.05,
  cylinder: 0.82,
  cone: 0.50,
  wheel: 0.90,
  teapot: 0.80,
};

/**
 * Diện tích mặt cản (m²) theo hình và kích thước đặc trưng (m).
 * @param {string} shape
 * @param {number} size
 * @returns {number}
 */
export function dragArea(shape, size) {
  switch (shape) {
    case 'sphere':
    case 'teapot':
      return Math.PI * (0.5 * size) ** 2;
    case 'cylinder':
    case 'wheel':
      return Math.PI * (0.45 * size) ** 2;
    case 'cone':
      return Math.PI * (0.5 * size) ** 2;
    case 'box':
    default:
      return size * size;
  }
}

/**
 * Độ lớn lực cản (N): F = ½ρv²CdA.
 * @param {number} speed — tốc độ (m/s)
 * @param {string} shape
 * @param {number} size — kích thước đặc trưng (m)
 * @returns {number}
 */
export function computeAirDragMagnitude(speed, shape, size) {
  const v2 = speed * speed;
  if (v2 < 1e-8) return 0;
  const Cd = DRAG_CD[shape] ?? DRAG_CD.box;
  const A = dragArea(shape, size);
  return 0.5 * AIR_DENSITY * v2 * Cd * A;
}

/**
 * Vector lực cản (N), ngược chiều vận tốc.
 * @param {{ x: number, y?: number, z?: number }} vel
 * @param {string} shape
 * @param {number} size
 * @returns {{ x: number, y: number, z: number }}
 */
export function airDragForceVector(vel, shape, size) {
  const vx = vel.x ?? 0;
  const vy = vel.y ?? 0;
  const vz = vel.z ?? 0;
  const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
  if (speed < 1e-4) return { x: 0, y: 0, z: 0 };

  const dragMag = computeAirDragMagnitude(speed, shape, size);
  const s = -dragMag / speed;
  return { x: vx * s, y: vy * s, z: vz * s };
}

/**
 * Gia tốc do cản không khí (m/s²) từ vector vận tốc 3D.
 * @param {{ x, y, z }} vel
 * @param {number} mass (kg)
 * @param {string} shape
 * @param {number} size
 * @returns {{ ax: number, ay: number, az: number }}
 */
export function airDragAcceleration3D(vel, mass, shape, size) {
  if (!mass || mass <= 0) return { ax: 0, ay: 0, az: 0 };
  const f = airDragForceVector(vel, shape, size);
  return { ax: f.x / mass, ay: f.y / mass, az: f.z / mass };
}

/**
 * Gia tốc cản trên một trục (m/s²), ngược chiều v.
 * @param {number} v — vận tốc theo trục (m/s)
 * @param {number} mass (kg)
 * @param {string} shape
 * @param {number} size
 * @returns {number}
 */
export function airDragAcceleration1D(v, mass, shape, size) {
  if (!mass || mass <= 0 || Math.abs(v) < 1e-4) return 0;
  const dragMag = computeAirDragMagnitude(Math.abs(v), shape, size);
  return (-Math.sign(v) * dragMag) / mass;
}

/**
 * Kích thước đặc trưng (m) từ tham số scene 1–3.
 * @param {object} params — sceneParams
 * @returns {{ shape: string, size: number }}
 */
export function objectDragGeometry(params) {
  const shape = params.graphicsShape ?? params.shape ?? 'box';
  const size = (params.boxSize ?? 0.6) * (params.graphicsScale ?? 1);
  return { shape, size };
}

/**
 * Kích thước đặc trưng cho vật trong scene 4.
 * @param {object} params
 * @param {'object_1'|'object_2'} objectId
 * @returns {{ shape: string, size: number }}
 */
export function collisionObjectDragGeometry(params, objectId) {
  const r = params.sphereRadius ?? 0.45;
  if (objectId === 'object_1') {
    const scale = params.graphicsObject1Scale ?? 1;
    return {
      shape: params.graphicsObject1Shape ?? 'sphere',
      size: Math.max(0.4, Math.min(1.6, r * 2 * scale)),
    };
  }
  const scale = params.graphicsObject2Scale ?? 1;
  return {
    shape: params.graphicsObject2Shape ?? 'sphere',
    size: Math.max(0.4, Math.min(1.6, r * 2 * scale)),
  };
}
