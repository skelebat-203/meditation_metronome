'use strict';

// App wiring: screens, navigation (incl. Android Back via history), session start/end, settings form.

const $ = function (sel, root) { return (root || document).querySelector(sel); };
const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

const SCREEN_TITLES = {};
SCREEN_TITLES[APP.SCREEN_IDS.LAUNCH] = 'Meditation Metronome';
SCREEN_TITLES[APP.SCREEN_IDS.MEDITATION] = 'Meditating — Meditation Metronome';
SCREEN_TITLES[APP.SCREEN_IDS.SETTINGS] = 'Settings — Meditation Metronome';
SCREEN_TITLES[APP.SCREEN_IDS.CREDITS] = 'Credits — Meditation Metronome';

const form = $('#settings-form');
const timerEl = $('#session-timer');
const timerStaticEl = $('#timer-static');
const timerToggleEl = $('#timer-toggle');
const slideshowEl = $('#slideshow');
const statusEl = $('#status');

let current = null;      // visible screen id
let inSession = false;
let sessionStartMs = 0;
let timerId = null;
let showRemaining = false; // Session timer mode; lasts for the current session
let idleId = null;
let wakeLock = null;
let wakeNoticeShown = false; // wake lock failure message: once per session
let finishing = false;   // end chime playing; launch screen follows
let finishId = null;

// ---------- Screens and navigation ----------

// Shows one screen, updates the title and moves focus to its heading (or `focusEl`).
function showScreen(id, focusEl) {
  Object.values(APP.SCREEN_IDS).forEach(function (screenId) {
    document.getElementById(screenId).hidden = screenId !== id;
  });
  current = id;
  const notice = document.getElementById('music-notice');
  if (notice) document.getElementById(id).appendChild(notice); // keep it in the visible <main>
  document.title = SCREEN_TITLES[id];
  document.body.dataset.screen = id;
  const target = focusEl || $('#' + id + ' h1');
  if (target) {
    if (!target.hasAttribute('tabindex') && target.tagName === 'H1') target.setAttribute('tabindex', '-1');
    target.focus();
  }
}

// Forward navigation pushes a history entry so Android Back (and the browser's Back) returns.
function goTo(id) {
  history.pushState({ screen: id }, '');
  showScreen(id);
}

// Back: from settings, return to where it was opened; from meditation, end the session.
window.addEventListener('popstate', function () {
  if (finishing) {
    endSession();
    return;
  }
  if (current === APP.SCREEN_IDS.CREDITS) {
    showScreen(APP.SCREEN_IDS.SETTINGS, $('[data-action="open-credits"]'));
  } else if (current === APP.SCREEN_IDS.SETTINGS) {
    Metronome.setVolume(Settings.getSession().metronomeVolume); // undo any preview volume
    Music.stopPreview();
    if (inSession) {
      showScreen(APP.SCREEN_IDS.MEDITATION);
      showControls();
    } else {
      showScreen(APP.SCREEN_IDS.LAUNCH, $('[data-action="open-settings"]', $('#' + APP.SCREEN_IDS.LAUNCH)));
    }
  } else if (current === APP.SCREEN_IDS.MEDITATION) {
    endSession();
  }
});

// ---------- Launch screen ----------

function renderToggles() {
  const s = Settings.getSession();
  $$('[data-toggle]').forEach(function (btn) {
    const on = s[btn.dataset.toggle];
    btn.setAttribute('aria-pressed', String(on));
    $('.toggle-state', btn).textContent = on ? 'on' : 'off';
  });
  $('#launch-length').value = String(s.sessionLength);
}

// Duration labels for the Session length and Mark every pickers.
function durationLabel(seconds) {
  if (seconds === 0) return 'Off';
  if (seconds < 60) return seconds + ' s (test)';
  return seconds / 60 + ' min';
}

