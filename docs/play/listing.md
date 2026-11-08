# Play store listing check

Source: `fastlane/metadata/android/en-US/`. Limits checked 2026-11-08 against the live Play Console help page "Add preview assets to showcase your app" (answer 9866151). That page does not state the title and full description limits; those use the known Play limits (30 and 4,000 characters).

## Passes

| Item | Play limit | Ours |
|---|---|---|
| Title | 30 characters | 20 ("Meditation Metronome") |
| Short description | 80 characters | 67 |
| Full description | 4,000 characters | 961 |
| Icon | 32-bit PNG with alpha, 512 × 512, up to 1,024 KB | 512 × 512 RGBA PNG, 8 KB (re-saved in v1.1.5; same pixels, fully opaque) |
| Feature graphic | 1024 × 500, JPEG or 24-bit PNG, no alpha | New: `images/featureGraphic.png`, 1024 × 500 RGB PNG, from `calm-bliss.webp` (CC0) with the app icon. Listed in `ATTRIBUTION.md`. Needs user approval. |
| Screenshot count | 2 to 8 | 6 |
| Screenshot format | JPEG or 24-bit PNG, no alpha, 320 to 3,840 px, long side at most 2× short side | 1080 × 2160 RGB PNG (2:1), no status bar |

Screenshots (v1.1.5, taken with Playwright at 432 × 864, scale 2.5): 1 home, 2 session with controls (4:34 remaining), 3 session with controls hidden (0:07 elapsed), 4 settings top, 5 settings lower, 6 credits. F-Droid uses the same files.

## Needs changing

Nothing open. A feature graphic without the dark square is waiting for user approval.

## Text

The text reads at a plain level and makes no claims Play would reject. One item to check: "No permissions needed" is true for this build (the AAB has no permissions). The GrapheneOS note can stay.
