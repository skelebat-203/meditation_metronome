# 0003 — UI Design

Rough wireframes for the three screens. Behavior lives in [`0002-app-behavior.md`](0002-app-behavior.md); this doc covers layout only. Status: **approved 2026-11-07.**

Phone, ~360 × 740 CSS px, in portrait and landscape. Desktop uses the landscape layout, centered.

Visual style: dark and calm (deep blue/black background, soft white text).

## Launch screen
### Portait

```
┌──────────────────────────────┐
│                         [⚙]  │  ← Settings
│                              │
│                              │
│                              │
│     ┌──────────────────┐     │
│     │  Start relaxing  │     │  ← random word each open
│     └──────────────────┘     │
│                              │
│       ⏲ Length [off ▾]       │  ← session length, next session only
│                              │
│         [◷ Metro]            │  ← on/off toggles, next session only
│            on                │
│                              │
│         [♪ Music]            │  ← on/off toggles, next session only
│            on                │
│                              │
│                              │
│                              │
└──────────────────────────────┘
```

### Landscape
```
┌──────────────────────────────────────────┐
│                                     [⚙]  │  ← Settings
│                                          │
│          ┌──────────────────┐            │
│          │  Start relaxing  │            │  ← random word each open
│          └──────────────────┘            │
│            ⏲ Length [off ▾]              │  ← session length, next session only
│          [◷ Metro] [♪ Music]             │  ← on/off toggles, next session only
│             on        on                 │
│                                          │
└──────────────────────────────────────────┘
```

- On load: random start track, start image and Start-button word (see `0002` § Launch screen).
- Background: one image from the set, dimmed, so text stays readable (contrast ≥ 4.5:1).
- Toggles: icon + text label, pressed state shown by fill, font-weight change, and by `aria-pressed`, not color alone.

## Meditation screen

### Portrait
```
┌──────────────────────────────┐
│ [■ End]                 [⚙]  │  ← End session · Session settings
│                              │
│                              │
│      (full-screen image,     │
│       slow cross-fade)       │
│                              │
│                              │
│           12:34              │  ← session timer (if on in settings)
│                              │
└──────────────────────────────┘
```

### Landscape
```
┌──────────────────────────────────────────┐
│ [■ End]                             [⚙]  │
│                                          │
│        (full-screen image, cropped       │
│         to fill, slow cross-fade)        │
│                                          │
│                 12:34                    │
└──────────────────────────────────────────┘
```

- End and Session settings buttons are **large or extra large** (exact size decided while building the screens, v0.1 step 5).
- Controls fade out after a few seconds idle; any tap brings them back. The timer stays visible if it is on.
- With controls hidden, nothing is on screen but the image (and the timer, if on).
- Images fill the screen and are cropped to fit (`object-fit: cover`). Source images must be large enough to crop for both orientations: at least 1920 px on the long side, with the subject near the center.

## Settings screen

One screen. Opened from the launch screen (Settings) or the meditation screen (Session settings).

### Portrait
```
┌──────────────────────────────┐
│ [← Back]  Settings  [Save ▾] │  ← Save opens the save menu
│                              │
│  Music              [ on  ]  │
│  Music volume   ──────●───   │
│  Track     [ Still Water ▾]  │  ← change music dropdown
│  Loop: [All|Selected]        │  ← pill switch: All / Selected
│                              │
│  Metronome          [ on  ]  │
│  Metronome volume ───●─────  │
│  Tick sound                  │
│   (•) Soft click  [▶]        │
│   ( ) Wood block  [▶]        │  ← [▶] previews the sound
│   ( ) Bell        [▶]        │
│                              │
│  Images             [ on  ]  │
│                              │
│  Session length     [off ▾]  │
│  Marks       [ on ] [5 min▾] │
│  Session timer      [ off ]  │
│  Keep screen awake  [ on  ]  │
│                              │
│  Credits       Add media >   │  ← attributions (v0.2) · own media (0005)
│                              │
└──────────────────────────────┘
```

