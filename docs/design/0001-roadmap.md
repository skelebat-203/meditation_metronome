# Roadmap — Meditation Metronome

Current work: [`RESUME-HERE.md`](../../RESUME-HERE.md)

## Scope

A simple, offline meditation app.

- **App code:** plain HTML, CSS and JavaScript files, with media in an `assets/` folder. No framework, no build step.
- **Runs on:** Android (GrapheneOS and stock) as an installed app, launched with one tap from the home screen. Tested in desktop browsers on Linux and Windows by opening `index.html`.
- **Distribution:** F-Droid and Google Play, as an APK/AAB that wraps the web files in a WebView.
- **App name:** Meditation Metronome. **Application ID:** `io.github.skelebat203.meditationmetronome` (permanent once published).
- **Android shell:** plain Android WebView project (no Capacitor). The web code does not depend on the shell, so it can be swapped later.
- **License:** GPL-3.0 (`LICENSE`).
- **Network:** none. No internet permission, no analytics, no remote assets. Threat model: LOCAL.

Behavior spec: [`0002-app-behavior.md`](0002-app-behavior.md).

### Base functionality

- Metronome with an on/off toggle. Fixed interval: 1 tick per second.
- Background music: ~10 meditative tracks, looping forever.
- Background images: ~20 meditative images, shown in slowly shuffled order, looping forever.

### Asset licensing

- Only **CC0, public domain, or CC BY** assets. No CC BY-NC or CC BY-ND: F-Droid treats them as non-free.
- Every asset is recorded in `ATTRIBUTION.md`: title, author, source URL, license.

## v0.1 — Core app (placeholder media) ✅ complete (v0.1.1 – v0.2.0)

0. UI design: rough wireframes of the launch, meditation and settings screens; approved by the user before any app code. ✅ (v0.1.1) — `0003-ui-design.md`
1. App skeleton: `index.html`, CSS and JS files; full-screen layout; shared constants file. ✅ (v0.1.2)
2. Metronome: on/off control, 1-second tick, three selectable tick sounds generated with the Web Audio API (no audio files); `prepare()` warms up audio before Start. ✅ (v0.1.3)
3. Music player: plays a list of tracks in a loop; placeholder tracks. ✅ (v0.1.3)
4. Image slideshow: 60 s per image, 5 s cross-fade, shuffled order, reshuffles after each full pass, reduced-motion support; placeholder images. ✅ (v0.1.4)
5. Launch screen, meditation screen and settings screen (saved + session settings), per `0002`. ✅ (v0.1.5)
6. Accessibility audit. ✅ (v0.1.6) — `docs/audits/accessibility/accessibility-v0.1.md`
7. Security review. ✅ (v0.2.0) — `docs/audits/security/security-v0.1.md`; SEC-02 (silent music failures) carried to v0.2.

Run as a single session with fresh restarts. Agent browser testing (Playwright, Lighthouse) added as local dev-only tooling.

## v0.2 — Real media

1. Source ~10 music tracks (CC0 / CC BY) and record them in `ATTRIBUTION.md`.
2. Source ~20 images (CC0 / CC BY) and record them in `ATTRIBUTION.md`.
3. Compress media for mobile size; wire it into the app.
4. In-app credits screen that shows the attributions.
5. Session length (countdown that ends the session) and marks (long chime every N minutes), per `0002` § Session length and marks. Session length replaces the Images toggle on the launch screen.
6. Accessibility audit.
7. Security review.

## v0.3 — Android package

1. Android WebView wrapper project; no Google Play Services dependency (needed for F-Droid).
2. App icon, name, splash screen.
3. Keep screen awake during a session (per `0002`).
4. Test on GrapheneOS, including what happens when the screen is turned off.
5. Accessibility audit.
6. Security review.

## v0.4 — F-Droid release

1. Reproducible build; fastlane metadata (description, screenshots).
2. Submit to F-Droid. Remove the 10-second test option from Session length and Marks first (`0002`).
3. Accessibility audit.
4. Security review.

## v0.5 — Google Play release

1. Signed AAB, store listing, privacy policy page on GitHub Pages (states that no data is collected).
2. Submit to Google Play.
3. Accessibility audit.
4. Security review.

## v0.6 — Background playback

1. Keep the session playing with the screen off: Android foreground service + media notification.
2. Test on GrapheneOS.
3. Accessibility audit.
4. Security review.

## Future (unscoped)

- Settings: let the user add their own music and images.

## v1.0 — Full launch

Releases before v1.0 go to beta testers. v1.0 is the full public launch, after background playback (v0.6) is done.
