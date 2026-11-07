# RESUME HERE

Roadmap: [`docs/design/0001-roadmap.md`](docs/design/0001-roadmap.md) · Behavior spec: [`docs/design/0002-app-behavior.md`](docs/design/0002-app-behavior.md)

## Current version
v0.1.1 — UI wireframes approved; no app code yet.

## v0.1 plan of action

Versions follow the global versioning rules (patch +1 per completed-work commit, `Plan-Step: v0.1/N` trailer). The final step bumps to v0.2.0. UI steps need the user's approval.

0. **UI design** (v0.1/0) — rough wireframes of the launch, meditation and settings screens. ✅ (v0.1.1)
   - Source: roadmap v0.1 item 0; `0002` § Screens
   - Files: `docs/design/0003-ui-design.md` (+ wireframe images if needed)
   - Verify: user approves the wireframes
   - Deps: none
1. **App skeleton** (v0.1/1) — `index.html`, CSS, JS, shared constants file; full-screen layout.
   - Source: roadmap v0.1 item 1
   - Files: `index.html`, `css/`, `js/constants.js`
   - Verify: opens in Firefox and Chrome on Linux with no console errors
   - Deps: 0
2. **Metronome** (v0.1/2) — on/off, 1 tick per second, three tick sounds via Web Audio.
   - Source: roadmap v0.1 item 2; `0002` § Metronome
   - Files: `js/metronome.js`
   - Verify: ticks stay on time over 5 minutes; each sound selectable
   - Deps: 1
3. **Music player** (v0.1/3) — looping track list with placeholder tracks.
   - Source: roadmap v0.1 item 3; `0002` § Music
   - Files: `js/music.js`, `assets/music/`
   - Verify: loops past the last track; volume works
   - Deps: 1
4. **Image slideshow** (v0.1/4) — shuffled, 60 s per image, 5 s cross-fade, reduced-motion support.
   - Source: roadmap v0.1 item 4; `0002` § Images
   - Files: `js/slideshow.js`, `assets/images/`
   - Verify: no repeat within a pass; reduced motion switches without a fade
   - Deps: 1
5. **Screens and settings** (v0.1/5) — launch, meditation, settings (saved + session).
   - Source: roadmap v0.1 item 5; `0002` § Screens
   - Files: `index.html`, `js/app.js`, `js/settings.js`, `css/`
   - Verify: saved settings persist across reloads; session settings do not
   - Deps: 0–4
6. **Accessibility audit** (v0.1/6) — with the user.
7. **Security review** (v0.1/7) — with the user; bumps to v0.2.0.

### Execution
- Group A: step 0 (main session, with the user)
- Group B: steps 1 → 2, 3, 4 → 5 (they share `index.html`, constants and app wiring)
- Reviews: steps 6, 7 (main session, with the user)
- Run mode: **single session with fresh restarts**. Few items, they touch shared files, and the UI design needs frequent approval.
- Status: ✅ A · ☐ B · ☐ reviews
