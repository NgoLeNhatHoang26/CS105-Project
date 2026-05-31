import { BaseScene } from './baseScene.js';
import { SCENE_IDS, ARENA_HALF } from '../constants.js';
import { disposeSimObject } from '../components/geometries.js';
import { createTexturedPlane, disposeGridMesh } from '../visualization/gridHelper.js';
import { vecLength } from '../utils/helpers.js';
import { horizontalForces, kineticEnergy } from '../physics/calculator.js';
import { forceFromAngles } from '../physics/forceManager.js';
import { getState } from '../state.js';
import { createExperimentPair, applyVisualRotation } from '../graphics/experimentObjectFactory.js';
import { createSimState } from '../physics/simObject.js';
import { integrateHorizontal } from '../physics/integrators/horizontal.js';
import { syncMeshFromState, saveInitialPoseKinematic, resetSimObjectKinematic } from '../components/simSync.js';
import {
  airDragForceVector,
  computeAirDragMagnitude,
  objectDragGeometry,
} from '../physics/airDrag.js';

function parseColor(hex, fallback = 0x4a90d9) {
  if (typeof hex !== 'string') return fallback;
  return Number.parseInt(hex.replace('#', ''), 16) || fallback;
}

export class Scene3Horizontal extends BaseScene {
  constructor() {
    super(SCENE_IDS.HORIZONTAL, 'Lực ngang');
    this.ground = null;
  }

  init(deps) {
    super.init(deps);
    const { view } = deps;
    const scene = view.getScene();

    const floor = createTexturedPlane(ARENA_HALF * 2, ARENA_HALF * 2, 16, 16);
    floor.mesh.position.y = 0;
    scene.add(floor.mesh);
    this.ground = floor;
    this.meshes.push(floor.mesh);

    this.onParameterChange();
  }

  _objectSpawnY(params) {
    return ((params.boxSize ?? 0.6) * (params.graphicsScale ?? 1)) / 2 + 0.05;
  }

  _buildObject(params) {
    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      const idx = this.meshes.indexOf(old.mesh);
      if (idx >= 0) this.meshes.splice(idx, 1);
      disposeSimObject(old);
    }

    const mass = params.mass;
    const spawnY = this._objectSpawnY(params);
    const pos = { x: 0, y: spawnY, z: 0 };

    const pair = createExperimentPair({
      shape: params.graphicsShape ?? params.shape ?? 'box',
      size: (params.boxSize ?? 0.6) * (params.graphicsScale ?? 1),
      mass: 0,
      position: pos,
      color: parseColor(params.graphicsColor, 0x4a90d9),
      wireframe: params.graphicsWireframe,
      textureMap: this._deps.textureMap,
      textureName: params.graphicsMaterial ?? 'default',
      damping: false,
    });
    const simState = createSimState({
      position: { x: 0, y: spawnY, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      mass,
    });
    const sim = {
      id: 'object_1',
      mesh: pair.mesh,
      material: pair.material,
      simState,
      mass,
      spawnY,
      selectable: true,
      reset: () => resetSimObjectKinematic(sim),
    };

    this.objects = [sim];
    this.meshes.push(sim.mesh);
    applyVisualRotation(sim, params);
  }

  onParameterChange() {
    const params = getState().sceneParams;

    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      const idx = this.meshes.indexOf(old.mesh);
      if (idx >= 0) this.meshes.splice(idx, 1);
      disposeSimObject(old);
    }

