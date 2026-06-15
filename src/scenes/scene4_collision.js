import { BaseScene } from './baseScene.js';
import { SCENE_IDS, ARENA_HALF } from '../constants.js';
import { disposeSimObject } from '../components/geometries.js';
import { createTexturedPlane, disposeGridMesh } from '../visualization/gridHelper.js';
import { kineticEnergy } from '../physics/calculator.js';
import { getState, setCollisionSnapshot, setPlayback } from '../state.js';
import { collisionRestitution, getSignedVelocity } from './collisionPresets.js';
import { createVisualMesh, applyVisualRotation } from '../graphics/experimentObjectFactory.js';
import { createSimState } from '../physics/simObject.js';
import { integrateCollision, handleCollision } from '../physics/integrators/collision1d.js';
import { syncMeshFromState, saveInitialPoseKinematic, resetSimObjectKinematic } from '../components/simSync.js';
import {
  computeAirDragMagnitude,
  collisionObjectDragGeometry,
} from '../physics/airDrag.js';

const REST_VELOCITY_EPS = 0.05;

/** Vector lực từng vật (hiển thị) — W/N luôn dùng m·g như scene 1–3. */
function objectForceVectors(mass, vx, g, mu, dragMag, dragVec) {
  const weight = mass * g;
  const gravity = { x: 0, y: -weight, z: 0 };
  const normal = { x: 0, y: weight, z: 0 };

  const frictionMag = Math.abs(vx) > REST_VELOCITY_EPS ? mu * mass * g : 0;
  const friction = frictionMag > 0
    ? { x: -Math.sign(vx) * frictionMag, y: 0, z: 0 }
    : null;

  const drag = dragMag > 0 && dragVec ? dragVec : null;

  const net = {
    x: (friction?.x ?? 0) + (drag?.x ?? 0),
    y: 0,
    z: (friction?.z ?? 0) + (drag?.z ?? 0),
  };

  return {
    applied: null,
    gravity,
    normal,
    friction,
    drag,
    net,
  };
}

function parseColor(hex, fallback) {
  if (typeof hex !== 'string') return fallback;
  return Number.parseInt(hex.replace('#', ''), 16) || fallback;
}

export class Scene4Collision extends BaseScene {
  constructor() {
    super(SCENE_IDS.COLLISION, 'Va chạm');
    this.ground = null;
    this._collided = false;
    this._allStopped = false;
  }

  init(deps) {
    super.init(deps);
    const { view } = deps;
    const scene = view.getScene();
    const params = getState().sceneParams;

    const floor = createTexturedPlane(ARENA_HALF * 2, ARENA_HALF * 2, 12, 12, 0xcccccc);
    floor.mesh.position.y = 0;
    scene.add(floor.mesh);
    this.ground = floor;
    this.meshes.push(floor.mesh);

    this._buildObjects(params);
    this.objects.forEach((o) => {
      scene.add(o.mesh);
      saveInitialPoseKinematic(o);
    });
    this.applyPlayInitialState();
  }

  _effectiveGravity() {
    const params = getState().sceneParams;
    const g = getState().global.gravity;
    return params.gravityEnabled ? g : 0;
  }

  /** g cho ma sát ngang — luôn dùng trọng lực toàn cục (N = m·g trên mặt phẳng ngang). */
  _frictionGravity() {
    return getState().global.gravity ?? 9.8;
  }

  _spawnLayout(params) {
    const r = params.sphereRadius ?? 0.45;
    const minDist = 2 * r + 0.1;
    const d = Math.max(params.initialDistance ?? 6, minDist);
    const half = d / 2;
    const maxScale = Math.max(params.graphicsObject1Scale ?? 1, params.graphicsObject2Scale ?? 1);
    const y = r * maxScale + 0.05;
    return {
      pos1: { x: -half, y, z: 0 },
      pos2: { x: half, y, z: 0 },
      radius: r,
      trackY: y,
    };
  }

  _lockToTrack(sim) {
    sim.simState.position.y = sim.trackY ?? 0.5;
    sim.simState.position.z = 0;
    sim.simState.velocity.y = 0;
    sim.simState.velocity.z = 0;
  }

  getInitialVelocities(params = getState().sceneParams) {
    return {
      v1x: getSignedVelocity(params.object1InitVelocity, params.object1Direction),
      v2x: getSignedVelocity(params.object2InitVelocity, params.object2Direction),
    };
  }

