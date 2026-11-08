# Publishing on F-Droid

F-Droid builds the app itself from this repo's source, signs it with its own key, and publishes it. The recipe it uses is `io.github.skelebat203.meditationmetronome.yml` in this folder.

## Before you submit
1. Pick the release commit and tag it `v0.4.{N}` (the version in `package.json`). Push the tag to GitHub.
2. In the recipe, replace every `{placeholder}`: the version, the versionCode (`major*10000 + minor*100 + patch`, e.g. 0.4.3 → 403) and your author name (or delete the `AuthorName` line).
3. Check the License line. `LICENSE` is GPL v3; the recipe says "or later". Change it to `GPL-3.0-only` if that is what you intend.

## Submitting
1. Create a free account on gitlab.com.
2. Fork the `fdroid/fdroiddata` repository.
3. In your fork, add the recipe as `metadata/io.github.skelebat203.meditationmetronome.yml`.
4. Optional: install `fdroidserver` and run `fdroid lint io.github.skelebat203.meditationmetronome` and `fdroid build -v -l io.github.skelebat203.meditationmetronome` to test it locally.
5. Open a merge request to `fdroid/fdroiddata` using the "App inclusion" template. Fill in the checklist.
6. A volunteer reviews it. Expect questions and a wait of a few days to several weeks. Answer in the merge request.
7. Once merged, the app appears in F-Droid after the next build cycle (usually within a few days).

## After that
- New versions: push a new `v0.4.{N}`-style tag with the bumped `package.json` version. `UpdateCheckMode: Tags` lets F-Droid find it and build it automatically.
- F-Droid signs the APK with its own key, so an APK you build and sign yourself cannot update an F-Droid install (and the reverse).
- Reproducible builds (later): the release build is deterministic, so you can later publish your own signed APK and add `Binaries:` and `AllowedAPKSigningKeys:` to the recipe. F-Droid then ships your signed APK after checking its own build matches.
