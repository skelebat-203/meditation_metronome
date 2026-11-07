# Accessibility audit — v0.2

Roadmap: v0.2 item 7. Target: WCAG 2.2 AA. Severity scale: `issue-severity-matrix_LOCAL.md` (bug lens). Status: drafted by the agent, awaiting user review.

Scope: changes since v0.1 — credits screen, session length and marks controls (launch and settings), Images toggle moved to Settings, music-error notice (SEC-02), track preview fade.

## Method

| Check | How | Status |
|---|---|---|
| Lighthouse ≥ 90 | Lighthouse 13.5.0 (local dev dependency), Playwright Chromium, served on loopback | ✅ 100 (launch screen) |
| Accessibility tree, names, roles, states | Playwright `ariaSnapshot()` on settings and with the music-error notice showing | ✅ done |
| Keyboard tab order | Playwright, launch, settings, credits, meditation | ✅ done |
| Keyboard navigation and focus return | Playwright: Enter on Settings, Credits, Back, Start, End; 10 s session ending on its own | ✅ done |
| Reflow / text resize at 200% | Playwright, root font-size 200%, 360×740 and 740×360, launch, settings, credits | ✅ done |
| Credits scroll by keyboard | Playwright, PageDown / ArrowDown from the focused heading | ✅ done |
| Music-error notice | Playwright, all `.opus` requests blocked | ✅ done |
| Contrast | Calculated from CSS tokens | ✅ done |
| Manual focus pass | Keyboard only, Firefox and Chrome, by the user | pending — user |
| Screen reader pass | Orca (Linux), by the user | pending — user |

Lighthouse audits the screen visible on load (launch). Settings, credits and meditation are covered by the Playwright checks above.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| A11Y-07 | Medium | Launch screen at 200% text in portrait (360 px): the Session length picker was wider than the screen, so it and the Metronome toggle ran off both sides (WCAG 1.4.4, 1.4.10). | ✅ fixed: toggle-row items capped at the screen width; the Session length label and picker wrap and stack. |
| A11Y-08 | Medium | Settings header at 200% text in portrait: the "Settings" title ran off the right edge and squeezed Back (WCAG 1.4.4, 1.4.10). Also affected the Credits header. | ✅ fixed: header wraps; the title drops below Back. |
| A11Y-09 | Low | Music-error notice hides itself after 8 s (WCAG 2.2.1). It is `role="alert"`, so screen readers announce it at once, and it is informational only (no action needed). | ✅ fixed (v0.2.10, user decision): the notice stays 30 s and has a close (✕) button named "Close message", reachable by keyboard; closing it while focused returns focus to the screen heading. |
| A11Y-10 | Info | On Settings and Credits, focus lands on the heading, so Back is reached with Shift+Tab or after the last control. Same as v0.1; Android Back and browser Back also work. | No action. |
| A11Y-11 | Info | The music-error notice sits outside `<main>`. It is a live alert, not page content; Lighthouse's landmark check does not apply to it. | ✅ fixed (v0.2.10, user decision): the notice is placed inside the visible screen's `<main>` and moves with screen changes. |

## Passed

- Lighthouse accessibility score 100.
- Session length (launch and settings) and Mark every are native `<select>`s with visible labels; Marks is a labelled checkbox; all change with arrow keys.
- Tick-sound, track-preview and volume controls keep their v0.1 names; the track preview button is named "Play 5 s of track".
- Credits: reached from Settings → Credits by keyboard; focus moves to the "Credits" heading; 32 headings (h2 groups, h3 per asset) give screen-reader structure; the list scrolls with PageDown and arrow keys; Back returns focus to the Credits button.
- Navigation focus: Back from Settings returns focus to the Settings button; End returns focus to Start with "Session ended" announced; a session that ends on its own (10 s test) returns to launch with focus on Start and "Session complete" announced.
- Meditation controls do not hide while one of them has keyboard focus.
- Music-error notice: `role="alert"`, announced without moving focus; text `#eef1f6` on `rgba(11,16,32,0.92)` ≈ 16:1.
- Track preview stops when leaving Settings or opening Credits, so no audio keeps playing on a screen without a stop control.
- No horizontal overflow at 200% text in either orientation after the fixes; screens scroll vertically instead of clipping.
- No console errors in Chromium.
