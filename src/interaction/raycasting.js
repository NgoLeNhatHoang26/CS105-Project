import * as THREE from 'three';
import { canDragObjects, isRunning, setParameter, getState } from '../state.js';
import { setHighlight } from '../components/materials.js';
import { syncBodyFromMesh, saveInitialPose } from '../components/geometries.js';
import { syncLoadedVisualFromBody } from '../graphics/modelLoader.js';
import {
  defaultDragPlane,
  constrainDragPosition,
  syncFreeFallHeightAfterDrag,
} from './dragConstraints.js';
import {
  computeBoxHalfExtentAlongNormal,
  constrainBodyToRamp,
  getRampFrameQuaternion,
} from '../scenes/inclineHelpers.js';
import { SCENE_IDS } from '../constants.js';

/**
 * Raycasting — chọn và kéo vật (STOPPED/PAUSED).
 */
export class RaycasterController {
  constructor(camera, domElement, getMeshes, getActiveScene, orbitControls) {
    this.camera = camera;
    this.domElement = domElement;
    this.getMeshes = getMeshes;
    this.getActiveScene = getActiveScene;
    this.orbitControls = orbitControls;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selected = null;
    this.pointerDown = false;
    this.isDragging = false;
    this.pointerDownPos = { x: 0, y: 0 };
    this.pointerMoved = false;
    this.pendingSelect = null;
    this.dragThresholdPx = 5;
    this.dragPlane = new THREE.Plane();
    this._dragPoint = new THREE.Vector3();
    this._lastMouseX = 0;
    this._lastMouseY = 0;
    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    domElement.addEventListener('pointerdown', this._onDown);
    domElement.addEventListener('pointermove', this._onMove);
    domElement.addEventListener('pointerup', this._onUp);
    domElement.addEventListener('pointerleave', this._onUp);
    window.addEventListener('keydown', this._onKeyDown);
  }

