import * as THREE from 'three';
import { BaseScene } from './baseScene.js';
import { SCENE_IDS } from '../constants.js';
import { disposeSimObject } from '../components/geometries.js';
import { createTexturedPlane } from '../visualization/gridHelper.js';
import { degToRad } from '../utils/helpers.js';
import { inclineForces, kineticEnergy } from '../physics/calculator.js';
import { getState } from '../state.js';
import {
  computeInclineData,
  computeBoxHalfExtentAlongNormal,
  getRampFrameQuaternion,
  computeSpawnPosition,
  computeAppliedForceOnRamp,
} from './inclineHelpers.js';
import { createVisualMesh, applyVisualRotation } from '../graphics/experimentObjectFactory.js';
import { createSimState } from '../physics/simObject.js';
import { integrateIncline } from '../physics/integrators/incline.js';
import { syncMeshFromState, saveInitialPoseKinematic } from '../components/simSync.js';
import {
  airDragForceVector,
  computeAirDragMagnitude,
  objectDragGeometry,
} from '../physics/airDrag.js';

function parseColor(hex, fallback = 0x4a90d9) {
  if (typeof hex !== 'string') return fallback;
  return Number.parseInt(hex.replace('#', ''), 16) || fallback;
}

export class Scene1Incline extends BaseScene {
  constructor() {
    super(SCENE_IDS.INCLINE, 'Mặt phẳng nghiêng');
    this.inclineGroup = new THREE.Group();
    this.inclineData = computeInclineData(5, 30);
    this.rampThickness = 0.2;
    this.rampWidth = 3;
    this.objectDims = { width: 0.6, height: 0.6, depth: 0.6 };
    this.spawnDownOffset = 0.1;
    this.spawnNormalOffset = 0.03;
  }

  init(deps) {
    super.init(deps);
    const { view } = deps;
    const scene = view.getScene();

    scene.add(this.inclineGroup);
    this.groups.push(this.inclineGroup);

    this.onParameterChange();
  }

