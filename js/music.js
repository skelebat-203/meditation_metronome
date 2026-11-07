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

  audio.addEventListener('ended', function () {
    load(index + 1);
    if (playing) play();
  });

  // Starts playback; call from a user gesture. Resumes the current track if one is loaded.
  function start() {
    if (playing) return;
    playing = true;
    if (!audio.src) load(index);
    play();
  }

  function stop() {
    playing = false;
    audio.pause();
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

  return Object.freeze({
    start: start,
    stop: stop,
    isPlaying: function () { return playing; },
    setTrack: setTrack,
    getTrackIndex: function () { return index; },
    getTracks: function () { return tracks; },
    randomTrackIndex: randomTrackIndex,
    setVolume: setVolume,
  });
})();
