import { BaseScene } from './baseScene.js';
import { SCENE_IDS, ARENA_HALF } from '../constants.js';
import {
  createSpherePair,
  createStaticBox,
  saveInitialPose,
  resetSimObject,
  syncMeshFromBody,
  disposePair,
} from '../components/geometries.js';
import { createTexturedPlane, disposeGridMesh } from '../visualization/gridHelper.js';
import {
  kineticEnergy,
  positionFromBody,
  solve1DCollision,
  velocityFromBody,
} from '../physics/calculator.js';
import {
  applyHorizontalFriction,
  clearForces,
} from '../physics/forceManager.js';
import { getState, setCollisionSnapshot, setPlayback } from '../state.js';
import { getSignedVelocity } from './collisionPresets.js';

const REST_VELOCITY_EPS = 0.05;

export class Scene4Collision extends BaseScene {
  constructor() {
    super(SCENE_IDS.COLLISION, 'Va chạm');
    this.ground = null;
    this._collided = false;
    this._allStopped = false;
    this._beforeSnapshot = null;
  }

  init(deps) {
    super.init(deps);
    const { view, physics } = deps;
    const scene = view.getScene();
    const params = getState().sceneParams;

    view.setBackground(0x2d3436);

    const floor = createTexturedPlane(ARENA_HALF * 2, ARENA_HALF * 2, 12, 12, 0xcccccc);
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

    this._buildObjects(params);
    this.objects.forEach((o) => {
      scene.add(o.mesh);
      physics.addBody(o.body);
      saveInitialPose(o);
    });
    this._applyPhysicsMaterials(params);
    this.applyPlayInitialState();
    this._setupCollisionListener(physics);
  }

  _effectiveGravity() {
    const params = getState().sceneParams;
    const g = getState().global.gravity;
    return params.gravityEnabled ? g : 0;
  }

  _frictionGravity() {
    return getState().global.gravity;
  }

  _applyPhysicsMaterials(params) {
    const { physics } = this._deps;
    physics.setGravity(this._effectiveGravity());
    physics.setDefaultRestitution(params.restitution);
    physics.setDefaultFriction(0);
  }

  _spawnLayout(params) {
    const r = params.sphereRadius ?? 0.45;
    const minDist = 2 * r + 0.1;
    const d = Math.max(params.initialDistance ?? 6, minDist);
    const half = d / 2;
    const y = r + 0.05;
    return {
      pos1: { x: -half, y, z: 0 },
      pos2: { x: half, y, z: 0 },
      radius: r,
      trackY: y,
    };
  }

  _configureBody1D(body) {
    body.fixedRotation = true;
    body.angularFactor.set(0, 0, 0);
    body.linearFactor.set(1, 0, 0);
    body.allowSleep = false;
  }

  _lockToTrack(sim) {
    const y = sim.trackY ?? 0.5;
    sim.body.position.y = y;
    sim.body.position.z = 0;
    sim.body.velocity.y = 0;
    sim.body.velocity.z = 0;
    sim.body.angularVelocity.set(0, 0, 0);
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
    o1.body.velocity.set(v1x, 0, 0);
    o2.body.velocity.set(v2x, 0, 0);
    o1.body.wakeUp();
    o2.body.wakeUp();
    this._collided = false;
    this._allStopped = false;
  }

  _buildObjects(params) {
    this.objects.forEach((o) => {
      this._deps?.view?.getScene()?.remove(o.mesh);
      this._deps?.physics?.removeBody(o.body);
      disposePair(o);
    });

    const { pos1, pos2, radius, trackY } = this._spawnLayout(params);

    const sphere1 = createSpherePair({
      radius,
      mass: params.mass1,
      position: pos1,
      color: 0x4a90d9,
    });
    const sphere2 = createSpherePair({
      radius,
      mass: params.mass2,
      position: pos2,
      color: 0xe94560,
    });

    this._configureBody1D(sphere1.body);
    this._configureBody1D(sphere2.body);

    const o1 = {
      id: 'object_1',
      ...sphere1,
      mass: params.mass1,
      trackY,
      selectable: true,
      reset: () => {
        resetSimObject(o1);
        this.applyPlayInitialState();
      },
    };
    const o2 = {
      id: 'object_2',
      ...sphere2,
      mass: params.mass2,
      trackY,
      selectable: true,
      reset: () => {
        resetSimObject(o2);
        this.applyPlayInitialState();
      },
    };

    this.objects = [o1, o2];
    const floorMesh = this.ground?.mesh;
    this.meshes = floorMesh ? [floorMesh, o1.mesh, o2.mesh] : [o1.mesh, o2.mesh];
    this._collided = false;
    this._allStopped = false;
    this._beforeSnapshot = null;
  }

  applyRuntimeForces() {
    if (this._stopped || this._allStopped || !this.objects.length) return;
    const params = getState().sceneParams;
    const mu = params.friction ?? 0;
    const g = this._frictionGravity();

    this.objects.forEach((o) => {
      clearForces(o.body);
      if (mu > 0) {
        applyHorizontalFriction(o.body, o.mass, g, mu, { x: 0, y: 0, z: 0 });
      }
    });
  }

