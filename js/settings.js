'use strict';

// Settings state. Two layers:
//   saved   — defaults for every session, kept in localStorage ("Persistent").
//   session — what the current/next session uses ("This session"); starts as a copy of saved.
// Track choice (session.trackChoice): APP.MUSIC.RANDOM or a track id (a built-in's file path, or an own
// media id). A specific track is saved by its id with Persistent; Random is saved as the sentinel. With
// Random, or no valid saved track, each app open starts on a random track. session.track is the id
// actually playing. Own media loads asynchronously, so ids of own items are only checked by reconcile().

const Settings = (function () {
  const KEY = APP.SETTINGS.STORAGE_KEY;
  const DEFAULTS = APP.SETTINGS.DEFAULTS;
  const SOUNDS = Object.values(APP.METRONOME.SOUNDS);
  const SESSION = APP.SESSION;
  const OWN_PREFIX = APP.OWN_MEDIA.ID_PREFIX;
  const RANDOM = APP.MUSIC.RANDOM;
  const REPEATS = Object.values(APP.MUSIC.REPEAT);

  // Interval choices in seconds: 1 min, 3 min, then 5–60 min in 5-minute steps.
  const INTERVALS = SESSION.SHORT_S.slice();
  for (let s = SESSION.STEP_S; s <= SESSION.MAX_S; s += SESSION.STEP_S) INTERVALS.push(s);
  const LENGTHS = [0].concat(INTERVALS); // 0 = off

  // Keeps only known keys with the right type; anything else falls back to the default.
  function sanitize(raw) {
    const out = {};
    Object.keys(DEFAULTS).forEach(function (k) {
      const v = raw && raw[k];
      out[k] = typeof v === typeof DEFAULTS[k] ? v : DEFAULTS[k];
    });
    if (REPEATS.indexOf(out.musicRepeat) === -1) out.musicRepeat = DEFAULTS.musicRepeat;
    if (!isOwnId(out.tickSound) && SOUNDS.indexOf(out.tickSound) === -1) out.tickSound = DEFAULTS.tickSound;
    if (LENGTHS.indexOf(out.sessionLength) === -1) out.sessionLength = DEFAULTS.sessionLength;
    if (INTERVALS.indexOf(out.markInterval) === -1) out.markInterval = DEFAULTS.markInterval;
    out.musicVolume = Math.min(1, Math.max(0, out.musicVolume));
    out.metronomeVolume = Math.min(1, Math.max(0, out.metronomeVolume));
    return out;
  }

  function isOwnId(id) { return typeof id === 'string' && id.indexOf(OWN_PREFIX) === 0; }

  // A valid track choice from the form (RANDOM or a known track id), or the current one.
  function validChoice(c, fallback) {
    return c === RANDOM || Music.hasTrack(c) ? c : fallback;
  }

  function tickOk(id) { return SOUNDS.indexOf(id) !== -1 || OwnMedia.has(id); }

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
  const rawTrack = raw && raw.track;
  let savedTrack = Music.hasTrack(rawTrack) || isOwnId(rawTrack) ? rawTrack : RANDOM;
  let session = Object.assign({}, saved, {
    trackChoice: savedTrack,
    track: savedTrack === RANDOM ? null : savedTrack, // null: picked by reconcile()
  });

  function copy(o) { return Object.assign({}, o); }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(Object.assign({ track: savedTrack }, saved)));
    } catch (err) {
      console.warn('Could not save settings:', err);
    }
  }

  // Drops references to missing tracks and tick sounds (removed, or never loaded): back to Random / the
  // default sound, in the session and in the saved defaults. Call after own media loads or changes.
  function reconcile() {
    if (session.trackChoice !== RANDOM && !Music.hasTrack(session.trackChoice)) session.trackChoice = RANDOM;
    if (session.trackChoice !== RANDOM) session.track = session.trackChoice;
    else if (!Music.hasTrack(session.track)) session.track = Music.randomTrackId();
    if (!tickOk(session.tickSound)) session.tickSound = DEFAULTS.tickSound;
    let changed = false;
    if (savedTrack !== RANDOM && !Music.hasTrack(savedTrack)) { savedTrack = RANDOM; changed = true; }
    if (!tickOk(saved.tickSound)) { saved.tickSound = DEFAULTS.tickSound; changed = true; }
    if (changed) persist();
  }

  // Applies to the current/next session only.
  function setSession(next) {
    const choice = validChoice(next.trackChoice, session.trackChoice);
    let track = session.track;
    if (choice !== RANDOM) track = choice;
    else if (session.trackChoice !== RANDOM) track = Music.randomTrackId();
    session = Object.assign(sanitize(next), { trackChoice: choice, track: track });
  }

  // Saves as defaults and applies to the session.
  function setPersistent(next) {
    saved = sanitize(next);
    savedTrack = validChoice(next.trackChoice, session.trackChoice);
    persist();
    setSession(next);
  }

  return Object.freeze({
    getSession: function () { return copy(session); },
    setSession: setSession,
    setPersistent: setPersistent,
    reconcile: reconcile,
    lengthChoices: function () { return LENGTHS.slice(); },
    intervalChoices: function () { return INTERVALS.slice(); },
  });
})();
