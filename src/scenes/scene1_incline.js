import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { BaseScene } from './baseScene.js';
import { SCENE_IDS } from '../constants.js';
import {
  createBoxPair,
  saveInitialPose,
  syncMeshFromBody,
  disposeSimObject,
} from '../components/geometries.js';
import { createTexturedPlane } from '../visualization/gridHelper.js';
import { degToRad } from '../utils/helpers.js';
import { inclineForces, kineticEnergy, positionFromBody, velocityFromBody } from '../physics/calculator.js';
import { applyForceVector, applyInclineFriction, clearForces, applyAirDrag, computeAirDragMagnitude } from '../physics/forceManager.js';
import { getState } from '../state.js';
import {
  computeInclineData,
  computeBoxHalfExtentAlongNormal,
  distanceAlongRamp,
  getRampFrameQuaternion,
  computeSpawnPosition,
  computeAppliedForceOnRamp,
  constrainBodyToRamp,
} from './inclineHelpers.js';
import { createVisualMesh, applyVisualRotation } from '../graphics/experimentObjectFactory.js';

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
    const { view, physics } = deps;
    const scene = view.getScene();
    const params = getState().sceneParams;

    scene.add(this.inclineGroup);
    this.groups.push(this.inclineGroup);

    this._buildRamp(params);
    this._buildObject(params);

    this.objects.forEach((o) => {
      scene.add(o.mesh);
      physics.addBody(o.body);
      saveInitialPose(o);
    });
    this.staticBodies.forEach((b) => physics.addBody(b));
    this.onParameterChange();
  }

  _buildRamp(params) {
    this.inclineData = computeInclineData(params.length, params.angleDeg);
    const { length, baseLength, height, topPoint, bottomPoint, angleRad, rampNormal } = this.inclineData;

    while (this.inclineGroup.children.length) {
      const c = this.inclineGroup.children[0];
      this.inclineGroup.remove(c);
      c.geometry?.dispose?.();
      if (Array.isArray(c.material)) {
        c.material.forEach((m) => {
          m.map?.dispose?.();
          m.dispose?.();
        });
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

    // Mặt dốc = Plane (khớp hình học), không dùng hộp dày — tránh kẹt ma sát Cannon.
    const planeShape = new CANNON.Plane();
    const body = new CANNON.Body({ mass: 0, shape: planeShape });
    const surfaceAnchor = topPoint.clone().add(bottomPoint).multiplyScalar(0.5);
    body.position.set(surfaceAnchor.x, surfaceAnchor.y, surfaceAnchor.z);
    body.quaternion.setFromVectors(
      new CANNON.Vec3(0, 1, 0),
      new CANNON.Vec3(rampNormal.x, rampNormal.y, rampNormal.z),
    );
    this.staticBodies.push(body);
  }

  _buildObject(params) {
    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      this._deps.physics.removeBody(old.body);
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
    const pair = createBoxPair({
      width: size,
      height: size,
      depth: size,
      mass,
      position: { x: spawn.x, y: spawn.y, z: spawn.z },
      color: 0x4a90d9,
      damping: false,
    });
    const visual = createVisualMesh({
      shape: params.graphicsShape ?? 'box',
      size,
      color: parseColor(params.graphicsColor, 0x4a90d9),
      wireframe: params.graphicsWireframe,
      textureMap: this._deps.textureMap,
      textureName: params.graphicsMaterial ?? 'default',
    });
    pair.mesh.geometry?.dispose?.();
    pair.mesh.material?.dispose?.();
    pair.mesh = visual.mesh;
    pair.material = visual.material;

    const sim = {
      id: 'object_1',
      ...pair,
      mass,
      selectable: true,
      reset: () => this._placeObjectAtTop(sim),
    };
    this.objects = [sim];
    this.meshes.push(sim.mesh);
    applyVisualRotation(sim, params);
  }

  _placeObjectAtTop(simObject) {
    if (!simObject) return;
    const halfHeightAlongNormal = computeBoxHalfExtentAlongNormal(this.objectDims, this.inclineData);
    const spawn = computeSpawnPosition(
      this.inclineData,
      halfHeightAlongNormal,
      this.spawnDownOffset,
      this.spawnNormalOffset,
    );
    const rampQuat = getRampFrameQuaternion(this.inclineData);
    simObject.mesh.position.copy(spawn);
    simObject.body.position.copy(spawn);
    simObject.mesh.quaternion.copy(rampQuat);
    simObject.body.quaternion.copy(rampQuat);

    // Scene mặt phẳng nghiêng MVP: vật chỉ trượt, không lăn.
    simObject.body.fixedRotation = true;
    simObject.body.angularFactor.set(0, 0, 0);
    simObject.body.updateMassProperties();
    simObject.body.velocity.set(0, 0, 0);
    simObject.body.angularVelocity.set(0, 0, 0);
    simObject.body.force.set(0, 0, 0);
    simObject.body.torque.set(0, 0, 0);
    // Ensure gravity/forces are applied right after resets/parameter changes.
    simObject.body.allowSleep = false;
    simObject.body.wakeUp();
    constrainBodyToRamp(simObject.body, this.inclineData, halfHeightAlongNormal);
    saveInitialPose(simObject);
  }

  onParameterChange() {
    const params = getState().sceneParams;
    const g = getState().global.gravity;
    this._deps.physics.setGravity(g);
    // Ma sát μ do applyInclineFriction; tắt ma sát tiếp xúc Cannon để không nhân đôi.
    this._deps.physics.setDefaultFriction(0);

    const oldBodies = [...this.staticBodies];
    oldBodies.forEach((b) => this._deps.physics.removeBody(b));
    this.staticBodies = [];

    this._buildRamp(params);
    this.staticBodies.forEach((b) => this._deps.physics.addBody(b));

    const old = this.objects[0];
    if (old) {
      this._deps.view.getScene().remove(old.mesh);
      this._deps.physics.removeBody(old.body);
      const idx = this.meshes.indexOf(old.mesh);
      if (idx >= 0) this.meshes.splice(idx, 1);
      disposeSimObject(old);
      this.objects = [];
    }

    this._buildObject(params);
    const obj = this.objects[0];
    this._deps.view.getScene().add(obj.mesh);
    this._deps.physics.addBody(obj.body);
    this._placeObjectAtTop(obj);
    this._stopped = false;
  }

  applyRuntimeForces() {
    if (this._stopped || !this.objects[0]) return;
    const params = getState().sceneParams;
    const g = getState().global.gravity;
    const obj = this.objects[0];
    clearForces(obj.body);
    const applied = computeAppliedForceOnRamp(
      this.inclineData,
      params.forceMag,
      params.forceAngleDeg,
    );
    applyForceVector(obj.body, applied);
    applyInclineFriction(obj.body, this.inclineData, params.mass, g, params.friction, applied);
    if (params.airResistance) {
      const shape = params.graphicsShape ?? 'box';
      const size = (params.boxSize ?? 0.6) * (params.graphicsScale ?? 1);
      applyAirDrag(obj.body, shape, size);
    }
  }

  update() {
    const obj = this.objects[0];
    if (!obj || this._stopped) return;

    const halfHeightAlongNormal = computeBoxHalfExtentAlongNormal(this.objectDims, this.inclineData);
    constrainBodyToRamp(obj.body, this.inclineData, halfHeightAlongNormal);
    syncMeshFromBody(obj.mesh, obj.body);

    const params = getState().sceneParams;
    const p = obj.body.position;
    const projected = distanceAlongRamp(new THREE.Vector3(p.x, p.y, p.z), this.inclineData);

    if (projected >= params.length - 0.15) {
      const halfHeightAlongNormal = computeBoxHalfExtentAlongNormal(this.objectDims, this.inclineData);
      const stopPos = computeSpawnPosition(
        this.inclineData,
        halfHeightAlongNormal,
        params.length - 0.12,
        this.spawnNormalOffset,
      );
      obj.body.velocity.set(0, 0, 0);
      obj.body.angularVelocity.set(0, 0, 0);
      obj.body.position.set(stopPos.x, stopPos.y, stopPos.z);
      const rampQuat = getRampFrameQuaternion(this.inclineData);
      obj.body.quaternion.copy(rampQuat);
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
    const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
    const sAlong = distanceAlongRamp(new THREE.Vector3(pos.x, pos.y, pos.z), this.inclineData);
    const forceAlongRamp = params.forceMag * Math.cos(degToRad(params.forceAngleDeg));
    const forces = inclineForces(params.mass, g, params.angleDeg, params.friction, forceAlongRamp);
    const shape = params.graphicsShape ?? 'box';
    const size = (params.boxSize ?? 0.6) * (params.graphicsScale ?? 1);
    const dragMag = params.airResistance ? computeAirDragMagnitude(obj.body, shape, size) : 0;
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
        ? velocityAlong >= 0
          ? -1
          : 1
        : driveAlong >= 0
          ? -1
          : 1;
    const frictionVec = {
      x: alongUnit.x * forces.friction * frictionSign,
      y: alongUnit.y * forces.friction * frictionSign,
      z: alongUnit.z * forces.friction * frictionSign,
    };
    const netVec = {
      x: appliedVec.x + gravityVec.x + normalVec.x + frictionVec.x,
      y: appliedVec.y + gravityVec.y + normalVec.y + frictionVec.y,
      z: 0,
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

  /** Mặt phẳng kéo trùng mặt dốc. */
  getDragPlane(sim) {
    const p = sim.mesh.position;
    const n = this.inclineData.rampNormal.clone();
    return new THREE.Plane(n, -n.dot(p));
  }

  dispose() {
    super.dispose();
  }
}