  applyPlayInitialState() {
    const params = getState().sceneParams;
    const [o1, o2] = this.objects;
    if (!o1 || !o2) return;
    const { v1x, v2x } = this.getInitialVelocities(params);

    o1.simState.velocity.x = v1x;
    o2.simState.velocity.x = v2x;
    this._collided = false;
    this._allStopped = false;
  }

  _buildObjects(params) {
    this.objects.forEach((o) => {
      this._deps?.view?.getScene()?.remove(o.mesh);
      disposeSimObject(o);
    });

    const { pos1, pos2, trackY } = this._spawnLayout(params);
    const size1 = Math.max(0.4, (params.sphereRadius ?? 0.45) * 2 * (params.graphicsObject1Scale ?? 1));
    const size2 = Math.max(0.4, (params.sphereRadius ?? 0.45) * 2 * (params.graphicsObject2Scale ?? 1));

    const vis1 = createVisualMesh({
      shape: params.graphicsObject1Shape ?? 'sphere',
      size: size1,
      color: parseColor(params.graphicsObject1Color, 0x4a90d9),
      wireframe: params.graphicsObject1Wireframe,
      textureMap: this._deps.textureMap,
      textureName: params.graphicsObject1Material ?? 'default',
    });
    vis1.mesh.position.set(pos1.x, pos1.y, pos1.z);
    const vis2 = createVisualMesh({
      shape: params.graphicsObject2Shape ?? 'sphere',
      size: size2,
      color: parseColor(params.graphicsObject2Color, 0xe94560),
      wireframe: params.graphicsObject2Wireframe,
      textureMap: this._deps.textureMap,
      textureName: params.graphicsObject2Material ?? 'default',
    });
    vis2.mesh.position.set(pos2.x, pos2.y, pos2.z);

    const state1 = createSimState({ position: { ...pos1 }, velocity: { x: 0, y: 0, z: 0 }, mass: params.mass1 });
    const state2 = createSimState({ position: { ...pos2 }, velocity: { x: 0, y: 0, z: 0 }, mass: params.mass2 });

    const o1 = {
      id: 'object_1',
      mesh: vis1.mesh,
      material: vis1.material,
      simState: state1,
      mass: params.mass1,
      trackY,
      selectable: true,
      reset: () => { resetSimObjectKinematic(o1); this.applyPlayInitialState(); },
    };
    const o2 = {
      id: 'object_2',
      mesh: vis2.mesh,
      material: vis2.material,
      simState: state2,
      mass: params.mass2,
      trackY,
      selectable: true,
      reset: () => { resetSimObjectKinematic(o2); this.applyPlayInitialState(); },
    };

    applyVisualRotation(o1, {
      graphicsRotX: params.graphicsObject1RotX,
      graphicsRotY: params.graphicsObject1RotY,
      graphicsRotZ: params.graphicsObject1RotZ,
    });
    applyVisualRotation(o2, {
      graphicsRotX: params.graphicsObject2RotX,
      graphicsRotY: params.graphicsObject2RotY,
      graphicsRotZ: params.graphicsObject2RotZ,
    });

    this.objects = [o1, o2];
    const floorMesh = this.ground?.mesh;
    this.meshes = floorMesh ? [floorMesh, o1.mesh, o2.mesh] : [o1.mesh, o2.mesh];
    this._collided = false;
    this._allStopped = false;
  }

  _captureCollisionKinematic(v1Before, v2Before, v1After, v2After) {
    const params = getState().sceneParams;
    const m1 = params.mass1;
    const m2 = params.mass2;
    const p1Before = m1 * v1Before;
    const p2Before = m2 * v2Before;
    const p1After = m1 * v1After;
    const p2After = m2 * v2After;
    const pBefore = p1Before + p2Before;
    const pAfter = p1After + p2After;
    const ek1Before = kineticEnergy(m1, v1Before, 0, 0);
    const ek2Before = kineticEnergy(m2, v2Before, 0, 0);
    const ek1After = kineticEnergy(m1, v1After, 0, 0);
    const ek2After = kineticEnergy(m2, v2After, 0, 0);
    const ekBefore = ek1Before + ek2Before;
    const ekAfter = ek1After + ek2After;

    setCollisionSnapshot({
      before: {
        v1: { x: v1Before, y: 0, z: 0 },
        v2: { x: v2Before, y: 0, z: 0 },
        p1: p1Before,
        p2: p2Before,
        momentum: pBefore,
        kineticEnergy: ekBefore,
        ek1: ek1Before,
        ek2: ek2Before,
      },
      after: {
        v1: { x: v1After, y: 0, z: 0 },
        v2: { x: v2After, y: 0, z: 0 },
        p1: p1After,
        p2: p2After,
        momentum: pAfter,
        kineticEnergy: ekAfter,
        ek1: ek1After,
        ek2: ek2After,
      },
      analytic: {
        v1: { x: v1After, y: 0, z: 0 },
        v2: { x: v2After, y: 0, z: 0 },
      },
      momentumDelta: pAfter - pBefore,
      energyLoss: ekAfter - ekBefore,
      restitutionObserved: collisionRestitution(params),
    });

    if (params.pauseOnCollision) setPlayback('pause');
  }

