'use strict';

// My media screen (docs/design/0005-own-media.md): expanders for Music, Images and Metronome sounds, each
// with an alphabetical list, Remove (two-step inline confirm) and an Add button that opens the file picker.
// Results go through Music.showNotice (an alert inside the visible <main>); progress through `announce`.

const MediaScreen = (function () {
  const C = APP.OWN_MEDIA;
  const REASONS = {
    format: 'unsupported format',
    size: 'over ' + C.MAX_IMAGE_LONG_SIDE_PX + 'px',
    duplicate: 'already added',
    error: 'could not be saved',
  };
  const QUOTA_TEXT = 'Not enough storage. Remove some of your files and try again.';
  const HINTS = {};
  HINTS[C.KINDS.IMAGE] = 'Images where the long side is less than ' + C.MIN_IMAGE_LONG_SIDE_PX + 'px may not fill the screen';
  HINTS[C.KINDS.TICK] = 'Sounds longer than the metronome will be shortened.';

  const sections = {}; // kind -> { list, empty, removeAll, add, actions }
  let announce = function () {};

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function button(label, onClick, ariaLabel) {
    const b = el('button', 'btn', label);
    b.type = 'button';
    if (ariaLabel) b.setAttribute('aria-label', ariaLabel);
    b.addEventListener('click', onClick);
    return b;
  }

  function mb(bytes) { return (bytes / C.BYTES_PER_MB).toFixed(1) + ' MB'; }

  // Swaps `host`'s contents for "{message} [yesLabel] [Keep]"; focus goes to Keep. Keep restores them.
  function askConfirm(host, message, yesLabel, onYes) {
    const saved = document.createDocumentFragment();
    while (host.firstChild) saved.appendChild(host.firstChild);
    const keep = button('Keep', function () {
      while (host.firstChild) host.removeChild(host.firstChild);
      host.appendChild(saved);
      host.querySelector('button').focus();
    });
    host.append(el('span', 'media-name', message), button(yesLabel, onYes), keep);
    keep.focus();
  }

  function removeAndAnnounce(ids, text, focusEl) {
    OwnMedia.remove(ids).then(function () {
      announce(text);
      focusEl.focus();
    }, function () { Music.showNotice('Could not remove. Try again.'); });
  }

  function renderList(kind) {
    const s = sections[kind];
    const recs = OwnMedia.list(kind);
    s.list.textContent = '';
    recs.forEach(function (rec) {
      const li = el('li', 'media-item');
      li.append(el('span', 'media-name', rec.name), el('span', 'media-size', mb(rec.size)));
      li.appendChild(button('Remove', function () {
        askConfirm(li, 'Remove ' + rec.name + '?', 'Remove', function () {
          removeAndAnnounce([rec.id], 'Removed ' + rec.name, s.add);
        });
      }, 'Remove ' + rec.name));
      s.list.appendChild(li);
    });
    s.list.hidden = !recs.length;
    s.empty.hidden = recs.length > 0;
    s.removeAll.hidden = !recs.length;
  }

  function refresh() {
    Object.keys(sections).forEach(renderList);
    OwnMedia.usedBytes().then(function (n) { document.getElementById('media-used').textContent = 'Used ' + mb(n); });
  }

  // Adds the picked files one by one, then reports one summary.
  function addFiles(kind, files) {
    const s = sections[kind];
    if (!files.length) return;
    announce('Adding ' + files.length + (files.length === 1 ? ' file' : ' files') + '...');
    let added = 0;
    const failed = [];
    let full = false;
    files.reduce(function (chain, file) {
      return chain.then(function () {
        if (full) return null;
        return OwnMedia.add(kind, file).then(function (r) {
          if (r.ok) added++;
          else if (r.reason === 'quota') full = true;
          else failed.push(file.name + ' (' + REASONS[r.reason] + ')');
        });
      });
    }, Promise.resolve()).then(function () {
      const parts = [];
      if (added) parts.push('Added ' + added + '.');
      if (failed.length) parts.push('Could not add ' + failed.length + ': ' + failed.join(', ') + '.');
      if (full) parts.push(QUOTA_TEXT);
      Music.showNotice(parts.join(' ') || 'Nothing was added.');
      refresh();
      s.add.focus();
    });
  }

  function build(host) {
    const kind = host.dataset.kind;
    const titleId = 'media-title-' + kind;
    const panelId = 'media-panel-' + kind;
    host.setAttribute('aria-labelledby', titleId);
    const h2 = el('h2');
    h2.id = titleId;
    const expander = el('button', 'btn media-expander');
    expander.type = 'button';
    expander.setAttribute('aria-expanded', 'false');
    expander.setAttribute('aria-controls', panelId);
    const chevron = el('span', null, '▾');
    chevron.setAttribute('aria-hidden', 'true');
    expander.append(host.dataset.title + ' ', chevron);
    h2.appendChild(expander);

    const panel = el('div', 'media-panel');
    panel.id = panelId;
    panel.hidden = true;
    const list = el('ul', 'media-list');
    const empty = el('p', 'media-empty', 'Nothing added yet.');
    const actions = el('div', 'media-actions');
    const input = el('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = host.dataset.accept;
    input.hidden = true;
    input.tabIndex = -1;
    input.addEventListener('change', function () {
      const files = Array.prototype.slice.call(input.files);
      input.value = '';
      addFiles(kind, files);
    });
    const add = button('+ ' + host.dataset.add, function () { input.click(); });
    const removeAll = button('Remove all', function () {
      const ids = OwnMedia.list(kind).map(function (r) { return r.id; });
      askConfirm(actions, 'Remove all ' + ids.length + '?', 'Remove all', function () {
        removeAndAnnounce(ids, 'Removed all ' + host.dataset.title.toLowerCase(), add);
      });
    }, 'Remove all ' + host.dataset.title.toLowerCase());
    actions.append(add, removeAll);
    panel.append(list, empty);
    if (HINTS[kind]) {
      const hint = el('p', 'media-hint', HINTS[kind]);
      hint.id = 'media-hint-' + kind;
      add.setAttribute('aria-describedby', hint.id);
      panel.appendChild(hint);
    }
    panel.append(actions, input);

    expander.addEventListener('click', function () {
      const open = expander.getAttribute('aria-expanded') !== 'true';
      expander.setAttribute('aria-expanded', String(open));
      chevron.textContent = open ? '▴' : '▾';
      panel.hidden = !open;
    });
    host.append(h2, panel);
    list.setAttribute('aria-labelledby', titleId);
    sections[kind] = { list: list, empty: empty, removeAll: removeAll, add: add };
  }

  // `announceFn(text)` writes to the polite status region.
  function init(announceFn) {
    announce = announceFn;
    Array.prototype.forEach.call(document.querySelectorAll('.media-section'), build);
    if (!OwnMedia.isAvailable()) {
      document.getElementById('media-body').hidden = true;
      document.getElementById('media-unavailable').hidden = false;
    }
    OwnMedia.onChange(refresh);
    refresh();
  }

  return Object.freeze({ init: init, refresh: refresh });
})();
