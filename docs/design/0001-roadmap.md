# Roadmap — Meditation Metronome

Current work: [`RESUME-HERE.md`](../../RESUME-HERE.md)

## Scope

A simple, offline meditation app.

- **App code:** plain HTML, CSS and JavaScript files, with media in an `assets/` folder. No framework, no build step.
- **Runs on:** Android (GrapheneOS and stock) as an installed app, launched with one tap from the home screen. Tested in desktop browsers on Linux and Windows by opening `index.html`.
- **Distribution:** F-Droid and Google Play, as an APK/AAB that wraps the web files in a WebView (Capacitor).
- **Network:** none. No internet permission, no analytics, no remote assets. Threat model: LOCAL.

### Base functionality

- Metronome with an on/off toggle. Fixed interval: 1 tick per second.
- Background music: ~10 meditative tracks, looping forever.
- Background images: ~20 meditative images, shown in slowly shuffled order, looping forever.

### Asset licensing

- Only **CC0, public domain, or CC BY** assets. No CC BY-NC or CC BY-ND: F-Droid treats them as non-free.
- Every asset is recorded in `ATTRIBUTION.md`: title, author, source URL, license.

## v0.1 — Core app (placeholder media)

1. App skeleton: `index.html`, CSS and JS files; full-screen layout; shared constants file.
2. Metronome: on/off control, 1-second tick generated with the Web Audio API (no audio file).
3. Music player: plays a list of tracks in a loop; placeholder tracks.
4. Image slideshow: slow cross-fade, shuffled order, reshuffles after each full pass; placeholder images.
5. Controls: music on/off and volume; metronome volume.
6. Accessibility audit.
7. Security review.

## v0.2 — Real media

1. Source ~10 music tracks (CC0 / CC BY) and record them in `ATTRIBUTION.md`.
2. Source ~20 images (CC0 / CC BY) and record them in `ATTRIBUTION.md`.
3. Compress media for mobile size; wire it into the app.
4. In-app credits screen that shows the attributions.
5. Accessibility audit.
6. Security review.

## v0.3 — Android package

1. Capacitor wrapper project; no Google Play Services dependency (needed for F-Droid).
2. App icon, name, splash screen.
3. Keep audio playing with the screen off and in the background.
4. Test on GrapheneOS.
5. Accessibility audit.
6. Security review.

## v0.4 — F-Droid release

1. Reproducible build; fastlane metadata (description, screenshots).
2. Submit to F-Droid.
3. Accessibility audit.
4. Security review.

## v0.5 — Google Play release

1. Signed AAB, store listing, privacy policy (states that no data is collected).
2. Submit to Google Play.
3. Accessibility audit.
4. Security review.
