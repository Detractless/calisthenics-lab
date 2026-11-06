// Draws the body skeleton over the video. Face points are not drawn except the
// nose; faint lines mean MediaPipe is unsure about that joint.

const BODY_LINES = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
  [15, 17], [15, 19], [15, 21], [17, 19],
  [16, 18], [16, 20], [16, 22], [18, 20],
  [27, 29], [29, 31], [27, 31], [28, 30], [30, 32], [28, 32],
];
const DRAWN_POINTS = [0, ...new Set(BODY_LINES.flat())];

export function drawSkeleton(canvas, landmarks) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks) return;

  const toPixels = (p) => [p.x * canvas.width, p.y * canvas.height];
  const lineWidth = Math.max(2, canvas.width / 250);
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  ctx.strokeStyle = '#4ade80';
  for (const [a, b] of BODY_LINES) {
    const confidence = Math.min(landmarks[a].visibility, landmarks[b].visibility);
    if (confidence < 0.2) continue;
    ctx.globalAlpha = Math.min(1, confidence + 0.2);
    ctx.beginPath();
    ctx.moveTo(...toPixels(landmarks[a]));
    ctx.lineTo(...toPixels(landmarks[b]));
    ctx.stroke();
  }

  ctx.fillStyle = '#fbbf24';
  for (const i of DRAWN_POINTS) {
    if (landmarks[i].visibility < 0.2) continue;
    ctx.globalAlpha = Math.min(1, landmarks[i].visibility + 0.2);
    ctx.beginPath();
    ctx.arc(...toPixels(landmarks[i]), lineWidth * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
