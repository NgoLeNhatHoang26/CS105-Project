import * as THREE from 'three';
import { SHADOW_MAP_SIZE } from '../constants.js';

/**
 * Chiếu sáng 3 loại:
 *   - AmbientLight   (ánh sáng môi trường)
 *   - DirectionalLight (ánh sáng định hướng, có bóng đổ / shadow mapping)
 *   - PointLight     (ánh sáng điểm, warm accent)
 */
export function setupSceneLights(scene) {
  // ── Ambient Light ──────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x9eb8ff, 0.42);

  // ── Directional Light (with PCFSoft shadow map) ───────────────────────────
  const directional = new THREE.DirectionalLight(0xe8f0ff, 0.78);
  directional.position.set(15, 25, 12);
  directional.castShadow = true;
  directional.shadow.mapSize.width  = SHADOW_MAP_SIZE;
  directional.shadow.mapSize.height = SHADOW_MAP_SIZE;
  directional.shadow.camera.near   = 0.5;
  directional.shadow.camera.far    = 80;
  // Wide shadow frustum to cover all experiment scenes.
  directional.shadow.camera.left   = -25;
  directional.shadow.camera.right  = 30;
  directional.shadow.camera.top    = 25;
  directional.shadow.camera.bottom = -25;
  directional.shadow.bias = -0.0005;

  // ── Point Light (ánh sáng điểm) ───────────────────────────────────────────
  // Warm fill light positioned above the center of the scene.
  // castShadow = false for performance; the directional light handles shadows.
  const pointLight = new THREE.PointLight(0x7c5cff, 0.48, 40, 1.4);
  pointLight.position.set(4, 10, 6);

  scene.add(ambient, directional, pointLight);
  return { ambient, directional, pointLight, all: [ambient, directional, pointLight] };
}
