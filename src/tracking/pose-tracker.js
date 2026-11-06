// Runs MediaPipe Pose Landmarker over an uploaded video, in the browser.
// The video is stepped frame by frame (seek, detect), so every sampled frame
// is analysed no matter how slow the device is.

import {
  FilesetResolver,
  PoseLandmarker,
} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';

export const SAMPLE_FPS = 30;

let landmarkerPromise = null;
// MediaPipe needs timestamps that keep growing across runs on one instance.
let runStartMs = 0;
let lastTimestampMs = 0;

async function createLandmarker() {
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
  const options = (delegate) => ({
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: 'VIDEO',
    numPoses: 1,
  });
  try {
    return await PoseLandmarker.createFromOptions(fileset, options('GPU'));
  } catch {
    return await PoseLandmarker.createFromOptions(fileset, options('CPU'));
  }
}

export function loadLandmarker() {
  landmarkerPromise ??= createLandmarker().catch((error) => {
    landmarkerPromise = null;
    throw error;
  });
  return landmarkerPromise;
}

function seekTo(video, timeSec) {
  return new Promise((resolve) => {
    if (Math.abs(video.currentTime - timeSec) < 0.0005 && video.readyState >= 2) {
      resolve();
      return;
    }
    video.addEventListener('seeked', resolve, { once: true });
    video.currentTime = timeSec;
  });
}

const plainPoints = (points) =>
  points?.map(({ x, y, z, visibility }) => ({ x, y, z, visibility }));

// Call once before each new video or camera run.
export function startRun() {
  runStartMs = lastTimestampMs + 1000;
}

// Finds the body in the current video frame. timeMs is time since the run
// started. Returns { timeMs, landmarks, world }; both are null when no person
// was found.
export function detectFrame(landmarker, video, timeMs) {
  lastTimestampMs = Math.max(runStartMs + timeMs, lastTimestampMs + 1);
  const result = landmarker.detectForVideo(video, lastTimestampMs);
  return {
    timeMs,
    landmarks: plainPoints(result.landmarks[0]) ?? null,
    world: plainPoints(result.worldLandmarks[0]) ?? null,
  };
}

// Steps through an uploaded video. Returns [{ timeMs, landmarks, world }];
// onFrame(frame, fractionDone) runs per frame.
export async function trackVideo(video, { onFrame, signal } = {}) {
  const landmarker = await loadLandmarker();
  startRun();
  const frameCount = Math.floor(video.duration * SAMPLE_FPS);
  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    signal?.throwIfAborted();
    const timeMs = Math.round((i / SAMPLE_FPS) * 1000);
    await seekTo(video, timeMs / 1000);
    const frame = detectFrame(landmarker, video, timeMs);
    frames.push(frame);
    onFrame?.(frame, (i + 1) / frameCount);
  }
  return frames;
}
