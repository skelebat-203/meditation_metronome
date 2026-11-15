'use strict';

// Music player: plays the built-in tracks plus the user's own in shuffled order, reshuffling after each
// full pass, forever (or repeats the current track, per the Music repeat setting).
// One <audio> element; the next track loads when the current one ends.
// A track is { id, title, src, own? }: id is the saved id (built-in: its path; own: OwnMedia id), src is
// what the <audio> loads (a blob: URL for own tracks).

const Music = (function () {
  const builtIn = APP.MUSIC.TRACKS.map(function (t) { return { id: t.src, title: t.title, src: t.src }; });
  let tracks = builtIn.slice();
  const audio = new Audio();
  let order = shuffledIndices(tracks.length);
  let pos = 0; // position of the current track in `order`
  let current = tracks[order[0]];
  let orphans = []; // blob: URLs of removed own tracks, revoked once the player has moved off them
  let playing = false;
  let repeatTrack = false; // true: replay the current track when it ends

  audio.preload = 'auto';
  audio.volume = APP.MUSIC.DEFAULT_VOLUME;

  function load(i) {
    current = tracks[i];
    audio.src = current.src;
    orphans = orphans.filter(function (url) {
      if (url === audio.src) return true;
      URL.revokeObjectURL(url);
      return false;
    });
  }

  function indexOfId(id) {
    return tracks.findIndex(function (t) { return t.id === id; });
  }

  // Replaces the user's own tracks. The current track keeps playing even if it was removed; its URL is
  // revoked when the player moves on. The pass restarts: the current track first, then a fresh shuffle.
  function setOwnTracks(own) {
    const kept = {};
    own.forEach(function (t) { kept[t.id] = true; });
    tracks.forEach(function (t) {
      if (!t.own || kept[t.id]) return;
      if (t.src === audio.src) orphans.push(t.src); else URL.revokeObjectURL(t.src);
    });
    tracks = builtIn.concat(own.map(function (t) { return { id: t.id, title: t.title, src: t.src, own: true }; }));
    order = shuffledIndices(tracks.length);
    pos = 0;
    if (!audio.src) { current = tracks[order[0]]; return; } // nothing loaded yet: the random start may be an own track
    const at = indexOfId(current.id);
    if (at === -1) { pos = -1; return; } // current track was removed: the next one starts a fresh pass
    order[order.indexOf(at)] = order[0];
    order[0] = at;
  }

  // Loads the next track in the shuffled order; after a full pass, reshuffles without repeating the last track.
  function loadNext() {
    pos++;
    if (pos >= order.length) {
      order = shuffledIndices(tracks.length, indexOfId(current.id));
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
    const title = current.title;
    console.warn('Music track failed:', current.id, audio.error);
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
    if (repeatTrack && indexOfId(current.id) !== -1) load(indexOfId(current.id)); else loadNext();
    if (playing) play();
  });

  // Starts playback; call from a user gesture. Resumes the current track if one is loaded.
  function start() {
    clearInterval(fadeId);
    if (playing) return;
    playing = true;
    failures = 0;
    if (!audio.src) load(indexOfId(current.id));
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
  function setTrack(id) {
    const i = indexOfId(id);
    if (i === -1) return;
    order = shuffledIndices(tracks.length);
    const at = order.indexOf(i);
    order[at] = order[0];
    order[0] = i;
    pos = 0;
    load(i);
    if (playing) play();
  }

  // Takes effect when the current track ends.
  function setRepeat(mode) {
    repeatTrack = mode === APP.MUSIC.REPEAT.TRACK;
  }

  function setVolume(v) {
    audio.volume = Math.min(1, Math.max(0, v));
  }

  function randomTrackId() {
    return tracks[Math.floor(Math.random() * tracks.length)].id;
  }

  // Settings preview: plays track i on its own element at volume v for APP.MUSIC.PREVIEW_MS,
  // then fades it out over APP.MUSIC.PREVIEW_FADE_MS and stops. A new preview replaces the old one.
  const previewAudio = new Audio();
  let previewTimer = null;
  let previewFadeId = null;

  function preview(id, v) {
    const track = tracks[indexOfId(id)];
    if (!track) return;
    stopPreview();
    previewAudio.src = track.src;
    previewAudio.volume = Math.min(1, Math.max(0, v));
    const p = previewAudio.play();
    if (p && p.catch) {
      p.catch(function (err) {
        console.warn('Music preview failed:', err);
        if (previewAudio.error) showNotice('Could not play "' + track.title + '".');
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
    getTrackId: function () { return current.id; },
    getTracks: function () { return tracks.slice(); },
    hasTrack: function (id) { return indexOfId(id) !== -1; },
    setOwnTracks: setOwnTracks,
    randomTrackId: randomTrackId,
    setVolume: setVolume,
    setRepeat: setRepeat,
    showNotice: showNotice, // shared with app.js for the wake lock message
  });
})();
