import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createPhongMaterial } from './materials.js';
import { syncLoadedVisualFromBody, disposeLoadedVisual } from '../graphics/modelLoader.js';

/**
 * Factory mesh + Cannon body — transformation sync từ physics.
 */
export function createBoxPair({
  width,
  height,
  depth,
  mass,
  position,
  color,
  material,
  damping = true,
}) {
  const w = width ?? 1;
  const h = height ?? 1;
  const d = depth ?? 1;
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = material ?? createPhongMaterial(color ?? 0x4a90d9);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(position.x, position.y, position.z);

  const shape = new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2));
  const body = new CANNON.Body({ mass, shape });
  body.position.set(position.x, position.y, position.z);
  if (mass > 0) {
    body.linearDamping = damping ? 0.01 : 0;
    body.angularDamping = damping ? 0.1 : 0;
  }

  return { mesh, body, geometry: geo, material: mat, shapeType: 'box' };
}

export function createSpherePair({ radius, mass, position, color, material, damping = true }) {
  const r = radius ?? 0.5;
  const geo = new THREE.SphereGeometry(r, 32, 32);
  const mat = material ?? createPhongMaterial(color ?? 0xe94560);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(position.x, position.y, position.z);

  const shape = new CANNON.Sphere(r);
  const body = new CANNON.Body({ mass, shape });
  body.position.set(position.x, position.y, position.z);
  if (mass > 0) {
    body.linearDamping = damping ? 0.01 : 0;
    body.angularDamping = damping ? 0.1 : 0;
  }

  return { mesh, body, geometry: geo, material: mat, shapeType: 'sphere' };
}

export function createStaticPlaneBody(offset = 0) {
  const shape = new CANNON.Plane();
  const body = new CANNON.Body({ mass: 0, shape });
  body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  body.position.y = offset;
  return body;
}

export function createStaticBox(size, position, quaternion) {
  const half = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
  const shape = new CANNON.Box(half);
  const body = new CANNON.Body({ mass: 0, shape });
  body.position.set(position.x, position.y, position.z);
  if (quaternion) body.quaternion.copy(quaternion);
  return body;
}

export function disposePair({ mesh, body, geometry, material }) {
  mesh?.parent?.remove(mesh);
  geometry?.dispose();
  if (material) {
    if (material.map) material.map.dispose();
    material.dispose();
  }
  return { mesh, body };
}

export function saveInitialPose(simObject) {
  simObject.initialPosition = simObject.mesh.position.clone();
  simObject.initialQuaternion = simObject.mesh.quaternion.clone();
}

export function resetSimObject(simObject) {
  if (!simObject.initialPosition) return;
  simObject.mesh.position.copy(simObject.initialPosition);
  simObject.mesh.quaternion.copy(simObject.initialQuaternion);
  simObject.body.position.copy(simObject.initialPosition);
  simObject.body.quaternion.copy(simObject.initialQuaternion);
  simObject.body.velocity.set(0, 0, 0);
  simObject.body.angularVelocity.set(0, 0, 0);
  simObject.body.wakeUp();
}

export function syncMeshFromBody(mesh, body) {
  mesh.position.copy(body.position);
  mesh.quaternion.copy(body.quaternion);
  const offset = mesh?.userData?.visualRotationOffset;
  if (offset) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(offset.x, offset.y, offset.z, 'XYZ'));
    mesh.quaternion.multiply(q);
  }
}

/** Đồng bộ mesh + model GLTF (nếu có). */
export function syncSimObjectFromBody(sim) {
  if (!sim?.mesh || !sim?.body) return;
  syncMeshFromBody(sim.mesh, sim.body);
  syncLoadedVisualFromBody(sim);
}

export function disposeSimObject(sim) {
  disposeLoadedVisual(sim);
  disposePair(sim);
}

export function syncBodyFromMesh(body, mesh) {
  body.position.copy(mesh.position);
  body.quaternion.copy(mesh.quaternion);
  body.velocity.set(0, 0, 0);
  body.angularVelocity.set(0, 0, 0);
}
