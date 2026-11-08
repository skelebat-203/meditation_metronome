# RESUME HERE

Roadmap: [`docs/design/0001-roadmap.md`](docs/design/0001-roadmap.md) · Behavior spec: [`docs/design/0002-app-behavior.md`](docs/design/0002-app-behavior.md)

## Current version
v1.0.2 — F-Droid paused: MR !56340 closed (3-month maintenance policy); resubmit on or after 2027-02-08. GitHub release v1.0.0 carries the developer-signed APK. Next: v1.1 Google Play (roadmap v1.1), starting with the user's Play developer account.

## v1.0 plan of action

Work toward the launch is versioned v0.6.x; the launch itself is v1.0.0. v1.0 is the F-Droid launch; Google Play moved to roadmap v1.1. The main session coordinates subagents in worktrees off a `v1.0` integration branch; `main` gets it only after the user's review. Human gates: blocking questions, anything outward-facing (store submissions, tags, GitHub Pages), and the end review. Security findings Low+ are fixed in the same version.

1. **Review the revisit-before-launch list** (v1.0/1) — with the user: fix, accept, or move to the roadmap each item in `0004`. ✅ (v0.6.2)
2. **Store listing update** (v1.0/2) ✅ (v0.6.1) — remove "background playback is planned"; note GrapheneOS behavior if kept.
   - Files: `fastlane/metadata/android/en-US/`
3. **F-Droid submission prep** (v1.0/3) ✅ (v0.6.1) — fill the recipe: author name, license (GPL-3.0-only / -or-later), category, real versionCode, `UpdateCheckData` if needed (security-v0.4 7.1, 7.2).
   - Files: `docs/fdroid/`, `package.json` (`versionCode`), `android/app/build.gradle`
   - Deps: user answers
4. **Accessibility audit** (v1.0/4) ✅ (v0.6.3, v1.0.0) — agent drafts; user reviews. Approved: [`accessibility-v1.0.md`](docs/audits/accessibility/accessibility-v1.0.md).
5. **Security review** (v1.0/5) ✅ (v1.0.0) — `docs/audits/security/security-v1.0.md`; approved.
6. **Release** (v1.0/6) ⏳ — tag and GitHub release done (v1.0.0); F-Droid MR !56340 closed 2026-11-08 (needs 3 months of maintenance); ⏸️ resubmit on or after 2027-02-08 with the alignment-preserved signed APK and the rewritemeta fix. — tag v1.0.0, GitHub release and F-Droid merge request from the user's accounts, with step-by-step help.

### Execution
- Step 1 with the user first (may change scope).
- Group A: steps 2, 3
- Reviews: steps 4, 5, then **pause for user review**; step 6 after approval.
- Run mode: **grouped subagents**.
- Status: ✅ 1 · ✅ A · ✅ reviews · ⏳ release
