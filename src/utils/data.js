import { getState } from '../state.js';
import { SCENE_NAMES } from '../constants.js';
import { formatNum } from './helpers.js';

let recordCounter = 0;

export function createDataPoint(telemetry) {
  const s = getState();
  recordCounter += 1;
  return {
    id: `datapoint_${String(recordCounter).padStart(3, '0')}`,
    timestamp: Date.now(),
    simulationTime: telemetry.time ?? s.simulationTime,
    frameNumber: s.frameCount,
    scene: SCENE_NAMES[s.currentSceneId],
    sceneId: s.currentSceneId,
    position: { ...telemetry.position },
    velocity: { ...telemetry.velocity },
    acceleration: telemetry.acceleration ? { ...telemetry.acceleration } : null,
    kineticEnergy: telemetry.kineticEnergy,
    mass: telemetry.mass,
    forces: telemetry.forces ? { ...telemetry.forces } : null,
    sceneSpecific: telemetry.sceneSpecific ? { ...telemetry.sceneSpecific } : null,
  };
}

export function exportToCSV(records, sceneId) {
  const headers = [
    'Scene',
    'RecordID',
    'FrameNumber',
    'Time_s',
    'X_m',
    'Y_m',
    'Z_m',
    'Vx_ms',
    'Vy_ms',
    'Vz_ms',
    'Ax_ms2',
    'Ay_ms2',
    'Az_ms2',
    'Mass_kg',
    'Ek_J',
    'Force_F_N',
    'Force_W_N',
    'Force_N_N',
    'Force_f_N',
    'Force_Net_N',
  ];

  const rows = records.map((r, i) => {
    const p = r.position || {};
    const v = r.velocity || {};
    const a = r.acceleration || {};
    const f = r.forces || {};
    return [
      r.scene,
      i + 1,
      r.frameNumber,
      formatNum(r.simulationTime, 3),
      formatNum(p.x, 3),
      formatNum(p.y, 3),
      formatNum(p.z, 3),
      formatNum(v.x, 3),
      formatNum(v.y, 3),
      formatNum(v.z, 3),
      formatNum(a?.x, 3),
      formatNum(a?.y, 3),
      formatNum(a?.z, 3),
      formatNum(r.mass, 2),
      formatNum(r.kineticEnergy, 2),
      formatNum(f.applied, 2),
      formatNum(f.gravity, 2),
      formatNum(f.normal, 2),
      formatNum(f.friction, 2),
      formatNum(f.net, 2),
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `physics_simulation_scene${sceneId}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
