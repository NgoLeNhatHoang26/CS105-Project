import * as CANNON from 'cannon-es';

/**
 * PhysicsEngine — bọc Cannon-es world.
 * Fixed timestep 1/60 cho mô phỏng ổn định.
 */
export class PhysicsEngine {
  constructor(gravity = 9.8) {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -gravity, 0),
    });
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.allowSleep = true;
    this.world.defaultContactMaterial.friction = 0.3;
    this.world.defaultContactMaterial.restitution = 0.3;
    this.bodies = [];
    this.gravity = gravity;
  }

  setGravity(g) {
    this.gravity = g;
    this.world.gravity.set(0, -g, 0);
  }

  addBody(body) {
    this.world.addBody(body);
    this.bodies.push(body);
    return body;
  }

  removeBody(body) {
    this.world.removeBody(body);
    const i = this.bodies.indexOf(body);
    if (i >= 0) this.bodies.splice(i, 1);
  }

  clearBodies() {
    [...this.bodies].forEach((b) => this.world.removeBody(b));
    this.bodies = [];
  }

  applyForce(body, force, worldPoint = null) {
    const f = new CANNON.Vec3(force.x, force.y, force.z);
    if (worldPoint) {
      body.applyForce(f, new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z));
    } else {
      body.applyForce(f);
    }
  }

  step(fixedDt = 1 / 60) {
    this.world.step(fixedDt);
  }

  setDefaultFriction(mu) {
    this.world.defaultContactMaterial.friction = mu;
  }

  setDefaultRestitution(e) {
    this.world.defaultContactMaterial.restitution = e;
  }

  createContactMaterial(matA, matB, options = {}) {
    const cm = new CANNON.ContactMaterial(matA, matB, {
      friction: options.friction ?? 0.3,
      restitution: options.restitution ?? 0.3,
    });
    this.world.addContactMaterial(cm);
    return cm;
  }
}
