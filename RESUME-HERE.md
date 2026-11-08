# RESUME HERE

Roadmap: [`docs/design/0001-roadmap.md`](docs/design/0001-roadmap.md) · Behavior spec: [`docs/design/0002-app-behavior.md`](docs/design/0002-app-behavior.md)

## Current version
v0.3.7 — steps 0–5 done (step 4 device test passed, fixes landed); step 6 accessibility audit drafted; step 7 security review drafted (uncommitted); next: review of both reports.

## v0.3 plan of action

Versions follow the global versioning rules (patch +1 per completed-work commit, `Plan-Step: v0.3/N` trailer). The final step bumps to v0.4.0. The main session coordinates subagents in worktrees off a `v0.3` integration branch; `main` gets it only after the user's end-of-version review. Human gates: blocking questions, and the end-of-version review (icon/splash, device test, a11y and security reports, plus any UI/UX changes the user notes).

0. **Android build tools** (v0.3/0) — JDK 17 and Android command-line tools installed project-local in `.tools/` (git-ignored), with a setup script pinning exact versions; usage documented in `.claude/CLAUDE.md`. Not part of the app. ✅ (v0.3.2)
   - Source: roadmap v0.3 item 1 (prerequisite)
   - Files: `.gitignore`, `scripts/setup-android-tools.sh`, `.claude/CLAUDE.md`
   - Verify: `java -version` and `sdkmanager --list_installed` work from `.tools/`; worktrees reuse the main checkout's `.tools/`
   - Deps: user go-ahead to install
1. **Android WebView wrapper** (v0.3/1) — plain WebView project loading the bundled web files; no Google Play Services; no INTERNET permission; no JS bridge; local files only (`0002` § Platform). Min API 21. ✅ (v0.3.3)
   - Source: roadmap v0.3 item 1; `0002` § Platform
   - Files: `android/`, web files copied or referenced at build
   - Verify: debug APK builds; manifest has no INTERNET permission; app opens to the launch screen in an emulator or on device
   - Deps: 0
2. **App icon, name, splash** (v0.3/2) — placeholder-quality icon and splash for user review at version end; name "Meditation Metronome"; ID `io.github.skelebat203.meditationmetronome`. ✅ (v0.3.4)
   - Source: roadmap v0.3 item 2
   - Files: `android/` resources
   - Verify: icon and name show in launcher; splash shows on start; user reviews at version end
   - Deps: 1
3. **Keep screen awake** (v0.3/3) — honors the Keep screen awake setting during a session. Open design question: the WebView lockdown forbids a JS-to-Android bridge, so use the web Screen Wake Lock API where the WebView supports it; ask the user before adding any bridge. ✅ (v0.3.5)
   - Source: roadmap v0.3 item 3; `0002` § Screen, § Platform
   - Files: `js/`, possibly `android/`
   - Verify: screen stays on through a session with the setting on; turns off normally with it off
   - Deps: 1
4. **GrapheneOS test** (v0.3/4) — with the user on device, including screen-off behavior; results recorded in `0002` § Screen. ✅ (v0.3.7) — TalkBack, 200% font, rotation, timer/marks, icon/splash and keep-awake passed; fixes: controls now auto-hide after a tap, slower end chime.
   - Deps: 1–3
5. **Credits from a single source** (v0.3/5) — `js/credits.js` and `ATTRIBUTION.md` can't drift: `ATTRIBUTION.md` is the source; `scripts/check-credits.js` (Node, no deps) checks every entry's title, author, source URL and license (credits may add a `(modified: ...)` note) in order, and that every file in `assets/` is listed and exists. ✅ (v0.3.1)
   - Source: roadmap v0.3 item 5
   - Files: `js/credits.js`, `scripts/check-credits.js`, `package.json`
   - Verify: `npm run check-credits` passes (exit 0); after any edit to `ATTRIBUTION.md`, `js/credits.js` or `assets/`, run it again — a mismatch or unlisted asset fails with exit 1 and names the entry
   - Deps: none
6. **Accessibility audit** (v0.3/6) — agent drafts; user reviews.
   - Report: `docs/audits/accessibility/accessibility-v0.3.md` — drafted, awaiting user review (v0.3.6)
7. **Security review** (v0.3/7) — agent drafts; user reviews; bumps to v0.4.0 and `v0.3` merges to `main`.
   - Report: `docs/audits/security/security-v0.3.md`

### Execution
- Group A: steps 0, 1, 2, 3 (Android; sequential)
- Group B: step 5 (web only; parallel with A)
- Reviews: step 4 with the user; steps 6, 7 drafted by agent, **pause for user review** before v0.4.0 and the merge to `main`
- Run mode: **grouped subagents**. Gates are at version end; A and B touch separate files.
- Status: ✅ A · ✅ B · ☐ reviews
