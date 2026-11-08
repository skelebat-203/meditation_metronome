# Accessibility audit — v1.0

Roadmap: v1.0 step 4. Target: WCAG 2.2 AA. Severity scale: `issue-severity-matrix_LOCAL.md` (bug lens). Status: drafted by the agent, awaiting user review.

Scope: the one app change since v0.5 is the saved start track (`0004` #3, v0.6.2), plus the new F-Droid store text (v0.6.1).

## Method

| Check | How | Status |
|---|---|---|
| Lighthouse ≥ 90 | Lighthouse 13.5.0, Playwright Chromium, served on loopback | ✅ 100 (launch screen) |
| Saved start track | Headless Playwright: pick a track in Settings, Persistent, reload; This session, reload | ✅ saved track starts after reload; This session choice is not kept |
| Settings form shows the active track | Track dropdown is filled from the session track on open | ✅ |
| Store text reading level | Flesch-Kincaid on `fastlane/metadata/android/en-US/` | ✅ full description grade 1.7 (ease 95); short description grade 9.7 |
| Keyboard, focus, reflow, TalkBack | No markup, control or focus change; v0.2–v0.4 results apply | N/A |

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| A11Y-18 | Info | The short description scores grade 9.7, but only because it is one 12-word sentence with the long words "meditation" and "metronome", which the app name already uses. No plainer wording keeps the meaning. | No action. |
| A11Y-17 | Info | Carried from v0.5: no cue when the OS stops a background session (GrapheneOS). Accepted in `0004` #5; the store text now warns about it. | No action. |

## Passed

- Lighthouse accessibility score 100, no failing audits.
- The saved track change adds no control, label or message; the existing Persistent / This session buttons and track dropdown cover it.
- Full store description reads at about grade 2, with short sentences and lists.
