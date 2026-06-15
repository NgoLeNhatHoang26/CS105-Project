import * as THREE from 'three';
import { getState } from '../state.js';
import { SCENE_IDS } from '../constants.js';
import { clamp } from '../utils/helpers.js';

const COLORS = {
  applied: 0xff3333,
  gravity: 0x3366ff,
  normal: 0xffd60a,
  friction: 0xffaa00,
  drag: 0x00ccaa,
  net: 0xffffff,
};

const LOCAL_ORIGIN = new THREE.Vector3(0, 0, 0);

const HIDE_BELOW_N = 0.25;
const NET_HIDE_BELOW_N = 0.5;

export class ForceVisualizer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'forceVectors';
    scene.add(this.group);
    this.arrows = new Map();
    this.lengthScale = 0.04;
    this.minLength = 0.2;
    this.maxLength = 3.25;
  }

  _disposeArrow(arrow) {
    if (!arrow) return;
    arrow.line?.geometry?.dispose?.();
    arrow.line?.material?.dispose?.();
    arrow.cone?.geometry?.dispose?.();
    arrow.cone?.material?.dispose?.();
  }

  _getOrCreateArrow(key, color) {
    let arrow = this.arrows.get(key);
    if (!arrow) {
      arrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        LOCAL_ORIGIN,
        1,
        color,
        0.22,
        0.12,
      );
      this.group.add(arrow);
      this.arrows.set(key, arrow);
    }
    return arrow;
  }

  _setArrow(key, vector, color, origin = LOCAL_ORIGIN, isNet = false) {
    const arrow = this._getOrCreateArrow(key, color);
    const magnitude = vector.length();
    const hideThreshold = isNet ? NET_HIDE_BELOW_N : HIDE_BELOW_N;
    if (magnitude < hideThreshold) {
      arrow.visible = false;
      return;
    }

    const dir = vector.clone().normalize();
    const rawLen = magnitude * this.lengthScale;
    const length = clamp(rawLen, this.minLength, this.maxLength);
    arrow.position.set(origin.x, origin.y, origin.z);
    arrow.setDirection(dir);
    arrow.setLength(length, length * 0.22, length * 0.12);
    arrow.visible = true;
  }

  clear() {
    this.arrows.forEach((arrow) => {
      this.group.remove(arrow);
      this._disposeArrow(arrow);
    });
    this.arrows.clear();
  }

  _hideUnused(visibleKeys) {
    this.arrows.forEach((arrow, key) => {
      arrow.visible = visibleKeys.has(key);
    });
  }

  _toVector(payload) {
    if (!payload) return null;
    const x = Number(payload.x ?? 0);
    const y = Number(payload.y ?? 0);
    const z = Number(payload.z ?? 0);
    return new THREE.Vector3(x, y, z);
  }

  _worldPositionFromMesh(mesh) {
    if (!mesh) return null;
    const p = new THREE.Vector3();
    mesh.getWorldPosition(p);
    return p;
  }

  updateFromTelemetry(telemetry, origin, activeScene = null) {
    const mode = getState().display.showVectors;
    if (mode === 'none' || !telemetry?.forceVectors) {
      this.group.position.set(0, 0, 0);
      this._hideUnused(new Set());
      return;
    }

    this.group.position.set(0, 0, 0);

    const visible = new Set();

    const showAll = mode === 'all';
    const showSelected = mode === 'selected';

    const maybeDraw = (key, payload, drawOrigin) => {
      const vec = this._toVector(payload);
      if (!vec) return;
      const baseKey = key.includes(':') ? key.split(':')[1] : key;
      const allow = showAll || (showSelected && (baseKey === 'applied' || baseKey === 'net'));
      if (!allow) return;
      this._setArrow(key, vec, COLORS[baseKey], drawOrigin, baseKey === 'net');
      visible.add(key);
    };

    const isCollisionScene =
      activeScene?.id === SCENE_IDS.COLLISION &&
      telemetry?.sceneSpecific?.object1Forces?.forceVectors &&
      telemetry?.sceneSpecific?.object2Forces?.forceVectors &&
      activeScene.objects?.length >= 2;

    if (isCollisionScene) {
      const objectPayloads = [
        {
          id: 'obj1',
          vectors: telemetry.sceneSpecific.object1Forces.forceVectors,
          mesh: activeScene.objects[0]?.mesh,
        },
        {
          id: 'obj2',
          vectors: telemetry.sceneSpecific.object2Forces.forceVectors,
          mesh: activeScene.objects[1]?.mesh,
        },
      ];

      objectPayloads.forEach(({ id, vectors, mesh }) => {
        const objOrigin = this._worldPositionFromMesh(mesh);
        if (!objOrigin || !vectors) return;

        maybeDraw(`${id}:applied`, vectors.applied, objOrigin);
        maybeDraw(`${id}:gravity`, vectors.gravity, objOrigin);
        maybeDraw(`${id}:normal`, vectors.normal, objOrigin);
        maybeDraw(`${id}:friction`, vectors.friction, objOrigin);
        maybeDraw(`${id}:drag`, vectors.drag, objOrigin);
        maybeDraw(`${id}:net`, vectors.net, objOrigin);
      });
    } else {
      const drawOrigin = new THREE.Vector3(origin.x ?? 0, origin.y ?? 0, origin.z ?? 0);
      const vectors = telemetry.forceVectors;
      maybeDraw('applied', vectors.applied, drawOrigin);
      maybeDraw('gravity', vectors.gravity, drawOrigin);
      maybeDraw('normal', vectors.normal, drawOrigin);
      maybeDraw('friction', vectors.friction, drawOrigin);
      maybeDraw('drag', vectors.drag, drawOrigin);
      maybeDraw('net', vectors.net, drawOrigin);
    }
    this._hideUnused(visible);
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
  }
}

export function getForceOriginFromScene(activeScene) {
  const obj = activeScene?.objects?.[0];
  if (obj?.mesh) {
    const p = new THREE.Vector3();
    obj.mesh.getWorldPosition(p);
    return { x: p.x, y: p.y, z: p.z };
  }
  return null;
}
