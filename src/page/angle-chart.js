// Plots the smoothed joint angle over time, with the two rep thresholds and a
// dot for every rep, so it is clear why a rep was or was not counted.

const MAX_DEG = 180;
const STATUS_COLORS = { valid: '#4ade80', review: '#fbbf24', partial: '#94a3b8' };

export function drawAngleChart(canvas, smoothed, reps, { extendedDeg, flexedDeg }) {
  const scale = window.devicePixelRatio || 1;
  const width = canvas.clientWidth * scale;
  const height = canvas.clientHeight * scale;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  if (smoothed.length < 2) return;

  const pad = 8 * scale;
  const endMs = smoothed[smoothed.length - 1].timeMs || 1;
  const x = (ms) => pad + (ms / endMs) * (width - 2 * pad);
  const y = (deg) => height - pad - (deg / MAX_DEG) * (height - 2 * pad);

  ctx.font = `${11 * scale}px system-ui, sans-serif`;
  ctx.lineWidth = scale;
  ctx.setLineDash([4 * scale, 4 * scale]);
  ctx.strokeStyle = '#64748b';
  ctx.fillStyle = '#94a3b8';
  for (const [deg, label] of [[extendedDeg, 'straight'], [flexedDeg, 'bent']]) {
    ctx.beginPath();
    ctx.moveTo(pad, y(deg));
    ctx.lineTo(width - pad, y(deg));
    ctx.stroke();
    ctx.fillText(`${label} ${deg}°`, pad + 4 * scale, y(deg) - 4 * scale);
  }
  ctx.setLineDash([]);

  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  let penDown = false;
  for (const { timeMs, angle } of smoothed) {
    if (angle === null) {
      penDown = false;
      continue;
    }
    if (penDown) ctx.lineTo(x(timeMs), y(angle));
    else ctx.moveTo(x(timeMs), y(angle));
    penDown = true;
  }
  ctx.stroke();

  for (const rep of reps) {
    ctx.fillStyle = STATUS_COLORS[rep.status];
    ctx.beginPath();
    ctx.arc(x(rep.timeMs), y(rep.minAngle), 5 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}
