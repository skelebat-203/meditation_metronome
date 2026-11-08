'use strict';

// Metronome: one beat per APP.METRONOME.INTERVAL_S, sounds synthesized with Web Audio.
// Ticks are scheduled on the audio clock well ahead of time, so they stay on time
// even when timers are throttled (background tab, busy main thread).

// Scheduler
const SCHEDULER_PERIOD_MS = 250;   // how often the scheduler wakes up
const SCHEDULE_AHEAD_S = 1.5;      // how far ahead ticks are queued (covers 1 s background throttling)
const START_DELAY_S = 0.05;        // first tick lands just after start

// Gain envelope floor (exponential ramps cannot reach 0)
const SILENCE = 0.0001;

// Soft click: short low-passed noise burst
const CLICK_DURATION_S = 0.03;
const CLICK_FILTER_HZ = 2500;
const CLICK_GAIN = 0.8;

// Wood block: pitched tone, band-passed, fast decay
const WOOD_FREQ_HZ = 880;
const WOOD_FILTER_Q = 4;
const WOOD_DURATION_S = 0.12;
const WOOD_GAIN = 0.9;

// Bell: inharmonic partials, long decay
const BELL_FREQ_HZ = 528;
const BELL_PARTIALS = [
  { ratio: 1, gain: 0.5, decay: 2.5 },
  { ratio: 2.76, gain: 0.2, decay: 1.2 },
  { ratio: 5.4, gain: 0.1, decay: 0.6 },
];
const BELL_ATTACK_S = 0.005;

// Chimes: longer versions of the selected tick sound (0002 § Session length and marks).
const CLICK_CHIME_S = 1.2;          // noise burst becomes a resonant swell
const CLICK_CHIME_Q = 12;
const WOOD_CHIME_S = 1.5;
const BELL_CHIME_STRETCH = 1.6;     // bell partial decays × this
const END_CHIME_STRETCH = 1.5;     // each end-chime strike rings this much longer than a mark
const END_CHIME_GAPS_S = [2, 2.5]; // gaps between the end chime's strikes, slowing down
const NOISE_BUFFER_S = CLICK_CHIME_S * END_CHIME_STRETCH;
// Mark: one strike. End: three strikes, lower pitch, so the two are easy to tell apart.
const CHIMES = {
  mark: { gapsS: [], pitch: 1, stretch: 1 },
  end: { gapsS: END_CHIME_GAPS_S, pitch: 0.75, stretch: END_CHIME_STRETCH },
};

