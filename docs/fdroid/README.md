# Publishing on F-Droid

F-Droid builds the app itself from this repo's source, signs it with its own key, and publishes it. The recipe it uses is `io.github.skelebat203.meditationmetronome.yml` in this folder. It is filled in for the v1.0.0 launch.

## How the version is found

- `package.json` holds both `version` (e.g. `1.0.0`) and `versionCode` (e.g. `10000`).
- `versionCode` must equal `major*10000 + minor*100 + patch`. The Android build stops with an error if it does not, so the two cannot drift.
- Update both fields together on every version bump.
- F-Droid's update checker reads both from `package.json` in each new tag (`UpdateCheckData` in the recipe). Then it adds a new build by itself.

## Before you submit
1. Make sure `package.json` says `"version": "1.0.0"` and `"versionCode": 10000` on the release commit.
2. Tag that commit `v1.0.0` and push the tag to GitHub. The recipe builds from this tag.
3. Check the recipe once more: version 1.0.0, versionCode 10000, commit `v1.0.0`.

## Submitting (first time)
1. **Make a GitLab account.** Go to gitlab.com and sign up. It is free.
2. **Fork fdroiddata.** Open `https://gitlab.com/fdroid/fdroiddata` and press **Fork**. This makes your own copy.
3. **Make a branch.** In your fork, make a new branch, e.g. `add-meditation-metronome`.
4. **Add the recipe.** In that branch, add a new file at `metadata/io.github.skelebat203.meditationmetronome.yml`. Paste in the recipe from this folder. Commit it.
5. **Optional: test it.** If you have `fdroidserver` installed, run `fdroid lint io.github.skelebat203.meditationmetronome` and `fdroid build -v -l io.github.skelebat203.meditationmetronome` inside your fdroiddata clone.
6. **Open a merge request.** Ask to merge your branch into `fdroid/fdroiddata` `master`. Pick the **App inclusion** template. Tick each line of the checklist that is true.
7. **Wait for review.** A volunteer checks it. This can take a few days to several weeks. A build bot also runs; if it fails, read its log.
8. **Once merged,** the app shows up in F-Droid after the next build cycle (usually a few days).

## What reviewers may ask
- **License:** that `LICENSE` matches the recipe (GPL-3.0-or-later).
- **Assets:** where the music and images come from. Point them to `ATTRIBUTION.md`.
- **Anti-features:** none apply. The app has no ads, no tracking and no network access.
- **Recipe changes:** they may tidy the recipe or ask for small fixes. Make them in your branch; the merge request updates by itself.
- **Store text and images:** these come from `fastlane/metadata/android/en-US/` in this repo.

Answer in the merge request comments.

## After that
- New versions: bump `version` and `versionCode` in `package.json`, add `fastlane/metadata/android/en-US/changelogs/{versionCode}.txt`, then push a `v{version}` tag. F-Droid finds and builds it.
- F-Droid signs the APK with its own key, so an APK you build and sign yourself cannot update an F-Droid install (and the reverse).
- Reproducible builds (later): the release build is deterministic, so you can later publish your own signed APK and add `Binaries:` and `AllowedAPKSigningKeys:` to the recipe. F-Droid then ships your signed APK after checking its own build matches.

## Signing releases (reproducible builds)

The app uses F-Droid reproducible builds: F-Droid rebuilds each tagged release and publishes the developer-signed APK only if its build matches.

- Key: `.tools/signing/release.keystore` (PKCS12; copy `release.p12`), password in `.tools/signing/release-keystore-password.txt`. Both are git-ignored and backed up by the user. Losing the key means no more updates for this app ID.
- Certificate SHA-256 (in the recipe as `AllowedAPKSigningKeys`): `6be464bd4e82ed7f241713fb8eb30faee196fe7b04c741b4738c0e0c72e528d4`
- For each release: tag `v{version}`, build `assembleRelease` from the tag, sign with `apksigner sign --alignment-preserved true --v4-signing-enabled false --ks .tools/signing/release.keystore --ks-key-alias meditationmetronome --ks-pass file:.tools/signing/release-keystore-password.txt --out meditation-metronome-v{version}.apk app-release-unsigned.apk`, and attach that exact file name to the GitHub release before F-Droid checks the tag.
- Sign with `--alignment-preserved true`: F-Droid copies the signature onto its own build without re-aligning, so the signed APK must keep the unsigned build's exact zip layout.
