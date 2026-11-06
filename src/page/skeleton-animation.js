// Animated skeleton preview showing an example calisthenics movement (push-up)
// rendered in the exact MediaPipe joint & bone style.

export function createSkeletonAnimation(canvas) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let startTime = null;

  function render(now) {
    if (!startTime) startTime = now;
    const elapsed = (now - startTime) / 1000;

    // Smooth sinusoidal loop for a full push-up rep (approx 2.5s per rep)
    const cycle = (elapsed % 2.5) / 2.5;
    // dip ranges from 0 (lockout at top) to 1 (chest at bottom)
    const dip = (Math.sin(cycle * Math.PI * 2 - Math.PI / 2) + 1) / 2;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Subtle ground line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 105);
    ctx.lineTo(w - 30, 105);
    ctx.stroke();

    // Key coordinates based on dip
    const near = {
      shoulder: [78 + 3 * dip, 44 + 40 * dip],
      elbow: [76 + 32 * dip, 74 + 10 * dip],
      wrist: [75, 105],
      hip: [155 + 2 * dip, 58 + 30 * dip],
      knee: [186 + 1 * dip, 79 + 15 * dip],
      ankle: [214, 100],
      toe: [222, 105],
      head: [56 + 3 * dip, 38 + 40 * dip],
    };

    // Far-side limbs (offset with slight depth perspective)
    const far = {
      shoulder: [near.shoulder[0] + 10, near.shoulder[1] - 6],
      elbow: [near.elbow[0] + 10, near.elbow[1] - 6],
      wrist: [near.wrist[0] + 10, near.wrist[1] - 5],
      hip: [near.hip[0] + 8, near.hip[1] - 5],
      knee: [near.knee[0] + 6, near.knee[1] - 4],
      ankle: [near.ankle[0] + 6, near.ankle[1] - 3],
      toe: [near.toe[0] + 6, near.toe[1] - 3],
    };

    // Helper to draw bone line
    const drawBone = (p1, p2, color, width = 2.5) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    };

    // Helper to draw joint point
    const drawJoint = (p, color, radius = 3.5) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p[0], p[1], radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const FAR_BONE = 'rgba(74, 222, 128, 0.35)';
    const FAR_JOINT = 'rgba(251, 191, 36, 0.45)';
    const NEAR_BONE = '#4ade80';
    const NEAR_JOINT = '#fbbf24';

    // 1. Draw Far limbs first (background)
    drawBone(far.shoulder, far.elbow, FAR_BONE, 2);
    drawBone(far.elbow, far.wrist, FAR_BONE, 2);
    drawBone(far.hip, far.knee, FAR_BONE, 2);
    drawBone(far.knee, far.ankle, FAR_BONE, 2);
    drawBone(far.ankle, far.toe, FAR_BONE, 2);

    drawJoint(far.shoulder, FAR_JOINT, 2.5);
    drawJoint(far.elbow, FAR_JOINT, 2.5);
    drawJoint(far.wrist, FAR_JOINT, 2.5);
    drawJoint(far.hip, FAR_JOINT, 2.5);
    drawJoint(far.knee, FAR_JOINT, 2.5);
    drawJoint(far.ankle, FAR_JOINT, 2.5);

    // 2. Torso connections between sides
    drawBone(near.shoulder, far.shoulder, 'rgba(74, 222, 128, 0.5)', 2);
    drawBone(near.hip, far.hip, 'rgba(74, 222, 128, 0.5)', 2);

    // 3. Near torso and head
    drawBone(near.shoulder, near.head, NEAR_BONE, 2.5);
    drawBone(near.shoulder, near.hip, NEAR_BONE, 3);

    // 4. Near limbs
    drawBone(near.shoulder, near.elbow, NEAR_BONE, 3);
    drawBone(near.elbow, near.wrist, NEAR_BONE, 3);
    drawBone(near.hip, near.knee, NEAR_BONE, 3);
    drawBone(near.knee, near.ankle, NEAR_BONE, 3);
    drawBone(near.ankle, near.toe, NEAR_BONE, 2.5);

    // 5. Near joints
    drawJoint(near.head, '#f59e0b', 4.5); // nose / head marker
    drawJoint(near.shoulder, NEAR_JOINT, 4);
    drawJoint(near.elbow, NEAR_JOINT, 4);
    drawJoint(near.wrist, NEAR_JOINT, 3.5);
    drawJoint(near.hip, NEAR_JOINT, 4);
    drawJoint(near.knee, NEAR_JOINT, 4);
    drawJoint(near.ankle, NEAR_JOINT, 3.5);
    drawJoint(near.toe, NEAR_JOINT, 3);

    animationId = requestAnimationFrame(render);
  }

  return {
    start() {
      if (animationId) return;
      startTime = null;
      animationId = requestAnimationFrame(render);
    },
    stop() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },
  };
}
