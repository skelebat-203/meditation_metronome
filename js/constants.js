'use strict';

// Shared app constants. Visual tokens (colors, fonts, spacing) live in css/style.css.
const APP = Object.freeze({
  SCREEN_IDS: Object.freeze({
    LAUNCH: 'screen-launch',
    MEDITATION: 'screen-meditation',
    SETTINGS: 'screen-settings',
  }),
  METRONOME: Object.freeze({
    INTERVAL_S: 1,
    SOUNDS: Object.freeze({
      SOFT_CLICK: 'soft-click',
      WOOD_BLOCK: 'wood-block',
      BELL: 'bell',
    }),
    DEFAULT_SOUND: 'soft-click',
    DEFAULT_VOLUME: 0.7, // 0..1
  }),
  MUSIC: Object.freeze({
    // Placeholder tracks (v0.1); real tracks arrive in v0.2.
    TRACKS: Object.freeze([
      Object.freeze({ title: 'Placeholder 1', src: 'assets/music/placeholder-01.opus' }),
      Object.freeze({ title: 'Placeholder 2', src: 'assets/music/placeholder-02.opus' }),
      Object.freeze({ title: 'Placeholder 3', src: 'assets/music/placeholder-03.opus' }),
    ]),
    DEFAULT_VOLUME: 0.5, // 0..1
  }),
});
