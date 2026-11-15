# 0002 — App Behavior

What the app does and how it behaves. Scope and build order live in the [roadmap](0001-roadmap.md).

## Screens

### Launch screen
- **Start button**, centered. Label is `Start {word}`; `{word}` is picked at random on each app open from: recovering, relaxing, centering, breathing.
- Order, top to bottom: Start, Length, then the Metronome and Music toggles.
- **Two on/off toggles** in a row under the Length picker: Metronome, Music. They start from the saved defaults (all on by default) and apply only to the next session. Persistent changes are made in saved settings.
- **Length** picker (Session length; labeled "Length" on the launch screen) between the Start button and the toggles (replaces the former Images toggle; Images is now in Settings only). Options: off (open-ended), 1 min, 3 min, 5–60 min in 5-minute steps; default off. Applies to the next session only; the saved default is set in Settings. See § Session length and marks.
- On each app open, the start image is chosen at random. The start track is random unless one was saved (see § Music).
- **Settings button**, top right. Opens the settings screen.
- Nothing plays until the user taps Start.

### Meditation screen
- Full-screen image slideshow, music and metronome, per the toggles.
- **End button**, top left. Ends the session and returns to the launch screen (Android Back does the same).
- **Session settings button**, top right. Opens the settings screen.
- **Session timer** (if on): elapsed time since Start. With a Session length set, the timer is a button: tapping it (or Enter/Space) switches between time elapsed and time remaining (Session length minus elapsed). Default is elapsed; the choice lasts for the current session. A word label ("elapsed" / "remaining") shows the mode. Its accessible name states the mode and value; it is not a live region, and a mode change is announced once via the status region. With Session length off, the timer is not a button and shows elapsed only. It stays visible and tappable when the controls hide; a tap on it also shows the controls.
- Controls hide after a few seconds idle and reappear on tap.

### Settings screen
One screen, opened from either the launch or meditation screen. Changes are applied from the **Save** menu (top right), which has two choices:

| Choice | What it does |
|---|---|
| Persistent | Saves the changes as defaults for every future session, applies them now, and returns to where Settings was opened (launch screen, or the running session) |
| This session | Applies the changes without changing defaults. From the launch screen it starts the session; from a running session it returns to that session |

Back with no changes leaves at once. Back with unsaved changes asks "Discard changes?" first (Discard / Keep editing); Android Back does the same. Layout and keyboard behavior: `0003` § Settings screen.

Controls:
- Music on/off, volume, and track (dropdown). The first choice, Random, is selected by default; the user's own tracks follow the built-ins under an "Uploaded" group; the preview plays the session's current track when Random is selected.
- Loop (two-option switch, "Loop:"): All (default; whole shuffled list, stored `list`) or Selected (repeat the current track, stored `track`). Persistent saves it; This session applies for the session only. A change made mid-session takes effect when the current track ends. Unknown saved values fall back to All.
- Track preview: plays the selected track for 5 s, fades it out over 2 s, then stops. Starting another preview or leaving Settings stops it.
- Metronome on/off and volume
- Tick sound (dropdown): soft click / wood block / bell, then an "Uploaded" group with the user's own sounds (`0005`). One "Play tick sound" button plays the selected sound. A removed uploaded sound falls back to soft click.
- Images on/off
- Session length: off / 1 min / 3 min / 5–60 min in 5-minute steps (default off)
- Marks on/off and interval: 1 min / 3 min / 5–60 min in 5-minute steps (default on, 5 min)
- Session timer (default off) — shows elapsed time; separate from Session length
- Keep screen awake (default on)
- Add media (button, bottom right, in line with Credits): opens the Add media screen, where the user adds and removes their own music, images and metronome sounds. See `0005`; add and remove apply at once, not through Save.

## Display
- Portrait and landscape. Images fill the screen and are cropped to fit; source images are at least 1920 px on the long side.

## Metronome
- 1 tick per second.
- Three built-in tick sounds, generated with the Web Audio API (no audio files): soft click, wood block, bell. The user can add their own sounds (`0005`): a tick plays at most 1 s, with a short fade; chimes play the sample at a lower pitch and ring longer.

