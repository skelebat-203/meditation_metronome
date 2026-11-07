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
const timerTextEl = $('#session-timer span');
const slideshowEl = $('#slideshow');
const statusEl = $('#status');

let current = null;      // visible screen id
let inSession = false;
let sessionStartMs = 0;
let timerId = null;
let idleId = null;
let wakeLock = null;
let sessionCheckId = null;
let nextMarkMs = 0;      // elapsed time of the next mark
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

function updateTimer() {
  timerTextEl.textContent = formatElapsed(Date.now() - sessionStartMs);
}

// Session length and marks, counted from Start. Checked on a short interval against the clock.
function scheduleMarks() {
  const s = Settings.getSession();
  const interval = s.markInterval * 1000;
  const elapsed = Date.now() - sessionStartMs;
  nextMarkMs = (Math.floor(elapsed / interval) + 1) * interval;
}

function checkSession() {
  const s = Settings.getSession();
  const elapsed = Date.now() - sessionStartMs;
  const lengthMs = s.sessionLength * 1000;
  if (lengthMs && elapsed >= lengthMs) {
    finishSession();
    return;
  }
  if (elapsed >= nextMarkMs) {
    // No mark at the same moment as the end chime.
    if (s.marks && !(lengthMs && nextMarkMs >= lengthMs)) Metronome.chime('mark');
    scheduleMarks();
  }
}

// Session length reached: end chime, fade out, then back to the launch screen once the chime ends.
function finishSession() {
  clearInterval(sessionCheckId);
  sessionCheckId = null;
  finishing = true;
  const chimeMs = Metronome.chime('end');
  Music.fadeOut(APP.SESSION.FADE_MS);
  Metronome.fadeOut(APP.SESSION.FADE_MS);
  finishId = setTimeout(function () {
    // Settings may be open on top of the meditation screen.
    history.go(current === APP.SCREEN_IDS.MEDITATION ? -1 : -2);
  }, Math.max(chimeMs, APP.SESSION.FADE_MS));
}

function requestWakeLock() {
  if (!navigator.wakeLock || wakeLock) return;
  navigator.wakeLock.request('screen').then(function (lock) {
    wakeLock = lock;
    lock.addEventListener('release', function () { wakeLock = null; });
  }).catch(function (err) { console.warn('Wake lock failed:', err); });
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
  if (s.timer && !timerId) {
    updateTimer();
    timerId = setInterval(updateTimer, APP.TIMER_UPDATE_MS);
  } else if (!s.timer && timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  if (s.keepAwake) requestWakeLock(); else releaseWakeLock();

  if (!finishing) {
    scheduleMarks();
    if (!sessionCheckId) sessionCheckId = setInterval(checkSession, APP.SESSION.CHECK_MS);
  }
}

function startSession() {
  inSession = true;
  sessionStartMs = Date.now();
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
  clearInterval(sessionCheckId);
  sessionCheckId = null;
  Music.stop();
  Metronome.stop();
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

function showControls() {
  document.body.classList.remove('controls-hidden');
  clearTimeout(idleId);
  idleId = setTimeout(function () {
    // Never hide while a control has keyboard focus.
    if (current === APP.SCREEN_IDS.MEDITATION && !$('#' + APP.SCREEN_IDS.MEDITATION).contains(document.activeElement)) {
      document.body.classList.add('controls-hidden');
    } else if (current === APP.SCREEN_IDS.MEDITATION) {
      showControls();
    }
  }, APP.CONTROLS_IDLE_MS);
}

['pointerdown', 'keydown'].forEach(function (type) {
  document.addEventListener(type, function () {
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
