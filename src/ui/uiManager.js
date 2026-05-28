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

/** Per-scene formula definitions (display only, no physics logic). */
const SCENE_FORMULAS = {
  1: {
    title: 'Mặt phẳng nghiêng',
    groups: [
      {
        title: 'Lực tác dụng',
        rows: [
          { sym: 'W',     eq: '= m·g' },
          { sym: 'N',     eq: '= m·g·cos θ' },
          { sym: 'f',     eq: '= μ·N' },
          { sym: 'F_net', eq: '= F − m·g·sin θ − f' },
        ],
      },
      {
        title: 'Chuyển động',
        rows: [
          { sym: 'a',    eq: '= F_net / m' },
          { sym: 'v(t)', eq: '= v₀ + a·t' },
          { sym: 's(t)', eq: '= v₀t + ½·a·t²' },
          { sym: 'Ek',   eq: '= ½·m·v²' },
        ],
      },
    ],
  },
  2: {
    title: 'Rơi tự do',
    groups: [
      {
        title: 'Chuyển động',
        rows: [
          { sym: 'y(t)',    eq: '= y₀ − ½·g·t²' },
          { sym: 'v_y(t)', eq: '= g·t  (↓)' },
          { sym: 'v_chạm', eq: '= √(2·g·h)' },
          { sym: 't_chạm', eq: '= √(2·h / g)' },
        ],
      },
      {
        title: 'Năng lượng',
        rows: [
          { sym: 'Ek',     eq: '= ½·m·v²' },
          { sym: 'Ep',     eq: '= m·g·h' },
          { sym: 'E_cơ',  eq: '= Ek + Ep = const' },
        ],
      },
    ],
  },
  3: {
    title: 'Lực ngang',
    groups: [
      {
        title: 'Lực tác dụng',
        rows: [
          { sym: 'N',     eq: '= m·g  (mặt ngang)' },
          { sym: 'f',     eq: '= μ·N = μ·m·g' },
          { sym: 'F_net', eq: '= F − f' },
        ],
      },
      {
        title: 'Chuyển động',
        rows: [
          { sym: 'a',    eq: '= (F − μ·m·g) / m' },
          { sym: 'x(t)', eq: '= ½·a·t²' },
          { sym: 'v(t)', eq: '= a·t' },
          { sym: 'Ek',   eq: '= ½·m·v²' },
        ],
      },
    ],
  },
  4: {
    title: 'Va chạm 1D',
    groups: [
      {
        title: 'Bảo toàn động lượng',
        rows: [
          { sym: 'p',    eq: '= m₁v₁ + m₂v₂ = const' },
          { sym: 'e',    eq: '= (v₂′ − v₁′) / (v₁ − v₂)' },
        ],
      },
      {
        title: 'Vận tốc sau va chạm',
        rows: [
          { sym: "v₁′", eq: '= ((m₁−e·m₂)v₁+(1+e)m₂v₂)/(m₁+m₂)' },
          { sym: "v₂′", eq: '= ((m₂−e·m₁)v₂+(1+e)m₁v₁)/(m₁+m₂)' },
        ],
      },
      {
        title: 'Năng lượng',
        rows: [
          { sym: 'Ek',  eq: '= ½·m·v²' },
          { sym: 'ΔEk', eq: '= Ek_sau − Ek_trước  (≤ 0)' },
        ],
      },
    ],
  },
};

/** UI-only: một dòng label / value trong data panel. */
function dataRow(label, value, { highlight = false, status } = {}) {
  const cls = ['data-value', highlight && 'highlight', status && `status-${status}`]
    .filter(Boolean)
    .join(' ');
  return `<div class="data-row"><span class="data-label">${label}</span><span class="${cls}">${value}</span></div>`;
}

function dataSection(title, rowsHtml) {
  if (!rowsHtml) return '';
  return `<div class="data-section"><div class="data-section-title">${title}</div>${rowsHtml}</div>`;
}

export class UIManager {
  constructor({ onSceneChange, onParamChange }) {
    this.onSceneChange = onSceneChange;
    this.onParamChange = onParamChange;
    this.gui = new GUI({ container: document.getElementById('gui-root'), title: 'Tham số' });
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

    camFolder.close();
    document.body.dataset.simState = getState().playback;
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
    this.updateFormulaPanel(sceneId);
  }

  /** Render static formula definitions for the active scene. */
  updateFormulaPanel(sceneId) {
    const el = document.getElementById('formula-content');
    if (!el) return;
    const data = SCENE_FORMULAS[sceneId];
    if (!data) {
      el.innerHTML = '<p class="data-placeholder">Không có công thức cho scene này.</p>';
      return;
    }
    let html = `<div class="formula-scene-name">${data.title}</div>`;
    data.groups.forEach((group) => {
      html += '<div class="formula-group">';
      if (group.title) {
        html += `<div class="formula-group-title">${group.title}</div>`;
      }
      group.rows.forEach((row) => {
        html += `<div class="formula-row"><span class="formula-sym">${row.sym}</span><span class="formula-eq">${row.eq}</span></div>`;
      });
      html += '</div>';
    });
    el.innerHTML = html;
  }

