/**
 * Verify collision physics formulas (Cases 1–8).
 * Run: node scripts/verify-collision.mjs
 */
import { solve1DCollision, kineticEnergy } from '../src/physics/calculator.js';
import {
  integrateCollision,
  handleCollision,
  applyFriction1D,
} from '../src/physics/integrators/collision1d.js';

const EPS = 1e-6;
const R = 0.45;

function approx(a, b, tol = EPS) {
  return Math.abs(a - b) <= tol;
}

function runCase(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    return true;
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
    return false;
  }
}

function assertApprox(actual, expected, label, tol = EPS) {
  if (!approx(actual, expected, tol)) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

// Case 1: equal mass elastic, object 2 at rest
runCase('Case 1: m1=m2=1, v1=5, v2=0, e=1', () => {
  const { v1After, v2After } = solve1DCollision(1, 1, 5, 0, 1);
  assertApprox(v1After, 0, 'v1_after');
  assertApprox(v2After, 5, 'v2_after');
});

// Case 2: heavy hits light
runCase('Case 2: m1=5, m2=1, v1=5, v2=0, e=1', () => {
  const { v1After, v2After } = solve1DCollision(5, 1, 5, 0, 1);
  assertApprox(v1After, 20 / 6, 'v1_after');
  assertApprox(v2After, 50 / 6, 'v2_after');
  if (v2After <= v1After) throw new Error('light object should move faster than heavy');
});

// Case 3: light hits heavy
runCase('Case 3: m1=1, m2=5, v1=5, v2=0, e=1', () => {
  const { v1After, v2After } = solve1DCollision(1, 5, 5, 0, 1);
  assertApprox(v1After, -20 / 6, 'v1_after');
  assertApprox(v2After, 10 / 6, 'v2_after');
  if (v1After >= 0) throw new Error('light object should bounce back');
});

// Case 4: head-on
runCase('Case 4: m1=m2=1, v1=5, v2=-5, e=1', () => {
  const { v1After, v2After } = solve1DCollision(1, 1, 5, -5, 1);
  assertApprox(v1After, -5, 'v1_after');
  assertApprox(v2After, 5, 'v2_after');
});

// Case 5: partial restitution
runCase('Case 5: m1=m2=1, v1=5, v2=0, e=0.5', () => {
  const ekBefore = kineticEnergy(1, 5, 0, 0);
  const { v1After, v2After } = solve1DCollision(1, 1, 5, 0, 0.5);
  const ekAfter = kineticEnergy(1, v1After, 0, 0) + kineticEnergy(1, v2After, 0, 0);
  if (ekAfter >= ekBefore) throw new Error('Ek should decrease when e < 1');
});

// Case 6: perfectly inelastic
runCase('Case 6: m1=m2=1, v1=5, v2=0, e=0', () => {
  const { v1After, v2After } = solve1DCollision(1, 1, 5, 0, 0);
  assertApprox(v1After, 2.5, 'v1_after');
  assertApprox(v2After, 2.5, 'v2_after');
});

// Case 7: friction slows to stop
runCase('Case 7: friction deceleration', () => {
  let v = 5;
  const mu = 0.3;
  const g = 9.8;
  const dt = 1 / 60;
  let steps = 0;
  while (Math.abs(v) > 0.01 && steps < 10000) {
    v = applyFriction1D(v, g, mu, dt);
    steps++;
  }
  assertApprox(v, 0, 'final velocity', 0.02);
});

// Case 8: both at rest
runCase('Case 8: v1=v2=0, no self-motion', () => {
  const state = { x1: -1, v1: 0, x2: 1, v2: 0 };
  const after = integrateCollision(state, 1, 1, 9.8, 0, 1 / 60);
  assertApprox(after.x1, state.x1, 'x1');
  assertApprox(after.x2, state.x2, 'x2');
  const hit = handleCollision(after, 1, 1, 1, R);
  if (hit.collided) throw new Error('should not collide when at rest and separated');
});

// Momentum conservation (μ=0, no external forces)
runCase('Momentum conserved when e=1', () => {
  const m1 = 3, m2 = 7, v1 = 4, v2 = -2;
  const pBefore = m1 * v1 + m2 * v2;
  const { v1After, v2After } = solve1DCollision(m1, m2, v1, v2, 1);
  const pAfter = m1 * v1After + m2 * v2After;
  assertApprox(pBefore, pAfter, 'momentum', 1e-10);
});

// Energy conserved when e=1
runCase('Energy conserved when e=1', () => {
  const m1 = 3, m2 = 7, v1 = 4, v2 = -2;
  const ekBefore = kineticEnergy(m1, v1, 0, 0) + kineticEnergy(m2, v2, 0, 0);
  const { v1After, v2After } = solve1DCollision(m1, m2, v1, v2, 1);
  const ekAfter = kineticEnergy(m1, v1After, 0, 0) + kineticEnergy(m2, v2After, 0, 0);
  assertApprox(ekBefore, ekAfter, 'energy', 1e-10);
});

// Simulate collision detection path
runCase('handleCollision: one_moving preset', () => {
  const x1 = -0.45;
  const x2 = 0.45;
  const state = { x1, v1: 5, x2, v2: 0 };
  const stepped = integrateCollision(state, 1, 1, 9.8, 0, 0.01);
  const overlap = handleCollision(stepped, 1, 1, 1, R);
  if (!overlap.collided) {
    // May need more steps — simulate until contact
    let s = { ...state };
    let collided = false;
    for (let i = 0; i < 500 && !collided; i++) {
      s = integrateCollision(s, 1, 1, 9.8, 0, 1 / 60);
      const r = handleCollision(s, 1, 1, 1, R);
      if (r.collided) {
        collided = true;
        assertApprox(r.state.v1, 0, 'v1_after', 0.01);
        assertApprox(r.state.v2, 5, 'v2_after', 0.01);
      } else {
        s = r.state;
      }
    }
    if (!collided) throw new Error('collision not detected within 500 steps');
  }
});

console.log('\nAll collision verification cases completed.');
