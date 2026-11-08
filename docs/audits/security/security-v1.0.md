# Security review — v1.0

Roadmap: v1.0 step 5. Threat model: LOCAL (`issue-severity-matrix_LOCAL.md`). Domains: `security-domains.md` (OWASP ASVS 5.0.0 chapter names). Status: drafted by the agent, awaiting user review. Not yet bumped to v1.0.0.

## Summary

### Executive summary
v1.0 adds the F-Droid recipe (`UpdateCheckData`), a `versionCode` literal in `package.json` checked by Gradle, and the saved start track in localStorage (`0004` #3). The review covered `git diff main..HEAD` plus the whole app (web code, WebView shell, manifest, recipe). One Low finding: the Gradle check accepted minor or patch numbers above 99, where the versionCode formula collides or goes backwards; fixed in v0.6.4. The stored track id is validated against the built-in track list before use. The v0.6.4 release APK has no permissions and versionCode 604 matches `package.json`. `npm audit`: 0 vulnerabilities.

### Summary table

| ID | Severity | CWE | Status | Issue |
| --- | --- | --- | --- | --- |
| 7.1 | Low | CWE-190 | Fixed (v0.6.4) | The Gradle versionCode check only compared against major*10000 + minor*100 + patch, so a version like 0.5.100 (code 600) passed while colliding with 0.6.0, breaking F-Droid update ordering. |
| 5.1 | Info | CWE-1357 | Not Fixed [Info needs no action. F-Droid recipes build from tags by convention; the tag is checked by F-Droid's reviewers and later builds are pinned by its update checker.] | The recipe's `commit: v1.0.0` names a mutable git tag rather than a commit hash, so a moved tag would change what F-Droid builds for that version. |

## Domain 7 - Secure Coding and Architecture

**7.1 versionCode range (Low, fixed).** `android/app/build.gradle` now fails the build unless the version is exactly `major.minor.patch` with minor and patch in 0..99, before the existing match check. Verified: `0.5.100`/`600` fails with the range message; `0.6.3`/`604` fails with the mismatch message; `0.6.3`/`603` passes.

Passed:
- Saved track (`js/settings.js`): stored as the track's file path and mapped back only by exact match against `APP.MUSIC.TRACKS`; any other value (path traversal, `javascript:` URL, number, object, null) falls back to a random start. Track indices from the form are checked as integers in range. Tested with headless Playwright across reloads; This session choices are not written to storage.
- Other stored settings keep the existing key/type allowlist and clamping (`sanitize`).
- `npm audit`: 0 vulnerabilities; dev dependencies pinned exact, not shipped.

## Domain 5 - Configuration

Passed:
- Recipe `UpdateCheckData` reads `versionCode` and `version` from `package.json` with digit-only captures; no scripts, `prebuild` or `srclibs` in the recipe.
- Release APK (v0.6.4 `assembleRelease`): `aapt dump permissions` lists none; versionCode 604 / versionName 0.6.4 match `package.json`. Manifest and WebView settings (no file/content access, no JS bridge, not debuggable, no backup) unchanged since v0.4.

## Secrets and artifacts

Passed: `git diff main..HEAD` holds docs, store text, the recipe, `js/settings.js`, `js/constants.js`, `build.gradle` and `package.json`; no secrets or build output.
