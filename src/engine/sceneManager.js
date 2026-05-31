import { createScene } from '../scenes/sceneFactory.js';
import { getState, setScene as setStateScene } from '../state.js';
import { applySceneLoadedModels } from '../graphics/applySceneModels.js';

export class SceneManager {
  constructor(view, textureMap = null) {
    this.view = view;
    this.activeScene = null;
    this.deps = {
      view,
      textureMap,
      onStop: null,
    };
  }

  setOnStop(fn) {
    this.deps.onStop = fn;
  }

  loadScene(sceneId) {
    this.dispose();
    setStateScene(sceneId);
    this.activeScene = createScene(sceneId, this.deps);
    return this.activeScene;
  }

  reset() {
    this.activeScene?.reset();
  }

  update(dt) {
    this.activeScene?.update(dt);
  }

  integrate(dt) {
    this.activeScene?.integrate?.(dt);
  }

  onParameterChange() {
    this.activeScene?.onParameterChange?.();
    applySceneLoadedModels(this.activeScene, this.view).catch((err) => {
      console.warn('applySceneLoadedModels:', err);
    });
  }

  getActiveScene() {
    return this.activeScene;
  }

  getSelectableMeshes() {
    return this.activeScene?.getSelectableMeshes() ?? [];
  }

  getTelemetry() {
    return this.activeScene?.getTelemetry() ?? {};
  }

  dispose() {
    this.activeScene?.dispose();
    this.activeScene = null;
  }
}