const CHOICES = { length: Settings.lengthChoices(), interval: Settings.intervalChoices() };
$$('[data-choices]').forEach(function (select) {
  CHOICES[select.dataset.choices].forEach(function (seconds) {
    const opt = document.createElement('option');
    opt.value = String(seconds);
    opt.textContent = durationLabel(seconds);
    select.appendChild(opt);
  });
});

$('#launch-length').addEventListener('change', function (e) {
  const s = Settings.getSession();
  s.sessionLength = Number(e.target.value);
  Settings.setSession(s);
});

$$('[data-toggle]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const s = Settings.getSession();
    s[btn.dataset.toggle] = !s[btn.dataset.toggle];
    Settings.setSession(s);
    renderToggles();
  });
});

// ---------- Session ----------

function formatElapsed(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = String(total % 60).padStart(2, '0');
  return h ? h + ':' + String(m).padStart(2, '0') + ':' + sec : m + ':' + sec;
}

// With a Session length set, the timer is a button that switches elapsed / remaining;
// otherwise it shows elapsed only. Not a live region: mode changes are announced via #status.
function updateTimer() {
  const lengthMs = Settings.getSession().sessionLength * 1000;
  const elapsedMs = Date.now() - sessionStartMs;
  if (!lengthMs) showRemaining = false;
  timerStaticEl.hidden = !!lengthMs;
  timerToggleEl.hidden = !lengthMs;
  if (!lengthMs) {
    timerStaticEl.textContent = formatElapsed(elapsedMs);
    return;
  }
  $('.timer-mode', timerToggleEl).textContent = showRemaining ? 'remaining' : 'elapsed';
  // Round remaining up so it reads 0:00 only at the end.
  $('.timer-value', timerToggleEl).textContent = showRemaining
    ? formatElapsed(Math.ceil(Math.max(0, lengthMs - elapsedMs) / 1000) * 1000)
    : formatElapsed(elapsedMs);
  $('.visually-hidden', timerToggleEl).textContent = showRemaining ? ', switch to elapsed' : ', switch to remaining';
}

timerToggleEl.addEventListener('click', function () {
  showRemaining = !showRemaining;
  updateTimer();
  statusEl.textContent = showRemaining ? 'Timer shows time remaining' : 'Timer shows time elapsed';
});

// Session length reached: end chime, fade out, then back to the launch screen once the chime ends.
// Called by the metronome's beat clock when the end chime starts.
function finishSession(chimeMs) {
  finishing = true;
  Music.fadeOut(APP.SESSION.FADE_MS);
  Metronome.fadeOut(APP.SESSION.FADE_MS);
  finishId = setTimeout(function () {
    // Settings may be open on top of the meditation screen.
    history.go(current === APP.SCREEN_IDS.MEDITATION ? -1 : -2);
  }, Math.max(chimeMs, APP.SESSION.FADE_MS));
}

// Keep screen awake is on but the lock is unsupported or refused: say so once per session (SEC 8.1).
function wakeLockFailed() {
  if (!inSession || wakeNoticeShown) return;
  wakeNoticeShown = true;
  Music.showNotice('Could not keep the screen awake. Your screen may turn off during the session.');
}

function requestWakeLock() {
  if (wakeLock) return;
  if (!navigator.wakeLock) { wakeLockFailed(); return; }
  navigator.wakeLock.request('screen').then(function (lock) {
    // The session may have ended while the request was pending.
    if (!inSession) { lock.release(); return; }
    wakeLock = lock;
    lock.addEventListener('release', function () { wakeLock = null; });
  }).catch(function (err) {
    console.warn('Wake lock failed:', err);
    wakeLockFailed();
  });
}

function releaseWakeLock() {
  if (wakeLock) wakeLock.release();
  wakeLock = null;
}

// The browser drops the wake lock when the page is hidden; take it back on return.
document.addEventListener('visibilitychange', function () {
  if (inSession && document.visibilityState === 'visible' && Settings.getSession().keepAwake) requestWakeLock();
});