  _buildRamp(params) {
    this.inclineData = computeInclineData(params.length, params.angleDeg);
    const { baseLength, height, bottomPoint } = this.inclineData;

    while (this.inclineGroup.children.length) {
      const c = this.inclineGroup.children[0];
      this.inclineGroup.remove(c);
      c.geometry?.dispose?.();
      if (Array.isArray(c.material)) {
        c.material.forEach((m) => { m.map?.dispose?.(); m.dispose?.(); });
      } else {
        c.material?.map?.dispose?.();
        c.material?.dispose?.();
      }
    }

    const floor = createTexturedPlane(20, 10, 10, 5, 0xf2f2f2);
    floor.mesh.position.set(0, 0, 0);
    this.inclineGroup.add(floor.mesh);

    const rampShape = new THREE.Shape();
    rampShape.moveTo(0, 0);
    rampShape.lineTo(-baseLength, 0);
    rampShape.lineTo(-baseLength, height);
    rampShape.closePath();

    const rampExtrude = new THREE.ExtrudeGeometry(rampShape, {
      depth: this.rampWidth,
      bevelEnabled: false,
      steps: 1,
    });
    const rampMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b8f99,
      shininess: 24,
      side: THREE.DoubleSide,
    });
    const rampMesh = new THREE.Mesh(rampExtrude, rampMaterial);
    rampMesh.castShadow = true;
    rampMesh.receiveShadow = true;
    rampMesh.position.set(bottomPoint.x, bottomPoint.y, -this.rampWidth / 2);
    this.inclineGroup.add(rampMesh);
  }

  _buildObject(params) {
    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      disposeSimObject(old);
      this.objects = [];
    }

    const size = (params.boxSize ?? 0.6) * (params.graphicsScale ?? 1);
    const mass = params.mass;
    this.objectDims = { width: size, height: size, depth: size };

    const halfHeightAlongNormal = computeBoxHalfExtentAlongNormal(this.objectDims, this.inclineData);
    const spawn = computeSpawnPosition(
      this.inclineData,
      halfHeightAlongNormal,
      this.spawnDownOffset,
      this.spawnNormalOffset,
    );

    const visual = createVisualMesh({
      shape: params.graphicsShape ?? 'box',
      size,
      color: parseColor(params.graphicsColor, 0x4a90d9),
      wireframe: params.graphicsWireframe,
      textureMap: this._deps.textureMap,
      textureName: params.graphicsMaterial ?? 'default',
    });

    const simState = createSimState({
      position: { x: spawn.x, y: spawn.y, z: spawn.z },
      velocity: { x: 0, y: 0, z: 0 },
      mass,
    });
    const sim = {
      id: 'object_1',
      mesh: visual.mesh,
      material: visual.material,
      simState,
      sAlong: this.spawnDownOffset,
      vAlong: 0,
      mass,
      selectable: true,
      reset: () => this._placeObjectAtTop(sim),
    };

    this.objects = [sim];
    this.meshes.push(sim.mesh);
    applyVisualRotation(sim, params);
  }

  _positionFromSAlong(sAlong) {
    const halfH = computeBoxHalfExtentAlongNormal(this.objectDims, this.inclineData);
    return computeSpawnPosition(this.inclineData, halfH, sAlong, this.spawnNormalOffset);
  }

  _placeObjectAtTop(simObject) {
    if (!simObject) return;
    const halfH = computeBoxHalfExtentAlongNormal(this.objectDims, this.inclineData);
    const spawn = computeSpawnPosition(
      this.inclineData,
      halfH,
      this.spawnDownOffset,
      this.spawnNormalOffset,
    );
    const rampQuat = getRampFrameQuaternion(this.inclineData);

    simObject.sAlong = this.spawnDownOffset;
    simObject.vAlong = 0;
    simObject.simState.position = { x: spawn.x, y: spawn.y, z: spawn.z };
    simObject.simState.velocity = { x: 0, y: 0, z: 0 };
    simObject.mesh.position.copy(spawn);
    simObject.mesh.quaternion.copy(rampQuat);
    saveInitialPoseKinematic(simObject);
  }

  onParameterChange() {
    const params = getState().sceneParams;

    this._buildRamp(params);

    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      const idx = this.meshes.indexOf(old.mesh);
      if (idx >= 0) this.meshes.splice(idx, 1);
      disposeSimObject(old);
      this.objects = [];
    }

    this._buildObject(params);
    const obj = this.objects[0];
    this._deps.view.getScene().add(obj.mesh);
    this._placeObjectAtTop(obj);
    this._stopped = false;
  }

  integrate(dt) {
    if (this._stopped || !this.objects[0]) return;
    const obj = this.objects[0];
    const params = getState().sceneParams;
    const g = getState().global.gravity;

    const result = integrateIncline(
      { sAlong: obj.sAlong, vAlong: obj.vAlong },
      params,
      g,
      dt,
      params.length,
    );

    obj.sAlong = result.sAlong;
    obj.vAlong = result.vAlong;

    const pos = this._positionFromSAlong(result.sAlong);
    obj.simState.position = { x: pos.x, y: pos.y, z: pos.z };
    obj.simState.velocity = {
      x: this.inclineData.downhillDir.x * result.vAlong,
      y: this.inclineData.downhillDir.y * result.vAlong,
      z: this.inclineData.downhillDir.z * result.vAlong,
    };

    if (result.stopped || obj.sAlong >= params.length - 0.15) {
      obj.sAlong = params.length - 0.12;
      obj.vAlong = 0;
      const stopPos = this._positionFromSAlong(obj.sAlong);
      obj.simState.position = { x: stopPos.x, y: stopPos.y, z: stopPos.z };
      obj.simState.velocity = { x: 0, y: 0, z: 0 };
      this.stopSimulation();
    }
  }

  update() {
    const obj = this.objects[0];
    if (!obj || this._stopped) return;

    const rampQuat = getRampFrameQuaternion(this.inclineData);
    syncMeshFromState(obj);
    obj.mesh.quaternion.copy(rampQuat);
  }

  getTelemetry() {
    const s = getState();
    const params = s.sceneParams;
    const g = s.global.gravity;
    const obj = this.objects[0];
    if (!obj) return { time: s.simulationTime, sceneName: this.name };

    const pos = { ...obj.simState.position };
    const d = this.inclineData.downhillDir;
    const vel = {
      x: d.x * obj.vAlong,
      y: d.y * obj.vAlong,
      z: d.z * obj.vAlong,
    };
    const speed = Math.abs(obj.vAlong);
    const sAlong = obj.sAlong;

    const forceAlongRamp = params.forceMag * Math.cos(degToRad(params.forceAngleDeg));
    const forces = inclineForces(params.mass, g, params.angleDeg, params.friction, forceAlongRamp);
    const { shape, size } = objectDragGeometry(params);
    const dragMag = params.airResistance ? computeAirDragMagnitude(speed, shape, size) : 0;
    const dragVec = dragMag > 0 ? airDragForceVector(vel, shape, size) : { x: 0, y: 0, z: 0 };
    forces.drag = dragMag;
    forces.net = Math.max(0, forces.net - dragMag);
    forces.acceleration = params.mass > 0 ? forces.net / params.mass : 0;

    const forceAngle = degToRad(params.forceAngleDeg);
    const alongUnit = this.inclineData.downhillDir.clone();
    const normalUnit = this.inclineData.rampNormal.clone();
    const appliedVec3 = computeAppliedForceOnRamp(
      this.inclineData,
      params.forceMag,
      params.forceAngleDeg,
    );
    const appliedVec = { x: appliedVec3.x, y: appliedVec3.y, z: appliedVec3.z };
    const gravityVec = { x: 0, y: -params.mass * g, z: 0 };
    const normalVec = {
      x: normalUnit.x * forces.normal,
      y: normalUnit.y * forces.normal,
      z: 0,
    };
    const velocityAlong = vel.x * alongUnit.x + vel.y * alongUnit.y + vel.z * alongUnit.z;
    const driveAlong = forces.weightParallel + params.forceMag * Math.cos(forceAngle);
    const frictionSign =
      Math.abs(velocityAlong) > 0.02
        ? velocityAlong >= 0 ? -1 : 1
        : driveAlong >= 0 ? -1 : 1;
    const frictionVec = {
      x: alongUnit.x * forces.friction * frictionSign,
      y: alongUnit.y * forces.friction * frictionSign,
      z: alongUnit.z * forces.friction * frictionSign,
    };
    const netVec = {
      x: appliedVec.x + gravityVec.x + normalVec.x + frictionVec.x + dragVec.x,
      y: appliedVec.y + gravityVec.y + normalVec.y + frictionVec.y + dragVec.y,
      z: dragVec.z,
    };

    return {
      time: s.simulationTime,
      sceneName: this.name,
      mass: params.mass,
      position: pos,
      velocity: vel,
      speed,
      acceleration: {
        x: forces.acceleration * alongUnit.x,
        y: forces.acceleration * alongUnit.y,
        z: forces.acceleration * alongUnit.z,
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
        distanceAlongRamp: sAlong,
        angleDeg: params.angleDeg,
        length: params.length,
        friction: params.friction,
      },
    };
  }

  getDragPlane(sim) {
    const p = sim.mesh.position;
    const n = this.inclineData.rampNormal.clone();
    return new THREE.Plane(n, -n.dot(p));
  }

  dispose() {
    super.dispose();
  }
}
