// A camera session: open the camera once, track the body live, and record
// sets on request. Only landmark frames are kept, never camera pictures.

import { loadLandmarker } from '../tracking/pose-tracker.js';
import { closeCamera, openCamera, runLiveTracking } from '../tracking/camera-recorder.js';

export const COUNTDOWN_SECONDS = 3;
export const MAX_RECORDING_MS = 3 * 60 * 1000;

// Resolves after `ms`, or sooner if the signal aborts. Returns true if it timed out.
function waitFor(ms, signal) {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve(false);
      return;
    }
    const finish = (timedOut) => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      resolve(timedOut);
    };
    const onAbort = () => finish(false);
    const timer = setTimeout(() => finish(true), ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

// Opens the camera and starts tracking. onFrame(frame, recorded) is called for
// every frame: recorded is true once a recording is running (timeMs then counts
// from the end of the countdown). Returns { record, failure, close }:
//   record({ stopSignal, onCountdown }) -> { frames, reason }, reason is
//     'stopped' | 'timeout' | 'cancelled'. Aborting stopSignal stops the
//     recording, or cancels it during the countdown.
//   failure - rejects if tracking breaks later on.
//   close() - turns the camera off.
export async function openTrackingSession(video, onFrame) {
  const landmarkerReady = loadLandmarker();
  landmarkerReady.catch(() => {}); // real errors surface at the await below
  let landmarker;
  try {
    await openCamera(video);
    landmarker = await landmarkerReady;
  } catch (error) {
    closeCamera(video);
    throw error;
  }

  let recording = null; // { frames, from } while a recording runs
  let latestMs = 0;
  const trackingStop = new AbortController();
  const tracking = runLiveTracking(landmarker, video, {
    signal: trackingStop.signal,
    onFrame: (frame) => {
      latestMs = frame.timeMs;
      if (!recording) {
        onFrame(frame, false);
        return;
      }
      const recorded = { ...frame, timeMs: frame.timeMs - recording.from };
      recording.frames.push(recorded);
      onFrame(recorded, true);
    },
  });
  const failure = tracking.then(() => new Promise(() => {}));
  failure.catch(() => {});

  const close = () => {
    trackingStop.abort();
    closeCamera(video);
  };

  async function record({ stopSignal, onCountdown }) {
    const run = async () => {
      for (let left = COUNTDOWN_SECONDS; left > 0; left--) {
        onCountdown(left);
        await waitFor(1000, stopSignal);
        if (stopSignal.aborted) return { frames: [], reason: 'cancelled' };
      }
      onCountdown(0);
      const frames = [];
      recording = { frames, from: latestMs };
      const timedOut = await waitFor(MAX_RECORDING_MS, stopSignal);
      return { frames, reason: timedOut ? 'timeout' : 'stopped' };
    };
    try {
      return await Promise.race([run(), failure]);
    } finally {
      recording = null;
    }
  }

  return { record, failure, close };
}