// Applies session settings to whatever is running. Safe to call any time during a session.
function applySession() {
  const s = Settings.getSession();
  Music.setVolume(s.musicVolume);
  Metronome.setVolume(s.metronomeVolume);
  Metronome.setSound(s.tickSound);
  if (Music.getTrackIndex() !== s.track) Music.setTrack(s.track);
  if (!inSession) return;

  if (s.music) Music.start(); else Music.stop();
  if (s.metronome) Metronome.start(); else Metronome.stop();
  slideshowEl.hidden = !s.images;
  if (s.images) Slideshow.start(); else Slideshow.stop();

  timerEl.hidden = !s.timer;
  if (s.timer) updateTimer(); // Session length may have changed
  if (s.timer && !timerId) {
    timerId = setInterval(updateTimer, APP.TIMER_UPDATE_MS);
  } else if (!s.timer && timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  if (s.keepAwake) requestWakeLock(); else releaseWakeLock();

  if (!finishing) Metronome.setCues(s.marks ? s.markInterval : 0, s.sessionLength);
}

function startSession() {
  inSession = true;
  showRemaining = false;
  wakeNoticeShown = false;
  sessionStartMs = Date.now();
  Metronome.beginSession(finishSession);
  applySession();
  goTo(APP.SCREEN_IDS.MEDITATION);
  showControls();
  statusEl.textContent = 'Session started';
}

function endSession() {
  const completed = finishing;
  inSession = false;
  finishing = false;
  clearTimeout(finishId);
  Music.stop();
  Metronome.endSession();
  Slideshow.stop();
  clearInterval(timerId);
  timerId = null;
  timerEl.hidden = true;
  releaseWakeLock();
  clearTimeout(idleId);
  document.body.classList.remove('controls-hidden');
  slideshowEl.hidden = false; // launch background
  renderToggles();
  showScreen(APP.SCREEN_IDS.LAUNCH, $('#start'));
  statusEl.textContent = completed ? 'Session complete' : 'Session ended';
}

// ---------- Meditation controls: hide when idle, show on any input ----------

// Last input was a key (not a pointer). Controls stay visible only under keyboard focus.
let keyboardInput = false;

// True when a control (not the programmatically focused heading) has keyboard focus.
function controlHasKeyboardFocus() {
  const el = document.activeElement;
  return keyboardInput && el && el.tabIndex >= 0 && $('#' + APP.SCREEN_IDS.MEDITATION).contains(el);
}

function showControls() {
  document.body.classList.remove('controls-hidden');
  clearTimeout(idleId);
  idleId = setTimeout(function () {
    if (current !== APP.SCREEN_IDS.MEDITATION) return;
    if (controlHasKeyboardFocus()) showControls(); // never hide under keyboard focus
    else document.body.classList.add('controls-hidden');
  }, APP.CONTROLS_IDLE_MS);
}

['pointerdown', 'keydown'].forEach(function (type) {
  document.addEventListener(type, function () {
    keyboardInput = type === 'keydown';
    if (current === APP.SCREEN_IDS.MEDITATION) showControls();
  }, true);
});

// Hidden controls stay in the DOM; focusing one brings them back.
$('#' + APP.SCREEN_IDS.MEDITATION).addEventListener('focusin', showControls);

// ---------- Settings form ----------

function fillForm(s) {
  form.music.checked = s.music;
  form.musicVolume.value = Math.round(s.musicVolume * 100);
  form.track.value = String(s.track);
  form.metronome.checked = s.metronome;
  form.metronomeVolume.value = Math.round(s.metronomeVolume * 100);
  renderVolumes();
  form.tickSound.value = s.tickSound;
  form.images.checked = s.images;
  form.sessionLength.value = String(s.sessionLength);
  form.marks.checked = s.marks;
  form.markInterval.value = String(s.markInterval);
  form.timer.checked = s.timer;
  form.keepAwake.checked = s.keepAwake;
}

function readForm() {
  return {
    music: form.music.checked,
    musicVolume: Number(form.musicVolume.value) / 100,
    track: Number(form.track.value),
    metronome: form.metronome.checked,
    metronomeVolume: Number(form.metronomeVolume.value) / 100,
    tickSound: form.tickSound.value,
    images: form.images.checked,
    sessionLength: Number(form.sessionLength.value),
    marks: form.marks.checked,
    markInterval: Number(form.markInterval.value),
    timer: form.timer.checked,
    keepAwake: form.keepAwake.checked,
  };
}

Music.getTracks().forEach(function (t, i) {
  const opt = document.createElement('option');
  opt.value = String(i);
  opt.textContent = t.title;
  form.track.appendChild(opt);
});

function openSettings() {
  fillForm(Settings.getSession());
  goTo(APP.SCREEN_IDS.SETTINGS);
}

// Applying closes settings; history.back() lands on the screen settings was opened from.
function applyAndClose(persistent) {
  const next = readForm();
  Music.stopPreview();
  if (persistent) Settings.setPersistent(next); else Settings.setSession(next);
  applySession();
  renderToggles();
  statusEl.textContent = persistent ? 'Settings saved' : 'Settings applied to this session';
  history.back();
}

$$('[data-preview]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    Metronome.setVolume(Number(form.metronomeVolume.value) / 100);
    Metronome.preview(btn.dataset.preview);
  });
});