#### Portrait, save menu open
```
┌──────────────────────────────┐
│ [← Back]  Settings  [Save ▴] │
│                  ┌───────────┴┐
│  Music           │ Persistent │  ← saved as defaults, applied now
│  Music volume    │────────────│
│  Track  [Still W │This session│  ← this session only
│  ...             └────────────┘
└──────────────────────────────┘
```
Items are plain text buttons with no borders and no hint lines (accessible names are just "Persistent" and "This session"), separated by a thin horizontal rule.

#### Portrait, Back with unsaved changes
```
┌──────────────────────────────┐
│ [← Back]  Settings  [Save ▾] │
│ ┌──────────────────────────┐ │
│ │ Discard changes?         │ │  ← inline notice inside <main>
│ │ [Discard] [Keep editing] │ │
│ └──────────────────────────┘ │
│  Music              [ on  ]  │
└──────────────────────────────┘
```

### Landscape
```
┌────────────────────────────────────────────────┐
│ [← Back]            Settings          [Save ▴] │
│                                 ┌──────────────┴─────┐
│                                 │ Persistent         │
│                                 │────────────────────│
│                                 │ This session       │
│                                 └────────────────────┘
│  Music          [ on  ]   Metronome    [ on  ] │
│  Music vol ───●──────     Metro vol  ───●──    │
│  Track [Still Water ▾]    Tick sound           │
│  Loop: [All|Selected]      (•) Soft click [▶]  │
│  Images         [ on  ]    ( ) Wood block [▶]  │
│  Session timer  [ off ]    ( ) Bell       [▶]  │
│  Keep awake     [ on  ]                        │
│  Credits                          Add media >  │
└────────────────────────────────────────────────┘
```
Two columns; the screen scrolls if it does not fit.

### Applying changes

Changes are applied from the **Save** menu at the top right.

- **Save button:** visible text "Save" plus a ▾/▴ chevron (decorative, hidden from assistive tech). Same size as Back. Accessible name "Save changes" (starts with the visible word, so voice control works), `aria-expanded`, `aria-controls` the panel.
- **Pattern: disclosure, not ARIA menu.** Native `<button>`; the panel is a `<ul>` of native `<button>`s shown/hidden with `hidden`. No `role="menu"`/`menuitem`. The panel follows the Save button in the DOM, so Tab goes straight into it.
- **Persistent** — saves the changes as defaults for every future session, applies them now, and returns to where Settings was opened: the launch screen, or the running session.
- **This session** — applies the changes without changing defaults. From the launch screen it also **starts the session** (Back from that session goes to the launch screen, not Settings). Opened mid-session, it returns to the running session.
- **Keyboard:** Enter/Space/tap toggles the panel; focus stays on Save when it opens. Up/Down on Save or inside the panel moves between items. Escape closes the panel and returns focus to Save. Choosing an item, tapping outside, or Tab past the panel also closes it.
- **Back:** top left. Never saves. With no changes it leaves at once. With unsaved changes it shows an inline "Discard changes?" notice inside `<main>` with [Discard] and [Keep editing]; focus moves to the notice heading, and Keep editing returns focus to Back. No dialog role. Android Back follows the same rules: it closes an open Save panel first, then asks if there are changes, then leaves.
- After a save, the status region announces "Settings saved" or "Settings applied to this session" (or "Session started").
- The panel has a visible 3:1 border and a solid background; nothing is hover-only.

## My media screen

Opened from the Settings button "Add media" (Add media >, bottom right, in line with Credits). Wireframe, text and behavior: [`0005`](0005-own-media.md) § My media screen. Same header pattern as Credits (Back, title). Expanders for Music, Images and Metronome sounds; notices appear inside `<main>`. In the Settings dropdown and tick sound list, the user's own items follow the built-ins under a non-selectable "Uploaded" heading.
