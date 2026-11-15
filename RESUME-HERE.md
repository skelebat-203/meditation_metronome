# RESUME HERE

Roadmap: [`docs/design/0001-roadmap.md`](docs/design/0001-roadmap.md) · Behavior spec: [`docs/design/0002-app-behavior.md`](docs/design/0002-app-behavior.md)

## Current version
v1.2.10 — v1.2 features are done and phone-tested (standard Android and GrapheneOS, all passed): 1 and 3 min options (v1.2.1), Music repeat now a Loop: All | Selected pill (v1.2.2, v1.2.4), Settings Save menu (v1.2.3), track Glory in Her Mind with no license by user decision (v1.2.5), own music/images/metronome sounds with the Android origin switch (v1.2.6), check-credits fix (v1.2.7), `assets/to_add` excluded from the APK (v1.2.8), Tick sound dropdown (v1.2.9). Next: accessibility audit (v1.2/5), then security review (v1.2/6), which bumps to v1.3.0. v1.1 (Google Play) is still open: Play Console signup (blocked by Google's new-account check), tester recruiting, then PEPK export of the F-Droid key; its commits land under the current v1.2.x number.

## Handoff for the audit session (v1.2 steps 5 and 6)
- Start state: `main` = v1.2.10, pushed; no feature work in flight. Read the steering files, the roadmap, `0002`–`0005`, and the two prior audits for format: [`accessibility-v1.0.md`](docs/audits/accessibility/accessibility-v1.0.md), [`security-v1.0.md`](docs/audits/security/security-v1.0.md).
- Run the audits as the plan below says: accessibility first, security last. The user reviews and approves each; findings Low+ are fixed in the same version (LOCAL severity matrix).
- Leftover: a git worktree `.claude/worktrees/test-fast` holds a throwaway fast-timing test build (uncommitted). Ask the user before removing it.
- The user's global `~/.claude/rules/dev-workflow.md` may now have a "dev branch for multi-feature sessions" rule (user was to paste it); if so, it applies to any new multi-feature session.
- Debug APKs for the phone: build with the commands in `.claude/CLAUDE.md`, copy to `~/Downloads/`. `assets/to_add/` is the user's untracked media-waiting-for-attribution folder; never commit it or ship it.

## v1.2 plan of action

Versions follow the versioning rules: each feature gets its own patch version and exactly one commit, numbered first-come, first-served (no fixed step order); the final step bumps to v1.3.0. UI steps need human approval.

1. **Length and Mark every: 1 and 3 min** (v1.2/1) ✅ (v1.2.1) — add 1 and 3 minute choices to both pickers.
   - Source: roadmap v1.2 item 1 · Files: `js/constants.js`, `js/app.js`, `docs/design/0002-app-behavior.md` · Verify: both pickers list 1, 3, 5–60 min; a 1-min session ends on time · Deps: none
2. **Music repeat mode** (v1.2/2) ✅ (v1.2.2, v1.2.4 pill toggle) — Settings choice: loop the whole shuffled list, or repeat the current track.
   - Source: roadmap v1.2 item 2 · Files: `index.html`, `js/music.js`, `js/settings.js`, `js/constants.js`, `js/app.js`, `0002`, `0003` · Verify: each mode loops as described; saved with Persistent · Deps: user approves UI
3. **Save menu** (v1.2/3) ✅ (v1.2.3) — move Persistent / This session into a menu at the top right of Settings; wireframe in `0003` approved first.
   - Source: roadmap v1.2 item 3 · Files: `0003`, `index.html`, `css/`, `js/app.js` · Verify: user approves; keyboard and screen reader can open the menu and save · Deps: user approves wireframe
4. **Own media** (v1.2/4) ✅ (v1.2.6, v1.2.9 tick sound dropdown; device tests passed) — user adds their own music, images and metronome sounds; design in [`0005-own-media.md`](docs/design/0005-own-media.md).
   - Source: roadmap v1.2 item 4 · Files: new design note, `index.html`, `js/`, `0002`, `0003` · Verify: added files play/show after restart, with no network access; user approves · Deps: user approves design
5. **Accessibility audit** (v1.2/5) — agent drafts, user reviews.
   - Source: roadmap v1.2 item 5 · Files: `docs/audits/accessibility/accessibility-v1.2.md` · Verify: Lighthouse ≥90 (serve on loopback, see `.claude/CLAUDE.md`), manual keyboard walkthrough, screen reader (TalkBack, user on both phones), user approves · Deps: 1–4 ✅
   - Scope (new or changed this version): Settings Save menu (disclosure, Escape/focus return, "Discard changes?" notice); Loop pill (radiogroup, single focus ring, equal halves; contrast was **not measured**: measure 3:1 edge and 4.5:1 text in both states); Tick sound select + preview; "Add media >" button; Add media screen (three expanders with aria-expanded/aria-controls, hints via aria-describedby, two-step remove, notices inside `<main>`, file inputs); Credits (empty License line hidden); full-width wake-lock notice in portrait; 1 and 3 min pickers. Also check: 320/640 px reflow, text spacing, focus not obscured, landscape, reduced motion.
   - Known small items to log or fix: the wake-lock notice overlaps content at the bottom of Settings; file sizes under 0.1 MB read "0.0 MB"; no notice when the device has no file picker.
6. **Security review** (v1.2/6) — last; bumps to v1.3.0 (a release boundary: built, signed artifact per `versioning.md`).
   - Source: roadmap v1.2 item 6 · Files: `docs/audits/security/security-v1.2.md` · Verify: user approves; findings Low+ fixed · Deps: 5
   - Scope: Android origin moved from `file:///android_asset/` to WebViewAssetLoader (`https://appassets.androidplatform.net/`, in-app only, no network); new dependency `androidx.webkit` 1.14.0 (1.15+ needs minSdk 23; the app keeps 21) and `android.useAndroidX=true`; `MainActivity` file chooser (document picker, `content://` only, local only, callback answered once, no persistable grants, no URIs logged); CSP `blob:` added to `img-src` and `media-src` only; IndexedDB user media (names via `textContent`, 4096 px image limit, decode checks, storage-full handling, privacy: stays on device); `npm audit`; no INTERNET (`aapt dump permissions`); two clean `assembleRelease` builds byte-identical; `assets/to_add` excluded from the APK; the Glory in Her Mind track has no license listed (user exception to the license rule; flag the F-Droid/Play review risk); a metronome sound is read fully into memory to decode (huge files untested).

### Execution
- Steps 1–4 run in parallel, one agent and one worktree each (`v1.2-step-N`). Patch numbers are first-come, first-served: a step takes the next number when the user approves it and it merges to `main`, in any order. Agents leave work uncommitted; the main session rebases, bumps the version, commits once and merges after approval.
- Steps 2, 3 and 4 touch the Settings form and will conflict; the main session resolves conflicts at merge.
- Steps 3 and 4 start with design only (wireframe / 3 mockups); no code until the user chooses.
- Steps 1–4 landed (v1.2.1–v1.2.9). Reviews 5, 6 in the main session with the user.
- Status: ✅ 1 · ✅ 2 · ✅ 3 · ✅ 4 · ☐ 5 accessibility · ☐ 6 security

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
