'use strict';

// Checks that js/credits.js matches ATTRIBUTION.md (the source of truth) and that every file
// in assets/ is listed. Dev-only; the app does not use this. Run: npm run check-credits
// Usage: node scripts/check-credits.js [projectRoot]

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const ATTRIBUTION_FILE = path.join(ROOT, 'ATTRIBUTION.md');
const CREDITS_FILE = path.join(ROOT, 'js', 'credits.js');
const ASSETS_DIR = path.join(ROOT, 'assets');

const errors = [];
const linkText = (cell) => cell.replace(/^\[(.*)\]\((.*)\)$/, '$1');
const linkUrl = (cell) => (cell.match(/^\[.*\]\((.*)\)$/) || [])[1];

// Parse ATTRIBUTION.md: "## Heading" sections with "| File | Title | Author | Source | License |" rows.
function parseAttribution() {
  const sections = [];
  for (const line of fs.readFileSync(ATTRIBUTION_FILE, 'utf8').split('\n')) {
    const heading = line.match(/^## (.+)$/);
    if (heading) { sections.push({ heading: heading[1].trim(), items: [] }); continue; }
    if (!line.startsWith('| `') || !sections.length) continue;
    const cells = line.split(' | ').map((c) => c.replace(/^\| |\s*\|$/g, '').trim());
    if (cells.length !== 5) { errors.push(`ATTRIBUTION.md: malformed row: ${line}`); continue; }
    const [file, title, author, source, license] = cells;
    sections[sections.length - 1].items.push({
      file: file.replace(/`/g, ''), title, author, source: linkUrl(source), license: linkText(license),
    });
  }
  return sections.filter((s) => s.items.length);
}

function loadCredits() {
  const context = {};
  vm.runInNewContext(`${fs.readFileSync(CREDITS_FILE, 'utf8')}\nthis.CREDITS = CREDITS;`, context);
  return context.CREDITS;
}

function listAssets(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? listAssets(full) : [path.relative(ROOT, full).split(path.sep).join('/')];
  });
}

const attribution = parseAttribution();
const credits = loadCredits();

if (attribution.map((s) => s.heading).join() !== credits.map((s) => s.heading).join()) {
  errors.push(`Section headings differ: ATTRIBUTION.md [${attribution.map((s) => s.heading)}] vs credits.js [${credits.map((s) => s.heading)}]`);
}

attribution.forEach((section, si) => {
  const items = (credits[si] && credits[si].items) || [];
  if (items.length !== section.items.length) {
    errors.push(`${section.heading}: ${section.items.length} entries in ATTRIBUTION.md, ${items.length} in credits.js`);
  }
  section.items.forEach((a, i) => {
    const c = items[i];
    const where = `${section.heading} #${i + 1} (${a.file})`;
    if (!c) return;
    for (const key of ['title', 'author', 'source']) {
      if (a[key] !== c[key]) errors.push(`${where}: ${key} differs\n    ATTRIBUTION.md: ${a[key]}\n    credits.js:     ${c[key]}`);
    }
    // credits.js may append a "(modified: ...)" note after the license name.
    if (c.license !== a.license && !c.license.startsWith(`${a.license} (`)) {
      errors.push(`${where}: license differs\n    ATTRIBUTION.md: ${a.license}\n    credits.js:     ${c.license}`);
    }
  });
});

const listed = new Set(attribution.flatMap((s) => s.items.map((a) => a.file)));
const onDisk = new Set(listAssets(ASSETS_DIR));
for (const f of onDisk) if (!listed.has(f)) errors.push(`${f}: in assets/ but not listed in ATTRIBUTION.md`);
for (const f of listed) if (!onDisk.has(f)) errors.push(`${f}: listed in ATTRIBUTION.md but missing from assets/`);

if (errors.length) {
  console.error(`Credits check FAILED (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Credits check passed: ${listed.size} assets, credits.js matches ATTRIBUTION.md.`);
