# Security review — v0.2

Roadmap: v0.2 item 8. Threat model: LOCAL (`issue-severity-matrix_LOCAL.md`). Domains: `security-domains.md` (OWASP ASVS 5.0.0 chapter names). Status: drafted by the agent, awaiting user review.

## Summary

### Executive summary
v0.2 added real media (10 Opus tracks, 20 WebP images), a credits screen, session length and marks, a visible music-error notice and a fading track preview. The review covered the v0.2 diff (`git diff main..HEAD`) and the whole app for injection sinks, network access, stored-settings handling, error clarity and asset licensing. The app is still offline-only with a strict CSP and no injection sinks. SEC-02 from v0.1 is resolved. One open finding: 11 credits entries show a cut-off source URL, which weakens the CC BY attribution the app must give.

### Summary table

| ID | Severity | CWE | Status | Issue |
| --- | --- | --- | --- | --- |
| 3.1 | Medium | CWE-1286 | Fixed (v0.2.9) | 11 of 30 credits entries show a source URL cut off at the first `)`, so the in-app attribution points to a missing Wikimedia page and does not fully credit CC BY assets. |
| 8.1 (SEC-02) | Low | CWE-755 | Fixed | Music playback failures were only logged to the console, so the user heard silence with no explanation; now a visible, announced message is shown and playback skips to the next track. |
| 7.1 | Info | — | Deferred — user decision: run `npm audit` in the last pre-1.0 subversion (v0.6) security review | Lighthouse 13.5.0 was added as a second dev-only dependency next to Playwright; neither is bundled in the app or loaded at runtime. |

## Domain 3 - Validation and Business Logic

| ID | Severity | CWE | Status | Finding |
|---|---|---|---|---|
| 3.1 | Medium | CWE-1286 | Fixed (v0.2.9) | `js/credits.js` source URLs were copied from `ATTRIBUTION.md` Markdown links and cut at the first `)`. Affected: Earth Prelude, Healing, Peaceful Desolation, Bois Raquet, Calm Bliss, Chugach misty morning, Lake Blanche, Marmaris Sunrise, Monte de Santa Tecla / Minho, Reflection Lake, Stonor Forest. Rated Medium (wrong output; license-compliance risk for the CC BY items). Fix: copy the full URLs from `ATTRIBUTION.md`; verify every `source` in `js/credits.js` equals the `ATTRIBUTION.md` link target. |

Passed: session length and mark interval from `localStorage` are whitelisted against the generated choice lists in `sanitize()`; out-of-list values fall back to defaults. The track index is session-only (not stored) and comes from a fixed `<select>`.

## Domain 4 - Web Frontend Security

Passed: no `innerHTML`, `eval`, `Function()`, inline scripts or styles in the diff; credits and the music-error notice use `textContent`; credits sources are plain text, not links, so the app opens nothing. CSP unchanged from v0.1 (`default-src 'self'`, `base-uri 'none'`, `form-action 'none'`); Playwright confirmed inline style injection is blocked.

## Domain 6 - Data Protection

Passed: stored settings gained `sessionLength`, `marks`, `markInterval`, `images`; all go through `sanitize()` (type check, whitelist). No data leaves the device; no `fetch`, XHR, WebSocket or remote URL loads.

## Domain 7 - Secure Coding and Architecture

| ID | Severity | CWE | Status | Finding |
|---|---|---|---|---|
| 7.1 | Info | — | Deferred to v0.6 (user) | `lighthouse` 13.5.0 added as a dev-only dependency, pinned exact. With `playwright` 1.64.1 it is the only dependency; neither ships. `npm audit` not run (needs network). |

## Domain 8 - Security Logging and Error Handling

| ID | Severity | CWE | Status | Finding |
|---|---|---|---|---|
| 8.1 (SEC-02, v0.1) | Low | CWE-755 | ✅ Resolved (v0.2.6) | A failed track shows a `role="alert"` message ("Could not play …. Skipping to the next track."); if every track fails, "Music could not be played." and music stops. Preview failures also show a message. Verified in Playwright with all `.opus` requests blocked. |

## Asset licenses

- 30 assets (10 tracks, 20 images), each listed in `ATTRIBUTION.md` with title, author, source and license; every file in `assets/` has a row.
- Licenses: CC0 (6), public domain (5), CC BY 2.0 (3), CC BY 3.0 / 3.0 US (12), CC BY 4.0 (4). No NC or ND licenses.
- CC BY modifications (re-encoded, faded, trimmed, resized, converted) are noted per asset.
- In-app credits: see 3.1.

## Secrets and artifacts

Passed: none committed; `.gitignore` covers `.env`, keystores, `node_modules/`, build output, APK/AAB and `.claude/worktrees/`.
