import * as THREE from 'three';
import { degToRad } from '../utils/helpers.js';

export function computeInclineData(length, angleDeg) {
  const angleRad = degToRad(angleDeg);
  const baseLength = length * Math.cos(angleRad);
  const height = length * Math.sin(angleRad);

  const bottomPoint = new THREE.Vector3(baseLength / 2, 0, 0);
  const topPoint = new THREE.Vector3(-baseLength / 2, height, 0);
  const downhillDir = bottomPoint.clone().sub(topPoint).normalize();
  const uphillDir = downhillDir.clone().negate();
  const rampNormal = new THREE.Vector3(Math.sin(angleRad), Math.cos(angleRad), 0).normalize();
  const rampRight = downhillDir.clone().cross(rampNormal).normalize();

  return {
    angleRad,
    length,
    baseLength,
    height,
    topPoint,
    bottomPoint,
    downhillDir,
    uphillDir,
    rampNormal,
    rampRight,
  };
}

export function getRampFrameQuaternion(inclineData) {
  const { downhillDir, rampNormal, rampRight } = inclineData;
  // local X = downhill, local Y = ramp normal, local Z = ramp right
  const basis = new THREE.Matrix4().makeBasis(downhillDir, rampNormal, rampRight);
  const quat = new THREE.Quaternion();
  quat.setFromRotationMatrix(basis);
  return quat;
}

export function computeBoxHalfExtentAlongNormal(dimensions, inclineData) {
  const { width, height, depth } = dimensions;
  const hx = width / 2;
  const hy = height / 2;
  const hz = depth / 2;

  const xAxis = inclineData.downhillDir;
  const yAxis = inclineData.rampNormal;
  const zAxis = inclineData.rampRight;
  const n = inclineData.rampNormal;

  // Support mapping: half-extent theo hướng normal thế giới.
  return (
    Math.abs(n.dot(xAxis)) * hx +
    Math.abs(n.dot(yAxis)) * hy +
    Math.abs(n.dot(zAxis)) * hz
  );
}

export function computeSpawnPosition(
  inclineData,
  halfHeightAlongNormal,
  downOffset = 0.06,
  normalOffset = 0.02,
) {
  const { topPoint, downhillDir, rampNormal } = inclineData;
  return topPoint
    .clone()
    .add(downhillDir.clone().multiplyScalar(downOffset))
    .add(rampNormal.clone().multiplyScalar(halfHeightAlongNormal + normalOffset));
}

export function distanceAlongRamp(worldPosition, inclineData) {
  return worldPosition
    .clone()
    .sub(inclineData.topPoint)
    .dot(inclineData.downhillDir);
}

export function getBottomAnchorPosition(inclineData, downOffset, halfHeightAlongNormal, normalOffset) {
  return inclineData.topPoint
    .clone()
    .add(inclineData.downhillDir.clone().multiplyScalar(downOffset))
    .add(inclineData.rampNormal.clone().multiplyScalar(halfHeightAlongNormal + normalOffset));
}

/**
 * Lực F trên mặt dốc: góc đo trong mặt phẳng tiếp tuyến (0° = xuống dốc, 90° = ngang mặt dốc).
 */
export function computeAppliedForceOnRamp(inclineData, forceMag, angleDeg) {
  const rad = degToRad(angleDeg);
  const { downhillDir, rampRight } = inclineData;
  return downhillDir
    .clone()
    .multiplyScalar(Math.cos(rad))
    .add(rampRight.clone().multiplyScalar(Math.sin(rad)))
    .multiplyScalar(forceMag);
}

/**
 * Giữ vật trên mặt dốc và trượt 1D dọc tâm dốc (không trôi ngang rampRight).
 */
export function constrainBodyToRamp(body, inclineData, halfHeightAlongNormal) {
  const { topPoint, rampNormal, rampRight } = inclineData;
  const pos = new THREE.Vector3(body.position.x, body.position.y, body.position.z);
  const vel = new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z);

  const planeDist = pos.clone().sub(topPoint).dot(rampNormal);
  if (Math.abs(planeDist - halfHeightAlongNormal) > 1e-4) {
    pos.addScaledVector(rampNormal, halfHeightAlongNormal - planeDist);
  }

  const lateral = pos.clone().sub(topPoint).dot(rampRight);
  if (Math.abs(lateral) > 1e-6) {
    pos.addScaledVector(rampRight, -lateral);
  }

  body.position.set(pos.x, pos.y, pos.z);

  const normalSpeed = vel.dot(rampNormal);
  const lateralSpeed = vel.dot(rampRight);
  if (Math.abs(normalSpeed) > 1e-6 || Math.abs(lateralSpeed) > 1e-6) {
    vel.addScaledVector(rampNormal, -normalSpeed);
    vel.addScaledVector(rampRight, -lateralSpeed);
    body.velocity.set(vel.x, vel.y, vel.z);
  }
}