  _updateMouse(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _resolveSimObject(object3d) {
    let o = object3d;
    while (o) {
      if (o.userData?.simObject) return o.userData.simObject;
      o = o.parent;
    }
    return null;
  }

  _pick() {
    const meshes = this.getMeshes();
    if (!meshes.length) return null;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(meshes, true);
    for (const hit of hits) {
      const sim = this._resolveSimObject(hit.object);
      if (sim?.selectable !== false) return sim;
    }
    return null;
  }

  _clearHighlight() {
    if (this.selected?.mesh) {
      setHighlight(this.selected.mesh, false);
    }
  }

  _setOrbitEnabled(enabled) {
    if (this.orbitControls) this.orbitControls.enabled = enabled;
  }

  _getDragPlane(sim) {
    const scene = this.getActiveScene?.();
    if (scene?.getDragPlane) return scene.getDragPlane(sim);
    return defaultDragPlane(sim);
  }

  _intersectDragPlane(event, sim) {
    this._updateMouse(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const plane = this._getDragPlane(sim);
    this.dragPlane.copy(plane);
    if (!this.raycaster.ray.intersectPlane(this.dragPlane, this._dragPoint)) return null;
    return this._dragPoint.clone();
  }

  _applyDragPosition(sim, worldPoint) {
    const scene = this.getActiveScene?.();
    const sceneId = scene?.id;
    const constrained = constrainDragPosition(sceneId, scene, sim, worldPoint);
    if (!constrained) return;

    sim.mesh.position.copy(constrained);

    if (sceneId === SCENE_IDS.INCLINE && scene?.inclineData) {
      const halfHeight = computeBoxHalfExtentAlongNormal(
        scene.objectDims ?? { width: 0.6, height: 0.6, depth: 0.6 },
        scene.inclineData,
      );
      const rampQuat = getRampFrameQuaternion(scene.inclineData);
      sim.mesh.quaternion.copy(rampQuat);
      sim.body.quaternion.copy(rampQuat);
      constrainBodyToRamp(sim.body, scene.inclineData, halfHeight);
      sim.mesh.position.copy(sim.body.position);
    }

    syncBodyFromMesh(sim.body, sim.mesh);
    syncLoadedVisualFromBody(sim);
  }

  _onDown(event) {
    if (event.button !== 0 || isRunning()) return;
    if (!canDragObjects()) return;

    this.pointerDown = true;
    this.isDragging = false;
    this.pointerMoved = false;
    this.pointerDownPos = { x: event.clientX, y: event.clientY };
    this._updateMouse(event);
    const sim = this._pick();
    this.pendingSelect = sim;

    if (sim) {
      this._setOrbitEnabled(false);
      event.preventDefault();
    }
  }

  _onMove(event) {
    this._updateMouse(event);

    if (this.pointerDown && this.pendingSelect && canDragObjects()) {
      const dx = event.clientX - this.pointerDownPos.x;
      const dy = event.clientY - this.pointerDownPos.y;
      if (!this.pointerMoved && Math.hypot(dx, dy) > this.dragThresholdPx) {
        this.pointerMoved = true;
        this.isDragging = true;
        this._clearHighlight();
        this.selected = this.pendingSelect;
        setHighlight(this.selected.mesh, true);
        this._lastMouseX = event.clientX;
        this._lastMouseY = event.clientY;
      }

      if (this.isDragging) {
        const mode = getState().display.transformMode ?? 'translate';
        if (mode === 'rotate') {
          this._applyRotateDelta(event);
        } else {
          const hit = this._intersectDragPlane(event, this.selected);
          if (hit) {
            this._applyDragPosition(this.selected, hit);
            event.preventDefault();
          }
        }
        return;
      }
    }

    if (!this.pointerDown && canDragObjects()) {
      const sim = this._pick();
      this._clearHighlight();
      if (sim) {
        this.selected = sim;
        setHighlight(sim.mesh, true);
      } else {
        this.selected = null;
      }
    }
  }

  _onUp(event) {
    if (event.button !== 0) return;

    if (this.isDragging && this.selected) {
      const scene = this.getActiveScene?.();
      if (scene?.id === SCENE_IDS.FREE_FALL) {
        const h = syncFreeFallHeightAfterDrag(this.selected);
        setParameter('initialHeight', h);
      }
      saveInitialPose(this.selected);
    } else if (!this.pointerMoved && this.pendingSelect) {
      this._clearHighlight();
      this.selected = this.pendingSelect;
      setHighlight(this.selected.mesh, true);
    }

    this.pointerDown = false;
    this.isDragging = false;
    this.pointerMoved = false;
    this.pendingSelect = null;
    this._setOrbitEnabled(true);
  }

  _applyBodyRotation(sim, newQ) {
    sim.body.quaternion.set(newQ.x, newQ.y, newQ.z, newQ.w);
    sim.mesh.quaternion.copy(newQ);
    const offset = sim.mesh?.userData?.visualRotationOffset;
    if (offset) {
      const qOff = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(offset.x, offset.y, offset.z, 'XYZ'),
      );
      sim.mesh.quaternion.multiply(qOff);
    }
    // Persist rotated orientation so Reset goes back to this pose
    sim.initialPosition = sim.mesh.position.clone();
    sim.initialQuaternion = newQ.clone();
  }

  _applyRotateDelta(event) {
    const sim = this.selected;
    if (!sim?.mesh || !sim?.body) return;

    const sensitivity = 0.012;
    const dxPx = event.clientX - this._lastMouseX;
    const dyPx = event.clientY - this._lastMouseY;
    this._lastMouseX = event.clientX;
    this._lastMouseY = event.clientY;

    if (Math.abs(dxPx) < 0.3 && Math.abs(dyPx) < 0.3) return;

    // World-space arcball: horizontal drag = Y axis, vertical drag = X axis
    const rotY = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0), dxPx * sensitivity,
    );
    const rotX = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0), dyPx * sensitivity,
    );
    const delta = rotX.clone().multiply(rotY); // apply rotY first, then rotX in world space

    const currentQ = new THREE.Quaternion(
      sim.body.quaternion.x,
      sim.body.quaternion.y,
      sim.body.quaternion.z,
      sim.body.quaternion.w,
    );
    this._applyBodyRotation(sim, delta.multiply(currentQ));
    event.preventDefault();
  }

  _onKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (!this.selected || isRunning() || !canDragObjects()) return;

    const step = Math.PI / 12; // 15° per keypress
    let axis = null;
    let angle = 0;

    if (e.code === 'BracketLeft')  { axis = new THREE.Vector3(0, 1, 0); angle = -step; }
    else if (e.code === 'BracketRight') { axis = new THREE.Vector3(0, 1, 0); angle =  step; }
    else if (e.code === 'Quote')   { axis = new THREE.Vector3(1, 0, 0); angle = -step; }
    else if (e.code === 'Backslash') { axis = new THREE.Vector3(1, 0, 0); angle =  step; }

    if (!axis) return;
    e.preventDefault();

    const dq = new THREE.Quaternion().setFromAxisAngle(axis, angle);
    const currentQ = new THREE.Quaternion(
      this.selected.body.quaternion.x,
      this.selected.body.quaternion.y,
      this.selected.body.quaternion.z,
      this.selected.body.quaternion.w,
    );
    this._applyBodyRotation(this.selected, dq.multiply(currentQ));
  }

  bindSimObjects(objects) {
    objects.forEach((o) => {
      if (!o.mesh) return;
      o.mesh.userData.simObject = o;
      o.mesh.traverse?.((c) => {
        c.userData.simObject = o;
      });
      if (o.loadedVisual) {
        o.loadedVisual.userData.simObject = o;
        o.loadedVisual.traverse((c) => {
          c.userData.simObject = o;
        });
      }
    });
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this._onDown);
    this.domElement.removeEventListener('pointermove', this._onMove);
    this.domElement.removeEventListener('pointerup', this._onUp);
    this.domElement.removeEventListener('pointerleave', this._onUp);
    window.removeEventListener('keydown', this._onKeyDown);
  }
}
