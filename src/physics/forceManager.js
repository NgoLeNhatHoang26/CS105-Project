import * as CANNON from 'cannon-es';
import { degToRad } from '../utils/helpers.js';

/**
 * Áp lực F do người dùng (N) lên body — world hoặc mặt phẳng nghiêng.
 */
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

export function forceOnIncline(magnitude, angleDeg, rampAngleRad) {
  const rad = degToRad(angleDeg);
  const along = magnitude * Math.cos(rad);
  const perp = magnitude * Math.sin(rad);
  return {
    x: along * Math.cos(rampAngleRad) - perp * Math.sin(rampAngleRad),
    y: along * Math.sin(rampAngleRad) + perp * Math.cos(rampAngleRad),
    z: 0,
  };
}

export function applyForceVector(body, force) {
  const f = new CANNON.Vec3(force.x, force.y, force.z);
  body.applyForce(f);
}

export function clearForces(body) {
  body.force.set(0, 0, 0);
  body.torque.set(0, 0, 0);
}

/**
 * Ma sát Coulomb (μN) trên mặt phẳng tiếp tuyến của dốc.
 * appliedForce: lực F do người dùng (đã nằm trên mặt dốc).
 */
export function applyInclineFriction(body, inclineData, mass, g, mu, appliedForce) {
  if (mu <= 0 || mass <= 0) return;

  const { angleRad, downhillDir, rampNormal } = inclineData;
  const normalForce = mass * g * Math.cos(angleRad);
  const frictionMag = mu * normalForce;

  const gravityTangent = downhillDir.clone().multiplyScalar(mass * g * Math.sin(angleRad));
  const drive = {
    x: appliedForce.x + gravityTangent.x,
    y: appliedForce.y + gravityTangent.y,
    z: appliedForce.z + gravityTangent.z,
  };
  const driveMag = Math.hypot(drive.x, drive.y, drive.z);

  const vel = {
    x: body.velocity.x,
    y: body.velocity.y,
    z: body.velocity.z,
  };
  const vn = vel.x * rampNormal.x + vel.y * rampNormal.y + vel.z * rampNormal.z;
  const vtx = vel.x - vn * rampNormal.x;
  const vty = vel.y - vn * rampNormal.y;
  const vtz = vel.z - vn * rampNormal.z;
  const speed = Math.hypot(vtx, vty, vtz);

  let fx;
  let fy;
  let fz;
  if (speed > 0.02) {
    const scale = -frictionMag / speed;
    fx = vtx * scale;
    fy = vty * scale;
    fz = vtz * scale;
  } else if (driveMag <= frictionMag) {
    fx = -drive.x;
    fy = -drive.y;
    fz = -drive.z;
  } else {
    const scale = -frictionMag / driveMag;
    fx = drive.x * scale;
    fy = drive.y * scale;
    fz = drive.z * scale;
  }

  applyForceVector(body, { x: fx, y: fy, z: fz });
}

// ─── Sức cản không khí ────────────────────────────────────────────────────────

const AIR_DENSITY = 1.225; // kg/m³ — điều kiện chuẩn, ngang mực biển

const DRAG_CD = {
  sphere:   0.47,
  box:      1.05,
  cylinder: 0.82,
  cone:     0.50,
  wheel:    0.90,
  teapot:   0.80,
};

function _dragArea(shape, size) {
  switch (shape) {
    case 'sphere':
    case 'teapot':   return Math.PI * (0.5 * size) ** 2;
    case 'cylinder':
    case 'wheel':    return Math.PI * (0.45 * size) ** 2;
    case 'cone':     return Math.PI * (0.5 * size) ** 2;
    case 'box':
    default:         return size * size;
  }
}

/** Độ lớn lực cản không khí (N): F = ½ρv²CdA — chỉ tính, không áp lực. */
export function computeAirDragMagnitude(body, shape, size) {
  const vx = body.velocity.x;
  const vy = body.velocity.y;
  const vz = body.velocity.z;
  const v2 = vx * vx + vy * vy + vz * vz;
  if (v2 < 1e-8) return 0;
  const Cd = DRAG_CD[shape] ?? DRAG_CD.box;
  const A = _dragArea(shape, size);
  return 0.5 * AIR_DENSITY * v2 * Cd * A;
}

/** Áp lực cản không khí lên body — hướng ngược vận tốc tức thời. */
export function applyAirDrag(body, shape, size) {
  const vx = body.velocity.x;
  const vy = body.velocity.y;
  const vz = body.velocity.z;
  const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
  if (speed < 1e-4) return;
  const dragMag = computeAirDragMagnitude(body, shape, size);
  const s = -dragMag / speed;
  applyForceVector(body, { x: vx * s, y: vy * s, z: vz * s });
}

/**
 * Ma sát Coulomb (μN) trên mặt phẳng ngang (mặt xz).
 * appliedForce: lực F do người dùng (thành phần ngang).
 */
export function applyHorizontalFriction(body, mass, g, mu, appliedForce) {
  if (mu <= 0 || mass <= 0) return;

  const frictionMag = mu * mass * g;
  const drive = { x: appliedForce.x, y: 0, z: appliedForce.z };
  const driveMag = Math.hypot(drive.x, drive.z);
  const speed = Math.hypot(body.velocity.x, body.velocity.z);

  let fx;
  let fz;
  if (speed > 0.02) {
    const scale = -frictionMag / speed;
    fx = body.velocity.x * scale;
    fz = body.velocity.z * scale;
  } else if (driveMag <= frictionMag) {
    fx = -drive.x;
    fz = -drive.z;
  } else {
    const scale = -frictionMag / driveMag;
    fx = drive.x * scale;
    fz = drive.z * scale;
  }

  applyForceVector(body, { x: fx, y: 0, z: fz });
}
