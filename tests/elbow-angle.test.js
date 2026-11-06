import { test } from 'node:test';
import assert from 'node:assert/strict';
import { angleAt } from '../src/tracking/joint-angle.js';
import { elbowAngle } from '../src/tracking/elbow-angle.js';

const pt = (x, y, z = 0) => ({ x, y, z });

test('angleAt measures right, straight and folded angles', () => {
  assert.ok(Math.abs(angleAt(pt(0, 1), pt(0, 0), pt(1, 0)) - 90) < 1e-9);
  assert.ok(Math.abs(angleAt(pt(-1, 0), pt(0, 0), pt(1, 0)) - 180) < 1e-9);
  assert.ok(Math.abs(angleAt(pt(1, 0), pt(0, 0), pt(1, 0))) < 1e-6);
  assert.equal(angleAt(pt(0, 0), pt(0, 0), pt(1, 0)), null);
});

function pose({ leftVisible = 1, rightVisible = 1 } = {}) {
  const landmarks = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0, visibility: 1 }));
  const world = Array.from({ length: 33 }, () => pt(0, 0, 0));
  // Left arm straight (180), right arm bent to 90.
  [world[11], world[13], world[15]] = [pt(-1, 0), pt(0, 0), pt(1, 0)];
  [world[12], world[14], world[16]] = [pt(0, 1), pt(0, 0), pt(1, 0)];
  landmarks[15].visibility = leftVisible;
  landmarks[16].visibility = rightVisible;
  return { landmarks, world };
}

test('elbowAngle averages arms that are clearly visible', () => {
  const { landmarks, world } = pose();
  assert.ok(Math.abs(elbowAngle(landmarks, world).angle - 135) < 1e-6);
});

test('elbowAngle ignores an arm that is hidden', () => {
  const { landmarks, world } = pose({ rightVisible: 0.1 });
  assert.ok(Math.abs(elbowAngle(landmarks, world).angle - 180) < 1e-6);
});

test('elbowAngle returns null when no arm is trustworthy or no person found', () => {
  const { landmarks, world } = pose({ leftVisible: 0.1, rightVisible: 0.2 });
  assert.equal(elbowAngle(landmarks, world).angle, null);
  assert.equal(elbowAngle(null, null).angle, null);
});
