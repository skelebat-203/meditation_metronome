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
  let shown = false;

  function shuffle(avoidFirst) {
    return shuffledIndices(sources.length, avoidFirst);
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

  // Shows the first image without cycling (launch-screen background). No-op once an image is shown.
  function show() {
    if (!shown) {
      shown = true;
      advance();
    }
  }

  // Cycles from the image on screen (or a new one if none is shown yet).
  function start() {
    if (timer) return;
    show();
    timer = setInterval(advance, APP.IMAGES.SHOW_MS);
  }

  // Stops cycling; the current image stays on screen.
  function stop() {
    clearInterval(timer);
    timer = null;
  }

  return Object.freeze({
    mount: mount,
    show: show,
    start: start,
    stop: stop,
    isRunning: function () { return timer !== null; },
  });
})();
