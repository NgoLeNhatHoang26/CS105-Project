import * as THREE from 'three';
import { BaseScene } from './baseScene.js';
import { SCENE_IDS } from '../constants.js';
import { disposeSimObject } from '../components/geometries.js';
import { createTexturedPlane, disposeGridMesh } from '../visualization/gridHelper.js';
import { degToRad, vecLength } from '../utils/helpers.js';
import { freeFallForces, kineticEnergy } from '../physics/calculator.js';
import { getState } from '../state.js';
import {
  GROUND_EPS,
  getObjectRadius,
  centerYFromBottomHeight,
  bottomYFromCenterY,
  minCenterYAtGround,
  theoreticalFreeFall,
} from './scene2Helpers.js';
import { createVisualMesh, applyVisualRotation } from '../graphics/experimentObjectFactory.js';
import { createSimState } from '../physics/simObject.js';
import { integrateFreeFall } from '../physics/integrators/freeFall.js';
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

export class Scene2FreeFall extends BaseScene {
  constructor() {
    super(SCENE_IDS.FREE_FALL, 'Rơi tự do');
    this.ground = null;
  }

  init(deps) {
    super.init(deps);
    const { view } = deps;
    const scene = view.getScene();
    const params = getState().sceneParams;

    const floor = createTexturedPlane(40, 40, 20, 20);
    floor.mesh.position.y = 0;
    scene.add(floor.mesh);
    this.ground = floor;
    this.meshes.push(floor.mesh);

    this._buildObject(params);
    this.objects.forEach((o) => {
      scene.add(o.mesh);
      saveInitialPoseKinematic(o);
    });
  }

  _buildObject(params) {
    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      disposeSimObject(old);
    }

    const r = Math.max(0.2, 0.5 * (params.boxSize ?? 0.6) * (params.graphicsScale ?? 1));
    const bottomH = params.initialHeight;
    const mass = params.mass;
    const pos = { x: 0, y: centerYFromBottomHeight(bottomH, r), z: 0 };
    const s = (params.boxSize ?? 0.6) * (params.graphicsScale ?? 1);
    const color = parseColor(params.graphicsColor, 0x4a90d9);
    const vis = createVisualMesh({
      shape: params.graphicsShape ?? params.shape ?? 'box',
      size: s,
      color,
      wireframe: params.graphicsWireframe,
      textureMap: this._deps.textureMap,
      textureName: params.graphicsMaterial ?? 'default',
    });
    vis.mesh.position.set(pos.x, pos.y, pos.z);
    const state = createSimState({ position: { ...pos }, velocity: { x: 0, y: 0, z: 0 }, mass });
    const sim = {
      id: 'object_1',
      mesh: vis.mesh,
      material: vis.material,
      simState: state,
      mass,
      radius: r,
      releaseHeight: bottomH,
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
    const groundY = minCenterYAtGround(obj.radius);

    const { pos, vel, hitGround } = integrateFreeFall(
      { pos: { ...obj.simState.position }, vel: { ...obj.simState.velocity } },
      params,
      g,
      dt,
      obj.radius,
      groundY,
    );

    obj.simState.position.x = pos.x;
    obj.simState.position.y = pos.y;
    obj.simState.position.z = pos.z;
    obj.simState.velocity.x = vel.x;
    obj.simState.velocity.y = vel.y;
    obj.simState.velocity.z = vel.z;

    if (hitGround) {
      this.stopSimulation();
    }
  }

  update() {
    const obj = this.objects[0];
    if (!obj || this._stopped) return;

    syncMeshFromState(obj);
    const r = obj.radius ?? getObjectRadius(getState().sceneParams);
    const yMin = minCenterYAtGround(r);
    if (obj.simState.position.y <= yMin) {
      obj.simState.position.y = yMin;
      obj.simState.velocity.x = 0;
      obj.simState.velocity.y = 0;
      obj.simState.velocity.z = 0;
      syncMeshFromState(obj);
      this.stopSimulation();
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
    const speed = vecLength(vel.x, vel.y, vel.z);
    const { shape, size } = objectDragGeometry(params);
    const dragMag = params.airResistance ? computeAirDragMagnitude(speed, shape, size) : 0;
    const dragVec = dragMag > 0 && speed > 1e-4
      ? airDragForceVector(vel, shape, size)
      : { x: 0, y: 0, z: 0 };
    const netVec = {
      x: appliedVec.x + gravityVec.x + dragVec.x,
      y: appliedVec.y + gravityVec.y + dragVec.y,
      z: appliedVec.z + gravityVec.z + dragVec.z,
    };
    const forces = freeFallForces(params.mass, g, appliedVec, netVec);
    forces.drag = dragMag;
    const heightBottom = bottomYFromCenterY(pos.y, r);
    const nearGround = heightBottom <= GROUND_EPS + 0.05;
    const pureFreeFall = params.forceMag === 0 && !params.airResistance;
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
        drag: dragMag > 0 ? dragVec : null,
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

  getDragPlane(sim) {
    const y = sim.simState?.position?.y ?? sim.mesh?.position?.y ?? 1;
    return new THREE.Plane(new THREE.Vector3(0, 1, 0), -y);
  }

  dispose() {
    if (this.ground) disposeGridMesh(this.ground);
    this.ground = null;
    super.dispose();
  }
}