## Session length and marks
Not a score or streak; only sound cues.
- **Session length** (countdown): when it reaches zero, the end chime plays, music and metronome fade out, and the app returns to the launch screen once the chime finishes. Off = session runs until End.
- **Marks**: a long chime every `{interval}` minutes, counted from Start. Sound only; no screen-reader announcement (the chime is the cue). No mark plays at the same moment as the end chime, including when the interval equals or divides the length (e.g. a 1-min mark with a 3-min length marks at 1 and 2 min only).
- **One beat clock**: ticks, marks and the end chime are timed on the same beat clock, counted from Start. A mark or the end chime falls exactly on a beat and replaces the tick on that beat (no tick plus chime). This holds after the tick sound changes mid-session; the chimes then use the new sound.
- **Chime sounds**: Web Audio, no files. Each is a distinct, longer version of the selected tick sound (soft click / wood block / bell). The mark chime and the end chime differ from each other, so the user can tell them apart: a mark is one strike; the end chime is three slower, lower strikes with widening gaps (2 s, then 2.5 s), each 50% longer than a mark strike. The return to the launch screen waits for the last strike to finish.

## Music
- ~10 built-in tracks plus the user's own (`0005`), played in shuffled order (not just a random start track); reshuffled after each full pass; loops forever. With Loop set to Selected, the playing track repeats forever instead; the shuffled list is not advanced.
- Start track: the Settings track dropdown starts with Random (the default). If a specific track was chosen and saved with Persistent, every future session starts with it, then plays the shuffled rest of the pass. With Random saved, or nothing saved, the start track is random on each app open. Random is stored as its own sentinel value; any other stored value must be a known track path or an `own:` id of an existing own track, or it is ignored. Choices made with This session (a track or Random) apply to that session only and are not saved. (`0004` #3, v0.6.2, v0.6.5)
- Opus, ~48 kbps, loops of ~2–3 minutes per track.

## Images
- ~20 built-in images plus the user's own (`0005`), shown in shuffled order; reshuffled after each full pass.
- Each image shows for 60 s, with a 5 s cross-fade.
- With `prefers-reduced-motion`, images switch without a fade.
- WebP, sized for phone screens, ~100–150 KB each.

## Screen
- Keep screen awake during a session (default on; changeable in saved settings).
- How: the web Screen Wake Lock API (`navigator.wakeLock`), taken when a session starts with the setting on, released when the session ends or the setting is turned off, and taken back when the app returns to the foreground (the browser drops it when the page is hidden). No JavaScript-to-Android bridge (§ Platform), so Android's own keep-screen-on flag is not used.
- If Keep screen awake is on and the lock is unsupported or refused, a notice says so once per session (same pattern as the music notice): "Could not keep the screen awake. Your screen may turn off during the session."
- Limitation: WebView supports the API from version 84 (mid-2020). A device whose WebView was never updated past that has no wake lock; there the screen follows the system timeout and the app still runs. Confirmed on GrapheneOS (v0.3 step 4): the WebView grants the lock to the local page and the screen stays on.
- Device test (v0.3 step 4, GrapheneOS): switching apps or turning the screen off stops the session. Testers report background playback works on (stock) Android; v0.5 marked complete by user decision without a foreground service. GrapheneOS behavior is tracked in `0004`.

## Platform
- Minimum Android version: 5.0 (API 21). Avoid very new web features; Android 5–7 WebViews stopped updating in 2022–2023.
- WebView lockdown (keeps old-device risk low): loads only bundled local files; no INTERNET permission; no JavaScript-to-Android bridge; no remote content.
- The WebView serves the bundled files through `androidx.webkit` `WebViewAssetLoader` at `https://appassets.androidplatform.net/` (assets only; no real network). Desktop browsers still open `index.html` from `file://`.
- Own media (`0005`): `MainActivity` has a `WebChromeClient.onShowFileChooser` that opens the system document picker (`ACTION_OPEN_DOCUMENT`, no storage permission). This is native code but not a JavaScript-to-Android bridge; the page only receives the picked `File` objects, which it copies into IndexedDB.
