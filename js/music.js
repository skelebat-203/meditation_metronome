'use strict';

// Music player: plays APP.MUSIC.TRACKS in order, wrapping from the last track to the first, forever.
// One <audio> element; the next track loads when the current one ends.

const Music = (function () {
  const tracks = APP.MUSIC.TRACKS;
  const audio = new Audio();
  let index = 0;
  let playing = false;

  audio.preload = 'auto';
  audio.volume = APP.MUSIC.DEFAULT_VOLUME;

  function load(i) {
    index = ((i % tracks.length) + tracks.length) % tracks.length;
    audio.src = tracks[index].src;
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

  function showNotice(text) {
    if (!notice) {
      notice = document.createElement('div');
      notice.className = 'music-notice';
      notice.setAttribute('role', 'alert');
      document.body.appendChild(notice);
    }
    notice.textContent = text;
    notice.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(function () { notice.hidden = true; }, APP.MUSIC.NOTICE_MS);
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
    load(index + 1);
    play();
  }

  audio.addEventListener('error', function () {
    if (playing) handleFailure();
  });

  audio.addEventListener('playing', function () { failures = 0; });

  audio.addEventListener('ended', function () {
    load(index + 1);
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
  function setTrack(i) {
    load(i);
    if (playing) play();
  }

  function setVolume(v) {
    audio.volume = Math.min(1, Math.max(0, v));
  }

  function randomTrackIndex() {
    return Math.floor(Math.random() * tracks.length);
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
  });
})();
