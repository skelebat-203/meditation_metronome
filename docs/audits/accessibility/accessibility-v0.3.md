# Accessibility audit — v0.3

Roadmap: v0.3 step 7. Target: WCAG 2.2 AA. Severity scale: `issue-severity-matrix_LOCAL.md` (bug lens). Status: drafted by the agent, awaiting user review.

Scope: changes since v0.2 — Android WebView wrapper, app icon and splash, Keep screen awake via the web Screen Wake Lock API, and the Session timer elapsed/remaining toggle (step 6). No other web screen layout changed in v0.3.

## Method

| Check | How | Status |
|---|---|---|
| Lighthouse ≥ 90 | Lighthouse 13.5.0, Playwright Chromium, served on loopback | ✅ 100 (launch screen) |
| Keyboard tab order, launch | Playwright | ✅ unchanged from v0.2 |
| Keep screen awake control | Playwright: labelled checkbox "Keep screen awake" in Settings | ✅ done |
| Session timer toggle (step 6) | Playwright: button "elapsed 0:01, switch to remaining"; tap, Enter and Space switch modes; remaining counts down; mode announced once via `#status`; no live region or `role="timer"` on the timer; tappable while controls hidden; 40 px tall with 5 px margin; with Session length off, no button | ✅ done |
| Wrapper code review (label, content description, font scaling, orientation, Back) | `MainActivity.java`, manifest, resources | ✅ done |
| Icon and splash contrast | Calculated from `colors.xml` | ✅ done |
| Large text in the APK (200% system font) | Code fix built; on-device check | pending — user (step 4) |
| TalkBack pass on device | GrapheneOS, by the user | pending — user (step 4) |
| Keep screen awake on device | GrapheneOS, by the user | pending — user (step 4) |
| Manual focus pass, Orca | By the user (no web screens changed) | pending — user |

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| A11Y-12 | Medium | Android WebView does not follow the system font size (its text zoom stays 100%), so users with large text set in Android saw normal-size text in the app (WCAG 1.4.4). | ✅ fixed: `setTextZoom` set from the system `fontScale` in `MainActivity`; a font-size change recreates the activity and reapplies it. Debug and release builds pass; device check at 200% pending (step 4). The v0.2 200% reflow checks cover the layout. |
| A11Y-13 | Medium (provisional) | Android WebView may not support the Screen Wake Lock API (MDN lists it as unsupported). If so, Keep screen awake does nothing in the APK and nothing tells the user; the screen can turn off mid-session, which matters for users who cannot easily wake it. | Resolved — wake lock granted and works on GrapheneOS (step 4). |
| A11Y-14 | Info | The WebView has no content description. TalkBack reads the web content inside it, which carries its own names and headings; a description would add a redundant announcement. | No action; confirm in TalkBack pass. |

## Passed

- Lighthouse accessibility score 100.
- App label "Meditation Metronome" (`strings.xml`) on the launcher and activity.
- Orientation not locked; rotation and resize do not reload the page or end a session (`configChanges`).
- Android Back walks the app's screen history, then leaves the app (same as browser Back).
- Icon and splash: `#EEF1F6` glyph on `#0B1020` ≈ 16:1; system bars use the app background, so no light flash on start.
- No other web screen changed; v0.2 keyboard, focus-return and 200% reflow results still apply.
