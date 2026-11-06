// Turns tracked frames into a landmark CSV and downloads it.
// Only body points are exported: the video and the face points (eyes, ears,
// mouth) stay out of the file. The nose is kept for chin-over-bar checks.

export const LANDMARK_NAMES = [
  'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner',
  'right_eye', 'right_eye_outer', 'left_ear', 'right_ear', 'mouth_left',
  'mouth_right', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky', 'left_index',
  'right_index', 'left_thumb', 'right_thumb', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_heel',
  'right_heel', 'left_foot_index', 'right_foot_index',
];

const FACE_POINTS_TO_SKIP = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

const HEADER = 'time_ms,joint,x,y,z,visibility,world_x,world_y,world_z';

const format = (value) =>
  typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(5) : value;

// frames: [{ timeMs, landmarks | null, world | null }]
export function framesToCsv(frames) {
  const rows = [HEADER];
  for (const { timeMs, landmarks, world } of frames) {
    if (!landmarks || !world) continue;
    landmarks.forEach((lm, i) => {
      if (FACE_POINTS_TO_SKIP.has(i)) return;
      const w = world[i];
      rows.push(
        [timeMs, LANDMARK_NAMES[i], lm.x, lm.y, lm.z, lm.visibility, w.x, w.y, w.z]
          .map(format)
          .join(','),
      );
    });
  }
  return rows.join('\n') + '\n';
}

export function downloadCsv(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
