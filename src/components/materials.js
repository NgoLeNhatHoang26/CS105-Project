import * as THREE from 'three';

/**
 * MeshPhongMaterial — mô hình Phong (ambient + diffuse + specular).
 */
export function createPhongMaterial(color, options = {}) {
  return new THREE.MeshPhongMaterial({
    color: color ?? 0x4a90d9,
    shininess: options.shininess ?? 40,
    specular: options.specular ?? 0x222222,
    emissive: options.emissive ?? 0x000000,
    ...options,
  });
}

function setHighlightMaterial(material, on, hex = 0x444400) {
  if (!material) return;
  const mats = Array.isArray(material) ? material : [material];
  mats.forEach((m) => {
    if (m?.emissive) m.emissive.setHex(on ? hex : 0x000000);
  });
}

/** Mesh, Group hoặc Material — highlight khi chọn vật. */
export function setHighlight(target, on, hex = 0x444400) {
  if (!target) return;
  if (target.isMesh || target.isGroup) {
    target.traverse((c) => {
      if (c.isMesh) setHighlightMaterial(c.material, on, hex);
    });
    return;
  }
  setHighlightMaterial(target, on, hex);
}

export function disposeMaterial(material) {
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
  } else if (material) {
    material.dispose?.();
  }
}
