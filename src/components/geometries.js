
import { disposeLoadedVisual } from '../graphics/modelLoader.js';


export function disposePair({ mesh, geometry, material }) {
  mesh?.parent?.remove(mesh);
  geometry?.dispose();
  if (material) {
    if (material.map) material.map.dispose();
    material.dispose();
  }
}

export function disposeSimObject(sim) {
  disposeLoadedVisual(sim);
  disposePair(sim);
}
