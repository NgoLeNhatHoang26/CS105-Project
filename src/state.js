import {
  PLAYBACK,
  DEFAULT_GLOBAL,
  DEFAULT_SCENE_PARAMS,
  DEFAULT_DISPLAY,
  SCENE_IDS,
} from './constants.js';

/** State tập trung — single source of truth */

function cloneSceneParams(sceneId) {
  return { ...DEFAULT_SCENE_PARAMS[sceneId] };
}

const state = {
  playback: PLAYBACK.STOPPED,
  currentSceneId: SCENE_IDS.INCLINE,
  simulationTime: 0,
  frameCount: 0,
  speedMultiplier: 1,
  global: structuredClone(DEFAULT_GLOBAL),
  sceneParams: cloneSceneParams(SCENE_IDS.INCLINE),
  display: { ...DEFAULT_DISPLAY },
  selection: { selectedObjectId: null },
  recordedData: [],
  collisionSnapshot: null,
};

const listeners = new Set();

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(state));
}

export function isRunning() {
  return state.playback === PLAYBACK.RUNNING;
}

export function isPaused() {
  return state.playback === PLAYBACK.PAUSED;
}

export function canEditStructure() {
  return state.playback !== PLAYBACK.RUNNING;
}

export function canDragObjects() {
  return state.playback !== PLAYBACK.RUNNING;
}

export function setScene(sceneId) {
  state.currentSceneId = sceneId;
  state.sceneParams = cloneSceneParams(sceneId);
  state.collisionSnapshot = null;
  state.playback = PLAYBACK.STOPPED;
  state.simulationTime = 0;
  state.frameCount = 0;
  notify();
}

export function setSpeedMultiplier(v) {
  state.speedMultiplier = v;
}

export function setParameter(key, value) {
  if (key === 'speedMultiplier') {
    state.speedMultiplier = value;
    notify();
    return;
  }
  if (key in state.global) {
    if (typeof state.global[key] === 'object') {
      Object.assign(state.global[key], value);
    } else {
      state.global[key] = value;
    }
  } else if (key in state.sceneParams) {
    state.sceneParams[key] = value;
  } else if (key in state.display) {
    state.display[key] = value;
  }
  notify();
}

export function setDisplay(key, value) {
  state.display[key] = value;
  notify();
}

export function setSelection(objectId) {
  state.selection.selectedObjectId = objectId;
  notify();
}

export function setPlayback(action) {
  switch (action) {
    case 'play':
      if (state.playback === PLAYBACK.PAUSED) {
        state.playback = PLAYBACK.RUNNING;
      } else if (state.playback === PLAYBACK.STOPPED) {
        state.playback = PLAYBACK.RUNNING;
      }
      break;
    case 'pause':
      if (state.playback === PLAYBACK.RUNNING) {
        state.playback = PLAYBACK.PAUSED;
      }
      break;
    case 'reset':
      state.playback = PLAYBACK.STOPPED;
      state.simulationTime = 0;
      state.frameCount = 0;
      state.collisionSnapshot = null;
      break;
    case 'stop':
      state.playback = PLAYBACK.STOPPED;
      break;
    default:
      break;
  }
  notify();
}

export function advanceSimulationTime(dt) {
  state.simulationTime += dt;
  state.frameCount += 1;
}

export function addRecordedPoint(point) {
  state.recordedData.push(point);
  notify();
}

export function clearRecordedData() {
  state.recordedData = [];
  notify();
}

export function setCollisionSnapshot(snapshot) {
  state.collisionSnapshot = snapshot;
  notify();
}

export function resetStateTiming() {
  state.simulationTime = 0;
  state.frameCount = 0;
  state.collisionSnapshot = null;
}
