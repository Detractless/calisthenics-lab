# Prompt: invite video for calisthenics people

Copy everything below the line and give it to the video agent.

---

Make a short video (60–90 seconds, 16:9, with captions) that invites people who do calisthenics to record themselves doing their moves, so we can teach a free, open-source movement tracker what good reps look like. Return a voiceover script with timestamps, a shot list, and the video itself if you can render it.

## Who is watching

Someone who trains: a beginner who knows their push-ups, or a master doing one-arm pull-ups. Not a programmer. Speak to them directly ("you"), warm and plain, like a training partner. No tech words. If you must name a tool, explain it in half a sentence.

## What we want them to do

Open the project's GitHub page, open the tracker in the browser, press Record, do a set of an exercise they know well, and press Stop. No account, no sign-up, no download. Anyone with a few free minutes can do it. Show those steps on screen using real screen recordings of the app. Do not show or say a local address like "localhost"; the viewer only needs the GitHub link.

Then tell them what happens next: within a couple of days of new recordings arriving, the counting for that exercise should get noticeably better and more accurate. Say it as the goal ("this is how it improves"), not as a guarantee, and show no numbers.

## Why they should care (the pitch)

- The tracker watches your camera and counts your reps. Right now it knows squats, push-ups and pull-ups, and it has a "+ Other" mode for any move it doesn't know yet.
- The goal is a shared library of real movement that any app can use. Think a game where a one-arm push-up reloads your weapon, a workout log that counts for you, or a coach that checks your form. Show these as "ideas for what's possible", labeled as ideas.
- Real athletes make it better. When you finish a set, the body-point numbers are saved to a shared library automatically. The tracker compares many people doing the same move to find the middle ground: where a real rep begins, and where a half-rep or a different move is not that exercise anymore. The more bodies, styles and skill levels it sees, the fairer and smarter that line gets. Skilled people are especially welcome: advanced moves are the ones it doesn't know yet.
- Give advanced athletes their own beat. If you can do a planche, a one-arm push-up, a front lever or a muscle-up, you can teach it a move almost nobody has shown it, in one short set. Say why this beats YouTube: online videos come from random camera angles and have text slapped over the body, so they teach a tracker very little. A clean recording of you, straight on, is far more useful. Tell them to keep their whole body in view, film from the side or front, and do a few clean reps.
- Explain it in plain words: "It learns from all of us what a good push-up looks like, so it doesn't just guess."

## Privacy (give it its own clear moment)

Say it simply, and show it on screen:
- Your face and your room are never recorded. The screen shows only a skeleton of dots and lines, not your picture.
- No video or photo of you is ever kept or sent. The only thing saved is a small file of body-point numbers (dots on a skeleton), and that is what goes to the shared library. It cannot be turned back into your face or your room.
- Say plainly, on screen, that this file is shared automatically after each set, so nobody is surprised.
- It's open source. Anyone can read exactly what it does, and we invite you to check.

The automatic sharing (stored in Supabase) is the plan and may not be live when this video is made. Write the script as "here is how it works", and put a note at the top of your output saying the upload must be live before the video goes public. Do not mention accuracy numbers, user counts or results we don't have.

## Look and feel

Minimal. This is the most important style rule: the video must feel calm, clean and uncluttered.
- Dark graphite background (about `#2a2c31` to `#141518`), soft glass panels, white text, one accent color, matching the app.
- One idea per scene. Lots of empty space. At most one short line of on-screen text at a time. No stock footage collages, no busy animations, no flashy transitions, no background music that competes with the voice.
- Start with a person training, not a logo.
- End with one clear call to action: "Record a set." plus the project name and GitHub link.

## Output format

Voiceover script with timing, shot list, and a list of clips to record. If you can't render the video, say so and list what is ready.
