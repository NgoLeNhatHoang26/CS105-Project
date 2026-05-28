/** Hằng số và giá trị mặc định theo từng scene */

export const PHYSICS_FIXED_DT = 1 / 60;
export const MAX_FRAME_DT = 0.05;

export const PLAYBACK = {
  STOPPED: 'stopped',
  RUNNING: 'running',
  PAUSED: 'paused',
};

export const SCENE_IDS = {
  INCLINE: 1,
  FREE_FALL: 2,
  HORIZONTAL: 3,
  COLLISION: 4,
};

export const SCENE_NAMES = {
  1: 'Mặt phẳng nghiêng',
  2: 'Rơi tự do',
  3: 'Lực ngang',
  4: 'Va chạm',
};

export const DEFAULT_GLOBAL = {
  gravity: 9.8,
  camera: {
    fov: 55,
    near: 0.1,
    far: 500,
    position: [8, 12, 18],
    target: [0, 2, 0],
  },
};

export const DEFAULT_SCENE_PARAMS = {
  1: {
    mass: 5,
    angleDeg: 30,
    length: 5,
    friction: 0.3,
    forceMag: 0,
    forceAngleDeg: 0,
    shape: 'box',
    boxSize: 0.6,
    sphereRadius: 0.4,
    graphicsShape: 'box',
    graphicsMaterial: 'default',
    graphicsColor: '#4a90d9',
    graphicsWireframe: false,
    graphicsScale: 1,
    graphicsRotX: 0,
    graphicsRotY: 0,
    graphicsRotZ: 0,
  },
  2: {
    mass: 5,
    /** Độ cao đáy vật so với mặt đất (m), không phải tọa độ tâm. */
    initialHeight: 20,
    angleDeg: 30,
    length: 5,
    friction: 0.3,
    forceMag: 0,
    forceAngleHorizontal: 0,
    forceAngleVertical: 0,
    shape: 'box',
    boxSize: 0.6,
    sphereRadius: 0.4,
    graphicsShape: 'box',
    graphicsMaterial: 'default',
    graphicsColor: '#4a90d9',
    graphicsWireframe: false,
    graphicsScale: 1,
    graphicsRotX: 0,
    graphicsRotY: 0,
    graphicsRotZ: 0,
  },
  3: {
    mass: 5,
    angleDeg: 30,
    length: 5,
    friction: 0.3,
    forceMag: 0,
    forceAngleDeg: 0,
    shape: 'box',
    boxSize: 0.6,
    sphereRadius: 0.4,
    graphicsShape: 'box',
    graphicsMaterial: 'default',
    graphicsColor: '#4a90d9',
    graphicsWireframe: false,
    graphicsScale: 1,
    graphicsRotX: 0,
    graphicsRotY: 0,
    graphicsRotZ: 0,
  },
  4: {
    mass1: 5,
    mass2: 3,
    angleDeg: 30,
    length: 5,
    collisionMode: 'head_on',
    restitution: 0.6,
    object1InitVelocity: 5,
    object2InitVelocity: 5,
    object1Direction: 1,
    object2Direction: -1,
    initialDistance: 6,
    sphereRadius: 0.45,
    friction: 0,
    pauseOnCollision: false,
    gravityEnabled: false,
    graphicsTarget: 'object_1',
    graphicsObject1Shape: 'sphere',
    graphicsObject1Material: 'default',
    graphicsObject1Color: '#4a90d9',
    graphicsObject1Wireframe: false,
    graphicsObject1Scale: 1,
    graphicsObject1RotX: 0,
    graphicsObject1RotY: 0,
    graphicsObject1RotZ: 0,
    graphicsObject2Shape: 'sphere',
    graphicsObject2Material: 'default',
    graphicsObject2Color: '#e94560',
    graphicsObject2Wireframe: false,
    graphicsObject2Scale: 1,
    graphicsObject2RotX: 0,
    graphicsObject2RotY: 0,
    graphicsObject2RotZ: 0,
  },
};

export const DEFAULT_DISPLAY = {
  showDataPanel: true,
  showVectors: 'none',
  debugMode: false,
};

export const SPEED_OPTIONS = [0.5, 1, 2, 4];

export const ARENA_HALF = 12;
export const SHADOW_MAP_SIZE = 2048;
