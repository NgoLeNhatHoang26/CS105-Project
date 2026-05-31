import * as THREE from 'three';
import { getState } from '../state.js';
import { SCENE_IDS, ARENA_HALF } from '../constants.js';
import {
  computeBoxHalfExtentAlongNormal,
  constrainBodyToRamp,
  computeSpawnPosition,
  distanceAlongRamp,
} from '../scenes/inclineHelpers.js';
import { bottomYFromCenterY, centerYFromBottomHeight } from '../scenes/scene2Helpers.js';

function makeVec3(x, y, z) {
  return {
    x,
    y,
    z,
    set(nx, ny, nz) {
      this.x = nx;
      this.y = ny;
      this.z = nz;
    },
  };
}

export function defaultDragPlane(simObject) {
  const y = simObject.simState?.position?.y ?? simObject.mesh?.position?.y ?? 0;
  return new THREE.Plane(new THREE.Vector3(0, 1, 0), -y);
}

export function constrainDragPosition(sceneId, scene, simObject, point) {
  if (!point) return null;

  switch (sceneId) {
    case SCENE_IDS.INCLINE:
      return constrainInclineDrag(scene, simObject, point);
    case SCENE_IDS.FREE_FALL:
      return constrainFreeFallDrag(simObject, point);
    case SCENE_IDS.HORIZONTAL:
      return constrainHorizontalDrag(simObject, point);
    case SCENE_IDS.COLLISION:
      return constrainCollisionDrag(scene, simObject, point);
    default:
      return point.clone();
  }
}

function constrainInclineDrag(scene, simObject, point) {
  const inclineData = scene.inclineData;
  if (!inclineData) return point.clone();

  const halfHeight = computeBoxHalfExtentAlongNormal(
    scene.objectDims ?? { width: 0.6, height: 0.6, depth: 0.6 },
    inclineData,
  );

  const bodyProxy = {
    position: makeVec3(point.x, point.y, point.z),
    velocity: makeVec3(0, 0, 0),
  };
  constrainBodyToRamp(bodyProxy, inclineData, halfHeight);

  let dist = distanceAlongRamp(
    new THREE.Vector3(bodyProxy.position.x, bodyProxy.position.y, bodyProxy.position.z),
    inclineData,
  );
  const maxDist = (scene.inclineData.length ?? 5) - 0.15;
  dist = Math.max(0, Math.min(maxDist, dist));

  const pos = computeSpawnPosition(inclineData, halfHeight, dist, scene.spawnNormalOffset ?? 0.03);

  simObject.sAlong = dist;
  simObject.vAlong = 0;

  return pos;
}

function constrainFreeFallDrag(_scene, simObject, point) {
  const r = simObject.radius ?? 0.3;
  const minY = r + 0.05;
  const maxY = 100;
  const limit = ARENA_HALF - 1;
  return new THREE.Vector3(
    THREE.MathUtils.clamp(point.x, -limit, limit),
    THREE.MathUtils.clamp(point.y, minY, maxY),
    THREE.MathUtils.clamp(point.z, -limit, limit),
  );
}

export function syncFreeFallHeightAfterDrag(simObject) {
  const r = simObject.radius ?? 0.3;
  const sourceY = simObject.simState.position.y;
  const bottom = bottomYFromCenterY(sourceY, r);
  simObject.releaseHeight = Math.max(0.5, bottom);
  return simObject.releaseHeight;
}

export function applyFreeFallHeightToBody(simObject, bottomHeight) {
  const r = simObject.radius ?? 0.3;
  const y = centerYFromBottomHeight(bottomHeight, r);
  simObject.simState.position.y = y;
  simObject.mesh.position.y = y;
  if (simObject.loadedVisual) {
    simObject.loadedVisual.position.y = y;
  }
}

function constrainHorizontalDrag(simObject, point) {
  const y = simObject.simState?.position?.y ?? simObject.mesh?.position?.y ?? 0.5;
  const limit = ARENA_HALF - 1;

  simObject.simState.position.x = THREE.MathUtils.clamp(point.x, -limit, limit);
  simObject.simState.position.z = THREE.MathUtils.clamp(point.z, -limit, limit);
  simObject.simState.velocity.x = 0;
  simObject.simState.velocity.z = 0;

  return new THREE.Vector3(
    THREE.MathUtils.clamp(point.x, -limit, limit),
    y,
    THREE.MathUtils.clamp(point.z, -limit, limit),
  );
}

function constrainCollisionDrag(scene, simObject, point) {
  const trackY = simObject.trackY ?? 0.5;
  const limit = ARENA_HALF - 2;
  const params = getState().sceneParams;
  const r = params.sphereRadius ?? 0.45;
  const minGap = 2 * r + 0.15;

  let x = THREE.MathUtils.clamp(point.x, -limit, limit);
  const other = scene.objects?.find((o) => o.id !== simObject.id);
  const otherX = other?.simState?.position?.x ?? null;
  if (otherX != null) {
    if (simObject.id === 'object_1') {
      x = Math.min(x, otherX - minGap);
    } else {
      x = Math.max(x, otherX + minGap);
    }
  }

  simObject.simState.position.x = x;
  simObject.simState.velocity.x = 0;

  return new THREE.Vector3(x, trackY, 0);
}
