import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createPhongMaterial } from '../components/materials.js';

function clampScale(scale) {
  return Math.max(0.4, Math.min(1.6, Number(scale ?? 1)));
}

function toRad(deg) {
  return (Number(deg ?? 0) * Math.PI) / 180;
}

function makeMaterial({ color, wireframe, textureMap, textureName }) {
  const map = textureMap?.[textureName] ?? null;
  return createPhongMaterial(color ?? 0x4a90d9, {
    wireframe: Boolean(wireframe),
    map: map ? map.clone() : null,
  });
}

function buildWheelMesh(size, mat) {
  const group = new THREE.Group();
  const tire = new THREE.Mesh(
    new THREE.TorusGeometry(0.52 * size, 0.14 * size, 16, 40),
    mat.clone(),
  );
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13 * size, 0.13 * size, 0.18 * size, 16),
    mat.clone(),
  );
  hub.rotation.x = Math.PI / 2;
  group.add(tire, hub);
  group.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  return group;
}

function buildTeapotLikeMesh(size, mat) {
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.35 * size, 0.05 * size),
    new THREE.Vector2(0.52 * size, 0.25 * size),
    new THREE.Vector2(0.55 * size, 0.5 * size),
    new THREE.Vector2(0.52 * size, 0.75 * size),
    new THREE.Vector2(0.38 * size, 0.9 * size),
    new THREE.Vector2(0.22 * size, 1.0 * size),
    new THREE.Vector2(0.28 * size, 1.1 * size),
    new THREE.Vector2(0.2 * size, 1.15 * size),
    new THREE.Vector2(0, 1.15 * size),
  ];
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function buildVisual(shape, size, material) {
  switch (shape) {
    case 'sphere':
      return new THREE.Mesh(new THREE.SphereGeometry(0.5 * size, 32, 32), material);
    case 'cone':
      return new THREE.Mesh(new THREE.ConeGeometry(0.5 * size, size, 32), material);
    case 'cylinder':
      return new THREE.Mesh(new THREE.CylinderGeometry(0.45 * size, 0.45 * size, size, 32), material);
    case 'wheel':
      return buildWheelMesh(size, material);
    case 'teapot':
      return buildTeapotLikeMesh(size, material);
    case 'box':
    default:
      return new THREE.Mesh(new THREE.BoxGeometry(size, size, size), material);
  }
}

export function createVisualMesh({
  shape = 'box',
  size = 0.6,
  color,
  wireframe,
  textureMap,
  textureName = 'default',
}) {
  const s = clampScale(size);
  const mat = makeMaterial({ color, wireframe, textureMap, textureName });
  const mesh = buildVisual(shape, s, mat);
  if (mesh.isMesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }
  return { mesh, material: mat, size: s };
}

function buildCollider(shape, size) {
  switch (shape) {
    case 'sphere':
    case 'teapot':
      return new CANNON.Sphere(0.5 * size);
    case 'cylinder':
    case 'wheel':
      return new CANNON.Cylinder(0.45 * size, 0.45 * size, size, 20);
    case 'cone':
      // cannon-es has no cone primitive; use simple cylinder proxy.
      return new CANNON.Cylinder(0.5 * size, 0.15 * size, size, 20);
    case 'box':
    default:
      return new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
  }
}

export function createExperimentPair({
  shape = 'box',
  size = 0.6,
  mass = 1,
  position,
  color,
  wireframe,
  textureMap,
  textureName = 'default',
  damping = true,
}) {
  const s = clampScale(size);
  const mat = makeMaterial({ color, wireframe, textureMap, textureName });
  const mesh = buildVisual(shape, s, mat);
  mesh.position.set(position.x, position.y, position.z);
  if (mesh.isMesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  const body = new CANNON.Body({ mass });
  body.addShape(buildCollider(shape, s));
  body.position.set(position.x, position.y, position.z);
  if (mass > 0) {
    body.linearDamping = damping ? 0.01 : 0;
    body.angularDamping = damping ? 0.1 : 0;
  }

  return { mesh, body, shapeType: shape, material: mat, size: s };
}

export function applyVisualRotation(simObject, cfg = {}) {
  if (!simObject?.mesh) return;
  const rx = toRad(cfg.graphicsRotX);
  const ry = toRad(cfg.graphicsRotY);
  const rz = toRad(cfg.graphicsRotZ);
  simObject.mesh.userData.visualRotationOffset = { x: rx, y: ry, z: rz };
}
