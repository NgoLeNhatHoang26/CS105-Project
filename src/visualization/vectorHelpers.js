import * as THREE from 'three';
import { getState } from '../state.js';
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

  _setArrow(key, vector, color) {
    const arrow = this._getOrCreateArrow(key, color);
    const magnitude = vector.length();
    const hideThreshold = key === 'net' ? NET_HIDE_BELOW_N : HIDE_BELOW_N;
    if (magnitude < hideThreshold) {
      arrow.visible = false;
      return;
    }

    const dir = vector.clone().normalize();
    const rawLen = magnitude * this.lengthScale;
    const length = clamp(rawLen, this.minLength, this.maxLength);
    arrow.position.set(0, 0, 0);
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

  updateFromTelemetry(telemetry, origin) {
    const mode = getState().display.showVectors;
    if (mode === 'none' || !telemetry?.forceVectors) {
      this.group.position.set(0, 0, 0);
      this._hideUnused(new Set());
      return;
    }

    this.group.position.set(origin.x ?? 0, origin.y ?? 0, origin.z ?? 0);

    const vectors = telemetry.forceVectors;
    const visible = new Set();

    const showAll = mode === 'all';
    const showSelected = mode === 'selected';

    const maybeDraw = (key) => {
      const vec = this._toVector(vectors[key]);
      if (!vec) return;
      const allow = showAll || (showSelected && (key === 'applied' || key === 'net'));
      if (!allow) return;
      this._setArrow(key, vec, COLORS[key]);
      visible.add(key);
    };

    maybeDraw('applied');
    maybeDraw('gravity');
    maybeDraw('normal');
    maybeDraw('friction');
    maybeDraw('drag');
    maybeDraw('net');
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
