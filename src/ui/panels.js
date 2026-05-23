/** Tạo cấu hình lil-gui theo scene */

const INCLINE_ANGLE = {
  key: 'độ dốc (°)',
  prop: 'angleDeg',
  min: 0,
  max: 90,
  step: 1,
  lockRunning: true,
};

const INCLINE_LENGTH = {
  key: 'chiều dài dốc (m)',
  prop: 'length',
  min: 1,
  max: 10,
  step: 0.1,
  lockRunning: true,
};

const INCLINE_FRICTION = {
  key: 'ma sát μ',
  prop: 'friction',
  min: 0,
  max: 1,
  step: 0.01,
  lockRunning: true,
};

export function getSceneGuiConfig(sceneId, state) {
  const common = [];

  if (sceneId === 1) {
    return [
      { key: 'khối lượng (kg)', prop: 'mass', min: 0.1, max: 50, step: 0.1, lockRunning: true },
      { ...INCLINE_ANGLE },
      { ...INCLINE_LENGTH },
      { ...INCLINE_FRICTION },
      { key: '|F| (N)', prop: 'forceMag', min: 0, max: 100, step: 1, lockRunning: false },
      { key: 'góc F (°)', prop: 'forceAngleDeg', min: -90, max: 90, step: 1, lockRunning: false },
    ];
  }
  if (sceneId === 2) {
    return [
      { key: 'khối lượng (kg)', prop: 'mass', min: 0.1, max: 50, step: 0.1, lockRunning: true },
      { key: 'độ cao (m)', prop: 'initialHeight', min: 1, max: 100, step: 0.5, lockRunning: true },
      { key: 'hình dạng', prop: 'shape', options: ['box', 'sphere'], lockRunning: true },
      { ...INCLINE_ANGLE, inactive: true },
      { ...INCLINE_LENGTH, inactive: true },
      { ...INCLINE_FRICTION, inactive: true },
      { key: '|F| (N)', prop: 'forceMag', min: 0, max: 100, step: 1, lockRunning: false },
      { key: 'góc F ngang (°)', prop: 'forceAngleHorizontal', min: 0, max: 360, step: 1, lockRunning: false },
      { key: 'góc F dọc (°)', prop: 'forceAngleVertical', min: -90, max: 90, step: 1, lockRunning: false },
    ];
  }
  if (sceneId === 3) {
    return [
      { key: 'khối lượng (kg)', prop: 'mass', min: 0.1, max: 50, step: 0.1, lockRunning: true },
      { ...INCLINE_ANGLE, inactive: true },
      { ...INCLINE_LENGTH, inactive: true },
      { ...INCLINE_FRICTION },
      { key: 'hình dạng', prop: 'shape', options: ['box', 'sphere'], lockRunning: true },
      { key: '|F| (N)', prop: 'forceMag', min: 0, max: 100, step: 1, lockRunning: false },
      { key: 'góc F (°)', prop: 'forceAngleDeg', min: 0, max: 360, step: 1, lockRunning: false },
    ];
  }
  if (sceneId === 4) {
    return [
      { key: 'm₁ (kg)', prop: 'mass1', min: 0.1, max: 50, step: 0.1, lockRunning: true, lockScene4: true },
      { key: 'm₂ (kg)', prop: 'mass2', min: 0.1, max: 50, step: 0.1, lockRunning: true, lockScene4: true },
      { ...INCLINE_ANGLE, inactive: true },
      { ...INCLINE_LENGTH, inactive: true },
      { key: 'v₂ ban đầu (m/s)', prop: 'object2InitVelocity', min: 0, max: 20, step: 0.5, lockRunning: true, lockScene4: true },
      { key: 'hệ số phục hồi e', prop: 'restitution', min: 0, max: 1, step: 0.05, lockRunning: true, lockScene4: true },
      { ...INCLINE_FRICTION, lockScene4: true },
    ];
  }
  return common;
}
