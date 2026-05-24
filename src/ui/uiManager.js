import GUI from 'lil-gui';
import {
  getState,
  isRunning,
  setParameter,
  setDisplay,
  subscribe,
} from '../state.js';
import { SCENE_NAMES, SPEED_OPTIONS, SCENE_IDS } from '../constants.js';
import { getSceneGuiConfig } from './panels.js';
import { formatNum } from '../utils/helpers.js';
import { applyCollisionPresetToParams } from '../scenes/collisionPresets.js';

export class UIManager {
  constructor({ onSceneChange, onParamChange }) {
    this.onSceneChange = onSceneChange;
    this.onParamChange = onParamChange;
    this.gui = new GUI({ container: document.getElementById('gui-root'), title: 'Điều khiển' });
    this.controllers = [];
    this.sceneFolder = null;
    this._buildGlobal();
    subscribe(() => this.setRunningLocks());
  }

  _buildGlobal() {
    const nav = this.gui.addFolder('Chọn scene');
    this.scenePicker = {
      scene: SCENE_NAMES[getState().currentSceneId],
    };
    this.scenePickerCtrl = nav
      .add(this.scenePicker, 'scene', {
        [SCENE_NAMES[1]]: SCENE_NAMES[1],
        [SCENE_NAMES[2]]: SCENE_NAMES[2],
        [SCENE_NAMES[3]]: SCENE_NAMES[3],
        [SCENE_NAMES[4]]: SCENE_NAMES[4],
      })
      .name('Scene')
      .onChange((name) => {
        const id = Object.entries(SCENE_NAMES).find(([, n]) => n === name)?.[0];
        if (id) this.onSceneChange(Number(id));
      });

    const env = this.gui.addFolder('Môi trường');
    const g = getState().global;
    this.gravityCtrl = env
      .add(g, 'gravity', 0, 20, 0.1)
      .name('g (m/s²)')
      .onChange((v) => {
        setParameter('gravity', v);
        this.onParamChange();
      });

    const speed = { speedMultiplier: getState().speedMultiplier };
    env.add(speed, 'speedMultiplier', SPEED_OPTIONS).name('Tốc độ sim').onChange((v) => {
      setParameter('speedMultiplier', Number(v));
    });

    const cam = getState().global.camera;
    const camFolder = this.gui.addFolder('Projection');
    camFolder.add(cam, 'fov', 40, 100, 1).name('FOV').onChange(() => this.onParamChange());
    camFolder.add(cam, 'near', 0.01, 2, 0.01).name('Near').onChange(() => this.onParamChange());
    camFolder.add(cam, 'far', 100, 1000, 10).name('Far').onChange(() => this.onParamChange());

    const disp = this.gui.addFolder('Hiển thị');
    const d = getState().display;
    disp.add(d, 'showVectors', ['none', 'selected', 'all']).name('Vector lực').onChange((v) => setDisplay('showVectors', v));
    disp.add(d, 'debugMode').name('Debug').onChange((v) => setDisplay('debugMode', v));
  }

  bindScene(sceneId) {
    if (this.scenePicker) {
      this.scenePicker.scene = SCENE_NAMES[sceneId];
      this.scenePickerCtrl?.updateDisplay();
    }
    if (this.sceneFolder) {
      this.sceneFolder.destroy();
      this.sceneFolder = null;
    }
    this.controllers = [];
    this.sceneFolder = this.gui.addFolder(SCENE_NAMES[sceneId] ?? 'Scene');
    const config = getSceneGuiConfig(sceneId, getState());
    const params = getState().sceneParams;

    config.forEach((item) => {
      if (item.options) {
        const c = this.sceneFolder.add(params, item.prop, item.options).name(item.key);
        c.onChange(() => {
          if (item.applyPreset) {
            applyCollisionPresetToParams(params, params.collisionMode);
            this.controllers.forEach(({ ctrl }) => ctrl.updateDisplay());
          }
          this.onParamChange(item.prop);
        });
        this.controllers.push({ ctrl: c, ...item });
        if (item.inactive) c.disable();
      } else if (item.prop === 'pauseOnCollision' || item.prop === 'gravityEnabled') {
        const c = this.sceneFolder.add(params, item.prop).name(item.key);
        c.onChange(() => this.onParamChange(item.prop));
        this.controllers.push({ ctrl: c, ...item });
      } else {
        const c = this.sceneFolder
          .add(params, item.prop, item.min, item.max, item.step)
          .name(item.key);
        c.onChange(() => {
          if (!item.inactive) this.onParamChange(item.prop);
        });
        this.controllers.push({ ctrl: c, ...item });
        if (item.inactive) c.disable();
      }
    });
    this.sceneFolder.open();
    this.setRunningLocks();
  }

