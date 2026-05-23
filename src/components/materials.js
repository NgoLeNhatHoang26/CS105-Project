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

export function setHighlight(material, on, hex = 0x444400) {
  if (!material || !material.emissive) return;
  material.emissive.setHex(on ? hex : 0x000000);
}

export function disposeMaterial(material) {
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
  } else if (material) {
    material.dispose?.();
  }
}
