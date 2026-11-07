# 0002 — App Behavior

What the app does and how it behaves. Scope and build order live in the [roadmap](0001-roadmap.md).

## Screens

### Launch screen
- **Start button**, centered. Label is `Start {word}`; `{word}` is picked at random on each app open from: recovering, relaxing, centering, breathing.
- **Three on/off toggles** in a row under the Start button: Music, Metronome, Images. They start from the saved defaults (all on by default) and apply only to the next session. Persistent changes are made in saved settings.
- **Settings button**, top right. Opens the settings screen (saved settings).
- Nothing plays until the user taps Start.

### Meditation screen
- Full-screen image slideshow, music and metronome, per the toggles.
- **Session settings button**. Opens the settings screen (session settings).
- Controls hide after a few seconds idle and reappear on tap.

### Settings screen
Two modes, same controls:

| Mode | Opened from | Changes apply to |
|---|---|---|
| Saved settings | Launch screen | Every future session (persist across app restarts) |
| Session settings | Meditation screen | Only the active session; discarded when it ends |

Controls:
- Music on/off and volume
- Metronome on/off and volume
- Images on/off
- Tick sound: soft click / wood block / bell
- Keep screen awake (default on)

## Metronome
- 1 tick per second.
- Three tick sounds, generated with the Web Audio API (no audio files): soft click, wood block, bell.

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

