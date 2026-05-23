import * as THREE from 'three';
import { BaseScene } from './baseScene.js';
import { SCENE_IDS } from '../constants.js';
import {
  createBoxPair,
  createSpherePair,
  createStaticPlaneBody,
  saveInitialPose,
  resetSimObject,
  syncMeshFromBody,
  disposePair,
} from '../components/geometries.js';
import { createTexturedPlane, disposeGridMesh } from '../visualization/gridHelper.js';
import { degToRad, vecLength } from '../utils/helpers.js';
import {
  freeFallForces,
  kineticEnergy,
  positionFromBody,
  velocityFromBody,
} from '../physics/calculator.js';
import { applyForceVector, clearForces, forceFromAngles } from '../physics/forceManager.js';
import { getState } from '../state.js';

export class Scene2FreeFall extends BaseScene {
  constructor() {
    super(SCENE_IDS.FREE_FALL, 'Rơi tự do');
    this.ground = null;
  }

  init(deps) {
    super.init(deps);
    const { view, physics } = deps;
    const scene = view.getScene();
    const params = getState().sceneParams;

    view.setBackground(0x87ceeb);

    const floor = createTexturedPlane(40, 40, 20, 20);
    floor.mesh.position.y = 0;
    scene.add(floor.mesh);
    this.ground = floor;
    this.meshes.push(floor.mesh);

    const groundBody = createStaticPlaneBody(0);
    this.staticBodies.push(groundBody);
    physics.addBody(groundBody);

    this._buildObject(params);
    this.objects.forEach((o) => {
      scene.add(o.mesh);
      physics.addBody(o.body);
      saveInitialPose(o);
    });
  }

  _buildObject(params) {
    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      this._deps.physics.removeBody(old.body);
      disposePair(old);
    }

    const h = params.initialHeight;
    const mass = params.mass;
    const pos = { x: 0, y: h, z: 0 };
    let pair;
    if (params.shape === 'sphere') {
      pair = createSpherePair({
        radius: params.sphereRadius ?? 0.4,
        mass,
        position: pos,
        color: 0xe94560,
      });
    } else {
      const s = params.boxSize ?? 0.6;
      pair = createBoxPair({
        width: s,
        height: s,
        depth: s,
        mass,
        position: pos,
        color: 0x4a90d9,
      });
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
    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      this._deps.physics.removeBody(old.body);
      disposePair(old);
    }
    this._buildObject(params);
    const scene = this._deps.view.getScene();
    const obj = this.objects[0];
    scene.add(obj.mesh);
    this._deps.physics.addBody(obj.body);
    saveInitialPose(obj);
    this._stopped = false;
  }

  applyRuntimeForces() {
    if (this._stopped || !this.objects[0]) return;
    const params = getState().sceneParams;
    const obj = this.objects[0];
    clearForces(obj.body);
    const hRad = degToRad(params.forceAngleHorizontal);
    const vRad = degToRad(params.forceAngleVertical);
    const mag = params.forceMag;
    const fx = mag * Math.cos(vRad) * Math.cos(hRad);
    const fy = mag * Math.sin(vRad);
    const fz = mag * Math.cos(vRad) * Math.sin(hRad);
    applyForceVector(obj.body, { x: fx, y: fy, z: fz });
  }

  update() {
    const obj = this.objects[0];
    if (!obj || this._stopped) return;
    syncMeshFromBody(obj.mesh, obj.body);
    const params = getState().sceneParams;
    const r =
      params.shape === 'sphere' ? params.sphereRadius ?? 0.4 : (params.boxSize ?? 0.6) / 2;
    if (obj.body.position.y <= r + 0.02) {
      obj.body.position.y = r + 0.02;
      obj.body.velocity.set(0, 0, 0);
      obj.body.angularVelocity.set(0, 0, 0);
      syncMeshFromBody(obj.mesh, obj.body);
      this.stopSimulation();
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
    const hRad = degToRad(params.forceAngleHorizontal);
    const vRad = degToRad(params.forceAngleVertical);
    const appliedVec = {
      x: params.forceMag * Math.cos(vRad) * Math.cos(hRad),
      y: params.forceMag * Math.sin(vRad),
      z: params.forceMag * Math.cos(vRad) * Math.sin(hRad),
    };
    const gravityVec = { x: 0, y: -params.mass * g, z: 0 };
    const netVec = {
      x: appliedVec.x + gravityVec.x,
      y: appliedVec.y + gravityVec.y,
      z: appliedVec.z + gravityVec.z,
    };
    const ax = params.mass > 0 ? netVec.x / params.mass : 0;
    const forces = freeFallForces(params.mass, g, ax);
    const nearGround = pos.y <= (params.boxSize ?? 0.6) / 2 + 0.05;

    return {
      time: s.simulationTime,
      sceneName: this.name,
      mass: params.mass,
      position: pos,
      velocity: vel,
      speed: vecLength(vel.x, vel.y, vel.z),
      acceleration: { x: forces.accelerationX, y: forces.accelerationY, z: 0 },
      kineticEnergy: kineticEnergy(params.mass, vel.x, vel.y, vel.z),
      forces: {
        gravity: forces.gravity,
        applied: params.forceMag,
        normal: nearGround ? forces.gravity : 0,
        friction: 0,
        net: Math.sqrt(netVec.x ** 2 + netVec.y ** 2 + netVec.z ** 2),
      },
      forceVectors: {
        applied: appliedVec,
        gravity: gravityVec,
        normal: nearGround ? { x: 0, y: params.mass * g, z: 0 } : null,
        friction: null,
        net: netVec,
      },
      sceneSpecific: {
        height: pos.y,
        horizontalX: pos.x,
        predictedImpact: params.forceMag === 0 ? Math.sqrt((2 * params.initialHeight) / g) : null,
      },
    };
  }

  dispose() {
    if (this.ground) disposeGridMesh(this.ground);
    this.ground = null;
    super.dispose();
  }
}
