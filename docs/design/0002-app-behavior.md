# 0002 — App Behavior

What the app does and how it behaves. Scope and build order live in the [roadmap](0001-roadmap.md).

## Screens

### Launch screen
- **Start button**, centered. Label is `Start {word}`; `{word}` is picked at random on each app open from: recovering, relaxing, centering, breathing.
- **Two on/off toggles** in a row under the Start button: Music, Metronome. They start from the saved defaults (all on by default) and apply only to the next session. Persistent changes are made in saved settings.
- **Session length** picker beside the toggles (replaces the former Images toggle; Images is now in Settings only). Options: off (open-ended), 5–60 min in 5-minute steps; default off. Applies to the next session only; the saved default is set in Settings. See § Session length and marks.
- On each app open, the start track and start image are chosen at random.
- **Settings button**, top right. Opens the settings screen.
- Nothing plays until the user taps Start.

### Meditation screen
- Full-screen image slideshow, music and metronome, per the toggles.
- **End button**, top left. Ends the session and returns to the launch screen (Android Back does the same).
- **Session settings button**, top right. Opens the settings screen.
- **Session timer** (if on): elapsed time since Start.
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
- **Marks**: a long chime every `{interval}` minutes, counted from Start. No mark plays at the same moment as the end chime.
- **One beat clock**: ticks, marks and the end chime are timed on the same beat clock, counted from Start. A mark or the end chime falls exactly on a beat and replaces the tick on that beat (no tick plus chime). This holds after the tick sound changes mid-session; the chimes then use the new sound.
- **Chime sounds**: Web Audio, no files. Each is a distinct, longer version of the selected tick sound (soft click / wood block / bell). The mark chime and the end chime differ from each other, so the user can tell them apart.
- **Test option (temporary)**: a 10-second choice in both Session length and Marks interval for manual testing. Remove before the first public release (v0.4).

## Music
- ~10 tracks, played in a continuous loop.
- Opus, ~48 kbps, loops of ~2–3 minutes per track.

## Images
- ~20 images, shown in shuffled order; reshuffled after each full pass.
- Each image shows for 60 s, with a 5 s cross-fade.
- With `prefers-reduced-motion`, images switch without a fade.
- WebP, sized for phone screens, ~100–150 KB each.

## Screen
- Keep screen awake during a session (default on; changeable in saved settings).
- Turning the screen off (power button) likely stops the session; confirm in v0.3. Background playback is scoped for v0.6 (roadmap).

## Platform
- Minimum Android version: 5.0 (API 21). Avoid very new web features; Android 5–7 WebViews stopped updating in 2022–2023.
- WebView lockdown (keeps old-device risk low): loads only bundled local files; no INTERNET permission; no JavaScript-to-Android bridge; no remote content.

## Open questions

1. **Start track vs. Persistent track.** On load the start track is random. If the user picks a track and presses Persistent, should future sessions start with that track instead of a random one?