  onParameterChange() {
    const params = getState().sceneParams;

    this.objects.forEach((o) => {
      this._deps.view.getScene().remove(o.mesh);
      disposeSimObject(o);
    });

    this._buildObjects(params);
    const scene = this._deps.view.getScene();
    this.objects.forEach((o) => {
      scene.add(o.mesh);
      saveInitialPoseKinematic(o);
    });

    this.applyPlayInitialState();
    this._collided = false;
    this._allStopped = false;
    setCollisionSnapshot(null);
    this._stopped = false;
  }

  reset() {
    super.reset();
    this._collided = false;
    this._allStopped = false;
    setCollisionSnapshot(null);
    this.applyPlayInitialState();
  }

  integrate(dt) {
    if (this._stopped || this._allStopped) return;
    const [o1, o2] = this.objects;
    if (!o1 || !o2) return;

    const params = getState().sceneParams;
    const g = this._frictionGravity();
    const mu = params.friction ?? 0;
    const r = params.sphereRadius ?? 0.45;

    let dragOpts = null;
    if (params.airResistance) {
      const g1 = collisionObjectDragGeometry(params, 'object_1');
      const g2 = collisionObjectDragGeometry(params, 'object_2');
      dragOpts = {
        enabled: true,
        shape1: g1.shape,
        size1: g1.size,
        shape2: g2.shape,
        size2: g2.size,
      };
    }

    const afterFriction = integrateCollision(
      {
        x1: o1.simState.position.x,
        v1: o1.simState.velocity.x,
        x2: o2.simState.position.x,
        v2: o2.simState.velocity.x,
      },
      o1.mass,
      o2.mass,
      g,
      mu,
      dt,
      dragOpts,
    );

    let finalState = afterFriction;
    if (!this._collided) {
      const result = handleCollision(afterFriction, o1.mass, o2.mass, collisionRestitution(params), r);
      if (result.collided) {
        this._collided = true;
        this._captureCollisionKinematic(result.v1Before, result.v2Before, result.state.v1, result.state.v2);
      }
      finalState = result.state;
    }

    o1.simState.position.x = finalState.x1;
    o1.simState.velocity.x = finalState.v1;
    o2.simState.position.x = finalState.x2;
    o2.simState.velocity.x = finalState.v2;
  }

  _tryStopAtRest() {
    const params = getState().sceneParams;
    if ((params.friction ?? 0) <= 0) return;

    const allSlow = this.objects.every((o) => Math.abs(o.simState.velocity.x) < REST_VELOCITY_EPS);
    if (!allSlow) return;

    this.objects.forEach((o) => {
      o.simState.velocity.x = 0;
    });
    this._allStopped = true;
  }

  update() {
    this.objects.forEach((o) => {
      this._lockToTrack(o);
      syncMeshFromState(o);
    });

    const limit = ARENA_HALF - 1;
    for (const o of this.objects) {
      if (Math.abs(o.simState.position.x) > limit) {
        this.stopSimulation();
        return;
      }
    }

    this._tryStopAtRest();
  }

  _simulationStatus() {
    if (this._allStopped) return 'Đã dừng';
    if (this._collided) return 'Đã va chạm';
    const { v1x, v2x } = this.getInitialVelocities();
    if (Math.abs(v1x) < 0.001 && Math.abs(v2x) < 0.001) return 'Đứng yên';
    return 'Đang chuyển động';
  }

