import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { BaseScene } from './baseScene.js';
import { SCENE_IDS, ARENA_HALF } from '../constants.js';
import {
  createBoxPair,
  createSpherePair,
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
import { applyForceVector, clearForces, forceFromAngles } from '../physics/forceManager.js';
import { getState } from '../state.js';

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
    this._buildObject(getState().sceneParams);

    this.objects.forEach((o) => {
      scene.add(o.mesh);
      physics.addBody(o.body);
      saveInitialPose(o);
    });
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

  _buildObject(params) {
    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      this._deps.physics.removeBody(old.body);
      disposePair(old);
    }
    const mass = params.mass;
    const pos = { x: 0, y: (params.boxSize ?? 0.6) / 2 + 0.05, z: 0 };
    let pair;
    if (params.shape === 'sphere') {
      pair = createSpherePair({
        radius: params.sphereRadius ?? 0.4,
        mass,
        position: pos,
        color: 0x4a90d9,
      });
    } else {
      const s = params.boxSize ?? 0.6;
      pair = createBoxPair({ width: s, height: s, depth: s, mass, position: pos, color: 0x4a90d9 });
    }
    const sim = {
      id: 'object_1',
      ...pair,
      mass,
      selectable: true,
      reset: () => resetSimObject(sim),
    };
    this.objects = [sim];
    this.meshes.push(sim.mesh);
  }

  onParameterChange() {
    const params = getState().sceneParams;
    this._deps.physics.setGravity(getState().global.gravity);
    this._deps.physics.setDefaultFriction(params.friction);
    if (this.objects[0]) {
      const o = this.objects[0];
      o.body.mass = params.mass;
      o.body.updateMassProperties();
    }
  }

  applyRuntimeForces() {
    if (this._stopped || !this.objects[0]) return;
    const params = getState().sceneParams;
    const obj = this.objects[0];
    clearForces(obj.body);
    const f = forceFromAngles(params.forceMag, params.forceAngleDeg, 'xz');
    applyForceVector(obj.body, f);
  }

  update() {
    const obj = this.objects[0];
    if (!obj || this._stopped) return;
    syncMeshFromBody(obj.mesh, obj.body);

    const p = obj.body.position;
    const limit = ARENA_HALF - 1;
    if (Math.abs(p.x) > limit || Math.abs(p.z) > limit) {
      obj.body.velocity.set(0, 0, 0);
      this.stopSimulation();
      return;
    }

    const params = getState().sceneParams;
    const speed = vecLength(obj.body.velocity.x, 0, obj.body.velocity.z);
    const maxF = params.friction * params.mass * getState().global.gravity;
    if (speed < 0.05 && params.forceMag <= maxF) {
      obj.body.velocity.set(0, 0, 0);
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
