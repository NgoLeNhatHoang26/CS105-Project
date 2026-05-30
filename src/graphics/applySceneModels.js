import { getState } from '../state.js';
import { SCENE_IDS } from '../constants.js';
import {
  attachLoadedModelVisual,
  disposeLoadedVisual,
} from './modelLoader.js';

function modelUrlForObject(sceneId, params, objectId) {
  if (sceneId === SCENE_IDS.COLLISION) {
    return objectId === 'object_2'
      ? params.graphicsObject2ModelUrl
      : params.graphicsObject1ModelUrl;
  }
  return params.graphicsModelUrl || null;
}

function targetSizeForObject(sceneId, params, sim) {
  if (sceneId === SCENE_IDS.COLLISION) {
    const r = params.sphereRadius ?? 0.45;
    const scale =
      sim.id === 'object_2'
        ? (params.graphicsObject2Scale ?? 1)
        : (params.graphicsObject1Scale ?? 1);
    return Math.max(0.4, r * 2 * scale);
  }
  const s = (params.boxSize ?? 0.6) * (params.graphicsScale ?? 1);
  return Math.max(0.3, s);
}

/**
 * Áp model GLB/GLTF đã chọn lên mesh hiển thị (không đổi collider physics).
 */
export async function applySceneLoadedModels(scene, view) {
  if (!scene?.objects?.length) return;
  const s = getState();
  const sceneId = s.currentSceneId;
  const params = s.sceneParams;
  const threeScene = view?.getScene();

  for (const obj of scene.objects) {
    const url = modelUrlForObject(sceneId, params, obj.id);
    if (!url) {
      disposeLoadedVisual(obj);
      continue;
    }
    try {
      const size = targetSizeForObject(sceneId, params, obj);
      const ok = await attachLoadedModelVisual(obj, url, size);
      if (ok && obj.loadedVisual && threeScene) {
        if (!obj.loadedVisual.parent) threeScene.add(obj.loadedVisual);
      }
    } catch (err) {
      console.warn('Load model failed:', err);
      disposeLoadedVisual(obj);
    }
  }
}

export function revokeModelUrl(url) {
  if (url && String(url).startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
