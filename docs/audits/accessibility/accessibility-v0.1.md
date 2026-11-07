# Accessibility audit — v0.1

Roadmap: v0.1 item 6. Target: WCAG 2.2 AA. Severity scale: `issue-severity-matrix_LOCAL.md` (bug lens).

## Method

| Check | How | Status |
|---|---|---|
| Accessibility tree, names, roles, states | Playwright `ariaSnapshot()` on launch and settings, 360×740 and 740×360 | ✅ done |
| Keyboard tab order | Playwright, launch screen | ✅ done |
| Reflow / text resize at 200% | Playwright, root font-size 200%, both orientations | ✅ done |
| Hidden-control behavior | Playwright, tap on hidden End | ✅ done |
| Contrast | Calculated from CSS tokens | ✅ done |
| Lighthouse ≥ 90 | Chrome DevTools, by the user | ✅ passed (user) |
| Manual focus pass | Keyboard only, Firefox and Chrome, by the user | ✅ passed (user) |
| Screen reader pass | Orca (Linux), by the user | ✅ passed (user) |

Lighthouse is not a project dependency and the app makes no network access, so it runs from Chrome DevTools rather than from the agent.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| A11Y-01 | Medium | Launch screen clipped at 200% text in landscape: toggles ran off both sides, Settings overlapped Start, and the screen could not scroll (WCAG 1.4.4, 1.4.10). | ✅ fixed: launch screen lays out in flow, toggle row wraps, screen scrolls. |
| A11Y-02 | Medium | Tapping the screen while controls are hidden could press the invisible End button and end the session (WCAG 3.2.2 / unexpected action). | ✅ fixed: hidden controls ignore pointer input; the first tap only reveals them. Keyboard focus still reveals them. |
| A11Y-03 | Medium | Session timer had no backing; over a light image the white text can fall below 4.5:1 (WCAG 1.4.3). | ✅ fixed: timer text sits on the same translucent surface as the buttons. |
| A11Y-04 | Low | Launch toggles were announced as "Music · on, pressed": the visible state text duplicated `aria-pressed`. | ✅ fixed: state text is `aria-hidden`; name is "Music", state comes from `aria-pressed`. |
| A11Y-05 | Info | `role="radiogroup"` on the tick-sound `<fieldset>` was redundant with native radios + legend. | ✅ removed. |
| A11Y-06 | Info | Minimum target size is 36 px: meets 2.5.8 (AA, 24 px), not 2.5.5 (AAA, 44 px). | No action. |

## Passed

- Language set; viewport allows zoom; one visible `<main>` per screen with an `<h1>`; focus moves to the new screen's heading on navigation.
- Status changes (session start/end, settings applied) announced via a polite live region.
- All form controls have labels; volume sliders expose a percentage `aria-valuetext`; preview buttons have descriptive names.
- Pressed toggles use fill + weight + `aria-pressed`, not color alone.
- Visible 3 px focus outline (`#9cc4ff` on `#0b1020`).
- Text contrast: `#eef1f6` on button surface over a white image ≈ 6.8:1; on page background ≈ 17:1.
- `prefers-reduced-motion`: slideshow switches without a fade; control fade disabled.
- No console errors in Chromium.
