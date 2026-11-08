# Master Rules

Project-specific instructions for Meditation Metronome. Complements the global instruction set; does not override a direct user instruction about goal or outcome.

## General rulesets
General rules load globally from `~/.claude/rules/` and `~/.claude/skills/`.
This project is local-only (no network access), so it uses the LOCAL severity matrix:
- @~/.claude/rules-library/issue-severity-matrix_LOCAL.md

## Docs
- Roadmap (scope): `docs/design/0001-roadmap.md`
- Current work: `RESUME-HERE.md`
- Asset licenses: `ATTRIBUTION.md`

## Project rules
- Plain HTML, CSS and JavaScript; media in `assets/`. No framework, no build step, no CDN or remote resources.
- The app makes no network access of any kind. Do not add the Android INTERNET permission. (The git repo has a remote; push rules are in the global `version-control.md`.)
- **One commit per patch version.** Each version number (e.g. v0.2.1) gets exactly one commit; never make a second commit with the same version. Follow-up fixes or doc changes either amend that commit, only if it has not been pushed, or wait and go into the next version's commit. Overrides the global checkpoint-commit rule for this project.
- All visible UI, including notices and messages, sits inside a landmark, normally `<main>`; no stray elements after `</main>`.
- Assets must be CC0, public domain, or CC BY, and listed in `ATTRIBUTION.md` before they are committed.

## Browser testing (agents)
- Headless Chromium via Playwright is a local dev-only dependency (`devDependencies` in the root `package.json`, pinned exact). It is never shipped in the app. Browsers live in `~/.var/app/com.vscodium.codium/cache/ms-playwright/`.
- Setup in a fresh checkout or worktree: `npm ci`, then `npx playwright install chromium` if the browser is missing.
- Load it in Node with `require("playwright")` from the project root and open `index.html` by `file://` URL. Keep test scripts in the session scratchpad, not the repo.
- Lighthouse is also a local dev-only dependency. It cannot audit `file://` URLs, so serve the app on loopback first and point it at Playwright's Chromium:
  ```
  python3 -m http.server 8765 --bind 127.0.0.1 &
  CHROME_PATH=$(node -e 'console.log(require("playwright").chromium.executablePath())') \
    npx lighthouse http://127.0.0.1:8765/index.html --only-categories=accessibility \
    --chrome-flags="--headless=new --no-sandbox" --output=json --output-path={scratchpad}/lh.json
  ```
  Stop the server afterwards. `--no-sandbox` is included because Chrome's own sandbox may fail inside the editor's Flatpak (untested without it).
- This is for agent checks only. The user tests in the system Firefox and Chrome, which stays the authority for the `Verify:` lines.

## Android build (agents)
- Version sync: every version bump also updates `versionCode` in `package.json` (major*10000 + minor*100 + patch). Gradle fails the build if it doesn't match; F-Droid's update checker reads it.
- Build tools (JDK 17, Android SDK) live in `.tools/` at the main checkout root (git-ignored), shared by all worktrees. Not part of the app. Install or repair with `scripts/setup-android-tools.sh` (pinned versions, checksums, idempotent; no sudo, nothing outside `.tools/`).
- Set these before any build, with `{main}` the main checkout root:
  ```
  export JAVA_HOME={main}/.tools/jdk
  export ANDROID_HOME={main}/.tools/android-sdk
  export ANDROID_USER_HOME={main}/.tools/android-user
  export GRADLE_USER_HOME={main}/.tools/gradle
  ```
- Build a debug APK from the checkout or worktree: `cd android && ./gradlew assembleDebug`. The web files (`index.html`, `css/`, `js/`, `assets/`) are copied into the APK at build time; there is no second copy in git. Output: `android/app/build/outputs/apk/debug/app-debug.apk`.
- Release build: `cd android && ./gradlew assembleRelease` outputs `android/app/build/outputs/apk/release/app-release-unsigned.apk`. Two clean builds must be byte-identical.
- Check permissions: `$ANDROID_HOME/build-tools/35.0.0/aapt dump permissions {apk}` (no INTERNET allowed).