    this._buildObject(params);
    const scene = this._deps.view.getScene();
    const obj = this.objects[0];
    scene.add(obj.mesh);
    saveInitialPoseKinematic(obj);
    this._stopped = false;
  }

  integrate(dt) {
    if (this._stopped || !this.objects[0]) return;
    const obj = this.objects[0];
    const params = getState().sceneParams;
    const g = getState().global.gravity;

    const next = integrateHorizontal(
      {
        x: obj.simState.position.x,
        z: obj.simState.position.z,
        vx: obj.simState.velocity.x,
        vz: obj.simState.velocity.z,
      },
      params,
      g,
      dt,
      ARENA_HALF,
    );

    obj.simState.position.x = next.x;
    obj.simState.position.z = next.z;
    obj.simState.velocity.x = next.vx;
    obj.simState.velocity.z = next.vz;
    obj.simState.position.y = obj.spawnY;

    const limit = ARENA_HALF - 1;
    if (Math.abs(next.x) >= limit || Math.abs(next.z) >= limit) {
      obj.simState.velocity.x = 0;
      obj.simState.velocity.z = 0;
      this.stopSimulation();
    }
  }

  update() {
    const obj = this.objects[0];
    if (!obj || this._stopped) return;

    const params = getState().sceneParams;
    syncMeshFromState(obj);

    const speed = vecLength(obj.simState.velocity.x, 0, obj.simState.velocity.z);
    const maxF = params.friction * params.mass * getState().global.gravity;
    const applied = forceFromAngles(params.forceMag, params.forceAngleDeg, 'xz');
    const appliedH = vecLength(applied.x, 0, applied.z);
    if (speed < 0.01 && appliedH <= maxF) {
      obj.simState.velocity.x = 0;
      obj.simState.velocity.z = 0;
    }
  }

  getTelemetry() {
    const s = getState();
    const params = s.sceneParams;
    const g = s.global.gravity;
    const obj = this.objects[0];
    if (!obj) return { time: s.simulationTime, sceneName: this.name };

    const pos = { ...obj.simState.position };
    const vel = { ...obj.simState.velocity };
    const speed = vecLength(vel.x, vel.y, vel.z);

    const forces = horizontalForces(
      params.mass,
      g,
      params.friction,
      params.forceMag,
      vel.x,
      vel.z,
    );
    const appliedVec = forceFromAngles(params.forceMag, params.forceAngleDeg, 'xz');
    const gravityVec = { x: 0, y: -params.mass * g, z: 0 };
    const normalVec = { x: 0, y: params.mass * g, z: 0 };
    const horizontalSpeed = vecLength(vel.x, 0, vel.z);
    const frictionMag = params.friction * params.mass * g;

    let frictionVec = { x: 0, y: 0, z: 0 };
    if (horizontalSpeed > 0.01) {
      frictionVec = {
        x: (-vel.x / horizontalSpeed) * frictionMag,
        y: 0,
        z: (-vel.z / horizontalSpeed) * frictionMag,
      };
    } else if (params.forceMag > 0.01) {
      const appliedLen = Math.sqrt(appliedVec.x ** 2 + appliedVec.z ** 2);
      if (appliedLen > 0) {
        frictionVec = {
          x: (-appliedVec.x / appliedLen) * Math.min(frictionMag, appliedLen),
          y: 0,
          z: (-appliedVec.z / appliedLen) * Math.min(frictionMag, appliedLen),
        };
      }
    }

    const { shape, size } = objectDragGeometry(params);
    const dragMag = params.airResistance ? computeAirDragMagnitude(horizontalSpeed, shape, size) : 0;
    const dragVec = dragMag > 0 && horizontalSpeed > 1e-4
      ? airDragForceVector({ x: vel.x, y: 0, z: vel.z }, shape, size)
      : { x: 0, y: 0, z: 0 };
    forces.drag = dragMag;
    forces.net = Math.max(0, forces.net - dragMag);

    const netVec = {
      x: appliedVec.x + frictionVec.x + dragVec.x,
      y: 0,
      z: appliedVec.z + frictionVec.z + dragVec.z,
    };

    return {
      time: s.simulationTime,
      sceneName: this.name,
      mass: params.mass,
      position: pos,
      velocity: vel,
      speed,
      acceleration: {
        x: params.mass > 0 ? netVec.x / params.mass : 0,
        y: 0,
        z: params.mass > 0 ? netVec.z / params.mass : 0,
      },
      kineticEnergy: kineticEnergy(params.mass, vel.x, vel.y, vel.z),
      forces,
      forceVectors: {
        applied: appliedVec,
        gravity: gravityVec,
        normal: normalVec,
        friction: frictionVec,
        drag: dragMag > 0 ? dragVec : null,
        net: netVec,
      },
      sceneSpecific: {
        friction: params.friction,
        positionXZ: `(${pos.x.toFixed(2)}, ${pos.z.toFixed(2)})`,
      },
    };
  }

  dispose() {
    if (this.ground) disposeGridMesh(this.ground);
    super.dispose();
  }
}
