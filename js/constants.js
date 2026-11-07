'use strict';

// Shared app constants. Visual tokens (colors, fonts, spacing) live in css/style.css.
const APP = Object.freeze({
  SCREEN_IDS: Object.freeze({
    LAUNCH: 'screen-launch',
    MEDITATION: 'screen-meditation',
    SETTINGS: 'screen-settings',
    CREDITS: 'screen-credits',
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
    PREVIEW_MS: 5000, // settings track preview length
  }),
  IMAGES: Object.freeze({
    // Placeholder images (v0.1); real images arrive in v0.2.
    SOURCES: Object.freeze([
      'assets/images/placeholder-01.webp',
      'assets/images/placeholder-02.webp',
      'assets/images/placeholder-03.webp',
      'assets/images/placeholder-04.webp',
    ]),
    SHOW_MS: 60000, // time each image is shown
    FADE_MS: 5000, // cross-fade; 0 under prefers-reduced-motion
  }),
  START_WORDS: Object.freeze(['recovering', 'relaxing', 'centering', 'breathing']),
  CONTROLS_IDLE_MS: 4000, // meditation-screen controls hide after this long without input
  TIMER_UPDATE_MS: 1000,
  SESSION: Object.freeze({
    CHECK_MS: 250, // how often session length and marks are checked
    // Session length and marks interval choices, in seconds. 0 = off (length only).
    // TEST_S is a temporary manual-test option; remove before v0.4 (0002 § Session length and marks).
    TEST_S: 10,
    STEP_S: 300, // 5 min
    MAX_S: 3600, // 60 min
    FADE_MS: 3000, // music/metronome fade-out when the session length ends
  }),
  SETTINGS: Object.freeze({
    STORAGE_KEY: 'meditation-metronome.settings',
    // Saved defaults. The music track is not saved: each app open starts on a random track.
    DEFAULTS: Object.freeze({
      music: true,
      musicVolume: 0.5,
      metronome: true,
      metronomeVolume: 0.7,
      tickSound: 'soft-click',
      images: true,
      sessionLength: 0, // seconds; 0 = off
      marks: true,
      markInterval: 300, // seconds
      timer: false,
      keepAwake: true,
    }),
  }),
});
