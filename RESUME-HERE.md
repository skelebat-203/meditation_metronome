# RESUME HERE

Roadmap: [`docs/design/0001-roadmap.md`](docs/design/0001-roadmap.md) · Behavior spec: [`docs/design/0002-app-behavior.md`](docs/design/0002-app-behavior.md)

## Current version
v1.2.2 — Music repeat setting added; v1.2.1 added 1 and 3 min options to Length and Mark every. v1.2 plan of action in place; `0004` #2 decided (chimes keep the metronome volume). v1.1 still open: Play Console signup (blocked by Google's new-account check), tester recruiting, then PEPK export of the F-Droid key; its commits land under the current v1.2.x number. Next: steps 2–4 in parallel worktrees (`v1.2-step-N`), first approved takes the next patch number.

## v1.2 plan of action

Versions follow the versioning rules: each feature gets its own patch version and exactly one commit, numbered first-come, first-served (no fixed step order); the final step bumps to v1.3.0. UI steps need human approval.

1. **Length and Mark every: 1 and 3 min** (v1.2/1) ✅ (v1.2.1) — add 1 and 3 minute choices to both pickers.
   - Source: roadmap v1.2 item 1 · Files: `js/constants.js`, `js/app.js`, `docs/design/0002-app-behavior.md` · Verify: both pickers list 1, 3, 5–60 min; a 1-min session ends on time · Deps: none
2. **Music repeat mode** (v1.2/2) ✅ (v1.2.2) — Settings choice: loop the whole shuffled list, or repeat the current track.
   - Source: roadmap v1.2 item 2 · Files: `index.html`, `js/music.js`, `js/settings.js`, `js/constants.js`, `js/app.js`, `0002`, `0003` · Verify: each mode loops as described; saved with Persistent · Deps: user approves UI
3. **Save menu** (v1.2/3) — move Persistent / This session into a menu at the top right of Settings; wireframe in `0003` approved first.
   - Source: roadmap v1.2 item 3 · Files: `0003`, `index.html`, `css/`, `js/app.js` · Verify: user approves; keyboard and screen reader can open the menu and save · Deps: user approves wireframe
4. **Own media** (v1.2/4) — user adds their own music and images; design note first (storage, size limits, removal, credits), with 3 UI mockups for the user to choose from.
   - Source: roadmap v1.2 item 4 · Files: new design note, `index.html`, `js/`, `0002`, `0003` · Verify: added files play/show after restart, with no network access; user approves · Deps: user approves design
5. **Accessibility audit** (v1.2/5) — with the user.
   - Source: roadmap v1.2 item 5 · Files: `docs/audits/accessibility/` · Verify: Lighthouse ≥90, manual checks · Deps: 1–4
6. **Security review** (v1.2/6) — last; bumps to v1.3.0.
   - Source: roadmap v1.2 item 6 · Files: `docs/audits/security/` · Verify: user approves · Deps: 5

### Execution
- Steps 1–4 run in parallel, one agent and one worktree each (`v1.2-step-N`). Patch numbers are first-come, first-served: a step takes the next number when the user approves it and it merges to `main`, in any order. Agents leave work uncommitted; the main session rebases, bumps the version, commits once and merges after approval.
- Steps 2, 3 and 4 touch the Settings form and will conflict; the main session resolves conflicts at merge.
- Steps 3 and 4 start with design only (wireframe / 3 mockups); no code until the user chooses.
- Reviews 5, 6 in the main session with the user, after steps 1–4 land.
- Status: ✅ 1 · ✅ 2 · ⏳ 3 (built, UI review) · ⏳ 4 (design, awaiting approval) · ☐ reviews

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
