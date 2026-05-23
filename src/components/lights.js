import * as THREE from 'three';
import { SHADOW_MAP_SIZE } from '../constants.js';

/**
 * Ánh sáng Phong: Ambient (môi trường) + Directional (khuếch tán + specular).
 */
export function setupSceneLights(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  const directional = new THREE.DirectionalLight(0xffffff, 0.85);
  directional.position.set(15, 25, 12);
  directional.castShadow = true;
  directional.shadow.mapSize.width = SHADOW_MAP_SIZE;
  directional.shadow.mapSize.height = SHADOW_MAP_SIZE;
  directional.shadow.camera.near = 0.5;
  directional.shadow.camera.far = 80;
  directional.shadow.camera.left = -25;
  directional.shadow.camera.right = 25;
  directional.shadow.camera.top = 25;
  directional.shadow.camera.bottom = -25;
  directional.shadow.bias = -0.0005;

  scene.add(ambient, directional);
  return { ambient, directional, all: [ambient, directional] };
}
