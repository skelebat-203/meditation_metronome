# RESUME HERE

Roadmap: [`docs/design/0001-roadmap.md`](docs/design/0001-roadmap.md) · Behavior spec: [`docs/design/0002-app-behavior.md`](docs/design/0002-app-behavior.md)

## Current version
v0.2.1 — v0.2 plan revised (timer and marks added; agent-run with gates at version end). Next: groups A and C.

## v0.2 plan of action

Versions follow the global versioning rules (patch +1 per completed-work commit, `Plan-Step: v0.2/N` trailer). The final step bumps to v0.3.0. The main session coordinates subagents, each in its own worktree; work lands on the `v0.2` integration branch, and `main` gets it only after the user's end-of-version review. Human gates: blocking questions, and the end-of-version review (media picks, credits screen, timer/marks UI, a11y and security reports, plus any UI/UX changes or new features the user notes).

1. **Source music** (v0.2/1) — agent finds and downloads ~10 meditative tracks (CC0 / public domain / CC BY only). Picks reviewed by the user at version end. If sourcing runs into problems, stop and ask.
   - Source: roadmap v0.2 item 1; roadmap § Asset licensing
   - Files: `assets/music/`, `ATTRIBUTION.md`
   - Verify: every track listed in `ATTRIBUTION.md` (title, author, source URL, license) before commit; no NC/ND licenses
   - Deps: none
2. **Source images** (v0.2/2) — agent finds and downloads ~20 meditative images (CC0 / public domain / CC BY only). Picks reviewed by the user at version end. If sourcing runs into problems, stop and ask.
   - Source: roadmap v0.2 item 2; roadmap § Asset licensing
   - Files: `assets/images/`, `ATTRIBUTION.md`
   - Verify: every image listed in `ATTRIBUTION.md` before commit; no NC/ND licenses
   - Deps: none
3. **Compress and wire in media** (v0.2/3) — compress for mobile size (Opus audio, WebP images); replace placeholders and their `ATTRIBUTION.md` rows; show the user a message when a track fails to play (SEC-02).
   - Source: roadmap v0.2 item 3; `0002` § Music, § Images; `security-v0.1.md` SEC-02
   - Files: `assets/`, `js/music.js`, `js/slideshow.js`, `js/constants.js`, `ATTRIBUTION.md`
   - Verify: music loops and slideshow shuffles with real media; a missing track shows a message instead of silence; total media size noted
   - Deps: 1, 2
4. **Credits screen** (v0.2/4) — in-app screen, opened from Settings → Credits, listing every asset's attribution.
   - Source: roadmap v0.2 item 4; `0003` § Settings screen (Credits row)
   - Files: `index.html`, `js/app.js`, `js/credits.js`, `css/`
   - Verify: every `ATTRIBUTION.md` entry appears; keyboard and screen reader can reach and leave it; user reviews at version end
   - Deps: 3 (final asset list)
5. **Session length and marks** (v0.2/5) — countdown that ends the session with an end chime; mark chime every N minutes (default on, 5 min); chimes are longer versions of the selected tick sound; Images toggle moves from launch screen to Settings only; 10-second test option.
   - Source: roadmap v0.2 item 5; `0002` § Session length and marks, § Launch screen, § Settings screen; `0003` launch and settings wireframes
   - Files: `index.html`, `js/app.js`, `js/settings.js`, `js/metronome.js` (or new `js/chime.js`), `js/constants.js`, `css/`
   - Verify: 10 s length ends session with end chime and returns to launch; 10 s marks chime repeatedly; mark and end chimes differ per tick sound; settings persist; keyboard/screen reader reach the new controls
   - Deps: none
6. **Accessibility audit** (v0.2/6) — Lighthouse ≥ 90 plus manual focus and screen reader checks; agent drafts, user reviews.
   - Report: `docs/audits/accessibility/accessibility-v0.2.md`
7. **Security review** (v0.2/7) — agent drafts, user reviews; on approval bumps to v0.3.0 and `v0.2` merges to `main`.
   - Report: `docs/audits/security/security-v0.2.md`

### Execution
- Group A: steps 1, 2 (media sourcing; separate folders, parallel)
- Group B: step 3 (after A)
- Group C: steps 4, 5 (UI; parallel with A; credits list final after B)
- Reviews: steps 6, 7 (agent drafts; **pause for user review** before v0.3.0 and the merge to `main`)
- Run mode: **grouped subagents**. Gates moved to version end, and groups touch separate files.
- Status: ☐ A · ☐ B · ☐ C · ☐ reviews