const Metronome = (function () {
  let ctx = null;
  let master = null;       // volume
  let noiseBuffer = null;
  let tickBus = null;      // per-run tick bus; disconnected on stop to cut queued ticks
  let cueBus = null;       // per-session chime bus; not faded, so the end chime rings out
  let timerId = null;      // beat clock scheduler
  let beat = 0;            // index of the next beat to queue, counted from session start
  let nextBeatTime = 0;
  let markBeats = 0;       // mark every this many beats; 0 = off
  let endBeat = 0;         // session ends on this beat; 0 = open-ended
  let onEnd = null;
  let endTimer = null;
  let sound = APP.METRONOME.DEFAULT_SOUND;
  let volume = APP.METRONOME.DEFAULT_VOLUME;

  // AudioContext is created lazily, from a user gesture (autoplay rules).
  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
      noiseBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * NOISE_BUFFER_S), ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function envelope(peak, time, duration) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, time);
    g.gain.exponentialRampToValueAtTime(SILENCE, time + duration);
    return g;
  }

  // Each player plays one tick at `time`, or a chime when `pitch` is given (`stretch` lengthens it); returns its length in seconds.
  function playClick(out, time, pitch, stretch) {
    const duration = pitch ? CLICK_CHIME_S * stretch : CLICK_DURATION_S;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = pitch ? 'bandpass' : 'lowpass';
    filter.frequency.value = CLICK_FILTER_HZ * (pitch || 1);
    if (pitch) filter.Q.value = CLICK_CHIME_Q;
    const g = envelope(CLICK_GAIN, time, duration);
    src.connect(filter).connect(g).connect(out);
    src.start(time);
    src.stop(time + duration);
    return duration;
  }

  function playWood(out, time, pitch, stretch) {
    const duration = pitch ? WOOD_CHIME_S * stretch : WOOD_DURATION_S;
    const freq = WOOD_FREQ_HZ * (pitch || 1);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = WOOD_FILTER_Q;
    const g = envelope(WOOD_GAIN, time, duration);
    osc.connect(filter).connect(g).connect(out);
    osc.start(time);
    osc.stop(time + duration);
    return duration;
  }

  function playBell(out, time, pitch, stretch) {
    const decayScale = pitch ? BELL_CHIME_STRETCH * stretch : 1;
    let longest = 0;
    BELL_PARTIALS.forEach(function (p) {
      const decay = p.decay * decayScale;
      longest = Math.max(longest, decay);
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = BELL_FREQ_HZ * (pitch || 1) * p.ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(SILENCE, time);
      g.gain.exponentialRampToValueAtTime(p.gain, time + BELL_ATTACK_S);
      g.gain.exponentialRampToValueAtTime(SILENCE, time + decay);
      osc.connect(g).connect(out);
      osc.start(time);
      osc.stop(time + decay);
    });
    return longest;
  }

  const PLAYERS = {};
  PLAYERS[APP.METRONOME.SOUNDS.SOFT_CLICK] = playClick;
  PLAYERS[APP.METRONOME.SOUNDS.WOOD_BLOCK] = playWood;
  PLAYERS[APP.METRONOME.SOUNDS.BELL] = playBell;

  // Plays a mark or end chime of the selected sound at `time`; returns its length in ms.
  function playChime(kind, out, time) {
    const c = CHIMES[kind];
    let endS = 0;
    let offset = 0;
    // One strike, then one more after each gap.
    for (let i = 0; i <= c.gapsS.length; i++) {
      if (i > 0) offset += c.gapsS[i - 1];
      endS = Math.max(endS, offset + PLAYERS[sound](out, time + offset, c.pitch, c.stretch));
    }
    return endS * 1000;
  }

  // Beat clock (0002 § Session length and marks): ticks, marks and the end chime share one clock.
  // A mark or the end chime replaces the tick on its beat.
  function schedule() {
    while (nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      if (endBeat && beat >= endBeat) {
        const chimeMs = playChime('end', cueBus, nextBeatTime);
        const cb = onEnd;
        endTimer = setTimeout(function () { if (cb) cb(chimeMs); }, (nextBeatTime - ctx.currentTime) * 1000);
        clearInterval(timerId);
        timerId = null;
        return;
      }
      if (markBeats && beat > 0 && beat % markBeats === 0) playChime('mark', cueBus, nextBeatTime);
      else if (tickBus) PLAYERS[sound](tickBus, nextBeatTime);
      beat++;
      nextBeatTime += APP.METRONOME.INTERVAL_S;
    }
  }

  // Starts the beat clock for a session. `endCallback(chimeMs)` runs when the end chime starts.
  function beginSession(endCallback) {
    endSession();
    ensureContext();
    cueBus = ctx.createGain();
    cueBus.connect(master);
    onEnd = endCallback;
    beat = 0;
    nextBeatTime = ctx.currentTime + START_DELAY_S;
    timerId = setInterval(schedule, SCHEDULER_PERIOD_MS);
  }

  // Stops the beat clock and cuts everything queued.
  function endSession() {
    clearInterval(timerId);
    timerId = null;
    clearTimeout(endTimer);
    stop();
    if (cueBus) cueBus.disconnect();
    cueBus = null;
  }

  // Mark interval and session length in seconds (0 = off). Applies to beats not yet queued.
  function setCues(markS, lengthS) {
    markBeats = Math.round(markS / APP.METRONOME.INTERVAL_S);
    endBeat = Math.round(lengthS / APP.METRONOME.INTERVAL_S);
    if (endBeat && endBeat < beat) endBeat = beat; // length shortened past now: end on the next beat
  }

  // Ticks on the session's beat clock (call after beginSession).
  function start() {
    if (tickBus) return;
    ensureContext();
    tickBus = ctx.createGain();
    tickBus.connect(master);
    if (timerId !== null) schedule();
  }

  function stop() {
    if (!tickBus) return;
    tickBus.disconnect();
    tickBus = null;
  }

  function isRunning() {
    return tickBus !== null;
  }

  // Takes effect on ticks not yet queued (up to SCHEDULE_AHEAD_S later).
  function setSound(name) {
    if (!PLAYERS[name]) throw new Error('Unknown tick sound: ' + name);
    sound = name;
  }

  function setVolume(v) {
    volume = Math.min(1, Math.max(0, v));
    if (master) master.gain.setValueAtTime(volume, ctx.currentTime);
  }

  // Sets up audio ahead of Start; call from a user gesture (e.g. first tap on the launch screen).
  function prepare() {
    ensureContext();
  }

  // Plays one tick of the given sound now (settings preview).
  function preview(name) {
    if (!PLAYERS[name]) throw new Error('Unknown tick sound: ' + name);
    ensureContext();
    PLAYERS[name](master, ctx.currentTime);
  }

  // Fades queued and future ticks to silence over `ms`, then stops.
  function fadeOut(ms) {
    if (!tickBus) return;
    const bus = tickBus;
    bus.gain.setValueAtTime(1, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(0, ctx.currentTime + ms / 1000);
    setTimeout(function () { if (tickBus === bus) stop(); }, ms);
  }

  return Object.freeze({ beginSession: beginSession, endSession: endSession, setCues: setCues, fadeOut: fadeOut, prepare: prepare, start: start, stop: stop, isRunning: isRunning, setSound: setSound, setVolume: setVolume, preview: preview });
})();