  setRunningLocks() {
    const running = isRunning();
    const sceneId = getState().currentSceneId;
    const lockAllS4 = running && sceneId === SCENE_IDS.COLLISION;

    this.controllers.forEach(({ ctrl, lockRunning, lockScene4, inactive }) => {
      const disable = inactive || lockAllS4 || (running && lockRunning);
      if (disable) ctrl.disable();
      else ctrl.enable();
    });

    if (running) this.gravityCtrl?.disable();
    else this.gravityCtrl?.enable();

    const gCtrl = this.gui.controllers?.find?.((c) => c.property === 'gravity');
    if (running) {
      document.getElementById('drag-hint').textContent =
        sceneId === 4
          ? 'RUNNING: Scene va chạm — không đổi tham số. Pause để chỉnh.'
          : 'RUNNING: chỉ đổi lực F / camera. Kéo chuột trái để xoay camera.';
    } else {
      document.getElementById('drag-hint').textContent =
        'STOPPED/PAUSED: click trái để chọn vật, kéo trái để xoay camera.';
    }
  }

  refreshDataPanel(telemetry) {
    const el = document.getElementById('data-content');
    if (!el || !telemetry) return;

    const s = getState();
    let text = `Scene: ${telemetry.sceneName}\n`;
    text += `t = ${formatNum(telemetry.time)} s\n`;
    if (telemetry.position) {
      text += `Vị trí: (${formatNum(telemetry.position.x)}, ${formatNum(telemetry.position.y)}, ${formatNum(telemetry.position.z)}) m\n`;
    }
    if (telemetry.velocity) {
      text += `v = (${formatNum(telemetry.velocity.x)}, ${formatNum(telemetry.velocity.y)}, ${formatNum(telemetry.velocity.z)}) m/s\n`;
      text += `|v| = ${formatNum(telemetry.speed)} m/s\n`;
    }
    if (telemetry.acceleration) {
      text += `a = (${formatNum(telemetry.acceleration.x)}, ${formatNum(telemetry.acceleration.y)}, ${formatNum(telemetry.acceleration.z)}) m/s²\n`;
    }
    text += `Ek = ${formatNum(telemetry.kineticEnergy)} J\n`;
    text += `m = ${formatNum(telemetry.mass)} kg\n`;

    if (telemetry.forces) {
      const f = telemetry.forces;
      text += `\n--- Lực (N) ---\n`;
      text += `F = ${formatNum(f.applied)}\n`;
      text += `W = ${formatNum(f.gravity)}\n`;
      text += `N = ${formatNum(f.normal)}\n`;
      text += `f = ${formatNum(f.friction)}\n`;
      text += `F_net = ${formatNum(f.net)}\n`;
    }

    if (telemetry.sceneSpecific) {
      const sp = telemetry.sceneSpecific;
      text += `\n--- Scene ---\n`;
      if (sp.distanceAlongRamp != null) text += `s dọc dốc = ${formatNum(sp.distanceAlongRamp)} m\n`;
      if (sp.height != null) text += `h = ${formatNum(sp.height)} m\n`;
      if (sp.horizontalX != null) text += `x = ${formatNum(sp.horizontalX)} m\n`;
      if (sp.totalMomentum != null) text += `p = ${formatNum(sp.totalMomentum)} kg·m/s\n`;
      if (sp.object1Velocity) {
        text += `v₁ = (${formatNum(sp.object1Velocity.x)}, ${formatNum(sp.object1Velocity.y)}, ${formatNum(sp.object1Velocity.z)}) m/s\n`;
      }
      if (sp.object2Velocity) {
        text += `v₂ = (${formatNum(sp.object2Velocity.x)}, ${formatNum(sp.object2Velocity.y)}, ${formatNum(sp.object2Velocity.z)}) m/s\n`;
      }
      if (sp.status) text += `Trạng thái: ${sp.status}\n`;
      if (sp.collision) {
        const c = sp.collision;
        text += `\nVa chạm:\n`;
        text += `p (sau) = ${formatNum(c.after?.momentum)}\n`;
        text += `ΔEk = ${formatNum(c.energyLoss)} J\n`;
        text += `e ≈ ${formatNum(c.restitutionObserved)}\n`;
        if (c.analytic?.v1) {
          text += `v₁' (lý thuyết) ≈ ${formatNum(c.analytic.v1.x)} m/s\n`;
          text += `v₂' (lý thuyết) ≈ ${formatNum(c.analytic.v2.x)} m/s\n`;
        }
      }
    }

    el.textContent = text;
  }

  updateRecordsTable() {
    const wrap = document.getElementById('records-table-wrap');
    const tbody = document.querySelector('#records-table tbody');
    const records = getState().recordedData;
    if (!wrap || !tbody) return;
    if (!records.length) {
      wrap.classList.add('hidden');
      return;
    }
    wrap.classList.remove('hidden');
    tbody.innerHTML = records
      .map(
        (r, i) =>
          `<tr><td>${i + 1}</td><td>${formatNum(r.simulationTime)}</td><td>(${formatNum(r.position?.x)}, ${formatNum(r.position?.y)})</td><td>${formatNum(Math.sqrt((r.velocity?.x ?? 0) ** 2 + (r.velocity?.y ?? 0) ** 2))}</td><td>${formatNum(r.kineticEnergy)}</td></tr>`,
      )
      .join('');
  }
}
