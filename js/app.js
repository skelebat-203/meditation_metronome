'use strict';

// App wiring: screens, navigation (incl. Android Back via history), session start/end, settings form.

const $ = function (sel, root) { return (root || document).querySelector(sel); };
const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

const SCREEN_TITLES = {};
SCREEN_TITLES[APP.SCREEN_IDS.LAUNCH] = 'Meditation Metronome';
SCREEN_TITLES[APP.SCREEN_IDS.MEDITATION] = 'Meditating — Meditation Metronome';
SCREEN_TITLES[APP.SCREEN_IDS.SETTINGS] = 'Settings — Meditation Metronome';
SCREEN_TITLES[APP.SCREEN_IDS.CREDITS] = 'Credits — Meditation Metronome';
SCREEN_TITLES[APP.SCREEN_IDS.MEDIA] = 'My media — Meditation Metronome';

// History entries above the launch screen, so the end of a session can go back to it from any screen.
const SCREEN_DEPTH = {};
SCREEN_DEPTH[APP.SCREEN_IDS.MEDITATION] = 1;
SCREEN_DEPTH[APP.SCREEN_IDS.SETTINGS] = 2;
SCREEN_DEPTH[APP.SCREEN_IDS.CREDITS] = 3;
SCREEN_DEPTH[APP.SCREEN_IDS.MEDIA] = 3;

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
let formSnapshot = '';   // form contents when Settings opened; differs = unsaved changes
let leavingSettings = false; // next Back out of Settings is approved (saved or discarded)

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
// `replace` swaps the current entry instead (Settings -> session, so Back skips Settings).
function goTo(id, replace) {
  if (replace) history.replaceState({ screen: id }, ''); else history.pushState({ screen: id }, '');
  showScreen(id);
}

