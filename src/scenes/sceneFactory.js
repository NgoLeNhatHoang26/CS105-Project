import { Scene1Incline } from './scene1_incline.js';
import { Scene2FreeFall } from './scene2_freefall.js';
import { Scene3Horizontal } from './scene3_horizontal.js';
import { Scene4Collision } from './scene4_collision.js';

const constructors = {
  1: Scene1Incline,
  2: Scene2FreeFall,
  3: Scene3Horizontal,
  4: Scene4Collision,
};

export function createScene(sceneId, deps) {
  const Ctor = constructors[sceneId];
  if (!Ctor) throw new Error(`Scene ${sceneId} không tồn tại`);
  const scene = new Ctor();
  scene.init(deps);
  return scene;
}
