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
import {
  kineticEnergy,
  momentum1D,
  positionFromBody,
  velocityFromBody,
} from '../physics/calculator.js';
import { getState, setCollisionSnapshot, setPlayback } from '../state.js';

export class Scene4Collision extends BaseScene {
  constructor() {
    super(SCENE_IDS.COLLISION, 'Va chạm');
    this.ground = null;
    this._collided = false;
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

    physics.setDefaultRestitution(params.restitution);
    physics.setDefaultFriction(params.friction ?? 0.1);

    this._setupCollisionListener(physics);
  }

  _buildObjects(params) {
    this.objects.forEach((o) => {
      this._deps?.view?.getScene()?.remove(o.mesh);
      this._deps?.physics?.removeBody(o.body);
      disposePair(o);
    });

    const box1 = createBoxPair({
      width: 0.8,
      height: 0.8,
      depth: 0.8,
      mass: params.mass1,
      position: { x: -3, y: 0.45, z: 0 },
      color: 0x4a90d9,
    });
    const sphere2 = createSpherePair({
      radius: 0.45,
      mass: params.mass2,
      position: { x: 3, y: 0.5, z: 0 },
      color: 0xe94560,
    });

    const o1 = {
      id: 'object_1',
      ...box1,
      mass: params.mass1,
      selectable: true,
      reset: () => this._resetObject(o1, params, false),
    };
    const o2 = {
      id: 'object_2',
      ...sphere2,
      mass: params.mass2,
      selectable: true,
      reset: () => this._resetObject(o2, params, true),
    };

    this.objects = [o1, o2];
    this.meshes = [o1.mesh, o2.mesh];
    this._collided = false;
    this._beforeSnapshot = null;
  }

  _resetObject(sim, params, isObj2) {
    resetSimObject(sim);
    if (isObj2) {
      sim.body.velocity.set(params.object2InitVelocity, 0, 0);
    }
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
      kineticEnergy(m1, v1.x, v1.y, v1.z) + kineticEnergy(m2, v2.x, v2.y, v2.z);

    this._beforeSnapshot = { v1: { ...v1 }, v2: { ...v2 }, momentum: pBefore, kineticEnergy: ekBefore };

    setTimeout(() => {
      const v1a = velocityFromBody(this.objects[0].body);
      const v2a = velocityFromBody(this.objects[1].body);
      const pAfter = m1 * v1a.x + m2 * v2a.x;
      const ekAfter =
        kineticEnergy(m1, v1a.x, v1a.y, v1a.z) + kineticEnergy(m2, v2a.x, v2a.y, v2a.z);
      const e =
        Math.abs(v2.x - v1.x) > 0.01
          ? (v2a.x - v1a.x) / (v1.x - v2.x)
          : params.restitution;

      setCollisionSnapshot({
        before: this._beforeSnapshot,
        after: { v1: v1a, v2: v2a, momentum: pAfter, kineticEnergy: ekAfter },
        momentumDelta: pAfter - pBefore,
        energyLoss: ekAfter - ekBefore,
        restitutionObserved: e,
      });
      setPlayback('pause');
    }, 400);
  }

  onParameterChange() {
    const params = getState().sceneParams;
    this._deps.physics.setGravity(getState().global.gravity);
    this._deps.physics.setDefaultRestitution(params.restitution);
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
      if (o.id === 'object_2') {
        o.body.velocity.set(params.object2InitVelocity, 0, 0);
      }
    });
    this._collided = false;
    setCollisionSnapshot(null);
    this._stopped = false;
  }

  reset() {
    super.reset();
    const params = getState().sceneParams;
    this._collided = false;
    setCollisionSnapshot(null);
    if (this.objects[1]) {
      this.objects[1].body.velocity.set(params.object2InitVelocity, 0, 0);
    }
    if (this.objects[0]) {
      this.objects[0].body.velocity.set(0, 0, 0);
    }
  }

  update() {
    this.objects.forEach((o) => syncMeshFromBody(o.mesh, o.body));
    const limit = ARENA_HALF - 1;
    for (const o of this.objects) {
      if (Math.abs(o.body.position.x) > limit) {
        this.stopSimulation();
        return;
      }
    }
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
      kineticEnergy(m1, v1.x, v1.y, v1.z) + kineticEnergy(m2, v2.x, v2.y, v2.z);
    const gravityVec = { x: 0, y: -m1 * s.global.gravity, z: 0 };
    const nearGround = o1.body.position.y <= 0.46;
    const normalVec = nearGround ? { x: 0, y: m1 * s.global.gravity, z: 0 } : null;
    const netVec = {
      x: gravityVec.x + (normalVec?.x ?? 0),
      y: gravityVec.y + (normalVec?.y ?? 0),
      z: gravityVec.z + (normalVec?.z ?? 0),
    };

    return {
      time: s.simulationTime,
      sceneName: this.name,
      mass: m1 + m2,
      position: positionFromBody(o1.body),
      velocity: v1,
      speed: Math.sqrt(v1.x ** 2 + v1.y ** 2),
      kineticEnergy: ek,
      forces: {
        applied: 0,
        gravity: m1 * s.global.gravity,
        normal: nearGround ? m1 * s.global.gravity : 0,
        friction: 0,
        net: Math.sqrt(netVec.x ** 2 + netVec.y ** 2 + netVec.z ** 2),
      },
      forceVectors: {
        applied: null,
        gravity: gravityVec,
        normal: normalVec,
        friction: null,
        net: netVec,
      },
      sceneSpecific: {
        object1Velocity: v1,
        object2Velocity: v2,
        totalMomentum: pTotal,
        collision: s.collisionSnapshot,
        status: this._collided ? 'Đã va chạm' : 'Chưa va chạm',
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
