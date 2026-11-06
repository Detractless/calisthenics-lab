// The glass results panel: rep total, per-rep table and angle chart.

import { countReps } from '../reps/rep-counter.js';
import { drawAngleChart } from './angle-chart.js';

const $ = (id) => document.getElementById(id);

let chart = null; // what the chart shows, kept so it can be redrawn on resize

export function hideResults() {
  $('results').hidden = true;
  const otherField = $('other-exercise-field');
  if (otherField) otherField.hidden = true;
  chart = null;
}

export function redrawChart() {
  if (chart) drawAngleChart($('angle-chart'), chart.smoothed, chart.reps, chart.limits);
}

// For an exercise that is not in the list: nothing to count, just confirm the recording.
export function showRecordingOnly(durationMs, customName = '') {
  chart = null;
  $('headline-value').textContent = `${(durationMs / 1000).toFixed(0)} s`;
  $('headline-label').textContent = customName ? `recorded (${customName})` : 'recorded';
  $('rep-details').hidden = true;
  const otherField = $('other-exercise-field');
  if (otherField) {
    otherField.hidden = false;
    const input = $('custom-exercise-input');
    if (input) {
      input.value = customName;
      setTimeout(() => input.focus(), 50);
    }
  }
  $('results').hidden = false;
}

// samples: [{ timeMs, angle | null }]. Returns the summary { counted, valid, review, partial }.
export function showResults(samples, limits) {
  const otherField = $('other-exercise-field');
  if (otherField) otherField.hidden = true;

  const { reps, smoothed, summary } = countReps(samples, limits);

  $('headline-value').textContent = summary.counted;
  $('headline-label').textContent = summary.counted === 1 ? 'rep' : 'reps';
  for (const name of ['valid', 'review', 'partial']) {
    $(`stat-${name}`).textContent = summary[name];
  }

  const rows = reps.map((rep) => {
    const row = document.createElement('tr');
    const cells = [
      rep.number ?? '–',
      `${(rep.timeMs / 1000).toFixed(1)} s`,
      `${Math.round(rep.minAngle)}°`,
      rep.status,
    ];
    cells.forEach((text, i) => {
      const cell = row.insertCell();
      cell.textContent = text;
      if (i === 3) cell.className = `status-${rep.status}`;
    });
    return row;
  });
  $('rep-rows').replaceChildren(...rows);

  $('rep-details').hidden = false;
  $('results').hidden = false;
  chart = { smoothed, reps, limits };
  redrawChart();
  return summary;
}
