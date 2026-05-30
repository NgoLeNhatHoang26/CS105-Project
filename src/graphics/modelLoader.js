import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

/**
 * Load GLTF/GLB từ URL (file local blob: hoặc public/models/...).
 */
export function loadGLTFFromUrl(url) {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf.scene),
      undefined,
      (err) => reject(err),
    );
  });
}

export function fitObjectToSize(root, targetSize) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
  const scale = targetSize / maxDim;
  root.scale.setScalar(scale);
  box.setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.sub(center);
}

export function disposeObject3D(root) {
  if (!root) return;
  root.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        m.map?.dispose?.();
        m.dispose?.();
      });
    }
  });
}

export function disposeLoadedVisual(sim) {
  if (!sim?.loadedVisual) return;
  sim.loadedVisual.parent?.remove(sim.loadedVisual);
  disposeObject3D(sim.loadedVisual);
  sim.loadedVisual = null;
  if (sim.mesh) sim.mesh.visible = true;
}

/**
 * Gắn model file làm lớp hiển thị; physics body / collider giữ nguyên.
 */
export async function attachLoadedModelVisual(sim, url, targetSize) {
  if (!sim?.mesh || !url) return false;
  const modelRoot = await loadGLTFFromUrl(url);
  disposeLoadedVisual(sim);

  const wrapper = new THREE.Group();
  wrapper.name = 'loadedModelVisual';
  const clone = modelRoot.clone(true);
  fitObjectToSize(clone, targetSize);
  clone.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  wrapper.add(clone);

  wrapper.position.copy(sim.mesh.position);
  wrapper.quaternion.copy(sim.mesh.quaternion);
  const offset = sim.mesh.userData?.visualRotationOffset;
  if (offset) {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(offset.x, offset.y, offset.z, 'XYZ'),
    );
    wrapper.quaternion.multiply(q);
  }

  sim.loadedVisual = wrapper;
  sim.mesh.visible = false;
  return true;
}

export function syncLoadedVisualFromBody(sim) {
  if (!sim?.loadedVisual || !sim.body) return;
  sim.loadedVisual.position.copy(sim.body.position);
  sim.loadedVisual.quaternion.copy(sim.body.quaternion);
  const offset = sim.mesh?.userData?.visualRotationOffset;
  if (offset) {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(offset.x, offset.y, offset.z, 'XYZ'),
    );
    sim.loadedVisual.quaternion.multiply(q);
  }
}
