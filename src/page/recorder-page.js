// Wires the page together: allow the camera, record a set, count reps, show
// the results, download the landmarks CSV.

import { DEFAULT_EXERCISE, EXERCISES } from '../reps/exercises.js';
import { countReps } from '../reps/rep-counter.js';
import { drawSkeleton } from './skeleton-drawer.js';
import { downloadCsv, framesToCsv } from './csv-export.js';
import { hideResults, redrawChart, showRecordingOnly, showResults } from './results-panel.js';
import { MAX_RECORDING_MS, openTrackingSession } from './camera-session.js';
import { createExerciseMenu } from './exercise-menu.js';

const $ = (id) => document.getElementById(id);
const video = $('video');
const overlay = $('overlay');
const primary = $('primary');
const live = $('live');
const statusText = $('status');

const CAMERA_ERRORS = {
  NotAllowedError: 'Camera permission was blocked. Allow the camera in your browser, then try again.',
  NotFoundError: 'No camera was found on this device.',
  NotReadableError: 'Another app is using the camera. Close it and try again.',
};

// The one button at the top changes with the stage.
const PRIMARY_BUTTON = {
  off: { text: 'Allow camera to track body position', className: 'primary' },
  starting: { text: 'Starting camera…', className: 'primary', disabled: true },
  ready: { text: 'Record', className: 'primary is-record' },
  countdown: { text: 'Cancel', className: 'primary' },
  recording: { text: 'Stop', className: 'primary is-stop' },
};

let stage = 'off'; // key of PRIMARY_BUTTON
let session = null;
let stopRecording = null;
let frames = [];
let savedExercise = DEFAULT_EXERCISE; // exercise of the last recording, for "download again"
let liveExercise = null; // exercise and samples of the recording in progress
let liveSamples = [];

const menu = createExerciseMenu($('exercise-menu'), EXERCISES, {
  initial: DEFAULT_EXERCISE,
  onChange: () => setStatus(''),
});

function setStatus(message) {
  statusText.textContent = message;
  statusText.hidden = !message;
}

function setStage(next) {
  stage = next;
  const { text, className, disabled = false } = PRIMARY_BUTTON[next];
  primary.textContent = text;
  primary.className = className;
  primary.disabled = disabled;
  menu.setDisabled(next !== 'off' && next !== 'ready');
  if (next !== 'countdown' && next !== 'recording') live.hidden = true;
}

function showLive(text, { big = false } = {}) {
  live.hidden = false;
  live.className = big ? 'live countdown' : 'live';
  live.textContent = text;
}

const clock = (ms) => {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
const plural = (n) => `${n} rep${n === 1 ? '' : 's'}`;

const toSample = (frame, exercise) => ({
  timeMs: frame.timeMs,
  angle: exercise.measure(frame.landmarks, frame.world).angle,
});

function saveCsv() {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  downloadCsv(framesToCsv(frames), `landmarks-${savedExercise}-${stamp}.csv`);
}

function endSession(message) {
  session?.close();
  session = null;
  stopRecording = null;
  drawSkeleton(overlay, null);
  setStage('off');
  if (message) setStatus(message);
}

// ---- Camera ----

async function startCamera() {
  hideResults();
  frames = [];
  setStatus('');
  setStage('starting');
  try {
    session = await openTrackingSession(video, handleLiveFrame);
  } catch (error) {
    setStage('off');
    setStatus(CAMERA_ERRORS[error.name] ?? `Could not start the camera: ${error.message}`);
    return;
  }
  session.failure.catch((error) => {
    stopRecording?.();
    endSession(`Tracking stopped: ${error.message}`);
  });
  setStage('ready');
  setStatus('Step back so your whole body is in view, then press Record.');
}

function handleLiveFrame(frame, recorded) {
  if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
  }
  drawSkeleton(overlay, frame.landmarks);
  if (!recorded || !liveExercise) return;
  if (!liveExercise.measure) {
    showLive(clock(frame.timeMs));
    return;
  }
  liveSamples.push(toSample(frame, liveExercise));
  showLive(plural(countReps(liveSamples, liveExercise).summary.counted));
}

function showCountdown(left) {
  if (left > 0) {
    showLive(left, { big: true });
    return;
  }
  setStage('recording');
  setStatus('');
  showLive(liveExercise.measure ? '0 reps' : '0:00');
}

// ---- Recording ----

async function record() {
  const key = menu.value();
  liveExercise = EXERCISES[key];
  liveSamples = [];
  const stop = new AbortController();
  stopRecording = () => stop.abort();
  setStatus('');
  setStage('countdown');

  let outcome;
  try {
    outcome = await session.record({ stopSignal: stop.signal, onCountdown: showCountdown });
  } catch (error) {
    endSession(`Tracking stopped: ${error.message}`);
    return;
  }
  if (!session) return; // tracking broke and the page already reset itself
  if (outcome.reason === 'cancelled') {
    setStage('ready');
    setStatus('Cancelled. Nothing was saved.');
    return;
  }
  // The set is over: turn the camera off before showing anything.
  endSession();
  finishRecording(outcome, key);
}

function finishRecording({ frames: recorded, reason }, key) {
  if (recorded.length === 0) {
    setStatus('Nothing was recorded.');
    return;
  }
  frames = recorded;
  savedExercise = key;
  const exercise = EXERCISES[key];
  if (exercise.measure) showResults(frames.map((f) => toSample(f, exercise)), exercise);
  else showRecordingOnly(frames[frames.length - 1].timeMs);
  saveCsv();

  const notes = ['CSV downloaded.'];
  const seenShare = frames.filter((f) => f.landmarks).length / frames.length;
  if (seenShare < 0.5) notes.push('Your body was seen in under half the frames. Step back so your whole body is in view.');
  if (reason === 'timeout') notes.push(`Recording stopped at the ${MAX_RECORDING_MS / 60000}-minute limit.`);
  setStatus(notes.join(' '));
}

// ---- Controls ----

primary.addEventListener('click', () => {
  if (stage === 'off') startCamera();
  else if (stage === 'ready') record();
  else if (stage === 'countdown' || stage === 'recording') stopRecording?.();
});
$('results-close').addEventListener('click', () => {
  hideResults();
  setStatus('');
});
$('download').addEventListener('click', saveCsv);
window.addEventListener('resize', redrawChart);

setStage('off');
