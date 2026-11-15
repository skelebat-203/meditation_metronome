'use strict';

// The user's own music, images and metronome sounds (docs/design/0005-own-media.md).
// Files are copied once into IndexedDB as Blobs and never referenced again. Items are kept in memory,
// sorted by name. Music and images get a blob: URL; tick sounds are decoded by the metronome.
// Revoking URLs of removed items is left to whoever plays them (Music, Slideshow).

const OwnMedia = (function () {
  const C = APP.OWN_MEDIA;
  const KINDS = Object.values(C.KINDS);
  const items = {};
  KINDS.forEach(function (k) { items[k] = []; });
  const listeners = [];
  let db = null;
  let persistAsked = false;

  function sortByName(a, b) {
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
  }

  function insert(rec) {
    if (rec.kind !== C.KINDS.TICK) rec.url = URL.createObjectURL(rec.blob);
    items[rec.kind].push(rec);
    items[rec.kind].sort(sortByName);
  }

  function notify() { listeners.forEach(function (fn) { fn(); }); }

  // Resolves with the transaction's result request; rejects with the request or transaction error.
  function run(mode, fn) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(C.STORE, mode);
      const req = fn(tx.objectStore(C.STORE));
      tx.oncomplete = function () { resolve(req.result); };
      tx.onerror = tx.onabort = function () { reject(tx.error || req.error); };
    });
  }

  // Opens the database and loads every record. Resolves with the number of unreadable records removed.
  // Rejects when IndexedDB is unavailable (the app then works with built-ins only).
  function init() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
      let req;
      try { req = indexedDB.open(C.DB_NAME, 1); } catch (err) { reject(err); return; }
      req.onupgradeneeded = function () { req.result.createObjectStore(C.STORE, { keyPath: 'id' }); };
      req.onerror = req.onblocked = function () { reject(req.error || new Error('IndexedDB blocked')); };
      req.onsuccess = function () { db = req.result; resolve(); };
    }).then(function () {
      return run('readonly', function (s) { return s.getAll(); });
    }).then(function (records) {
      const bad = [];
      records.forEach(function (rec) {
        if (rec && KINDS.indexOf(rec.kind) !== -1 && rec.blob instanceof Blob && typeof rec.name === 'string') insert(rec);
        else if (rec && rec.id) bad.push(rec.id);
      });
      bad.forEach(function (id) { run('readwrite', function (s) { return s.delete(id); }); });
      return bad.length;
    });
  }

  // Validation by real decode (0005 § Formats).
  function checkAudio(url) {
    return new Promise(function (resolve, reject) {
      const a = new Audio();
      const timer = setTimeout(function () { settle(reject); }, C.DECODE_TIMEOUT_MS);
      function settle(fn) {
        clearTimeout(timer);
        a.onloadedmetadata = a.onerror = null;
        a.removeAttribute('src');
        a.load();
        fn();
      }
      a.preload = 'metadata';
      a.onloadedmetadata = function () { settle(resolve); };
      a.onerror = function () { settle(reject); };
      a.src = url;
    });
  }

  function checkImage(url) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () {
        (img.decode ? img.decode() : Promise.resolve()).then(function () { resolve(img); }, reject);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function nameOf(file) {
    return file.name.replace(/\.[^.]*$/, '') || 'Untitled';
  }

  function newId() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return C.ID_PREFIX + Array.prototype.map.call(bytes, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  // Adds one file. Resolves { ok: true } or { ok: false, reason } with reason one of
  // 'format', 'size' (image too large), 'duplicate', 'quota', 'error'.
  function add(kind, file) {
    const name = nameOf(file);
    const dup = items[kind].some(function (r) { return r.name === name && r.size === file.size; });
    if (dup) return Promise.resolve({ ok: false, reason: 'duplicate' });
    const url = URL.createObjectURL(file);
    const check = kind === C.KINDS.IMAGE
      ? checkImage(url).then(function (img) {
        return Math.max(img.naturalWidth, img.naturalHeight) > C.MAX_IMAGE_LONG_SIDE_PX ? 'size' : null;
      })
      : checkAudio(url).then(function () { return null; });
    return check.catch(function () { return 'format'; }).then(function (problem) {
      URL.revokeObjectURL(url);
      if (problem) return { ok: false, reason: problem };
      const rec = { id: newId(), kind: kind, name: name, type: file.type, size: file.size, added: Date.now(), blob: file };
      return run('readwrite', function (s) { return s.add(rec); }).then(function () {
        insert(rec);
        askPersist();
        notify();
        return { ok: true };
      }, function (err) {
        return { ok: false, reason: err && err.name === 'QuotaExceededError' ? 'quota' : 'error' };
      });
    });
  }

  // Asks the browser once not to evict our storage; a refusal or missing API is ignored.
  function askPersist() {
    if (persistAsked || !navigator.storage || !navigator.storage.persist) return;
    persistAsked = true;
    navigator.storage.persist().catch(function () {});
  }

  // Removes the given ids. Resolves when stored.
  function remove(ids) {
    return Promise.all(ids.map(function (id) {
      return run('readwrite', function (s) { return s.delete(id); });
    })).then(function () {
      KINDS.forEach(function (k) {
        items[k] = items[k].filter(function (r) { return ids.indexOf(r.id) === -1; });
      });
      notify();
    });
  }

  function find(id) {
    for (let i = 0; i < KINDS.length; i++) {
      const rec = items[KINDS[i]].find(function (r) { return r.id === id; });
      if (rec) return rec;
    }
    return null;
  }

  // Bytes used: the browser's estimate for this origin, else the sum of stored sizes.
  function usedBytes() {
    const sum = KINDS.reduce(function (n, k) {
      return n + items[k].reduce(function (m, r) { return m + r.size; }, 0);
    }, 0);
    if (!navigator.storage || !navigator.storage.estimate) return Promise.resolve(sum);
    return navigator.storage.estimate().then(function (e) { return e.usage || sum; }, function () { return sum; });
  }

  return Object.freeze({
    init: init,
    add: add,
    remove: remove,
    list: function (kind) { return items[kind].slice(); },
    has: function (id) { return find(id) !== null; },
    blobOf: function (id) { const r = find(id); return r ? r.blob : null; },
    usedBytes: usedBytes,
    onChange: function (fn) { listeners.push(fn); },
    isAvailable: function () { return db !== null; },
  });
})();
