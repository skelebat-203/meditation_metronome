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
    TRACKS: Object.freeze([
      Object.freeze({ title: 'Above the Clouds', src: 'assets/music/above-the-clouds.opus' }),
      Object.freeze({ title: 'Bathed in the Light', src: 'assets/music/bathed-in-the-light.opus' }),
      Object.freeze({ title: 'Ephemera', src: 'assets/music/ephemera.opus' }),
      Object.freeze({ title: 'Healing', src: 'assets/music/healing.opus' }),
      Object.freeze({ title: 'Meditation Impromptu 01', src: 'assets/music/meditation-impromptu-01.opus' }),
      Object.freeze({ title: 'Meditation Impromptu 02', src: 'assets/music/meditation-impromptu-02.opus' }),
      Object.freeze({ title: 'Meditation Impromptu 03', src: 'assets/music/meditation-impromptu-03.opus' }),
      Object.freeze({ title: 'Monday Meditation', src: 'assets/music/monday-meditation.opus' }),
      Object.freeze({ title: 'Penumbra', src: 'assets/music/penumbra.opus' }),
      Object.freeze({ title: 'Post Drone', src: 'assets/music/post-drone.opus' }),
    ]),
    DEFAULT_VOLUME: 0.5, // 0..1
    PREVIEW_MS: 5000, // settings track preview: full-volume play time
    PREVIEW_FADE_MS: 2000, // then fades out over this long and stops
    NOTICE_MS: 30000, // how long a playback-error message stays on screen (A11Y-09); it also has a close button
  }),
  IMAGES: Object.freeze({
    SOURCES: Object.freeze([
      'assets/images/beech-ferns-gullmarsskogen.webp',
      'assets/images/birchwood-slavnoe.webp',
      'assets/images/bois-raquet-high-fens.webp',
      'assets/images/calm-bliss.webp',
      'assets/images/chugach-misty-morning.webp',
      'assets/images/clearwater-falls.webp',
      'assets/images/duke-forest-mist.webp',
      'assets/images/engakuji-zen-garden.webp',
      'assets/images/koyasan-zen-garden.webp',
      'assets/images/lake-blanche-reflection.webp',
      'assets/images/lake-gunn-reflection.webp',
      'assets/images/lake-louise-sunrise.webp',
      'assets/images/lake-matheson-mist.webp',
      'assets/images/lotus-nelumbo.webp',
      'assets/images/lotus-pink.webp',
      'assets/images/marmaris-sunrise.webp',
      'assets/images/minho-river-reflection.webp',
      'assets/images/reflection-lake.webp',
      'assets/images/spruce-forest-holma.webp',
      'assets/images/stonor-forest-mist.webp',
    ]),
    SHOW_MS: 60000, // time each image is shown
    FADE_MS: 5000, // cross-fade; 0 under prefers-reduced-motion
  }),
  START_WORDS: Object.freeze(['recovering', 'relaxing', 'centering', 'breathing']),
  CONTROLS_IDLE_MS: 4000, // meditation-screen controls hide after this long without input
  TIMER_UPDATE_MS: 1000,
  SESSION: Object.freeze({
    // Session length and marks interval choices, in seconds. 0 = off (length only).
    STEP_S: 300, // 5 min
    MAX_S: 3600, // 60 min
    FADE_MS: 3000, // music/metronome fade-out when the session length ends
  }),
  SETTINGS: Object.freeze({
    STORAGE_KEY: 'meditation-metronome.settings',
    // Saved defaults. The music track is saved separately (settings.js), only via Persistent.
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
