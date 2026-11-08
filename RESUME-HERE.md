# RESUME HERE

Roadmap: [`docs/design/0001-roadmap.md`](docs/design/0001-roadmap.md) · Behavior spec: [`docs/design/0002-app-behavior.md`](docs/design/0002-app-behavior.md)

## Current version
v1.1.5 — new 1080 × 2160 screenshots (6) and RGBA icon for Play. v1.1 steps 3–5 done on `worktree-v1.1-group-a`. Next: user approves the new feature graphic; step 1 (Play account) and step 2 (signing) with the user.

## v1.1 plan of action

Versions follow the versioning rules; the final step bumps to v1.2.0. UI steps need human approval. Outward-facing steps (Play Console, GitHub Pages, signing) are done by the user with the main session.

1. **Play developer account** (v1.1/1) — user pays the fee and verifies identity.
   - Source: roadmap v1.1 item 1 · Files: none · Verify: Console opens · Deps: user
2. **Signing** (v1.1/2) — sign the AAB with the existing F-Droid release key (Play App Signing upload); key stays out of git.
   - Source: roadmap v1.1 item 2 · Files: none in git · Verify: `jarsigner -verify` / Console accepts upload · Deps: 1, 3
3. **Unsigned AAB build** (v1.1/3) ✅ (v1.1.1) — `bundleRelease` gives `android/app/build/outputs/bundle/release/app-release.aab`; two clean builds byte-identical; no permissions. No build changes were needed.
   - Source: roadmap v1.1 item 3 · Files: none · Verify: sha256 of two clean builds match · Deps: none
4. **Privacy policy and Data safety** (v1.1/4) ✅ (v1.1.2) — `docs/privacy/index.html`; `docs/play/data-safety.md`. Pages not enabled yet.
   - Source: roadmap v1.1 item 4 · Files: `docs/privacy/`, `docs/play/` · Verify: user reads both; Pages on (user) · Deps: none
5. **Play listing** (v1.1/5) ✅ (v1.1.3, v1.1.5) — `docs/play/listing.md`; feature graphic added; screenshots and icon fixed.
   - Source: roadmap v1.1 item 5 · Files: `fastlane/metadata/android/en-US/`, `docs/play/listing.md`, `ATTRIBUTION.md` · Verify: user approves graphic · Deps: none
6. **Closed test** (v1.1/6) — 12+ testers for 14 continuous days.
   - Source: roadmap v1.1 item 6 · Files: none · Verify: Console shows 14 days · Deps: 1, 2, 4, 5
7. **Production access and submit** (v1.1/7)
   - Source: roadmap v1.1 item 7 · Files: none · Verify: app live · Deps: 6
8. **Accessibility audit** (v1.1/8) — with the user.
   - Source: roadmap v1.1 item 8 · Files: `docs/audits/accessibility/` · Verify: Lighthouse ≥90, manual checks · Deps: 3–5
9. **Security review** (v1.1/9) — last; bumps to v1.2.0.
   - Source: roadmap v1.1 item 9 · Files: `docs/audits/security/` · Verify: user approves · Deps: 8

### Execution
- Group A (agent, worktree): steps 3, 4, 5.
- Main session with user: steps 1, 2, 6, 7, then reviews 8, 9.
- Run mode: **single main session plus one agent** (group A).
- Status: ✅ A · ☐ 1 · ☐ 2 · ☐ 6 · ☐ 7 · ☐ reviews

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
