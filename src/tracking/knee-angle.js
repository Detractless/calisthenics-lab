// Knee angle (hip-knee-ankle) for squats: about 170° standing, smaller as you sink.

import { meanLimbAngle } from './joint-angle.js';

const LEGS = [
  { a: 23, b: 25, c: 27 },
  { a: 24, b: 26, c: 28 },
];

export const kneeAngle = (landmarks, world) => meanLimbAngle(landmarks, world, LEGS);