  setRunningLocks() {
    const running = isRunning();
    const sceneId = getState().currentSceneId;
    const lockAllS4 = running && sceneId === SCENE_IDS.COLLISION;
    const playback = getState().playback;

    document.body.dataset.simState = playback;

    this.controllers.forEach(({ ctrl, lockRunning, lockScene4, inactive }) => {
      const disable = inactive || lockAllS4 || (running && lockRunning);
      if (disable) ctrl.disable();
      else ctrl.enable();
    });

    if (running) this.gravityCtrl?.disable();
    else this.gravityCtrl?.enable();

    const hint = document.getElementById('drag-hint');
    if (hint) {
      hint.textContent = running
        ? sceneId === 4
          ? 'RUNNING — Scene va chạm: không đổi tham số. Pause để chỉnh.'
          : 'RUNNING — Chỉ đổi lực F / camera. Kéo chuột trái để xoay camera.'
        : 'STOPPED/PAUSED — Click trái chọn vật; kéo trái xoay camera.';
    }
  }

  refreshDataPanel(telemetry) {
    const el = document.getElementById('data-content');
    const badge = document.getElementById('data-scene-badge');
    if (!el || !telemetry) return;

    if (badge) badge.textContent = telemetry.sceneName ?? '—';

    let kin = '';
    kin += dataRow('t', `${formatNum(telemetry.time)} s`, { highlight: true });
    if (telemetry.position) {
      const p = telemetry.position;
      kin += dataRow('Vị trí', `(${formatNum(p.x)}, ${formatNum(p.y)}, ${formatNum(p.z)}) m`);
    }
    if (telemetry.velocity) {
      const v = telemetry.velocity;
      kin += dataRow('v', `(${formatNum(v.x)}, ${formatNum(v.y)}, ${formatNum(v.z)}) m/s`);
      kin += dataRow('|v|', `${formatNum(telemetry.speed)} m/s`);
    }
    if (telemetry.acceleration) {
      const a = telemetry.acceleration;
      kin += dataRow('a', `(${formatNum(a.x)}, ${formatNum(a.y)}, ${formatNum(a.z)}) m/s²`);
    }
    kin += dataRow('Ek', `${formatNum(telemetry.kineticEnergy)} J`);
    kin += dataRow('m', `${formatNum(telemetry.mass)} kg`);

    let forces = '';
    if (telemetry.forces) {
      const f = telemetry.forces;
      forces += dataRow('F', `${formatNum(f.applied)} N`);
      forces += dataRow('W', `${formatNum(f.gravity)} N`);
      forces += dataRow('N', `${formatNum(f.normal)} N`);
      forces += dataRow('f', `${formatNum(f.friction)} N`);
      forces += dataRow('F_net', `${formatNum(f.net)} N`);
    }

    let scene = '';
    const sp = telemetry.sceneSpecific;
    if (sp) {
      if (sp.distanceAlongRamp != null) {
        scene += dataRow('s dọc dốc', `${formatNum(sp.distanceAlongRamp)} m`);
      }
      if (sp.heightBottom != null) {
        scene += dataRow('h (đáy)', `${formatNum(sp.heightBottom)} m`);
        if (sp.releaseHeight != null) scene += dataRow('h₀', `${formatNum(sp.releaseHeight)} m`);
      } else if (sp.height != null) {
        scene += dataRow('h', `${formatNum(sp.height)} m`);
      }
      if (sp.horizontalX != null) scene += dataRow('x', `${formatNum(sp.horizontalX)} m`);
      if (sp.onGround) scene += dataRow('Trạng thái', 'đã chạm đất', { status: 'ok' });
      if (sp.predictedImpact != null) {
        scene += dataRow('t_chạm đất', `≈ ${formatNum(sp.predictedImpact)} s`);
      }
      if (sp.theoretical) {
        const th = sp.theoretical;
        scene += dataRow('y (lý thuyết)', `${formatNum(th.yBottom)} m`);
        scene += dataRow('v_y (lý thuyết)', `${formatNum(th.vy)} m/s`);
        if (th.tGround != null) {
          scene += dataRow('v_chạm đất', `≈ ${formatNum(th.vGround)} m/s`);
        }
      }
      if (sp.totalMomentum != null) scene += dataRow('p', `${formatNum(sp.totalMomentum)} kg·m/s`);
      if (sp.object1Velocity) {
        const v1 = sp.object1Velocity;
        scene += dataRow('v₁', `(${formatNum(v1.x)}, ${formatNum(v1.y)}, ${formatNum(v1.z)}) m/s`);
      }
      if (sp.object2Velocity) {
        const v2 = sp.object2Velocity;
        scene += dataRow('v₂', `(${formatNum(v2.x)}, ${formatNum(v2.y)}, ${formatNum(v2.z)}) m/s`);
      }
      if (sp.status) scene += dataRow('Trạng thái', sp.status);
      if (sp.collision) {
        const c = sp.collision;
        scene += dataRow('p (sau va)', `${formatNum(c.after?.momentum)} kg·m/s`);
        scene += dataRow('ΔEk', `${formatNum(c.energyLoss)} J`);
        scene += dataRow('e', formatNum(c.restitutionObserved));
        if (c.analytic?.v1) {
          scene += dataRow("v₁' (LT)", `${formatNum(c.analytic.v1.x)} m/s`);
          scene += dataRow("v₂' (LT)", `${formatNum(c.analytic.v2.x)} m/s`);
        }
      }
    }

    el.innerHTML =
      dataSection('Chuyển động', kin) +
      dataSection('Lực (N)', forces) +
      dataSection('Scene', scene);
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
