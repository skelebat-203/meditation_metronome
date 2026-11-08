# 0002 — App Behavior

What the app does and how it behaves. Scope and build order live in the [roadmap](0001-roadmap.md).

## Screens

### Launch screen
- **Start button**, centered. Label is `Start {word}`; `{word}` is picked at random on each app open from: recovering, relaxing, centering, breathing.
- Order, top to bottom: Start, Length, then the Metronome and Music toggles.
- **Two on/off toggles** in a row under the Length picker: Metronome, Music. They start from the saved defaults (all on by default) and apply only to the next session. Persistent changes are made in saved settings.
- **Length** picker (Session length; labeled "Length" on the launch screen) between the Start button and the toggles (replaces the former Images toggle; Images is now in Settings only). Options: off (open-ended), 5–60 min in 5-minute steps; default off. Applies to the next session only; the saved default is set in Settings. See § Session length and marks.
- On each app open, the start track and start image are chosen at random.
- **Settings button**, top right. Opens the settings screen.
- Nothing plays until the user taps Start.

### Meditation screen
- Full-screen image slideshow, music and metronome, per the toggles.
- **End button**, top left. Ends the session and returns to the launch screen (Android Back does the same).
- **Session settings button**, top right. Opens the settings screen.
- **Session timer** (if on): elapsed time since Start. With a Session length set, the timer is a button: tapping it (or Enter/Space) switches between time elapsed and time remaining (Session length minus elapsed). Default is elapsed; the choice lasts for the current session. A word label ("elapsed" / "remaining") shows the mode. Its accessible name states the mode and value; it is not a live region, and a mode change is announced once via the status region. With Session length off, the timer is not a button and shows elapsed only. It stays visible and tappable when the controls hide; a tap on it also shows the controls.
- Controls hide after a few seconds idle and reappear on tap.

### Settings screen
One screen, opened from either the launch or meditation screen. Changes are applied with one of two buttons:

| Button | Applies to |
|---|---|
| Persistent | Saved as defaults for every future session, and applied now |
| This session | The current session only (from the launch screen: the next session). Defaults unchanged |

Back without pressing either button discards the changes.

Controls:
- Music on/off, volume, and track (dropdown)
- Track preview: plays the selected track for 5 s, fades it out over 2 s, then stops. Starting another preview or leaving Settings stops it.
- Metronome on/off and volume
- Tick sound: soft click / wood block / bell
- Images on/off
- Session length: off / 5–60 min (default off)
- Marks on/off and interval: 5–60 min in 5-minute steps (default on, 5 min)
- Session timer (default off) — shows elapsed time; separate from Session length
- Keep screen awake (default on)

## Display
- Portrait and landscape. Images fill the screen and are cropped to fit; source images are at least 1920 px on the long side.

## Metronome
- 1 tick per second.
- Three tick sounds, generated with the Web Audio API (no audio files): soft click, wood block, bell.

## Session length and marks
Not a score or streak; only sound cues.
- **Session length** (countdown): when it reaches zero, the end chime plays, music and metronome fade out, and the app returns to the launch screen once the chime finishes. Off = session runs until End.
- **Marks**: a long chime every `{interval}` minutes, counted from Start. Sound only; no screen-reader announcement (the chime is the cue). No mark plays at the same moment as the end chime.
- **One beat clock**: ticks, marks and the end chime are timed on the same beat clock, counted from Start. A mark or the end chime falls exactly on a beat and replaces the tick on that beat (no tick plus chime). This holds after the tick sound changes mid-session; the chimes then use the new sound.
- **Chime sounds**: Web Audio, no files. Each is a distinct, longer version of the selected tick sound (soft click / wood block / bell). The mark chime and the end chime differ from each other, so the user can tell them apart: a mark is one strike; the end chime is three slower, lower strikes with widening gaps (2 s, then 2.5 s), each 50% longer than a mark strike. The return to the launch screen waits for the last strike to finish.
- **Test option (temporary)**: a 10-second choice in both Session length and Marks interval for manual testing. Remove before the first public release (v0.4).

## Music
- ~10 tracks, played in shuffled order (not just a random start track); reshuffled after each full pass; loops forever.
- Opus, ~48 kbps, loops of ~2–3 minutes per track.

## Images
- ~20 images, shown in shuffled order; reshuffled after each full pass.
- Each image shows for 60 s, with a 5 s cross-fade.
- With `prefers-reduced-motion`, images switch without a fade.
- WebP, sized for phone screens, ~100–150 KB each.

## Screen
- Keep screen awake during a session (default on; changeable in saved settings).
- How: the web Screen Wake Lock API (`navigator.wakeLock`), taken when a session starts with the setting on, released when the session ends or the setting is turned off, and taken back when the app returns to the foreground (the browser drops it when the page is hidden). No JavaScript-to-Android bridge (§ Platform), so Android's own keep-screen-on flag is not used.
- Limitation: WebView supports the API from version 84 (mid-2020). A device whose WebView was never updated past that has no wake lock; there the screen follows the system timeout and the app still runs. Confirmed on GrapheneOS (v0.3 step 4): the WebView grants the lock to the local page and the screen stays on.
- Device test (v0.3 step 4, GrapheneOS): switching apps or turning the screen off stops the session. Expected until background playback (v0.6).
- Turning the screen off (power button) likely stops the session; confirm in v0.3. Background playback is scoped for v0.6 (roadmap).

## Platform
- Minimum Android version: 5.0 (API 21). Avoid very new web features; Android 5–7 WebViews stopped updating in 2022–2023.
- WebView lockdown (keeps old-device risk low): loads only bundled local files; no INTERNET permission; no JavaScript-to-Android bridge; no remote content.