  _setupCollisionListener(physics) {
    this._contactHandler = (e) => {
      if (this._collided) return;
      const pairs = [this.objects[0]?.body, this.objects[1]?.body];
      const involved = e.bodyA === pairs[0] || e.bodyB === pairs[0];
      const involved2 = e.bodyA === pairs[1] || e.bodyB === pairs[1];
      if (involved && involved2) {
        this._captureCollision();
      }
    };
    physics.world.addEventListener('collide', this._contactHandler);
  }

  _captureCollision() {
    if (this._collided) return;
    this._collided = true;
    const params = getState().sceneParams;
    const v1 = velocityFromBody(this.objects[0].body);
    const v2 = velocityFromBody(this.objects[1].body);
    const m1 = params.mass1;
    const m2 = params.mass2;
    const pBefore = m1 * v1.x + m2 * v2.x;
    const ekBefore =
      kineticEnergy(m1, v1.x, 0, 0) + kineticEnergy(m2, v2.x, 0, 0);

    this._beforeSnapshot = { v1: { ...v1 }, v2: { ...v2 }, momentum: pBefore, kineticEnergy: ekBefore };

    setTimeout(() => {
      const v1a = velocityFromBody(this.objects[0].body);
      const v2a = velocityFromBody(this.objects[1].body);
      const pAfter = m1 * v1a.x + m2 * v2a.x;
      const ekAfter =
        kineticEnergy(m1, v1a.x, 0, 0) + kineticEnergy(m2, v2a.x, 0, 0);
      const approach = v1.x - v2.x;
      const e =
        Math.abs(approach) > 0.01 ? (v2a.x - v1a.x) / approach : params.restitution;

      const analytic = solve1DCollision(m1, m2, v1.x, v2.x, params.restitution);

      setCollisionSnapshot({
        before: this._beforeSnapshot,
        after: { v1: v1a, v2: v2a, momentum: pAfter, kineticEnergy: ekAfter },
        analytic: {
          v1: { x: analytic.v1After, y: 0, z: 0 },
          v2: { x: analytic.v2After, y: 0, z: 0 },
        },
        momentumDelta: pAfter - pBefore,
        energyLoss: ekAfter - ekBefore,
        restitutionObserved: e,
      });

      if (params.pauseOnCollision) {
        setPlayback('pause');
      }
    }, 400);
  }

  onParameterChange() {
    const params = getState().sceneParams;

    this.objects.forEach((o) => {
      this._deps.view.getScene().remove(o.mesh);
      this._deps.physics.removeBody(o.body);
      disposePair(o);
    });
    this._buildObjects(params);
    const scene = this._deps.view.getScene();
    this.objects.forEach((o) => {
      scene.add(o.mesh);
      this._deps.physics.addBody(o.body);
      saveInitialPose(o);
    });
    this._applyPhysicsMaterials(params);
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

  _tryStopAtRest() {
    const params = getState().sceneParams;
    if ((params.friction ?? 0) <= 0) return;

    const allSlow = this.objects.every(
      (o) => Math.abs(o.body.velocity.x) < REST_VELOCITY_EPS,
    );
    if (!allSlow) return;

    this.objects.forEach((o) => {
      o.body.velocity.set(0, 0, 0);
      o.body.angularVelocity.set(0, 0, 0);
    });
    this._allStopped = true;
  }

  update() {
    const params = getState().sceneParams;

    this.objects.forEach((o) => {
      this._lockToTrack(o);
      syncMeshFromBody(o.mesh, o.body);
    });

    const limit = ARENA_HALF - 1;
    for (const o of this.objects) {
      if (Math.abs(o.body.position.x) > limit) {
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

    const v1 = velocityFromBody(o1.body);
    const v2 = velocityFromBody(o2.body);
    const m1 = params.mass1;
    const m2 = params.mass2;
    const pTotal = m1 * v1.x + m2 * v2.x;
    const ek =
      kineticEnergy(m1, v1.x, 0, 0) + kineticEnergy(m2, v2.x, 0, 0);
    const mu = params.friction ?? 0;
    const g = this._frictionGravity();
    const frictionMag = mu * m1 * g;

    return {
      time: s.simulationTime,
      sceneName: this.name,
      mass: m1 + m2,
      position: positionFromBody(o1.body),
      velocity: v1,
      speed: Math.abs(v1.x),
      kineticEnergy: ek,
      forces: {
        applied: 0,
        gravity: params.gravityEnabled ? m1 * g : 0,
        normal: params.gravityEnabled ? m1 * g : 0,
        friction: Math.abs(v1.x) > 0.01 ? frictionMag : 0,
        net: 0,
      },
      forceVectors: {
        applied: null,
        gravity: null,
        normal: null,
        friction: null,
        net: null,
      },
      sceneSpecific: {
        collisionMode: params.collisionMode,
        object1Velocity: v1,
        object2Velocity: v2,
        totalMomentum: pTotal,
        initialDistance: params.initialDistance,
        collision: s.collisionSnapshot,
        status: this._simulationStatus(),
      },
    };
  }

  dispose() {
    if (this._contactHandler && this._deps?.physics) {
      this._deps.physics.world.removeEventListener('collide', this._contactHandler);
    }
    if (this.ground) disposeGridMesh(this.ground);
    super.dispose();
  }
}
