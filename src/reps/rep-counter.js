// Counts reps from a joint-angle signal (elbow or knee).
//
// A rep starts when the joint leaves the "straight" angle and ends when it gets
// back to it. It is valid if the angle reached the "bent" angle on the way.
// The joint must straighten again before the next rep can start, so half reps
// do not pile up as extra counts.

const SMOOTH_RADIUS = 2; // frames on each side
const PARTIAL_DROP_DEG = 30; // dip this far below "straight" to count as an attempt
const REVIEW_GAP_SHARE = 0.3; // too many untrusted frames inside a rep -> review

// Centred moving average that ignores frames without a trusted angle.
export function smoothAngles(samples, radius = SMOOTH_RADIUS) {
  return samples.map((sample, i) => {
    if (sample.angle === null) return sample;
    let sum = 0;
    let count = 0;
    const end = Math.min(samples.length - 1, i + radius);
    for (let j = Math.max(0, i - radius); j <= end; j++) {
      if (samples[j].angle !== null) {
        sum += samples[j].angle;
        count++;
      }
    }
    return { ...sample, angle: sum / count };
  });
}

// samples: [{ timeMs, angle | null }] in time order.
// Returns { reps, smoothed, summary }. Each rep has a status:
//   valid   - reached the bent angle with clear tracking
//   review  - reached it, but tracking was unreliable for part of the rep
//   partial - dipped but never reached the bent angle (not counted)
export function countReps(samples, { extendedDeg, flexedDeg }) {
  const smoothed = smoothAngles(samples);
  const attempts = [];
  let armed = false;
  let cycle = null;

  const finishCycle = () => {
    if (!cycle) return;
    const reached = cycle.minAngle <= flexedDeg;
    const dipped = cycle.minAngle <= extendedDeg - PARTIAL_DROP_DEG;
    if (reached || dipped) {
      const gapShare = cycle.gaps / (cycle.gaps + cycle.frames);
      attempts.push({
        status: !reached ? 'partial' : gapShare > REVIEW_GAP_SHARE ? 'review' : 'valid',
        timeMs: cycle.minMs,
        minAngle: cycle.minAngle,
      });
    }
    cycle = null;
  };

  for (const sample of smoothed) {
    if (sample.angle === null) {
      if (cycle) cycle.gaps++;
    } else if (sample.angle >= extendedDeg) {
      finishCycle();
      armed = true;
    } else if (armed) {
      cycle ??= { minAngle: sample.angle, minMs: sample.timeMs, frames: 0, gaps: 0 };
      cycle.frames++;
      if (sample.angle < cycle.minAngle) {
        cycle.minAngle = sample.angle;
        cycle.minMs = sample.timeMs;
      }
    }
  }
  finishCycle();

  let counted = 0;
  const reps = attempts.map((a) => ({ ...a, number: a.status === 'partial' ? null : ++counted }));
  const total = (status) => reps.filter((r) => r.status === status).length;
  return {
    reps,
    smoothed,
    summary: {
      counted,
      valid: total('valid'),
      review: total('review'),
      partial: total('partial'),
    },
  };
}
