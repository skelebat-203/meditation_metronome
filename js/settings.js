'use strict';

// Settings state. Two layers:
//   saved   — defaults for every session, kept in localStorage ("Persistent").
//   session — what the current/next session uses ("This session"); starts as a copy of saved.
// The track is session-only: each app open starts on a random track.

const Settings = (function () {
  const KEY = APP.SETTINGS.STORAGE_KEY;
  const DEFAULTS = APP.SETTINGS.DEFAULTS;
  const SOUNDS = Object.values(APP.METRONOME.SOUNDS);
  const SESSION = APP.SESSION;

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

  // localStorage can throw (storage disabled); the app still works with defaults.
  function loadSaved() {
    try {
      return sanitize(JSON.parse(localStorage.getItem(KEY)));
    } catch (err) {
      return sanitize(null);
    }
  }

  let saved = loadSaved();
  let session = Object.assign({}, saved, { track: Music.randomTrackIndex() });

  function copy(o) { return Object.assign({}, o); }

  // Applies to the current/next session only.
  function setSession(next) {
    session = Object.assign(sanitize(next), { track: next.track });
  }

  // Saves as defaults and applies to the session.
  function setPersistent(next) {
    saved = sanitize(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(saved));
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
