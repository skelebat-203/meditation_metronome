'use strict';

// Settings state. Two layers:
//   saved   — defaults for every session, kept in localStorage ("Persistent").
//   session — what the current/next session uses ("This session"); starts as a copy of saved.
// Track choice (session.trackChoice): APP.MUSIC.RANDOM or a track index. A specific track is saved by
// its file path (a stable id) with Persistent; Random is saved as the sentinel. With Random, or no valid
// saved track, each app open starts on a random track. session.track is the index actually playing.

const Settings = (function () {
  const KEY = APP.SETTINGS.STORAGE_KEY;
  const DEFAULTS = APP.SETTINGS.DEFAULTS;
  const SOUNDS = Object.values(APP.METRONOME.SOUNDS);
  const SESSION = APP.SESSION;
  const TRACKS = APP.MUSIC.TRACKS;
  const RANDOM = APP.MUSIC.RANDOM;

  // Interval choices in seconds: 5–60 min in 5-minute steps.
  const INTERVALS = [];
  for (let s = SESSION.STEP_S; s <= SESSION.MAX_S; s += SESSION.STEP_S) INTERVALS.push(s);
  const LENGTHS = [0].concat(INTERVALS); // 0 = off

  // Keeps only known keys with the right type; anything else falls back to the default.
  function sanitize(raw) {
    const out = {};
    Object.keys(DEFAULTS).forEach(function (k) {
      const v = raw && raw[k];
      out[k] = typeof v === typeof DEFAULTS[k] ? v : DEFAULTS[k];
    });
    if (SOUNDS.indexOf(out.tickSound) === -1) out.tickSound = DEFAULTS.tickSound;
    if (LENGTHS.indexOf(out.sessionLength) === -1) out.sessionLength = DEFAULTS.sessionLength;
    if (INTERVALS.indexOf(out.markInterval) === -1) out.markInterval = DEFAULTS.markInterval;
    out.musicVolume = Math.min(1, Math.max(0, out.musicVolume));
    out.metronomeVolume = Math.min(1, Math.max(0, out.metronomeVolume));
    return out;
  }

  // Saved track id -> track index; anything that is not a known track's path gives -1 (random start).
  function trackIndexOf(id) {
    if (typeof id !== 'string') return -1;
    for (let i = 0; i < TRACKS.length; i++) if (TRACKS[i].src === id) return i;
    return -1;
  }

  // A valid track choice from the form (RANDOM or a track index), or the current one.
  function validChoice(c, fallback) {
    return c === RANDOM || (Number.isInteger(c) && c >= 0 && c < TRACKS.length) ? c : fallback;
  }

  // localStorage can throw (storage disabled); the app still works with defaults.
  function loadRaw() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch (err) {
      return null;
    }
  }

  const raw = loadRaw();
  let saved = sanitize(raw);
  const savedTrack = trackIndexOf(raw && raw.track);
  let session = Object.assign({}, saved, {
    trackChoice: savedTrack >= 0 ? savedTrack : RANDOM,
    track: savedTrack >= 0 ? savedTrack : Music.randomTrackIndex(),
  });

  function copy(o) { return Object.assign({}, o); }

  // Applies to the current/next session only.
  function setSession(next) {
    const choice = validChoice(next.trackChoice, session.trackChoice);
    let track = session.track;
    if (choice !== RANDOM) track = choice;
    else if (session.trackChoice !== RANDOM) track = Math.floor(Math.random() * TRACKS.length);
    session = Object.assign(sanitize(next), { trackChoice: choice, track: track });
  }

  // Saves as defaults and applies to the session.
  function setPersistent(next) {
    saved = sanitize(next);
    const choice = validChoice(next.trackChoice, session.trackChoice);
    try {
      localStorage.setItem(KEY, JSON.stringify(Object.assign({ track: choice === RANDOM ? RANDOM : TRACKS[choice].src }, saved)));
    } catch (err) {
      console.warn('Could not save settings:', err);
    }
    setSession(next);
  }

  return Object.freeze({
    getSession: function () { return copy(session); },
    setSession: setSession,
    setPersistent: setPersistent,
    lengthChoices: function () { return LENGTHS.slice(); },
    intervalChoices: function () { return INTERVALS.slice(); },
  });
})();
