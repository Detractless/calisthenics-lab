import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kneeAngle } from '../src/tracking/knee-angle.js';
import { countReps } from '../src/reps/rep-counter.js';
import { EXERCISES } from '../src/reps/exercises.js';

const pt = (x, y, z = 0) => ({ x, y, z });

// Both legs: hip straight above the knee, ankle placed so the knee angle is `deg`.
function legs(deg) {
  const landmarks = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0, visibility: 1 }));
  const world = Array.from({ length: 33 }, () => pt(0, 0, 0));
  const rad = (deg * Math.PI) / 180;
  const ankle = pt(Math.sin(rad), Math.cos(rad));
  for (const [hip, knee, foot] of [[23, 25, 27], [24, 26, 28]]) {
    world[hip] = pt(0, 1);
    world[knee] = pt(0, 0);
    world[foot] = ankle;
  }
  return { landmarks, world };
}

const angleOf = (deg) => {
  const { landmarks, world } = legs(deg);
  return kneeAngle(landmarks, world).angle;
};

test('kneeAngle measures hip-knee-ankle', () => {
  assert.ok(Math.abs(angleOf(90) - 90) < 1e-6);
  assert.ok(Math.abs(angleOf(170) - 170) < 1e-6);
});

test('kneeAngle returns null without a person or without visible legs', () => {
  assert.equal(kneeAngle(null, null).angle, null);
  const { landmarks, world } = legs(90);
  for (const i of [27, 28]) landmarks[i].visibility = 0.1;
  assert.equal(kneeAngle(landmarks, world).angle, null);
});

test('the squat limits count a deep squat and ignore a shallow dip', () => {
  const { measure, ...limits } = EXERCISES.squat;
  // Knee angle keyframes: stand, deep squat, stand, shallow dip, stand (15 frames apart).
  const keyframes = [170, 95, 170, 140, 170];
  const degrees = [];
  for (let k = 0; k < keyframes.length - 1; k++) {
    for (let step = 0; step < 15; step++) {
      degrees.push(keyframes[k] + ((keyframes[k + 1] - keyframes[k]) * step) / 15);
    }
  }
  degrees.push(170);
  const samples = degrees.map((deg, i) => ({ timeMs: i * 33, angle: angleOf(deg) }));
  const { summary } = countReps(samples, limits);
  assert.equal(measure, kneeAngle);
  assert.equal(summary.counted, 1);
  assert.equal(summary.partial, 0);
});

test('"other" has no measure, so nothing is counted', () => {
  assert.equal(EXERCISES.other.measure, null);
});
