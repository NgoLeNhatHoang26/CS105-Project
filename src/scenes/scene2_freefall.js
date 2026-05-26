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
import { applyForceVector, clearForces } from '../physics/forceManager.js';
import { getState } from '../state.js';
import {
  GROUND_EPS,
  getObjectRadius,
  centerYFromBottomHeight,
  bottomYFromCenterY,
  minCenterYAtGround,
  theoreticalFreeFall,
} from './scene2Helpers.js';

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

    const r = getObjectRadius(params);
    const bottomH = params.initialHeight;
    const mass = params.mass;
    const pos = { x: 0, y: centerYFromBottomHeight(bottomH, r), z: 0 };
    const bodyOpts = { mass, position: pos, damping: false };

    let pair;
    if (params.shape === 'sphere') {
      pair = createSpherePair({
        radius: r,
        ...bodyOpts,
        color: 0xe94560,
      });
    } else {
      const s = params.boxSize ?? 0.6;
      pair = createBoxPair({
        width: s,
        height: s,
        depth: s,
        ...bodyOpts,
        color: 0x4a90d9,
      });
    }

    const sim = {
      id: 'object_1',
      ...pair,
      mass,
      radius: r,
      releaseHeight: bottomH,
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
    const r = obj.radius ?? getObjectRadius(getState().sceneParams);
    const yMin = minCenterYAtGround(r);
    if (obj.body.position.y <= yMin) {
      obj.body.position.y = yMin;
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
    const r = obj.radius ?? getObjectRadius(params);
    const releaseH = obj.releaseHeight ?? params.initialHeight;
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
    const forces = freeFallForces(params.mass, g, appliedVec, netVec);
    const heightBottom = bottomYFromCenterY(pos.y, r);
    const nearGround = heightBottom <= GROUND_EPS + 0.05;
    const pureFreeFall = params.forceMag === 0;
    const t = s.simulationTime;
    const theory = pureFreeFall ? theoreticalFreeFall(g, t, releaseH) : null;

    return {
      time: t,
      sceneName: this.name,
      mass: params.mass,
      position: pos,
      velocity: vel,
      speed: vecLength(vel.x, vel.y, vel.z),
      acceleration: {
        x: forces.accelerationX,
        y: forces.accelerationY,
        z: forces.accelerationZ,
      },
      kineticEnergy: kineticEnergy(params.mass, vel.x, vel.y, vel.z),
      forces: {
        gravity: forces.gravity,
        applied: forces.applied,
        normal: nearGround ? forces.gravity : 0,
        friction: 0,
        net: forces.net,
      },
      forceVectors: {
        applied: appliedVec,
        gravity: gravityVec,
        normal: nearGround ? { x: 0, y: params.mass * g, z: 0 } : null,
        friction: null,
        net: netVec,
      },
      sceneSpecific: {
        heightBottom,
        centerY: pos.y,
        releaseHeight: releaseH,
        horizontalX: pos.x,
        onGround: this._stopped || nearGround,
        predictedImpact: pureFreeFall && g > 0 ? Math.sqrt((2 * releaseH) / g) : null,
        theoretical: theory,
      },
    };
  }

  dispose() {
    if (this.ground) disposeGridMesh(this.ground);
    this.ground = null;
    super.dispose();
  }
}
