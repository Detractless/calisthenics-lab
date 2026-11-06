// Live camera access. The camera picture goes only to the hidden <video>
// element and MediaPipe: it is never drawn, recorded or uploaded.

import { detectFrame, startRun } from './pose-tracker.js';

export async function requestCameraPermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('The camera needs a secure page (https:// or localhost).');
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });
  // Immediately release camera tracks after confirming permission
  stream.getTracks().forEach((track) => track.stop());
}

export async function openCamera(video) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('The camera needs a secure page (https:// or localhost).');
  }
  video.srcObject = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });
  await video.play();
}

export function closeCamera(video) {
  video.srcObject?.getTracks().forEach((track) => track.stop());
  video.srcObject = null;
}

// Tracks the body on every new camera frame until `signal` aborts.
// onFrame gets { timeMs, landmarks, world }, timeMs counted from this call.
export function runLiveTracking(landmarker, video, { onFrame, signal }) {
  startRun();
  const startedAt = performance.now();
  let lastVideoTime = -1;
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (signal.aborted) {
        resolve();
        return;
      }
      try {
        if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          onFrame(detectFrame(landmarker, video, Math.round(performance.now() - startedAt)));
        }
      } catch (error) {
        reject(error);
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}
