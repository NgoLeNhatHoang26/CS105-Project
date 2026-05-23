import * as THREE from 'three';

/**
 * Texture mapping — lưới procedural (UV repeat) cho sàn / ramp.
 */
export function createGridTexture(repeatX = 8, repeatY = 8) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 1;
  const step = size / 16;
  for (let i = 0; i <= 16; i++) {
    const p = i * step;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

export function createTexturedPlane(width, depth, repeatX = 8, repeatY = 8, color = 0xffffff) {
  const tex = createGridTexture(repeatX, repeatY);
  const geo = new THREE.PlaneGeometry(width, depth);
  const mat = new THREE.MeshPhongMaterial({
    map: tex,
    color,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return { mesh, texture: tex, geometry: geo, material: mat };
}

export function disposeGridMesh({ mesh, texture, geometry, material }) {
  mesh?.parent?.remove(mesh);
  texture?.dispose();
  geometry?.dispose();
  material?.dispose();
}
