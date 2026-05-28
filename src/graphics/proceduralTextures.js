import * as THREE from 'three';

/**
 * Procedural texture generators using HTML Canvas → THREE.CanvasTexture.
 * All textures use UV RepeatWrapping for tileable mapping.
 */

function makeCanvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return { c, ctx: c.getContext('2d') };
}

/** Black-and-white checker grid. */
export function createCheckerTexture(size = 256) {
  const { c, ctx } = makeCanvas(size);
  const s = size / 8;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? '#555' : '#ddd';
      ctx.fillRect(i * s, j * s, s, s);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

/** Vertical wood grain stripes with horizontal gradient. */
export function createWoodTexture(size = 256) {
  const { c, ctx } = makeCanvas(size);
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0,   '#8B4513');
  grad.addColorStop(0.3, '#A0522D');
  grad.addColorStop(0.6, '#6B3510');
  grad.addColorStop(1,   '#8B4513');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < size; i += 10) {
    const wave = Math.sin(i * 0.12) * 4;
    ctx.beginPath();
    ctx.moveTo(i + wave, 0);
    ctx.lineTo(i + wave, size);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

/** Brushed metallic horizontal lines. */
export function createMetalTexture(size = 256) {
  const { c, ctx } = makeCanvas(size);
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0,   '#c8c8c8');
  grad.addColorStop(0.4, '#9e9e9e');
  grad.addColorStop(0.6, '#d8d8d8');
  grad.addColorStop(1,   '#b2b2b2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 4) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

/** Brick pattern with mortar joints. */
export function createBrickTexture(size = 256) {
  const { c, ctx } = makeCanvas(size);
  ctx.fillStyle = '#b0b0b0';
  ctx.fillRect(0, 0, size, size);
  const bw = 60, bh = 28, mortar = 4;
  const rows = Math.ceil(size / bh) + 1;
  const cols = Math.ceil(size / bw) + 2;
  for (let row = 0; row < rows; row++) {
    const offset = (row % 2) * (bw / 2);
    for (let col = -1; col < cols; col++) {
      const x = col * bw + offset + mortar / 2;
      const y = row * bh + mortar / 2;
      const lightness = 38 + ((row * 7 + col * 13) % 12);
      ctx.fillStyle = `hsl(5, 52%, ${lightness}%)`;
      ctx.fillRect(x, y, bw - mortar, bh - mortar);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

/** Marble-like veining on light background. */
export function createMarbleTexture(size = 256) {
  const { c, ctx } = makeCanvas(size);
  ctx.fillStyle = '#f0ece8';
  ctx.fillRect(0, 0, size, size);
  const veins = [
    { x: 30,  dy: 18 }, { x: 90,  dy: -12 }, { x: 160, dy: 20 },
    { x: 200, dy: -8  }, { x: 50,  dy: 25  }, { x: 130, dy: -15 },
  ];
  veins.forEach(({ x: sx, dy }) => {
    ctx.strokeStyle = `rgba(120,85,65,${0.2 + Math.abs(dy) * 0.01})`;
    ctx.lineWidth = 1 + Math.abs(dy) * 0.05;
    ctx.beginPath();
    let cx = sx, cy = 0;
    ctx.moveTo(cx, cy);
    for (let step = 0; step < 20; step++) {
      cx += dy * 0.3 + (step % 3 - 1) * 8;
      cy += size / 20;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

/**
 * Build and return a named texture map.
 * { default: null, checker, wood, metal, brick, marble }
 */
export function buildTextureMap() {
  return {
    default: null,
    checker: createCheckerTexture(),
    wood:    createWoodTexture(),
    metal:   createMetalTexture(),
    brick:   createBrickTexture(),
    marble:  createMarbleTexture(),
  };
}
