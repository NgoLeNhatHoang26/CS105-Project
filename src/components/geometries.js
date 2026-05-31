import * as THREE from 'three';
import { createPhongMaterial } from './materials.js';
import { syncLoadedVisualFromMesh, disposeLoadedVisual } from '../graphics/modelLoader.js';

/** Mesh factory — không tạo physics body. */
export function createBoxPair({
  width,
  height,
  depth,
  position,
  color,
  material,
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
  return { mesh, geometry: geo, material: mat, shapeType: 'box' };
}

export function createSpherePair({ radius, position, color, material }) {
  const r = radius ?? 0.5;
  const geo = new THREE.SphereGeometry(r, 32, 32);
  const mat = material ?? createPhongMaterial(color ?? 0xe94560);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(position.x, position.y, position.z);
  return { mesh, geometry: geo, material: mat, shapeType: 'sphere' };
}

export function disposePair({ mesh, geometry, material }) {
  mesh?.parent?.remove(mesh);
  geometry?.dispose();
  if (material) {
    if (material.map) material.map.dispose();
    material.dispose();
  }
}

export function disposeSimObject(sim) {
  disposeLoadedVisual(sim);
  disposePair(sim);
}

/** Đồng bộ mesh + model GLTF (nếu có) khi pause. */
export function syncSimObject(sim) {
  if (!sim?.mesh) return;
  syncLoadedVisualFromMesh(sim);
}
