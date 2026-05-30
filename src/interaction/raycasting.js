import * as THREE from 'three';
import { canDragObjects, isRunning, setParameter } from '../state.js';
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
    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    domElement.addEventListener('pointerdown', this._onDown);
    domElement.addEventListener('pointermove', this._onMove);
    domElement.addEventListener('pointerup', this._onUp);
    domElement.addEventListener('pointerleave', this._onUp);
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
      }

      if (this.isDragging) {
        const hit = this._intersectDragPlane(event, this.selected);
        if (hit) {
          this._applyDragPosition(this.selected, hit);
          event.preventDefault();
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
  }
}
