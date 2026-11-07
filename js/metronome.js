'use strict';

// Metronome: one tick per APP.METRONOME.INTERVAL_S, sounds synthesized with Web Audio.
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

const Metronome = (function () {
  let ctx = null;
  let master = null;       // volume
  let runBus = null;       // per-run bus; disconnected on stop to cut queued ticks
  let noiseBuffer = null;
  let timerId = null;
  let nextTickTime = 0;
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
      noiseBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * CLICK_DURATION_S), ctx.sampleRate);
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

  function playClick(out, time) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = CLICK_FILTER_HZ;
    const g = envelope(CLICK_GAIN, time, CLICK_DURATION_S);
    src.connect(filter).connect(g).connect(out);
    src.start(time);
  }

  function playWood(out, time) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = WOOD_FREQ_HZ;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = WOOD_FREQ_HZ;
    filter.Q.value = WOOD_FILTER_Q;
    const g = envelope(WOOD_GAIN, time, WOOD_DURATION_S);
    osc.connect(filter).connect(g).connect(out);
    osc.start(time);
    osc.stop(time + WOOD_DURATION_S);
  }

  function playBell(out, time) {
    BELL_PARTIALS.forEach(function (p) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = BELL_FREQ_HZ * p.ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(SILENCE, time);
      g.gain.exponentialRampToValueAtTime(p.gain, time + BELL_ATTACK_S);
      g.gain.exponentialRampToValueAtTime(SILENCE, time + p.decay);
      osc.connect(g).connect(out);
      osc.start(time);
      osc.stop(time + p.decay);
    });
  }

  const PLAYERS = {};
  PLAYERS[APP.METRONOME.SOUNDS.SOFT_CLICK] = playClick;
  PLAYERS[APP.METRONOME.SOUNDS.WOOD_BLOCK] = playWood;
  PLAYERS[APP.METRONOME.SOUNDS.BELL] = playBell;

  function schedule() {
    while (nextTickTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      PLAYERS[sound](runBus, nextTickTime);
      nextTickTime += APP.METRONOME.INTERVAL_S;
    }
  }

  function start() {
    if (timerId !== null) return;
    ensureContext();
    runBus = ctx.createGain();
    runBus.connect(master);
    nextTickTime = ctx.currentTime + START_DELAY_S;
    schedule();
    timerId = setInterval(schedule, SCHEDULER_PERIOD_MS);
  }

  function stop() {
    if (timerId === null) return;
    clearInterval(timerId);
    timerId = null;
    runBus.disconnect();
    runBus = null;
  }

  function isRunning() {
    return timerId !== null;
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

  return Object.freeze({ prepare: prepare, start: start, stop: stop, isRunning: isRunning, setSound: setSound, setVolume: setVolume, preview: preview });
})();
