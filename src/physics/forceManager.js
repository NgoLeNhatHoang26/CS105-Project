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
