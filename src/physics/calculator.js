import { degToRad, vecLength } from '../utils/helpers.js';

export function kineticEnergy(mass, vx, vy, vz = 0) {
  const v2 = vx * vx + vy * vy + vz * vz;
  return 0.5 * mass * v2;
}

export function inclineForces(mass, g, angleDeg, mu, appliedF = 0) {
  const theta = degToRad(angleDeg);
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);
  const weight = mass * g;
  const wParallel = weight * sinT;
  const normal = weight * cosT;
  const friction = mu * normal;
  const net = appliedF + wParallel - friction;
  return {
    gravity: weight,
    weightParallel: wParallel,
    normal,
    friction,
    applied: appliedF,
    net,
    acceleration: mass > 0 ? net / mass : 0,
  };
}

export function horizontalForces(mass, g, mu, appliedF, velX, velZ) {
  const weight = mass * g;
  const normal = weight;
  const frictionMag = mu * normal;
  const speed = vecLength(velX, 0, velZ);
  let fx = appliedF;
  let fz = 0;
  if (speed > 0.01) {
    fx -= (frictionMag * velX) / speed;
    fz -= (frictionMag * velZ) / speed;
  } else if (appliedF < frictionMag) {
    fx = 0;
  } else {
    fx = appliedF - frictionMag;
  }
  const net = vecLength(fx, 0, fz);
  return {
    gravity: weight,
    normal,
    friction: frictionMag,
    applied: appliedF,
    net,
    acceleration: mass > 0 ? net / mass : 0,
    frictionComponents: { x: fx - appliedF, z: fz },
  };
}

/**
 * Lực và gia tốc rơi tự do / ném (lực F áp dụng theo vector).
 * appliedVec, netVec: thành phần lực (N).
 */
export function freeFallForces(mass, g, appliedVec = { x: 0, y: 0, z: 0 }, netVec = null) {
  const weight = mass * g;
  const net = netVec ?? {
    x: appliedVec.x,
    y: appliedVec.y - weight,
    z: appliedVec.z ?? 0,
  };
  const m = mass > 0 ? mass : 1;
  const ax = net.x / m;
  const ay = net.y / m;
  const az = (net.z ?? 0) / m;
  const appliedMag = vecLength(appliedVec.x, appliedVec.y, appliedVec.z ?? 0);
  const netMag = vecLength(net.x, net.y, net.z ?? 0);
  return {
    gravity: weight,
    applied: appliedMag,
    net: netMag,
    accelerationX: ax,
    accelerationY: ay,
    accelerationZ: az,
  };
}

export function momentum1D(masses, velocities) {
  return masses.reduce((p, m, i) => p + m * velocities[i], 0);
}

/** Vận tốc sau va chạm 1D (momentum + hệ số phục hồi e). */
export function solve1DCollision(m1, m2, v1, v2, e = 1) {
  const sum = m1 + m2;
  if (sum <= 0) return { v1After: v1, v2After: v2 };
  const v1After = (m1 * v1 + m2 * v2 - e * m2 * (v2 - v1)) / sum;
  const v2After = (m1 * v1 + m2 * v2 + e * m1 * (v2 - v1)) / sum;
  return { v1After, v2After };
}

export function totalKineticEnergy(objects) {
  return objects.reduce((sum, o) => {
    const v = o.body?.velocity ?? o.velocity;
    const m = o.mass ?? o.body?.mass;
    return sum + kineticEnergy(m, v.x, v.y, v.z);
  }, 0);
}

export function velocityFromBody(body) {
  return { x: body.velocity.x, y: body.velocity.y, z: body.velocity.z };
}

export function positionFromBody(body) {
  return { x: body.position.x, y: body.position.y, z: body.position.z };
}
