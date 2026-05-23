import { ViewRenderer } from './engine/view.js';
import { PhysicsEngine } from './engine/physics.js';
import { SceneManager } from './engine/sceneManager.js';
import { setupOrbitControls, resetCameraView } from './interaction/controls.js';
import { RaycasterController } from './interaction/raycasting.js';
import { UIManager } from './ui/uiManager.js';
import { initStats } from './ui/stats.js';
import { DebugVisualizer } from './visualization/debugHelpers.js';
import { ForceVisualizer } from './visualization/vectorHelpers.js';
import {
  getState,
  setPlayback,
  isRunning,
  advanceSimulationTime,
  addRecordedPoint,
  clearRecordedData,
  subscribe,
} from './state.js';
import { PHYSICS_FIXED_DT, MAX_FRAME_DT, DEFAULT_GLOBAL } from './constants.js';
import { createDataPoint, exportToCSV } from './utils/data.js';
import { bindKeyboard } from './interaction/input.js';

let lastTime = performance.now();
let physicsAccumulator = 0;

const canvas = document.getElementById('canvas');
const view = new ViewRenderer(canvas);
view.init();

const physics = new PhysicsEngine(getState().global.gravity);
const sceneManager = new SceneManager(view, physics);

sceneManager.setOnStop(() => setPlayback('pause'));

const controls = setupOrbitControls(view.getCamera(), canvas);
const stats = initStats();

const debugViz = new DebugVisualizer(view.getScene());
const forceViz = new ForceVisualizer(view.getScene());

const raycaster = new RaycasterController(
  view.getCamera(),
  canvas,
  () => sceneManager.getSelectableMeshes(),
);

function applyCameraFromState() {
  const cam = getState().global.camera;
  view.updateCameraParams(cam);
}

function loadScene(sceneId) {
  setPlayback('reset');
  sceneManager.loadScene(sceneId);
  const active = sceneManager.getActiveScene();
  raycaster.bindSimObjects(active?.objects ?? []);
  debugViz.trackMeshes(active?.objects?.map((o) => o.mesh) ?? []);
  ui.bindScene(sceneId);
  applyCameraFromState();
  view.setBackground(sceneId === 2 ? 0x87ceeb : sceneId === 4 ? 0x2d3436 : 0xb0c4de);
}

const ui = new UIManager({
  onSceneChange: (id) => loadScene(id),
  onParamChange: () => {
    applyCameraFromState();
    sceneManager.onParameterChange();
    const active = sceneManager.getActiveScene();
    raycaster.bindSimObjects(active?.objects ?? []);
    debugViz.trackMeshes(active?.objects?.map((o) => o.mesh) ?? []);
  },
});

document.getElementById('btn-play')?.addEventListener('click', () => {
  setPlayback('play');
  ui.setRunningLocks();
  const s = getState();
  if (s.currentSceneId === 4 && sceneManager.getActiveScene()) {
    const params = s.sceneParams;
    const o2 = sceneManager.getActiveScene().objects[1];
    if (o2) o2.body.velocity.set(params.object2InitVelocity, 0, 0);
  }
});

document.getElementById('btn-pause')?.addEventListener('click', () => {
  setPlayback('pause');
  ui.setRunningLocks();
});

document.getElementById('btn-reset')?.addEventListener('click', () => {
  setPlayback('reset');
  physicsAccumulator = 0;
  sceneManager.reset();
  sceneManager.onParameterChange();
  ui.setRunningLocks();
});

document.getElementById('btn-reset-view')?.addEventListener('click', () => {
  const c = DEFAULT_GLOBAL.camera;
  resetCameraView(view.getCamera(), controls, c.position, c.target);
});

document.getElementById('btn-record')?.addEventListener('click', () => {
  const telemetry = sceneManager.getTelemetry();
  addRecordedPoint(createDataPoint(telemetry));
  ui.updateRecordsTable();
});

document.getElementById('btn-clear-records')?.addEventListener('click', () => {
  clearRecordedData();
  ui.updateRecordsTable();
});

document.getElementById('btn-export-csv')?.addEventListener('click', () => {
  const s = getState();
  exportToCSV(s.recordedData, s.currentSceneId);
});

bindKeyboard({
  onPlayPause: () => {
    if (isRunning()) document.getElementById('btn-pause')?.click();
    else document.getElementById('btn-play')?.click();
  },
  onReset: () => document.getElementById('btn-reset')?.click(),
});

subscribe(() => {
  debugViz.setEnabled(getState().display.debugMode);
});

function syncMeshes() {
  const objects = sceneManager.getActiveScene()?.objects ?? [];
  objects.forEach((o) => {
    if (o.mesh && o.body) {
      o.mesh.position.copy(o.body.position);
      o.mesh.quaternion.copy(o.body.quaternion);
    }
  });
}

function loop(now) {
  requestAnimationFrame(loop);
  stats.begin();

  const frameDt = Math.min((now - lastTime) / 1000, MAX_FRAME_DT);
  lastTime = now;

  if (isRunning()) {
    const speed = getState().speedMultiplier;
    physicsAccumulator += frameDt * speed;
    while (physicsAccumulator >= PHYSICS_FIXED_DT) {
      sceneManager.applyRuntimeForces();
      physics.step(PHYSICS_FIXED_DT);
      sceneManager.update(PHYSICS_FIXED_DT);
      physicsAccumulator -= PHYSICS_FIXED_DT;
      advanceSimulationTime(PHYSICS_FIXED_DT);
    }
  } else {
    syncMeshes();
  }

  const telemetry = sceneManager.getTelemetry();
  ui.refreshDataPanel(telemetry);
  ui.setRunningLocks();

  const origin = telemetry.position ?? { x: 0, y: 1, z: 0 };
  forceViz.updateFromTelemetry(telemetry, origin);
  debugViz.update();

  controls.update();
  view.render();
  stats.end();
}

loadScene(getState().currentSceneId);
requestAnimationFrame(loop);