// Back: from settings, return to where it was opened; from meditation, end the session.
window.addEventListener('popstate', function () {
  if (finishing) {
    endSession();
    return;
  }
  if (current === APP.SCREEN_IDS.CREDITS || current === APP.SCREEN_IDS.MEDIA) {
    showScreen(APP.SCREEN_IDS.SETTINGS, $('[data-action="' + (current === APP.SCREEN_IDS.MEDIA ? 'open-media' : 'open-credits') + '"]'));
  } else if (current === APP.SCREEN_IDS.SETTINGS) {
    if (!leavingSettings && (saveMenuOpen() || settingsDirty())) {
      // Stay: put the entry back, then close the menu or ask about unsaved changes.
      history.pushState({ screen: APP.SCREEN_IDS.SETTINGS }, '');
      if (saveMenuOpen()) setSaveMenu(false, true); else showDiscardNotice();
      return;
    }
    leavingSettings = false;
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
    history.go(-SCREEN_DEPTH[current]);
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
  Music.setRepeat(s.musicRepeat);
  Metronome.setVolume(s.metronomeVolume);
  Metronome.setSound(s.tickSound);
  if (Music.getTrackId() !== s.track) Music.setTrack(s.track);
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

// `replace`: start from Settings, replacing its history entry.
function startSession(replace) {
  inSession = true;
  showRemaining = false;
  wakeNoticeShown = false;
  sessionStartMs = Date.now();
  Metronome.beginSession(finishSession);
  applySession();
  goTo(APP.SCREEN_IDS.MEDITATION, replace === true);
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
  form.track.value = s.trackChoice;
  form.musicRepeat.value = s.musicRepeat;
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
    musicRepeat: form.musicRepeat.value,
    trackChoice: form.track.value,
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

function option(value, text) {
  const opt = document.createElement('option');
  opt.value = value;
  opt.textContent = text;
  return opt;
}

// Track dropdown: Random, the built-in tracks, then the user's own under a non-selectable "Uploaded" group.
function renderTrackOptions() {
  form.track.textContent = '';
  form.track.appendChild(option(APP.MUSIC.RANDOM, APP.MUSIC.RANDOM_LABEL));
  const own = document.createElement('optgroup');
  own.label = APP.OWN_MEDIA.UPLOADED_LABEL;
  Music.getTracks().forEach(function (t) {
    (t.own ? own : form.track).appendChild(option(t.id, t.title));
  });
  if (own.children.length) form.track.appendChild(own);
}

// Tick dropdown: the built-in sounds, then the user's own under the same "Uploaded" group.
function renderTickOptions() {
  form.tickSound.textContent = '';
  Object.values(APP.METRONOME.SOUNDS).forEach(function (id) {
    form.tickSound.appendChild(option(id, APP.METRONOME.SOUND_LABELS[id]));
  });
  const own = OwnMedia.list(APP.OWN_MEDIA.KINDS.TICK);
  if (!own.length) return;
  const group = document.createElement('optgroup');
  group.label = APP.OWN_MEDIA.UPLOADED_LABEL;
  own.forEach(function (rec) { group.appendChild(option(rec.id, rec.name)); });
  form.tickSound.appendChild(group);
}

const saveToggle = $('#save-toggle');
const savePanel = $('#save-panel');
const saveMenu = $('#save-menu');
const discardNotice = $('#discard-notice');

function settingsDirty() { return JSON.stringify(readForm()) !== formSnapshot; }

function saveMenuOpen() { return !savePanel.hidden; }

// Disclosure: Save toggles the panel; `returnFocus` puts focus back on Save.
function setSaveMenu(open, returnFocus) {
  savePanel.hidden = !open;
  saveToggle.setAttribute('aria-expanded', String(open));
  $('#save-chevron').textContent = open ? '▴' : '▾';
  if (!open && returnFocus) saveToggle.focus();
}

function saveItems() { return $$('.save-item', savePanel); }

function showDiscardNotice() {
  discardNotice.hidden = false;
  $('#discard-title').focus();
}

function hideDiscardNotice() { discardNotice.hidden = true; }

function openSettings() {
  fillForm(Settings.getSession());
  formSnapshot = JSON.stringify(readForm());
  setSaveMenu(false);
  hideDiscardNotice();
  goTo(APP.SCREEN_IDS.SETTINGS);
}

// Back button on Settings: leave at once, or ask first when there are unsaved changes.
function backFromSettings() {
  if (saveMenuOpen()) setSaveMenu(false);
  if (settingsDirty()) showDiscardNotice(); else history.back();
}

function discardAndLeave() {
  leavingSettings = true;
  history.back();
}

// Persistent: save defaults, apply, then history.back() lands on the screen Settings was opened from
// (launch screen, or the running session). This session: apply; from the launch screen the session
// starts, from a running session it returns to it.
function applyAndClose(persistent) {
  const next = readForm();
  Music.stopPreview();
  if (persistent) Settings.setPersistent(next); else Settings.setSession(next);
  setSaveMenu(false);
  hideDiscardNotice();
  if (!persistent && !inSession) {
    renderToggles();
    startSession(true);
    return;
  }
  applySession();
  renderToggles();
  statusEl.textContent = persistent ? 'Settings saved' : 'Settings applied to this session';
  leavingSettings = true;
  history.back();
}

saveToggle.addEventListener('click', function () { setSaveMenu(!saveMenuOpen()); });

saveMenu.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && saveMenuOpen()) {
    e.preventDefault();
    setSaveMenu(false, true);
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const items = saveItems();
    const i = items.indexOf(document.activeElement);
    if (i === -1 && e.key === 'ArrowUp') return;
    e.preventDefault();
    if (!saveMenuOpen()) setSaveMenu(true);
    const step = e.key === 'ArrowDown' ? 1 : -1;
    items[(i + step + items.length) % items.length].focus();
  }
});

// Tab out of the menu closes it; focus stays where Tab sent it.
saveMenu.addEventListener('focusout', function (e) {
  if (e.relatedTarget && !saveMenu.contains(e.relatedTarget)) setSaveMenu(false);
});

document.addEventListener('pointerdown', function (e) {
  if (saveMenuOpen() && !saveMenu.contains(e.target)) setSaveMenu(false);
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
        if (!row[1]) return; // no license listed for one track
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
  'start': function () { startSession(false); },
  'end': function () { history.back(); },
  'open-settings': openSettings,
  'back': function () { history.back(); },
  'back-settings': backFromSettings,
  'discard': discardAndLeave,
  'keep-editing': function () { hideDiscardNotice(); $('[data-action="back-settings"]').focus(); },
  'open-media': function () { Music.stopPreview(); goTo(APP.SCREEN_IDS.MEDIA); },
  'open-credits': function () { Music.stopPreview(); goTo(APP.SCREEN_IDS.CREDITS); },
  'preview-track': function () { Music.preview(form.track.value === APP.MUSIC.RANDOM ? Settings.getSession().track : form.track.value, Number(form.musicVolume.value) / 100); },
  'preview-tick': function () {
    Metronome.setVolume(Number(form.metronomeVolume.value) / 100);
    Metronome.preview(form.tickSound.value);
  },
  'apply-persistent': function () { applyAndClose(true); },
  'apply-session': function () { applyAndClose(false); },
};

$$('[data-action]').forEach(function (btn) {
  btn.addEventListener('click', function () { ACTIONS[btn.dataset.action](); });
});

// ---------- Own media ----------

// Puts the user's own media into the player, slideshow and Settings choices. The Settings form keeps
// its current (possibly unedited) values; a value that no longer exists falls back as Settings decides.
function syncOwnMedia() {
  const dirty = settingsDirty();
  const trackValue = form.track.value;
  const tickValue = form.tickSound.value;
  Music.setOwnTracks(OwnMedia.list(APP.OWN_MEDIA.KINDS.MUSIC).map(function (r) {
    return { id: r.id, title: r.name, src: r.url };
  }));
  Slideshow.setOwnImages(OwnMedia.list(APP.OWN_MEDIA.KINDS.IMAGE).map(function (r) { return r.url; }));
  Settings.reconcile();
  const s = Settings.getSession();
  renderTrackOptions();
  renderTickOptions();
  form.track.value = trackValue;
  if (form.track.value !== trackValue) form.track.value = s.trackChoice;
  form.tickSound.value = tickValue;
  if (form.tickSound.value !== tickValue) form.tickSound.value = s.tickSound;
  if (!dirty) formSnapshot = JSON.stringify(readForm());
  if (inSession) Metronome.setSound(s.tickSound);
  if (!inSession) Music.setTrack(s.track);
}

OwnMedia.onChange(syncOwnMedia);

// ---------- Init ----------

// Own media loads first (asynchronously); the app starts with built-ins only if it cannot.
let unreadable = 0;
OwnMedia.init().then(function (skipped) {
  unreadable = skipped;
}, function (err) {
  console.warn('Own media unavailable:', err);
}).then(function () {
  MediaScreen.init(function (text) { statusEl.textContent = text; });
  $('#start').textContent = 'Start ' + APP.START_WORDS[Math.floor(Math.random() * APP.START_WORDS.length)];
  syncOwnMedia();
  renderCredits();
  Slideshow.mount(slideshowEl);
  Slideshow.show();
  renderToggles();
  history.replaceState({ screen: APP.SCREEN_IDS.LAUNCH }, '');
  showScreen(APP.SCREEN_IDS.LAUNCH, $('#start'));
  if (unreadable) Music.showNotice('Some of your files could not be read and were removed.');
});
