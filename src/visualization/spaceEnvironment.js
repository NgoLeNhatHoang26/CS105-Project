import * as THREE from 'three';

/**
 * Nền vũ trụ cố định — không bị xóa khi đổi scene vật lý.
 */
export function createSpaceStarfield(scene, count = 2800) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const c1 = new THREE.Color(0xa8d4ff);
  const c2 = new THREE.Color(0xe8d4ff);
  const c3 = new THREE.Color(0xffffff);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 320;
    positions[i3 + 1] = Math.random() * 160 + 4;
    positions[i3 + 2] = (Math.random() - 0.5) * 320;

    const pick = Math.random();
    const col = pick < 0.55 ? c3 : pick < 0.8 ? c1 : c2;
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.42,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(geo, mat);
  stars.name = 'spaceStarfield';
  stars.frustumCulled = false;
  stars.renderOrder = -100;
  scene.add(stars);
  return stars;
}

export const SCENE_SPACE_THEMES = {
  1: { bg: 0x0a0e22, fogNear: 38, fogFar: 145 },
  2: { bg: 0x12082a, fogNear: 32, fogFar: 135 },
  3: { bg: 0x081420, fogNear: 36, fogFar: 150 },
  4: { bg: 0x06040f, fogNear: 28, fogFar: 125 },
};

export function setSpaceBackground(scene, sceneId) {
  const theme = SCENE_SPACE_THEMES[sceneId] ?? SCENE_SPACE_THEMES[1];
  const color = new THREE.Color(theme.bg);
  scene.background = color;
  scene.fog = new THREE.Fog(theme.bg, theme.fogNear, theme.fogFar);
  return theme;
}
