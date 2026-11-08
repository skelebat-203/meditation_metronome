'use strict';

// Music player: plays APP.MUSIC.TRACKS in shuffled order, reshuffling after each full pass, forever.
// One <audio> element; the next track loads when the current one ends.

const Music = (function () {
  const tracks = APP.MUSIC.TRACKS;
  const audio = new Audio();
  let order = shuffledIndices(tracks.length);
  let pos = 0; // position of the current track in `order`
  let index = order[0];
  let playing = false;

  audio.preload = 'auto';
  audio.volume = APP.MUSIC.DEFAULT_VOLUME;

  function load(i) {
    index = i;
    audio.src = tracks[index].src;
  }

  // Loads the next track in the shuffled order; after a full pass, reshuffles without repeating the last track.
  function loadNext() {
    pos++;
    if (pos >= order.length) {
      order = shuffledIndices(tracks.length, index);
      pos = 0;
    }
    load(order[pos]);
  }

  // play() returns a promise in modern browsers; a rejection (e.g. autoplay block) is logged, not thrown.
  function play() {
    const p = audio.play();
    if (p && p.catch) p.catch(function (err) { console.warn('Music play failed:', err); });
  }

  // Playback errors (SEC-02): a track that fails to load or decode shows a visible, announced message,
  // then the player skips to the next track. If every track fails in a row, music stops.
  let notice = null;
  let noticeTimer = null;
  let failures = 0;

  // The notice sits inside the visible screen's <main> (A11Y-11); app.js moves it on screen changes.
  // app.js also uses it for the wake lock message (SEC 8.1).
  let noticeText = null;

  function hideNotice() {
    clearTimeout(noticeTimer);
    const hadFocus = notice.contains(document.activeElement);
    notice.hidden = true;
    if (hadFocus) {
      const heading = notice.parentNode.querySelector('h1');
      if (heading) heading.focus();
    }
  }

  function showNotice(text) {
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'music-notice';
      notice.className = 'music-notice';
      notice.setAttribute('role', 'alert');
      noticeText = document.createElement('span');
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'btn';
      close.setAttribute('aria-label', 'Close message');
      close.textContent = '✕';
      close.addEventListener('click', hideNotice);
      notice.append(noticeText, close);
    }
    const screen = document.querySelector('main:not([hidden])');
    if (screen && notice.parentNode !== screen) screen.appendChild(notice);
    noticeText.textContent = text;
    notice.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(hideNotice, APP.MUSIC.NOTICE_MS);
  }

  function handleFailure() {
    const title = tracks[index].title;
    console.warn('Music track failed:', tracks[index].src, audio.error);
    failures++;
    if (failures >= tracks.length) {
      playing = false;
      showNotice('Music could not be played.');
      return;
    }
    showNotice('Could not play "' + title + '". Skipping to the next track.');
    loadNext();
    play();
  }

  audio.addEventListener('error', function () {
    if (playing) handleFailure();
  });

  audio.addEventListener('playing', function () { failures = 0; });

  audio.addEventListener('ended', function () {
    loadNext();
    if (playing) play();
  });

  // Starts playback; call from a user gesture. Resumes the current track if one is loaded.
  function start() {
    clearInterval(fadeId);
    if (playing) return;
    playing = true;
    failures = 0;
    if (!audio.src) load(index);
    // A track that already failed to load while idle is reported now that the user asked for music.
    if (audio.error) { handleFailure(); return; }
    play();
  }

  function stop() {
    playing = false;
    audio.pause();
  }

  // Lowers the volume to 0 over `ms`, then stops. The next start() restores volume via setVolume().
  const FADE_STEPS = 20;
  let fadeId = null;
  function fadeOut(ms) {
    if (!playing) return;
    const from = audio.volume;
    let step = 0;
    clearInterval(fadeId);
    fadeId = setInterval(function () {
      step++;
      audio.volume = Math.max(0, from * (1 - step / FADE_STEPS));
      if (step >= FADE_STEPS || !playing) {
        clearInterval(fadeId);
        stop();
      }
    }, ms / FADE_STEPS);
  }

  // Switches track; keeps playing if already playing. Starts the track from the beginning.
  // The chosen track starts a new shuffled pass, so every other track still plays once before a repeat.
  function setTrack(i) {
    order = shuffledIndices(tracks.length);
    const at = order.indexOf(i);
    order[at] = order[0];
    order[0] = i;
    pos = 0;
    load(i);
    if (playing) play();
  }

  function setVolume(v) {
    audio.volume = Math.min(1, Math.max(0, v));
  }

  // The first track of the session's shuffled order.
  function randomTrackIndex() {
    return order[0];
  }

  // Settings preview: plays track i on its own element at volume v for APP.MUSIC.PREVIEW_MS,
  // then fades it out over APP.MUSIC.PREVIEW_FADE_MS and stops. A new preview replaces the old one.
  const previewAudio = new Audio();
  let previewTimer = null;
  let previewFadeId = null;

  function preview(i, v) {
    stopPreview();
    previewAudio.src = tracks[i].src;
    previewAudio.volume = Math.min(1, Math.max(0, v));
    const p = previewAudio.play();
    if (p && p.catch) {
      p.catch(function (err) {
        console.warn('Music preview failed:', err);
        if (previewAudio.error) showNotice('Could not play "' + tracks[i].title + '".');
      });
    }
    previewTimer = setTimeout(fadePreview, APP.MUSIC.PREVIEW_MS);
  }

  function fadePreview() {
    const from = previewAudio.volume;
    let step = 0;
    previewFadeId = setInterval(function () {
      step++;
      previewAudio.volume = Math.max(0, from * (1 - step / FADE_STEPS));
      if (step >= FADE_STEPS) stopPreview();
    }, APP.MUSIC.PREVIEW_FADE_MS / FADE_STEPS);
  }

  function stopPreview() {
    clearTimeout(previewTimer);
    clearInterval(previewFadeId);
    previewAudio.pause();
  }

  return Object.freeze({
    preview: preview,
    stopPreview: stopPreview,
    start: start,
    stop: stop,
    fadeOut: fadeOut,
    isPlaying: function () { return playing; },
    setTrack: setTrack,
    getTrackIndex: function () { return index; },
    getTracks: function () { return tracks; },
    randomTrackIndex: randomTrackIndex,
    setVolume: setVolume,
    showNotice: showNotice, // shared with app.js for the wake lock message
  });
})();
