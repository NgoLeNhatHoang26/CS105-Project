import { createScene } from '../scenes/sceneFactory.js';
import { getState, setScene as setStateScene } from '../state.js';

export class SceneManager {
  constructor(view, physics) {
    this.view = view;
    this.physics = physics;
    this.activeScene = null;
    this.deps = {
      view,
      physics,
      onStop: null,
    };
  }

  setOnStop(fn) {
    this.deps.onStop = fn;
  }

  loadScene(sceneId) {
    this.dispose();
    setStateScene(sceneId);
    this.physics.clearBodies();
    this.activeScene = createScene(sceneId, this.deps);
    return this.activeScene;
  }

  reset() {
    this.activeScene?.reset();
  }

  update(dt) {
    this.activeScene?.update(dt);
  }

  applyRuntimeForces() {
    this.activeScene?.applyRuntimeForces();
  }

  onParameterChange() {
    this.activeScene?.onParameterChange();
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
    this.physics.clearBodies();
  }
}
