import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countReps } from '../src/reps/rep-counter.js';

const LIMITS = { extendedDeg: 150, flexedDeg: 100 };
const FPS = 30;

// Builds a signal: each segment is [lowestAngle, frames] and goes
// 170 -> lowest -> 170 (a smooth dip), with a few straight frames between.
function signal(segments, { start = [], gapAt = [] } = {}) {
  const angles = [...start];
  for (const [lowest, length] of segments) {
    angles.push(170, 170, 170);
    for (let i = 0; i < length; i++) {
      angles.push(170 - (170 - lowest) * Math.sin((Math.PI * (i + 1)) / (length + 1)));
    }
  }
  angles.push(170, 170, 170);
  return angles.map((angle, i) => ({
    timeMs: Math.round((i / FPS) * 1000),
    angle: gapAt.includes(i) ? null : angle,
  }));
}

test('counts ten full reps', () => {
  const { summary, reps } = countReps(signal(Array(10).fill([60, 40])), LIMITS);
  assert.equal(summary.counted, 10);
  assert.equal(summary.valid, 10);
  assert.deepEqual(reps.map((r) => r.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('half reps are partial and not counted', () => {
  const { summary } = countReps(signal([[60, 40], [115, 40], [60, 40]]), LIMITS);
  assert.equal(summary.counted, 2);
  assert.equal(summary.partial, 1);
});

test('tiny wobbles are ignored', () => {
  const { reps } = countReps(signal([[145, 40], [60, 40]]), LIMITS);
  assert.equal(reps.length, 1);
});

test('no lockout between dips counts once', () => {
  const angles = [170, 170, 170, 80, 120, 80, 120, 80, 170, 170].map((angle, i) => ({
    timeMs: i * 33,
    angle,
  }));
  const { summary } = countReps(angles, { extendedDeg: 150, flexedDeg: 100 });
  assert.equal(summary.counted, 1);
});

test('video that starts bent waits for the first lockout', () => {
  const start = [60, 70, 90, 120, 160];
  const { summary } = countReps(signal([[60, 40]], { start }), LIMITS);
  assert.equal(summary.counted, 1);
});

test('rep that ends the video at the top still counts', () => {
  const angles = [170, 170, 170, 140, 100, 70, 60, 60].map((angle, i) => ({
    timeMs: i * 33,
    angle,
  }));
  assert.equal(countReps(angles, LIMITS).summary.counted, 1);
});

test('rep with mostly untrusted frames is flagged for review', () => {
  const clean = signal([[60, 40]]);
  const gappy = clean.map((s, i) => (i > 5 && i < 40 && i % 2 ? { ...s, angle: null } : s));
  const { summary } = countReps(gappy, LIMITS);
  assert.equal(summary.counted, 1);
  assert.equal(summary.review, 1);
});

test('empty and all-null signals count nothing', () => {
  assert.equal(countReps([], LIMITS).summary.counted, 0);
  const nulls = [0, 1, 2].map((i) => ({ timeMs: i, angle: null }));
  assert.equal(countReps(nulls, LIMITS).summary.counted, 0);
});
