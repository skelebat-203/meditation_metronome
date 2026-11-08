# Accessibility audit — v0.4

Roadmap: v0.4 step 5. Target: WCAG 2.2 AA. Severity scale: `issue-severity-matrix_LOCAL.md` (bug lens). Status: drafted by the agent, awaiting user review.

Scope: changes since v0.3 — 10-second test option removed from Session length and Marks (step 1), release build (step 2), F-Droid store listing (step 3). No layout, control or on-device behavior changed.

## Method

| Check | How | Status |
|---|---|---|
| Lighthouse ≥ 90 | Lighthouse 13.5.0, Playwright Chromium, served on loopback | ✅ 100 (launch screen) |
| Length and Marks pickers | Playwright: Length offers Off, 5–60 min; Marks 5–60 min; no "s (test)" option; Arrow Down changes the launch Length picker | ✅ done |
| Saved 10 s setting | Playwright: stored `sessionLength: 10`, `markInterval: 10` load as Off and 5 min (defaults) | ✅ done |
| Keyboard tab order, launch | Playwright: Length > Metronome > Music > Settings > Start, unchanged from v0.3 | ✅ done |
| Release APK label | `aapt dump badging`: `application-label: 'Meditation Metronome'` | ✅ done |
| Store text reading level | Flesch-Kincaid grade: full description 1.8, short description 9.7, changelog 2.4 | ✅ ≤ 10 |
| Store icon contrast | `icon.png` pixels: `#EEF1F6` glyph on `#0B1020` ≈ 16:1 | ✅ done |
| Screenshot alt text | F-Droid has no alt-text field for screenshots | N/A |
| Device checks (TalkBack, large text) | No on-device behavior changed; v0.3 results apply | N/A |

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| A11Y-16 | Info | Start is focused on load, so it shows a focus ring before any input. Intended: keyboard and screen reader users land on the main action. | No action. |

## Passed

- Lighthouse accessibility score 100.
- Removing the 10 s option leaves both pickers with plain "N min" labels; no other screen changed, so v0.2/v0.3 keyboard, focus-return and 200% reflow results still apply.
- Store listing uses plain words and short sentences; the icon matches the launcher icon.