// Volume sliders show and announce their value as a percentage.
function renderVolumes() {
  [form.musicVolume, form.metronomeVolume].forEach(function (input) {
    const text = input.value + '%';
    input.setAttribute('aria-valuetext', text);
    $('output[for="' + input.id + '"]', form).textContent = text;
  });
}

form.addEventListener('input', renderVolumes);

form.addEventListener('submit', function (e) { e.preventDefault(); });

// ---------- Credits ----------

// Builds the credits list once from CREDITS (js/credits.js). Source is plain text: the app opens no links.
function renderCredits() {
  const root = $('#credits-list');
  CREDITS.forEach(function (group) {
    const section = document.createElement('section');
    section.className = 'settings-group';
    const h2 = document.createElement('h2');
    h2.textContent = group.heading;
    const ul = document.createElement('ul');
    group.items.forEach(function (item) {
      const li = document.createElement('li');
      const h3 = document.createElement('h3');
      h3.textContent = item.title;
      li.appendChild(h3);
      [['Author', item.author], ['Source', item.source], ['License', item.license]].forEach(function (row) {
        const p = document.createElement('p');
        p.textContent = row[0] + ': ' + row[1];
        li.appendChild(p);
      });
      ul.appendChild(li);
    });
    section.appendChild(h2);
    section.appendChild(ul);
    root.appendChild(section);
  });
}

// ---------- Actions ----------

const ACTIONS = {
  'start': startSession,
  'end': function () { history.back(); },
  'open-settings': openSettings,
  'back': function () { history.back(); },
  'open-credits': function () { Music.stopPreview(); goTo(APP.SCREEN_IDS.CREDITS); },
  'preview-track': function () { Music.preview(Number(form.track.value), Number(form.musicVolume.value) / 100); },
  'apply-persistent': function () { applyAndClose(true); },
  'apply-session': function () { applyAndClose(false); },
};

$$('[data-action]').forEach(function (btn) {
  btn.addEventListener('click', function () { ACTIONS[btn.dataset.action](); });
});

// ---------- Init ----------

$('#start').textContent = 'Start ' + APP.START_WORDS[Math.floor(Math.random() * APP.START_WORDS.length)];
Music.setTrack(Settings.getSession().track);
renderCredits();
Slideshow.mount(slideshowEl);
Slideshow.show();
renderToggles();
history.replaceState({ screen: APP.SCREEN_IDS.LAUNCH }, '');
showScreen(APP.SCREEN_IDS.LAUNCH, $('#start'));
