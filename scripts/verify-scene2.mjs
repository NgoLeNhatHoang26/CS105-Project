/**
 * Kiểm tra Scene 2 — logic spawn đáy + damping=0 + clamp đất.
 * Chạy: node scripts/verify-scene2.mjs
 */
import * as CANNON from 'cannon-es';

const DT = 1 / 60;
const G = 9.8;
const BOX_HALF = 0.3;
const GROUND_EPS = 0.02;

function centerYFromBottom(h) {
  return h + BOX_HALF;
}

function simulate({ bottomH = 20, g = G, mass = 5, maxTime = 5 }) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -g, 0) });
  const ground = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
  ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(ground);

  const shape = new CANNON.Box(new CANNON.Vec3(BOX_HALF, BOX_HALF, BOX_HALF));
  const body = new CANNON.Body({ mass, shape });
  body.position.set(0, centerYFromBottom(bottomH), 0);
  body.linearDamping = 0;
  body.angularDamping = 0;
  world.addBody(body);

  const yMin = BOX_HALF + GROUND_EPS;
  const marks = new Set([Math.round(0.5 / DT), Math.round(1.0 / DT)]);
  const samples = [];
  let step = 0;
  let t = 0;
  let stopped = false;

  while (t < maxTime && !stopped) {
    world.step(DT);
    step += 1;
    t = step * DT;
    if (body.position.y <= yMin) {
      body.position.y = yMin;
      body.velocity.set(0, 0, 0);
      stopped = true;
    }
    if (marks.has(step)) {
      const mark = step * DT;
      const yBottom = body.position.y - BOX_HALF;
      samples.push({ t: mark, yBottom, vy: body.velocity.y });
    }
  }

  const tGround = Math.sqrt((2 * bottomH) / g);
  return { samples, tEnd: t, tGround, stopped };
}

let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failed += 1;
  } else {
    console.log('OK:', msg);
  }
}

const r = simulate({ bottomH: 20, g: G });
for (const s of r.samples) {
  const yTh = 20 - 0.5 * G * s.t * s.t;
  const vyTh = -G * s.t;
  assert(Math.abs(s.yBottom - yTh) < 0.1, `y @ ${s.t}s: sim=${s.yBottom.toFixed(3)} th=${yTh.toFixed(3)}`);
  assert(Math.abs(s.vy - vyTh) < 0.1, `vy @ ${s.t}s: sim=${s.vy.toFixed(3)} th=${vyTh.toFixed(3)}`);
}
assert(Math.abs(r.tEnd - r.tGround) < 0.05, `t_ground sim=${r.tEnd.toFixed(3)} th=${r.tGround.toFixed(3)}`);

const m1 = simulate({ bottomH: 15, mass: 0.5 });
const m2 = simulate({ bottomH: 15, mass: 50 });
assert(Math.abs(m1.tEnd - m2.tEnd) < 0.05, `mass independence: ${m1.tEnd.toFixed(3)} vs ${m2.tEnd.toFixed(3)}`);

process.exit(failed > 0 ? 1 : 0);
