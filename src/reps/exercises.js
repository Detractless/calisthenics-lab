// The exercises in the dropdown. `measure` turns a frame into the joint angle
// that is counted; extendedDeg is "back to start", flexedDeg is "deep enough
// to count". "other" is any exercise not listed: recorded, never counted.

import { elbowAngle } from '../tracking/elbow-angle.js';
import { kneeAngle } from '../tracking/knee-angle.js';

export const DEFAULT_EXERCISE = 'squat';

export const EXERCISES = {
  squat: { label: 'Squat', measure: kneeAngle, extendedDeg: 160, flexedDeg: 110 },
  'push-up': { label: 'Push-up', measure: elbowAngle, extendedDeg: 150, flexedDeg: 100 },
  'pull-up': { label: 'Pull-up', measure: elbowAngle, extendedDeg: 150, flexedDeg: 100 },
  other: { label: '+ Other', measure: null },
};
