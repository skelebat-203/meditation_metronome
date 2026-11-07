# Master Rules

Project-specific instructions for Meditation Metronome. Complements the global instruction set; does not override a direct user instruction about goal or outcome.

## General rulesets
General rules load globally from `~/.claude/rules/` and `~/.claude/skills/`.
This project is local-only (no network access), so it uses the LOCAL severity matrix:
- @~/.claude/rules-library/issue-severity-matrix_LOCAL.md

## Docs
- Roadmap (scope): `docs/design/0001-roadmap.md`
- Current work: `RESUME-HERE.md`
- Asset licenses: `ATTRIBUTION.md`

## Project rules
- Plain HTML, CSS and JavaScript; media in `assets/`. No framework, no build step, no CDN or remote resources.
- The app makes no network access of any kind. Do not add the Android INTERNET permission. (The git repo has a remote; push rules are in the global `version-control.md`.)
- Assets must be CC0, public domain, or CC BY, and listed in `ATTRIBUTION.md` before they are committed.

## Browser testing (agents)
- Headless Chromium via Playwright is a local dev-only dependency (`devDependencies` in the root `package.json`, pinned exact). It is never shipped in the app. Browsers live in `~/.var/app/com.vscodium.codium/cache/ms-playwright/`.
- Setup in a fresh checkout or worktree: `npm ci`, then `npx playwright install chromium` if the browser is missing.
- Load it in Node with `require("playwright")` from the project root and open `index.html` by `file://` URL. Keep test scripts in the session scratchpad, not the repo.
- This is for agent checks only. The user tests in the system Firefox and Chrome, which stays the authority for the `Verify:` lines.
