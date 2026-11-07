'use strict';

// Fisher-Yates shuffle of the indices 0..n-1. If `avoidFirst` is given, it never lands first,
// so nothing repeats across a pass boundary. Shared by the music player and the slideshow.
function shuffledIndices(n, avoidFirst) {
  const a = [];
  for (let i = 0; i < n; i++) a.push(i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  if (a.length > 1 && a[0] === avoidFirst) {
    const t = a[0]; a[0] = a[1]; a[1] = t;
  }
  return a;
}
