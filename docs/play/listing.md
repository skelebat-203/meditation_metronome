# Play store listing check

Source: `fastlane/metadata/android/en-US/`. Limits checked 2026-11-08 against the live Play Console help page "Add preview assets to showcase your app" (answer 9866151). That page does not state the title and full description limits; those use the known Play limits (30 and 4,000 characters).

## Passes

| Item | Play limit | Ours |
|---|---|---|
| Title | 30 characters | 20 ("Meditation Metronome") |
| Short description | 80 characters | 67 |
| Full description | 4,000 characters | 961 |
| Icon size | 512 × 512 PNG, up to 1,024 KB | 512 × 512, 7.5 KB |
| Feature graphic | 1024 × 500, JPEG or 24-bit PNG, no alpha | New: `images/featureGraphic.png`, 1024 × 500 RGB PNG, from `calm-bliss.webp` (CC0) with the app icon. Listed in `ATTRIBUTION.md`. Needs user approval. |
| Screenshot count | 2 to 8 | 5 |
| Screenshot format | JPEG or 24-bit PNG, no alpha, 320 to 3,840 px | 1080 × 2400 RGB PNG |

## Needs changing

1. **Screenshots are too tall.** Play says the longer side can't be more than twice the shorter side. 2400 / 1080 = 2.22. Options: retake at 1080 × 1920 (9:16, Play's recommended size), or crop the current ones to 1080 × 2160 (2:1). Retaking at 9:16 is better: it also counts for Play's "recommended" formats (at least 4 at 1080 px or more). Use a separate Play folder if F-Droid should keep the current ones.
2. **Icon has no alpha channel.** Play asks for a 32-bit PNG with alpha. Ours is 24-bit RGB. The fix is to save it again as RGBA (same look). It may upload as is; check in the Console.

## Text

The text reads at a plain level and makes no claims Play would reject. One item to check: "No permissions needed" is true for this build (the AAB has no permissions). The GrapheneOS note can stay.
