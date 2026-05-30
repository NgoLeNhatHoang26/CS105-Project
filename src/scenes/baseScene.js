import { disposeLoadedVisual } from '../graphics/modelLoader.js';

/**
 * Contract cơ sở cho mỗi scene vật lý.
 */
export class BaseScene {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.objects = [];
    this.meshes = [];
    this.staticBodies = [];
    this.groups = [];
    this._deps = null;
    this._stopped = false;
  }

  init(deps) {
    this._deps = deps;
    this._stopped = false;
  }

  getSelectableMeshes() {
    const list = [];
    this.objects.forEach((o) => {
      if (o.selectable === false) return;
      if (o.mesh) list.push(o.mesh);
      if (o.loadedVisual) list.push(o.loadedVisual);
    });
    return list;
  }

  reset() {
    this._stopped = false;
    this.objects.forEach((obj) => {
      if (obj.reset) obj.reset();
    });
  }

  update() {}

  applyRuntimeForces() {}

  onParameterChange() {}

  getTelemetry() {
    return { time: 0, sceneName: this.name };
  }

  dispose() {
    const { view, physics } = this._deps || {};
    const scene = view?.getScene();
    this.meshes.forEach((m) => scene?.remove(m));
    this.groups.forEach((g) => scene?.remove(g));
    this.objects.forEach((o) => {
      if (o.loadedVisual) {
        scene?.remove(o.loadedVisual);
        disposeLoadedVisual(o);
      }
      if (o.dispose) o.dispose();
      else if (o.mesh) scene?.remove(o.mesh);
      if (o.body) physics?.removeBody(o.body);
    });
    this.staticBodies.forEach((b) => physics?.removeBody(b));
    this.objects = [];
    this.meshes = [];
    this.staticBodies = [];
    this.groups = [];
  }

  stopSimulation() {
    this._stopped = true;
    const { onStop } = this._deps || {};
    onStop?.();
  }

  isStopped() {
    return this._stopped;
  }
}
