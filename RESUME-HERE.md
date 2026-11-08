# RESUME HERE

Roadmap: [`docs/design/0001-roadmap.md`](docs/design/0001-roadmap.md) · Behavior spec: [`docs/design/0002-app-behavior.md`](docs/design/0002-app-behavior.md)

## Current version
v0.6.0 — v0.5 complete (summary in the roadmap); next: v1.0 planning with the user.

## v1.0 plan of action

Work toward the launch is versioned v0.6.x; the launch itself is v1.0.0. The main session coordinates subagents in worktrees off a `v1.0` integration branch; `main` gets it only after the user's review. Human gates: blocking questions, anything outward-facing (store submissions, tags, GitHub Pages), and the end review. Security findings Low+ are fixed in the same version.

1. **Review the revisit-before-launch list** (v1.0/1) — with the user: fix, accept, or move to the roadmap each item in `0004`.
2. **Store listing update** (v1.0/2) — remove "background playback is planned"; note GrapheneOS behavior if kept.
   - Files: `fastlane/metadata/android/en-US/`
3. **F-Droid submission prep** (v1.0/3) — fill the recipe: author name, license (GPL-3.0-only / -or-later), category, real versionCode, `UpdateCheckData` if needed (security-v0.4 7.1, 7.2).
   - Files: `docs/fdroid/`
   - Deps: user answers
4. **Google Play prep** (v1.0/4) — signed AAB (upload key kept out of git), Play listing, privacy policy page on GitHub Pages (no data collected).
   - Deps: user's Play developer account; signing-key decision
5. **Accessibility audit** (v1.0/5) — agent drafts; user reviews.
6. **Security review** (v1.0/6) — agent drafts; user reviews; bumps to v1.0.0.
7. **Release** (v1.0/7) — tag v1.0.0, GitHub release, F-Droid merge request and Play submission from the user's accounts, with step-by-step help.

### Execution
- Step 1 with the user first (may change scope).
- Group A: steps 2, 3 · Group B: step 4 (parallel)
- Reviews: steps 5, 6, then **pause for user review**; step 7 after approval.
- Run mode: **grouped subagents**.
- Status: ☐ 1 · ☐ A · ☐ B · ☐ reviews · ☐ release
