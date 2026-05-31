/**
 * SimState — trạng thái động học của vật (position, velocity, mass).
 */

/**
 * Tạo SimState rỗng.
 * @param {object} opts
 * @param {{x,y,z}} opts.position
 * @param {{x,y,z}} opts.velocity
 * @param {number}  opts.mass  (kg)
 * @returns {SimState}
 */
export function createSimState({
  position = { x: 0, y: 0, z: 0 },
  velocity = { x: 0, y: 0, z: 0 },
  mass = 1,
} = {}) {
  return {
    position: { ...position },
    velocity: { ...velocity },
    acceleration: { x: 0, y: 0, z: 0 },
    mass,
  };
}

/**
 * Sao chép sâu một SimState.
 * @param {SimState} state
 * @returns {SimState}
 */
export function cloneSimState(state) {
  return {
    position: { ...state.position },
    velocity: { ...state.velocity },
    acceleration: { ...state.acceleration },
    mass: state.mass,
  };
}

/**
 * Reset SimState về vị trí/vận tốc ban đầu đã lưu trong `sim.initialSimState`.
 * @param {object} sim  — simObject có `simState` và `initialSimState`
 */
export function resetSimStateFromInitial(sim) {
  if (!sim.initialSimState || !sim.simState) return;
  sim.simState.position = { ...sim.initialSimState.position };
  sim.simState.velocity = { ...sim.initialSimState.velocity };
  sim.simState.acceleration = { x: 0, y: 0, z: 0 };
}

/**
 * Lưu snapshot trạng thái hiện tại làm "initial" để reset.
 * @param {object} sim
 */
export function saveInitialSimState(sim) {
  if (!sim.simState) return;
  sim.initialSimState = cloneSimState(sim.simState);
}
