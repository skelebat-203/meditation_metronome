# Accessibility audit — v0.5

Roadmap: v0.5 step 3. Target: WCAG 2.2 AA. Severity scale: `issue-severity-matrix_LOCAL.md` (bug lens). Status: drafted by the agent, awaiting user review.

Scope: v0.5 changed no app code. Background playback was marked complete by user decision (testers: works on Android; GrapheneOS stops the session, tracked in `0004` item 5).

## Method

| Check | How | Status |
|---|---|---|
| Lighthouse ≥ 90 | Lighthouse 13.5.0, Playwright Chromium, served on loopback | ✅ 100 (launch screen) |
| No app changes since v0.4 | `git diff main~1..HEAD -- js css index.html android` | ✅ empty |
| Keyboard, focus, reflow, TalkBack | No UI or on-device behavior changed; v0.2–v0.4 results apply | N/A |

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| A11Y-17 | Info | When the OS stops a session in the background (GrapheneOS), the app gives no cue: no sound, notification or message on return. A user who cannot see the screen, or has the screen off, may not know the session ended early. Tracked as platform behavior in `0004` item 5; a cue would need a foreground service or notification, out of scope by user decision. | No action. |

## Passed

- Lighthouse accessibility score 100.
- No layout, control or behavior change, so earlier keyboard, focus-return, 200% reflow and TalkBack results still apply.