  getTelemetry() {
    const s = getState();
    const params = s.sceneParams;
    const [o1, o2] = this.objects;
    if (!o1 || !o2) return { time: s.simulationTime, sceneName: this.name };

    const m1 = params.mass1;
    const m2 = params.mass2;
    const g = this._frictionGravity();
    const mu = params.friction ?? 0;

    const x1 = o1.simState.position.x;
    const x2 = o2.simState.position.x;
    const v1 = { x: o1.simState.velocity.x, y: 0, z: 0 };
    const v2 = { x: o2.simState.velocity.x, y: 0, z: 0 };
    const pos1 = { ...o1.simState.position };

    const p1 = m1 * v1.x;
    const p2 = m2 * v2.x;
    const pTotal = p1 + p2;
    const ek1 = kineticEnergy(m1, v1.x, 0, 0);
    const ek2 = kineticEnergy(m2, v2.x, 0, 0);
    const ek = ek1 + ek2;

    const friction1 = Math.abs(v1.x) > REST_VELOCITY_EPS ? mu * m1 * g : 0;
    const friction2 = Math.abs(v2.x) > REST_VELOCITY_EPS ? mu * m2 * g : 0;
    const weight1 = params.gravityEnabled ? m1 * g : 0;
    const weight2 = params.gravityEnabled ? m2 * g : 0;

    const geo1 = collisionObjectDragGeometry(params, 'object_1');
    const geo2 = collisionObjectDragGeometry(params, 'object_2');
    const drag1 = params.airResistance ? computeAirDragMagnitude(Math.abs(v1.x), geo1.shape, geo1.size) : 0;
    const drag2 = params.airResistance ? computeAirDragMagnitude(Math.abs(v2.x), geo2.shape, geo2.size) : 0;

    const frictionVec1 = friction1 > 0
      ? { x: -Math.sign(v1.x) * friction1, y: 0, z: 0 }
      : { x: 0, y: 0, z: 0 };
    const frictionVec2 = friction2 > 0
      ? { x: -Math.sign(v2.x) * friction2, y: 0, z: 0 }
      : { x: 0, y: 0, z: 0 };
    const gravityVec = params.gravityEnabled ? { x: 0, y: -(m1 + m2) * g, z: 0 } : { x: 0, y: 0, z: 0 };
    const normalVec = params.gravityEnabled ? { x: 0, y: (m1 + m2) * g, z: 0 } : { x: 0, y: 0, z: 0 };
    const netFriction = friction1 + friction2;

    const dragVec1 = drag1 > 0 && Math.abs(v1.x) > 1e-4
      ? { x: -Math.sign(v1.x) * drag1, y: 0, z: 0 }
      : null;
    const dragVec2 = drag2 > 0 && Math.abs(v2.x) > 1e-4
      ? { x: -Math.sign(v2.x) * drag2, y: 0, z: 0 }
      : null;
    const netHoriz = {
      x: frictionVec1.x + frictionVec2.x + (dragVec1?.x ?? 0) + (dragVec2?.x ?? 0),
      y: 0,
      z: 0,
    };
    const netMag = Math.hypot(netHoriz.x, netHoriz.z);

    return {
      time: s.simulationTime,
      sceneName: this.name,
      mass: m1 + m2,
      position: pos1,
      velocity: v1,
      speed: Math.abs(v1.x),
      kineticEnergy: ek,
      forces: {
        applied: 0,
        gravity: weight1 + weight2,
        normal: weight1 + weight2,
        friction: netFriction,
        drag: drag1 + drag2,
        net: netFriction + drag1 + drag2,
      },
      forceVectors: {
        applied: null,
        gravity: params.gravityEnabled ? gravityVec : null,
        normal: params.gravityEnabled ? normalVec : null,
        friction: netFriction > 0 ? { x: frictionVec1.x + frictionVec2.x, y: 0, z: 0 } : null,
        drag: drag1 + drag2 > 0
          ? { x: (dragVec1?.x ?? 0) + (dragVec2?.x ?? 0), y: 0, z: 0 }
          : null,
        net: netMag > 0.25 ? netHoriz : null,
      },
      sceneSpecific: {
        collisionMode: params.collisionMode,
        object1Position: x1,
        object2Position: x2,
        mass1: m1,
        mass2: m2,
        object1Velocity: v1,
        object2Velocity: v2,
        momentum1: p1,
        momentum2: p2,
        totalMomentum: pTotal,
        kineticEnergy1: ek1,
        kineticEnergy2: ek2,
        elasticCollision: params.elasticCollision,
        restitution: collisionRestitution(params),
        friction: mu,
        initialDistance: params.initialDistance,
        collisionOccurred: this._collided,
        collision: s.collisionSnapshot,
        status: this._simulationStatus(),
        object1Forces: {
          friction: friction1,
          frictionVector: frictionVec1,
          weight: weight1,
          forceVectors: objectForceVectors(m1, v1.x, g, mu, drag1, dragVec1),
        },
        object2Forces: {
          friction: friction2,
          frictionVector: frictionVec2,
          weight: weight2,
          forceVectors: objectForceVectors(m2, v2.x, g, mu, drag2, dragVec2),
        },
      },
    };
  }

  dispose() {
    if (this.ground) disposeGridMesh(this.ground);
    super.dispose();
  }
}
