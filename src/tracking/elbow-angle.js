// Elbow angle (shoulder-elbow-wrist) for pull-ups and push-ups.

import { meanLimbAngle } from './joint-angle.js';

const ARMS = [
  { a: 11, b: 13, c: 15 },
  { a: 12, b: 14, c: 16 },
];

export const elbowAngle = (landmarks, world) => meanLimbAngle(landmarks, world, ARMS);
