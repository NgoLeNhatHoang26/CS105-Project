import * as THREE from 'three';
import { getState } from '../state.js';
import { clamp } from '../utils/helpers.js';

const COLORS = {
  applied: 0xff3333,
  gravity: 0x3366ff,
  normal: 0xffd60a,
  friction: 0xffaa00,
  net: 0xffffff,
};

export class ForceVisualizer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'forceVectors';
    scene.add(this.group);
    this.arrows = new Map();
    this.lengthScale = 0.04;
    this.minLength = 0.35;
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
        new THREE.Vector3(),
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

  _setArrow(key, vector, origin, color) {
    const arrow = this._getOrCreateArrow(key, color);
    const magnitude = vector.length();
    if (magnitude < 1e-4) {
      arrow.visible = false;
      return;
    }
    const dir = vector.clone().normalize();
    const length = clamp(magnitude * this.lengthScale, this.minLength, this.maxLength);
    arrow.setDirection(dir);
    arrow.setLength(length, length * 0.22, length * 0.12);
    arrow.position.copy(origin);
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
      this._hideUnused(new Set());
      return;
    }

    const o = new THREE.Vector3(origin.x, origin.y, origin.z);
    const vectors = telemetry.forceVectors;
    const visible = new Set();

    const showAll = mode === 'all';
    const showSelected = mode === 'selected';

    const maybeDraw = (key) => {
      const vec = this._toVector(vectors[key]);
      if (!vec) return;
      const allow = showAll || (showSelected && (key === 'applied' || key === 'net'));
      if (!allow) return;
      this._setArrow(key, vec, o, COLORS[key]);
      visible.add(key);
    };

    maybeDraw('applied');
    maybeDraw('gravity');
    maybeDraw('normal');
    maybeDraw('friction');
    maybeDraw('net');
    this._hideUnused(visible);
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
  }
}
