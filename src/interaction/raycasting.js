import * as THREE from 'three';
import { canDragObjects } from '../state.js';
import { setHighlight } from '../components/materials.js';

/**
 * Raycasting — chọn và kéo vật (STOPPED/PAUSED).
 */
export class RaycasterController {
  constructor(camera, domElement, getMeshes) {
    this.camera = camera;
    this.domElement = domElement;
    this.getMeshes = getMeshes;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selected = null;
    this.pointerDown = false;
    this.pointerDownPos = { x: 0, y: 0 };
    this.pointerMoved = false;
    this.pendingSelect = null;
    this.dragThresholdPx = 5;
    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    domElement.addEventListener('pointerdown', this._onDown);
    domElement.addEventListener('pointermove', this._onMove);
    domElement.addEventListener('pointerup', this._onUp);
  }

  _updateMouse(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _pick() {
    const meshes = this.getMeshes();
    if (!meshes.length) return null;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(meshes, false);
    return hits[0]?.object ?? null;
  }

  _clearHighlight() {
    if (this.selected?.mesh?.material) {
      setHighlight(this.selected.mesh.material, false);
    }
  }

  _onDown(event) {
    if (event.button !== 0) return;
    this.pointerDown = true;
    this.pointerMoved = false;
    this.pointerDownPos = { x: event.clientX, y: event.clientY };
    this._updateMouse(event);
    const mesh = this._pick();
    this.pendingSelect = mesh?.userData?.simObject ?? null;
  }

  _onMove(event) {
    this._updateMouse(event);
    if (this.pointerDown) {
      const dx = event.clientX - this.pointerDownPos.x;
      const dy = event.clientY - this.pointerDownPos.y;
      this.pointerMoved = this.pointerMoved || Math.hypot(dx, dy) > this.dragThresholdPx;
    }

    if (!this.pointerDown && canDragObjects()) {
      const mesh = this._pick();
      this._clearHighlight();
      if (mesh?.userData?.simObject) {
        this.selected = mesh.userData.simObject;
        setHighlight(mesh.material, true);
      }
    }
  }

  _onUp(event) {
    if (event.button !== 0) return;
    const canSelect = !this.pointerMoved;
    if (canSelect && this.pendingSelect) {
      this._clearHighlight();
      this.selected = this.pendingSelect;
      setHighlight(this.selected.mesh.material, true);
    }
    this.pointerDown = false;
    this.pointerMoved = false;
    this.pendingSelect = null;
  }

  bindSimObjects(objects) {
    objects.forEach((o) => {
      if (o.mesh) o.mesh.userData.simObject = o;
    });
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this._onDown);
    this.domElement.removeEventListener('pointermove', this._onMove);
    this.domElement.removeEventListener('pointerup', this._onUp);
  }
}
