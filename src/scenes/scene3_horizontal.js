import { BaseScene } from './baseScene.js';
import { SCENE_IDS, ARENA_HALF } from '../constants.js';
import {
  createStaticBox,
  saveInitialPose,
  resetSimObject,
  syncMeshFromBody,
  disposePair,
} from '../components/geometries.js';
import { createTexturedPlane, disposeGridMesh } from '../visualization/gridHelper.js';
import { degToRad, vecLength } from '../utils/helpers.js';
import {
  horizontalForces,
  kineticEnergy,
  positionFromBody,
  velocityFromBody,
} from '../physics/calculator.js';
import {
  applyForceVector,
  applyHorizontalFriction,
  clearForces,
  forceFromAngles,
} from '../physics/forceManager.js';
import { getState } from '../state.js';
import { createExperimentPair, applyVisualRotation } from '../graphics/experimentObjectFactory.js';

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
    const { view, physics } = deps;
    const scene = view.getScene();
    view.setBackground(0xb0c4de);

    const floor = createTexturedPlane(ARENA_HALF * 2, ARENA_HALF * 2, 16, 16);
    floor.mesh.position.y = 0;
    scene.add(floor.mesh);
    this.ground = floor;
    this.meshes.push(floor.mesh);

    const groundBody = createStaticBox(
      { x: ARENA_HALF * 2, y: 0.2, z: ARENA_HALF * 2 },
      { x: 0, y: -0.1, z: 0 },
    );
    this.staticBodies.push(groundBody);
    physics.addBody(groundBody);

    this._buildWalls();
    this.staticBodies.forEach((b) => physics.addBody(b));
    this.onParameterChange();
  }

  _buildWalls() {
    const h = 3;
    const t = 0.5;
    const positions = [
      { x: ARENA_HALF, y: h / 2, z: 0 },
      { x: -ARENA_HALF, y: h / 2, z: 0 },
      { x: 0, y: h / 2, z: ARENA_HALF },
      { x: 0, y: h / 2, z: -ARENA_HALF },
    ];
    const sizes = [
      { x: t, y: h, z: ARENA_HALF * 2 },
      { x: t, y: h, z: ARENA_HALF * 2 },
      { x: ARENA_HALF * 2, y: h, z: t },
      { x: ARENA_HALF * 2, y: h, z: t },
    ];
    positions.forEach((pos, i) => {
      const body = createStaticBox(sizes[i], pos);
      this.staticBodies.push(body);
    });
  }

  _objectSpawnY(params) {
    return ((params.boxSize ?? 0.6) * (params.graphicsScale ?? 1)) / 2 + 0.05;
  }

  _configureObjectPhysics(sim, params) {
    const { body } = sim;
    if ((params.graphicsShape ?? params.shape ?? 'box') === 'box') {
      // Mô hình ma sát trượt: hộp không lăn trên mặt phẳng ngang.
      body.fixedRotation = true;
      body.angularFactor.set(0, 0, 0);
    } else {
      body.fixedRotation = false;
      body.angularFactor.set(1, 1, 1);
    }
    body.mass = params.mass;
    body.updateMassProperties();
    body.angularVelocity.set(0, 0, 0);
    body.allowSleep = false;
    body.wakeUp();
  }

  _buildObject(params) {
    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      this._deps.physics.removeBody(old.body);
      const idx = this.meshes.indexOf(old.mesh);
      if (idx >= 0) this.meshes.splice(idx, 1);
      disposePair(old);
    }
    const mass = params.mass;
    const pos = { x: 0, y: this._objectSpawnY(params), z: 0 };
    const pair = createExperimentPair({
      shape: params.graphicsShape ?? params.shape ?? 'box',
      size: (params.boxSize ?? 0.6) * (params.graphicsScale ?? 1),
      mass,
      position: pos,
      color: parseColor(params.graphicsColor, 0x4a90d9),
      wireframe: params.graphicsWireframe,
      textureMap: this._deps.textureMap,
      textureName: params.graphicsMaterial ?? 'default',
    });
    const sim = {
      id: 'object_1',
      ...pair,
      mass,
      selectable: true,
      reset: () => resetSimObject(sim),
    };
    this.objects = [sim];
    this.meshes.push(sim.mesh);
    applyVisualRotation(sim, params);
  }

  onParameterChange() {
    const params = getState().sceneParams;
    this._deps.physics.setGravity(getState().global.gravity);
    // Ma sát μ do applyHorizontalFriction; tắt ma sát tiếp xúc Cannon (xung đột với fixedRotation).
    this._deps.physics.setDefaultFriction(0);

    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      this._deps.physics.removeBody(old.body);
      const idx = this.meshes.indexOf(old.mesh);
      if (idx >= 0) this.meshes.splice(idx, 1);
      disposePair(old);
    }

    this._buildObject(params);
    const scene = this._deps.view.getScene();
    const obj = this.objects[0];
    scene.add(obj.mesh);
    this._deps.physics.addBody(obj.body);
    this._configureObjectPhysics(obj, params);
    saveInitialPose(obj);
    this._stopped = false;
  }

  applyRuntimeForces() {
    if (this._stopped || !this.objects[0]) return;
    const params = getState().sceneParams;
    const g = getState().global.gravity;
    const obj = this.objects[0];
    clearForces(obj.body);
    const applied = forceFromAngles(params.forceMag, params.forceAngleDeg, 'xz');
    applyForceVector(obj.body, applied);
    applyHorizontalFriction(obj.body, params.mass, g, params.friction, applied);
  }

  update() {
    const obj = this.objects[0];
    if (!obj || this._stopped) return;
    syncMeshFromBody(obj.mesh, obj.body);

    const p = obj.body.position;
    const limit = ARENA_HALF - 1;
    if (Math.abs(p.x) > limit || Math.abs(p.z) > limit) {
      obj.body.velocity.set(0, 0, 0);
      obj.body.angularVelocity.set(0, 0, 0);
      this.stopSimulation();
      return;
    }

    const params = getState().sceneParams;
    const speed = vecLength(obj.body.velocity.x, 0, obj.body.velocity.z);
    const maxF = params.friction * params.mass * getState().global.gravity;
    const applied = forceFromAngles(params.forceMag, params.forceAngleDeg, 'xz');
    const appliedHoriz = vecLength(applied.x, 0, applied.z);
    if (speed < 0.05 && appliedHoriz <= maxF) {
      obj.body.velocity.set(0, 0, 0);
      obj.body.angularVelocity.set(0, 0, 0);
    }
  }

  getTelemetry() {
    const s = getState();
    const params = s.sceneParams;
    const g = s.global.gravity;
    const obj = this.objects[0];
    if (!obj) return { time: s.simulationTime, sceneName: this.name };

    const pos = positionFromBody(obj.body);
    const vel = velocityFromBody(obj.body);
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
    const netVec = {
      x: appliedVec.x + gravityVec.x + normalVec.x + frictionVec.x,
      y: appliedVec.y + gravityVec.y + normalVec.y + frictionVec.y,
      z: appliedVec.z + gravityVec.z + normalVec.z + frictionVec.z,
    };

    return {
      time: s.simulationTime,
      sceneName: this.name,
      mass: params.mass,
      position: pos,
      velocity: vel,
      speed,
      acceleration: {
        x: forces.acceleration * (vel.x >= 0 ? 1 : -1),
        y: 0,
        z: 0,
      },
      kineticEnergy: kineticEnergy(params.mass, vel.x, vel.y, vel.z),
      forces,
      forceVectors: {
        applied: appliedVec,
        gravity: gravityVec,
        normal: normalVec,
        friction: frictionVec,
        net: netVec,
      },
      sceneSpecific: { friction: params.friction, positionXZ: `(${pos.x.toFixed(2)}, ${pos.z.toFixed(2)})` },
    };
  }

  dispose() {
    if (this.ground) disposeGridMesh(this.ground);
    super.dispose();
  }
}
