'use strict';

// Image slideshow: shows APP.IMAGES.SOURCES in shuffled order, reshuffling after each full pass, forever.
// Two stacked <img> layers cross-fade; under prefers-reduced-motion images switch without a fade.

const Slideshow = (function () {
  const sources = APP.IMAGES.SOURCES;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let layers = null; // [back, front]
  let order = [];
  let pos = 0;
  let timer = null;

  // Fisher-Yates shuffle. If `avoidFirst` is given, it never lands first, so no image repeats across a pass boundary.
  function shuffle(avoidFirst) {
    const a = sources.map(function (_, i) { return i; });
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    if (a.length > 1 && a[0] === avoidFirst) {
      const t = a[0]; a[0] = a[1]; a[1] = t;
    }
    return a;
  }

  function nextIndex() {
    if (pos >= order.length) {
      order = shuffle(order[order.length - 1]);
      pos = 0;
    }
    return order[pos++];
  }

  // Builds the layers inside `container` (once). Call before start().
  function mount(container) {
    if (layers) return;
    container.classList.add('slideshow');
    layers = [0, 1].map(function () {
      const img = document.createElement('img');
      img.alt = ''; // decorative
      container.appendChild(img);
      return img;
    });
    order = shuffle();
  }

  // Loads the next image on the hidden layer, then fades it in on top of the visible one.
  // The outgoing layer stays opaque underneath until the fade ends, so the screen never dims mid-fade.
  function advance() {
    const incoming = layers[0];
    const outgoing = layers[1];
    const fadeMs = reducedMotion.matches ? 0 : APP.IMAGES.FADE_MS;
    layers = [outgoing, incoming];
    incoming.onload = function () {
      incoming.style.transitionDuration = fadeMs + 'ms';
      incoming.style.zIndex = 1;
      outgoing.style.zIndex = 0;
      incoming.classList.add('is-visible');
      setTimeout(function () {
        outgoing.style.transitionDuration = '0ms';
        outgoing.classList.remove('is-visible');
      }, fadeMs);
    };
    incoming.src = sources[nextIndex()];
  }

  function start() {
    if (timer) return;
    advance();
    timer = setInterval(advance, APP.IMAGES.SHOW_MS);
  }

  // Stops cycling; the current image stays on screen.
  function stop() {
    clearInterval(timer);
    timer = null;
  }

  return Object.freeze({
    mount: mount,
    start: start,
    stop: stop,
    isRunning: function () { return timer !== null; },
  });
})();
