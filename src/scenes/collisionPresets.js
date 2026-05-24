/** Preset tình huống va chạm 1D (scene 4). */

export const COLLISION_MODE_OPTIONS = {
  'Va trực diện': 'head_on',
  'Một vật chạy': 'one_moving',
  'Đuổi kịp': 'catch_up',
  'Đứng yên': 'at_rest',
};

export const DIRECTION_OPTIONS = {
  '+x (→)': 1,
  '−x (←)': -1,
};

/** Giá trị áp dụng lên sceneParams (không ghi đè m, e, khoảng cách). */
export const COLLISION_PRESETS = {
  head_on: {
    object1InitVelocity: 5,
    object2InitVelocity: 5,
    object1Direction: 1,
    object2Direction: -1,
    friction: 0,
  },
  one_moving: {
    object1InitVelocity: 5,
    object2InitVelocity: 0,
    object1Direction: 1,
    object2Direction: 1,
    friction: 0,
  },
  catch_up: {
    object1InitVelocity: 6,
    object2InitVelocity: 2,
    object1Direction: 1,
    object2Direction: 1,
    friction: 0,
  },
  at_rest: {
    object1InitVelocity: 0,
    object2InitVelocity: 0,
    object1Direction: 1,
    object2Direction: 1,
    friction: 0,
  },
};

export function applyCollisionPresetToParams(params, mode = params.collisionMode) {
  const preset = COLLISION_PRESETS[mode];
  if (!preset) return params;
  Object.assign(params, preset, { collisionMode: mode });
  return params;
}

export function getSignedVelocity(speed, direction) {
  return (speed ?? 0) * (direction ?? 1);
}
