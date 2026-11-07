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
