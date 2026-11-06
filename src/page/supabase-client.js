// Client configuration and write-only upload for Supabase

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://fqtspwfivookcxreoeyh.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_itzOkpqAHTR4GSFbKKq1cg_CqVxtl2u';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Uploads an anonymized movement recording to Supabase.
 * Only writes skeletal coordinate data; never photos or video.
 */
export async function uploadRecording({
  exercise,
  durationMs,
  repsCounted = 0,
  repsValid = 0,
  repsReview = 0,
  repsPartial = 0,
  landmarksCsv,
}) {
  try {
    const { error } = await supabase.from('recordings').insert([
      {
        exercise,
        duration_ms: durationMs,
        reps_counted: repsCounted,
        reps_valid: repsValid,
        reps_review: repsReview,
        reps_partial: repsPartial,
        landmarks_csv: landmarksCsv,
      },
    ]);
    if (error) {
      console.warn('Supabase recording upload not completed:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.warn('Supabase request failed:', err);
    return { success: false, error: err.message };
  }
}
