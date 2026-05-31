/** Đồng bộ Three.js mesh từ SimState (kinematic). */

import * as THREE from 'three';
import { syncLoadedVisualFromMesh } from '../graphics/modelLoader.js';

/**
 * Cập nhật `mesh.position` từ `sim.simState.position`.
 * Giữ nguyên quaternion (rotation do scene tự quản lý).
 * @param {object} sim  — simObject có `mesh` và `simState`
 */
export function syncMeshFromState(sim) {
  if (!sim?.mesh || !sim?.simState) return;
  const p = sim.simState.position;
  sim.mesh.position.set(p.x, p.y, p.z);

  // Áp visual rotation offset nếu có (giữ compat với graphics layer)
  const offset = sim.mesh?.userData?.visualRotationOffset;
  if (offset) {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(offset.x, offset.y, offset.z, 'XYZ'),
    );
    sim.mesh.quaternion.multiply(q);
  }
  syncLoadedVisualFromMesh(sim);
}

/**
 * Lưu vị trí khởi đầu của sim kinematic để sau này reset.
 * Gọi sau khi spawn, trước Play.
 * @param {object} sim
 */
export function saveInitialPoseKinematic(sim) {
  if (!sim?.simState) return;
  sim.initialSimState = {
    position: { ...sim.simState.position },
    velocity: { ...sim.simState.velocity },
    acceleration: { x: 0, y: 0, z: 0 },
    mass: sim.simState.mass,
  };
  // Lưu thêm quaternion mesh để reset hình dạng
  if (sim.mesh) {
    sim.initialMeshQuaternion = sim.mesh.quaternion.clone();
  }
}

/**
 * Reset sim kinematic về trạng thái ban đầu.
 * @param {object} sim
 */
export function resetSimObjectKinematic(sim) {
  if (!sim?.simState || !sim?.initialSimState) return;
  const init = sim.initialSimState;
  sim.simState.position = { ...init.position };
  sim.simState.velocity = { ...init.velocity };
  sim.simState.acceleration = { x: 0, y: 0, z: 0 };

  if (sim.mesh) {
    sim.mesh.position.set(init.position.x, init.position.y, init.position.z);
    if (sim.initialMeshQuaternion) {
      sim.mesh.quaternion.copy(sim.initialMeshQuaternion);
    }
  }
}
