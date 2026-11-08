# Security review — v0.4

Roadmap: v0.4 step 6. Threat model: LOCAL (`issue-severity-matrix_LOCAL.md`). Domains: `security-domains.md` (OWASP ASVS 5.0.0 chapter names). Status: drafted by the agent, awaiting user review.

## Summary

### Executive summary
v0.4 adds a release build, an F-Droid recipe and store listing, and removes the 10 s test option. The review covered `git diff main..v0.4` and the whole app: release manifest, reproducibility, build supply chain, the recipe and the fastlane metadata. The release APK is not debuggable, has no permissions, no backup and one launcher activity; two clean builds are byte-identical; Gradle resolves only from Google and Maven Central. No Low+ findings, so nothing needed fixing under the Fix policy. Three Info notes follow. `npm audit` stays deferred to v0.6 (user decision).

### Summary table

| ID | Severity | CWE | Status | Issue |
| --- | --- | --- | --- | --- |
| 6.1 | Info | — | No action [carried user cleanup from v0.3 6.1: `~/.android` now also holds `adbkey`, `adbkey.pub` and `adb.5037`, written 22:04 by an `adb` run outside the project setup; not created by this build] | `~/.android` exists outside `.tools/` again; the release builds in this review used `ANDROID_USER_HOME=.tools/android-user` and did not touch it. |
| 7.1 | Info | — | No action [functional, not security; fill the real versionCode at submit time per `docs/fdroid/README.md`] | Recipe template `versionCode: 40{N}` matches the formula only for patch 0–9; from 0.4.10 the formula gives 410, not 4010. |
| 7.2 | Info | — | No action [functional, not security; check with `fdroid checkupdates` before submit] | versionCode is computed in Gradle from `package.json`, so F-Droid's `UpdateCheckMode: Tags` may not read it from the tagged source; auto-updates may need `UpdateCheckData`. |

## Domain 5 - Configuration

Passed (release APK `app-release-unsigned.apk`, 0.4.4):
- `aapt`: no permissions; no `debuggable`; `allowBackup=false`; one activity, exported only as the launcher.
- WebView debugging: no `setWebContentsDebuggingEnabled`; release is not debuggable, so it stays off.
- No network security config; cleartext is off by default at target SDK 35 and moot without INTERNET.
- WebView lockdown unchanged from v0.3.
- Unsigned; no keystore in the repo (`.gitignore` covers `*.keystore`, `*.jks`, `*.apk`).

## Domain 6 - Data Protection

| ID | Severity | CWE | Status | Finding |
|---|---|---|---|---|
| 6.1 | Info | — | No action (see summary) | `~/.android`: `analytics.settings`, `cli/`, `bin/` (21:08–21:09) and adb keys (22:04). User cleanup: delete it if unwanted. |

Passed: fastlane text has no personal data; PNGs carry no text/EXIF chunks; screenshots show only app UI and bundled images. Recipe `AuthorName` is a placeholder; commits use the GitHub noreply address.

## Domain 7 - Secure Coding and Architecture

| ID | Severity | CWE | Status | Finding |
|---|---|---|---|---|
| 7.1 | Info | — | No action (see summary) | `docs/fdroid/io.github.skelebat203.meditationmetronome.yml`: `versionCode: 40{N}`. |
| 7.2 | Info | — | No action (see summary) | `android/app/build.gradle` reads the version from `package.json` at build time. |

Passed:
- Reproducible: two clean `assembleRelease` builds gave the same SHA-256 (`76a0a03e…c629`); `vcsInfo` off, `dependenciesInfo` off, no BuildConfig.
- Gradle repositories: `google()` and `mavenCentral()` only (plugin portal removed in v0.4); `FAIL_ON_PROJECT_REPOS`; AGP 8.7.3 pinned; no libraries.
- Wrapper: distribution pinned by `distributionSha256Sum`, `validateDistributionUrl=true`; wrapper JAR SHA-256 unchanged from v0.3 (`2db75c40…8046`, matches Gradle's published value).
- F-Droid recipe: no secrets; repo `https://github.com/skelebat-203/meditation_metronome.git`; builds from tags `v0.4.{N}`, `subdir: android/app`, F-Droid signs.
- 10 s removal: a saved 10 s value is rejected by `sanitize` and falls back to the default.

## Secrets and artifacts

Passed: none committed.
