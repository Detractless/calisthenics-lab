# Rep tracker

Browser-only rep counter for squats, push-ups and pull-ups. MediaPipe Pose
Landmarker tracks the body on your device. The camera picture is never shown,
saved or uploaded: the screen shows only a skeleton.

## Run it

```
npm start        # serves http://localhost:8000
npm test         # rep-counter, elbow-angle and knee-angle tests (Node 20+)
```

1. Press **Allow camera to track body position** (top centre).
2. Pick the exercise in the dropdown at the top right (default Squat).
3. Press **Record**, get in position during the 3-second countdown, do your
   set, press **Stop**. Cancel during the countdown to go back.
4. The camera turns off, the rep count appears in a glass panel, and a
   landmarks CSV downloads.

Recording stops by itself after 3 minutes. The camera needs `localhost` or
`https://` (GitHub Pages is fine). Keep your whole body in view.

**+ Other** is for any exercise not in the list: it records the CSV only and
counts nothing.

## How a rep is counted

1. MediaPipe gives 33 body points per camera frame.
2. A joint angle is computed from the 3D world points: knee (hip-knee-ankle)
   for squats, elbow (shoulder-elbow-wrist) for push-ups and pull-ups. Limbs
   the camera cannot see clearly are ignored.
3. A rep starts when the joint leaves "straight" and counts when it reaches
   "bent". The joint must straighten again before the next rep. The angles
   per exercise are in `src/reps/exercises.js` (squat 160° / 110°,
   push-up and pull-up 150° / 100°).
4. Statuses: **valid**, **review** (tracking unreliable mid-rep), **partial**
   (dipped but never reached "bent", not counted).

## Landmarks CSV

`time_ms,joint,x,y,z,visibility,world_x,world_y,world_z`. Body points only: the
eye, ear and mouth points are left out. The nose is kept.

## Layout

- `src/tracking/` MediaPipe, camera access, joint angles
- `src/reps/` exercise list and rep counting
- `src/page/` the page: wiring, camera session, dropdown, results, skeleton, CSV
- `tests/` Node tests for the counting and angle maths

`trackVideo` in `src/tracking/pose-tracker.js` can still analyze a video file
frame by frame (no page uses it now); it is meant for testing against
human-labeled clips.

## Next phases

- Supabase: optional "share this recording" upload and a personal library.
- On-demand Claude review of `review` / `partial` reps (owner-triggered GitHub
  Action or local Claude Code), reading the CSVs.

## License

[MIT](LICENSE)
