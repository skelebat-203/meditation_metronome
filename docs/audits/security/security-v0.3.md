# Security review — v0.3

Roadmap: v0.3 step 8. Threat model: LOCAL (`issue-severity-matrix_LOCAL.md`). Domains: `security-domains.md` (OWASP ASVS 5.0.0 chapter names). Status: drafted by the agent, awaiting user review.

## Summary

### Executive summary
v0.3 wraps the web app in an Android WebView APK, adds project-local Android build tools, a credits check script and Keep screen awake. The review covered `git diff main..v0.3` and the whole app: WebView lockdown, manifest, build supply chain, the credits script and the wake-lock code. The WebView is locked to bundled files with no bridge, no permissions, no backup and no debugging in release. Every Low+ finding is fixed in v0.3 (Fix policy, LOCAL matrix): the command-line tools zip is checked by SHA-256 (7.1, v0.3.13) and SDK tooling is redirected to `.tools/android-user` (6.1, v0.3.2). 5.1 is re-rated Info: no realistic risk. 8.1 (silent wake-lock failure) is a usability defect, moved to the accessibility report as A11Y-15 and fixed in v0.3.13. The Gradle wrapper JAR matches Gradle's published checksum.

### Summary table

| ID | Severity | CWE | Status | Issue |
| --- | --- | --- | --- | --- |
| 5.1 | Info | — | No action [nothing plays before the user taps Start; after that, timers drive track changes and chimes, which need gesture-free playback; only bundled local files can load, so no outside page or file can trigger audio: no realistic risk] | WebView set to `setMediaPlaybackRequiresUserGesture(false)`, so page script may start audio without a tap; with local-only content the risk is limited to the app's own media. |
| 5.2 | Info | — | No action [step 4 (v0.3.7): the web wake lock works on GrapheneOS, so the native flag is not needed] | `FLAG_KEEP_SCREEN_ON` is not used because the lockdown forbids a JS-to-Android bridge; Keep screen awake relies only on the web Screen Wake Lock API, which Android WebView may not support. |
| 6.1 | Low | CWE-359 | Fixed (v0.3.2) [setup sets `ANDROID_USER_HOME=.tools/android-user`; user cleanup: delete the existing `~/.android`, recreated at 21:08 by an `android-cli` binary outside this build] | Android SDK tooling created `~/.android` with an analytics settings file (holding a random user ID, opted out) and a queued metrics folder, outside the project's `.tools/`. |
| 7.1 | Low | CWE-328 | Fixed (v0.3.13) | `setup-android-tools.sh` verifies the Android command-line tools zip by SHA-1 only; the JDK uses SHA-256 and SDK packages are verified by `sdkmanager`. |
| 8.1 | — | — | Moved to accessibility-v0.3.md as a defect (A11Y-15) | If the wake-lock request fails, the app only logged a console warning, so a user who turned on Keep screen awake was not told the screen may turn off. Usability defect, not a security risk. |

## Domain 5 - Configuration

Android WebView and manifest.

| ID | Severity | CWE | Status | Finding |
|---|---|---|---|---|
| 5.1 | Info | — | No action (see summary) | `MainActivity`: `setMediaPlaybackRequiresUserGesture(false)`. Needed because playback after Start runs on timers. Only `file:///android_asset/web/` loads (see Passed), so only the app's own media can play. |
| 5.2 | Info | — | No action (wake lock works on device, v0.3.7) | No `FLAG_KEEP_SCREEN_ON` (no bridge, per `0002` § Platform). The flag could be set natively for the whole activity without a bridge, but then it would ignore the setting. See A11Y-13. |

Passed:
- No `addJavascriptInterface`; no bridge of any kind.
- File access: `setAllowFileAccess`, `setAllowContentAccess`, `setAllowFileAccessFromFileURLs`, `setAllowUniversalAccessFromFileURLs` all `false`; assets still load from `file:///android_asset`.
- Navigation: `shouldOverrideUrlLoading` blocks and `shouldInterceptRequest` returns an empty response for every URL outside `file:///android_asset/web/` (both API variants). No multiple windows, no script-opened windows, geolocation off.
- Mixed content: WebView default on API 21+ is never-allow; unused (no network).
- Debugging: no `setWebContentsDebuggingEnabled`; release APK manifest has no `debuggable` (debug APK only, as expected).
- Manifest: no permissions (`aapt dump permissions` lists none; no INTERNET). `allowBackup="false"`. Cleartext is off by default at target SDK 35 and moot without INTERNET.
- Exported components: one activity, exported because it is the launcher; no extras or data read from the intent.

## Domain 4 - Web Frontend Security

Passed: wake-lock code (`js/app.js`) takes the lock only in a session with the setting on, releases it on end or setting off, retakes it on return to foreground, and releases a lock granted after the session ended. CSP unchanged from v0.2.

## Domain 6 - Data Protection

| ID | Severity | CWE | Status | Finding |
|---|---|---|---|---|
| 6.1 | Low | CWE-359 | Fixed (v0.3.2) by the redirect; user to delete `~/.android` | During setup the SDK tool wrote `~/.android/analytics.settings` (random user ID, `hasOptedIn: false`) and a queued metrics folder. Setup now sets `ANDROID_USER_HOME=.tools/android-user`. At review time `~/.android` again held `analytics.settings`, `cli/analytics/`, `cli/last_update_check` and a 93 MB `bin/android-cli`, created 21:08, before this review's build (21:17); source not this build. No personal data seen; nothing confirmed sent. |

## Domain 7 - Secure Coding and Architecture

| ID | Severity | CWE | Status | Finding |
|---|---|---|---|---|
| 7.1 | Low | CWE-328 | Fixed (v0.3.13) | `CMDLINE_TOOLS_SHA1` in `scripts/setup-android-tools.sh`. SHA-1 is collision-prone. Fix: `CMDLINE_TOOLS_SHA256` checked with `sha256sum`. Google publishes no SHA-256 for build 16111833 (repository XML gives SHA-1 only; the download page lists a different build), so the SHA-256 `0877a1d0…cfa8` was computed from a fresh download that passed the published SHA-1 and pinned. Re-running the script passes (idempotent). |

Passed:
- Gradle wrapper: `gradle-8.11.1-bin.zip` pinned with `distributionSha256Sum`; `validateDistributionUrl=true`. Wrapper JAR SHA-256 `2db75c40782f5e8ba1fc278a5574bab070adccb2d21ca5a6e5ed840888448046` matches Gradle's published `gradle-8.11.1-wrapper.jar.sha256` (checked v0.3.13).
- AGP pinned exact (8.7.3); repositories limited to Google, Maven Central and the Gradle plugin portal; `FAIL_ON_PROJECT_REPOS`; no third-party libraries in the APK.
- Setup script: HTTPS only (`--proto '=https'`), checksum before unpack, no sudo, writes only to `.tools/`.
- `scripts/check-credits.js`: dev-only, no dependencies, reads repo files only; it runs `js/credits.js` in `vm.runInNewContext`, which is not a sandbox but only ever loads the repo's own file.
- `npm audit` still deferred to v0.6 (v0.2 finding 7.1).

## Domain 8 - Security Logging and Error Handling

| ID | Severity | CWE | Status | Finding |
|---|---|---|---|---|
| 8.1 | — | — | Moved to accessibility-v0.3.md as a defect | Silent wake-lock failure is a usability defect, not a security risk; recorded and fixed (v0.3.13) as A11Y-15. |

## Secrets and artifacts

Passed: none committed; `.gitignore` covers `.tools/`, Android build output, keystores and APK/AAB.
