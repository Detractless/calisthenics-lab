// Joint angle per limb from MediaPipe pose landmarks.
// Geometry uses world landmarks (metres, hip-centred), which depend less on
// camera angle than flat image coordinates. Visibility comes from the image
// landmarks.

export const MIN_VISIBILITY = 0.5;

// Angle in degrees at point b, between the lines b->a and b->c.
export function angleAt(a, b, c) {
  const v1 = [a.x - b.x, a.y - b.y, a.z - b.z];
  const v2 = [c.x - b.x, c.y - b.y, c.z - b.z];
  const length = Math.hypot(...v1) * Math.hypot(...v2);
  if (length === 0) return null;
  const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  return (Math.acos(Math.min(1, Math.max(-1, dot / length))) * 180) / Math.PI;
}

function readLimb(landmarks, world, { a, b, c }) {
  const confidence = Math.min(...[a, b, c].map((i) => landmarks[i].visibility ?? 0));
  return { angle: angleAt(world[a], world[b], world[c]), confidence };
}

// limbs: [{ a, b, c }] landmark indices, the angle is measured at b.
// Returns the mean angle of the limbs that are clearly visible, or
// angle: null when none is trustworthy, so the rep counter can skip the frame.
export function meanLimbAngle(landmarks, world, limbs) {
  if (!landmarks || !world) return { angle: null, confidence: 0 };
  const readings = limbs.map((limb) => readLimb(landmarks, world, limb));
  const usable = readings.filter(
    (r) => r.angle !== null && r.confidence >= MIN_VISIBILITY,
  );
  if (usable.length === 0) {
    return { angle: null, confidence: Math.max(...readings.map((r) => r.confidence)) };
  }
  return {
    angle: usable.reduce((sum, r) => sum + r.angle, 0) / usable.length,
    confidence: Math.max(...usable.map((r) => r.confidence)),
  };
}
