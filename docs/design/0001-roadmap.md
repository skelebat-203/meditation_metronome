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

## v0.2 — Real media ✅ complete (v0.2.1 – v0.3.0)

1. Source ~10 music tracks (CC0 / CC BY) and record them in `ATTRIBUTION.md`. ✅ (v0.2.4, v0.2.12)
2. Source ~20 images (CC0 / CC BY) and record them in `ATTRIBUTION.md`. ✅ (v0.2.5, v0.2.12)
3. Compress media for mobile size; wire it into the app. ✅ (v0.2.6, v0.2.14 shuffled track order)
4. In-app credits screen that shows the attributions. ✅ (v0.2.3, v0.2.9)
5. Session length (countdown that ends the session) and marks (long chime every N minutes), per `0002` § Session length and marks. Session length replaces the Images toggle on the launch screen. ✅ (v0.2.1, v0.2.2, v0.2.11)
6. Settings track preview: play 5 s, fade out over 2 s, then stop (`0002` § Settings screen). ✅ (v0.2.7)
7. Accessibility audit. ✅ (v0.2.8, v0.2.10) — `docs/audits/accessibility/accessibility-v0.2.md`; Lighthouse 100.
8. Security review. ✅ (v0.3.0) — `docs/audits/security/security-v0.2.md`; SEC-02 resolved; `npm audit` deferred to v0.6 (user decision).

Run as grouped subagents on a `v0.2` integration branch, with one user review at version end. Raw media kept out of git history (compressed before commit). Items 5 and 6 added mid-version; user review replaced 5 tracks and 1 image, added shuffled track order, and started `0004-revisit-before-launch.md`.

## v0.3 — Android package ✅ complete (v0.3.1 – v0.4.0)

1. Android WebView wrapper project; no Google Play Services dependency (needed for F-Droid). ✅ (v0.3.2 build tools, v0.3.3)
2. App icon, name, splash screen. ✅ (v0.3.4; placeholder icon approved for now)
3. Keep screen awake during a session (per `0002`). ✅ (v0.3.5, v0.3.13 failure notice)
4. Test on GrapheneOS, including what happens when the screen is turned off. ✅ (v0.3.7, v0.3.9–v0.3.11 end chime) — wake lock works; app switch or screen off stops the session (v0.6).
5. Credits from a single source: stop `js/credits.js` and `ATTRIBUTION.md` drifting (one generated from the other, or a check that they match). ✅ (v0.3.1) — `npm run check-credits`.
6. Session timer: tap to switch elapsed/remaining (`0002` § Meditation screen). ✅ (v0.3.8, v0.3.10, v0.3.12 launch label/order)
7. Accessibility audit. ✅ (v0.3.6, v0.3.13) — `docs/audits/accessibility/accessibility-v0.3.md`; Lighthouse 100; A11Y-15 (silent wake-lock failure) fixed.
8. Security review. ✅ (v0.4.0) — `docs/audits/security/security-v0.3.md`; all Low+ findings fixed (new fix policy in the severity matrix).

Run as grouped subagents on a `v0.3` integration branch. Android build tools live project-local in `.tools/` (git-ignored, `scripts/setup-android-tools.sh`). Item 6 added mid-version.

## v0.4 — Release prep ✅ complete (v0.4.1 – v0.5.0)

Store submissions moved to v1.0 by user decision; the app goes to app stores at v1.0, not before.

1. Remove the 10-second test option from Session length and Marks (`0002`). ✅ (v0.4.2)
2. Reproducible release build; F-Droid recipe draft (`docs/fdroid/`). ✅ (v0.4.3) — two clean builds byte-identical; Google Maven + Maven Central only.
3. Fastlane metadata (description, screenshots). ✅ (v0.4.4)
4. Accessibility audit. ✅ (v0.4.5) — `docs/audits/accessibility/accessibility-v0.4.md`; Lighthouse 100.
5. Security review. ✅ (v0.5.0) — `docs/audits/security/security-v0.4.md`; no Low+ findings.

Run as grouped subagents on a `v0.4` integration branch.

## v0.5 — Background playback ✅ complete (v0.5.1 – v0.6.0)

1. Keep the session playing with the screen off: Android foreground service + media notification. ✅ (v0.5.1) — marked complete by user decision: testers report background playback already works on Android; no foreground service built.
2. Test on GrapheneOS. ✅ (v0.5.1) — from the v0.3 device test: on GrapheneOS, switching apps or turning the screen off stops the session (tracked in `0004`).
3. Accessibility audit. ✅ (v0.5.2) — `docs/audits/accessibility/accessibility-v0.5.md`; Lighthouse 100.
4. Security review; run `npm audit` (deferred from v0.2 by user decision; last pre-1.0 subversion). ✅ (v0.6.0) — `docs/audits/security/security-v0.5.md`; `npm audit` 0 vulnerabilities; no findings.

## Future (unscoped)

- Settings: let the user add their own music and images.
- Settings: music repeat mode — loop the whole (shuffled) list, or repeat a single track.
- Settings: Move save options into a save menu at the top right
- Add 1 and 3 minute options to length.

## v1.0 — Full launch (F-Droid)

Releases before v1.0 go to beta testers (APKs, not app stores). v1.0 is the full public launch on F-Droid, after background playback (v0.5) is done. Google Play moved to v1.1 by user decision.

1. Submit to F-Droid: fill the recipe (`docs/fdroid/`) — author name, license (GPL-3.0-only or -or-later), category, real versionCode, `UpdateCheckData` if F-Droid can't read the version (security-v0.4 7.1, 7.2); tag the release; merge request to `fdroiddata` from the user's GitLab account. Recipe ✅ (v0.6.1); tag, GitHub release and merge request at v1.0.0.
2. Update the store listing text (it says background playback is planned). ✅ (v0.6.1, v1.0.0)
3. Accessibility audit. ✅ (v0.6.3) — `docs/audits/accessibility/accessibility-v1.0.md`; Lighthouse 100.
4. Security review. ✅ (v1.0.0) — `docs/audits/security/security-v1.0.md`; 7.1 (versionCode range) fixed in v0.6.4.

Before launch: review every item in [`0004-revisit-before-launch.md`](0004-revisit-before-launch.md). ✅ (v0.6.2) — #3 start track fixed (v0.6.2, v0.6.5 Random choice); others accepted.

## v1.1 — Google Play release

1. Google Play: signed AAB (upload key kept out of git), store listing, privacy policy page on GitHub Pages (states that no data is collected); submit from the user's Play developer account.
2. Accessibility audit.
3. Security review.
