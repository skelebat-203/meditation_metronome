# Security review — v0.1

Roadmap: v0.1 item 7. Threat model: LOCAL (`issue-severity-matrix_LOCAL.md`). The app has no network access; the realistic hostile input is a corrupted or tampered `localStorage` entry.

## Scope

`index.html`, `css/style.css`, `js/*.js`, `assets/`, `package.json`, `.gitignore`, `ATTRIBUTION.md`.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| SEC-01 | Low | CSP allowed `data:` images (unused) and did not set `base-uri` or `form-action` (not covered by `default-src`). | ✅ fixed: dropped `data:`, added `base-uri 'none'; form-action 'none'`. Verified in Chromium: images load, no CSP violations. |
| SEC-02 | Low | Music playback failures (e.g. a missing or unplayable track) are only logged to the console; the user hears silence with no explanation. | Open — revisit in v0.2 when real media is wired in. |
| SEC-03 | Info | `frame-ancestors` cannot be set from a `<meta>` CSP. Not relevant: the Android shell loads only bundled files (`0002` § Platform). | No action. |
| SEC-04 | Info | `npm audit` not run (needs network). Only dependency is `playwright`, dev-only, pinned exact, never shipped. | No action. |

## Passed

- **No network access:** no `fetch`, XHR, WebSocket or remote URLs; CSP `default-src 'self'` blocks any that are added by mistake.
- **No injection sinks:** no `innerHTML`, `eval`, `Function()` or inline scripts/styles; all dynamic text uses `textContent`.
- **Stored settings:** `localStorage` is parsed in `try/catch` and passed through `sanitize()` — unknown keys dropped, types checked, tick sound whitelisted, volumes clamped. JSON cannot carry `NaN`, so a tampered entry falls back to defaults.
- **No data leaves the device:** settings stay in `localStorage`; no analytics.
- **Secrets and artifacts:** none committed; `.gitignore` covers `.env`, keystores, `node_modules/`, build output, APK/AAB.
- **Assets:** all CC0 and listed in `ATTRIBUTION.md`.
