import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function setupOrbitControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = true;
  controls.enablePan = true;
  // Orbit bằng chuột trái theo yêu cầu mới.
  // Pan vẫn giữ ở chuột giữa/phải để không chiếm chuột trái.
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.PAN,
  };
  return controls;
}

export function resetCameraView(camera, controls, position, target) {
  camera.position.set(...position);
  if (controls) {
    controls.target.set(...target);
    controls.update();
  } else {
    camera.lookAt(...target);
  }
}
