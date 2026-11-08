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
│   ⏲ Session length [off ▾]   │  ← session length, next session only
│                              │
│         [♪ Music]            │  ← on/off toggles, next session only
│            on                │
│                              │
│         [◷ Metro]            │  ← on/off toggles, next session only
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
│        ⏲ Session length [off ▾]          │  ← session length, next session only
│          [♪ Music] [◷ Metro]             │  ← on/off toggles, next session only
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
│ [← Back]        Settings     │
│                              │
│  Music              [ on  ]  │
│  Music volume   ──────●───   │
│  Track     [ Still Water ▾]  │  ← change music dropdown
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
│  Credits                  >  │  ← attributions (v0.2)
│                              │
│ [ Persistent ] [This session]│  ← how to apply the changes
└──────────────────────────────┘
```

### Landscape
```
┌────────────────────────────────────────────────┐
│ [← Back]              Settings                 │
│                                                │
│  Music          [ on  ]   Metronome    [ on  ] │
│  Music vol ───●──────     Metro vol  ───●──    │
│  Track [Still Water ▾]    Tick sound           │
│                            (•) Soft click [▶]  │
│  Images         [ on  ]    ( ) Wood block [▶]  │
│  Session timer  [ off ]    ( ) Bell       [▶]  │
│  Keep awake     [ on  ]                        │
│  Credits  >                                    │
│                                                │
│         [ Persistent ]  [ This session ]       │
└────────────────────────────────────────────────┘
```
Two columns; the screen scrolls if it does not fit.

### Applying changes
- **Persistent** — saves the changes as defaults for every future session, and applies them now.
- **This session** — applies the changes to the current session only (or, from the launch screen, to the next session). Defaults are unchanged.
- **Back** without pressing either button discards the changes.
