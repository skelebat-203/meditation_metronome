# RESUME HERE

Roadmap: [`docs/design/0001-roadmap.md`](docs/design/0001-roadmap.md) · Behavior spec: [`docs/design/0002-app-behavior.md`](docs/design/0002-app-behavior.md)

## Current version
v0.2.0 — v0.1 complete (summary in the roadmap); next: v0.2 step 1.

## v0.2 plan of action

Versions follow the global versioning rules (patch +1 per completed-work commit, `Plan-Step: v0.2/N` trailer). The final step bumps to v0.3.0. UI steps need the user's approval (credits screen; media picks).

1. **Source music** (v0.2/1) — agent finds and downloads ~10 meditative tracks (CC0 / public domain / CC BY only); user approves the picks. If sourcing runs into problems, stop and discuss next steps with the user.
   - Source: roadmap v0.2 item 1; roadmap § Asset licensing
   - Files: `assets/music/`, `ATTRIBUTION.md`
   - Verify: every track listed in `ATTRIBUTION.md` (title, author, source URL, license) before commit; no NC/ND licenses
   - Deps: none
2. **Source images** (v0.2/2) — agent finds and downloads ~20 meditative images (CC0 / public domain / CC BY only); user approves the picks. If sourcing runs into problems, stop and discuss next steps with the user.
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
   - Verify: user approves the screen; every `ATTRIBUTION.md` entry appears; keyboard and screen reader can reach and leave it
   - Deps: 3 (final asset list)
5. **Accessibility audit** (v0.2/5) — with the user; Lighthouse ≥ 90 plus manual focus and screen reader checks.
   - Report: `docs/audits/accessibility/accessibility-v0.2.md`
6. **Security review** (v0.2/6) — with the user; bumps to v0.3.0.
   - Report: `docs/audits/security/security-v0.2.md`

### Execution
- Group A: steps 1, 2 (agent sources the media; separate folders, can run in parallel; user approves picks)
- Group B: step 3 (after A)
- Group C: step 4 (UI can be built alongside A/B with placeholder data; final check after B)
- Reviews: steps 5, 6 (main session, with the user)
- Run mode: **single session with fresh restarts**. Few items, and media picks and the credits screen need frequent user approval.
- Status: ☐ A · ☐ B · ☐ C · ☐ reviews
