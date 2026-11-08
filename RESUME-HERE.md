# RESUME HERE

Roadmap: [`docs/design/0001-roadmap.md`](docs/design/0001-roadmap.md) · Behavior spec: [`docs/design/0002-app-behavior.md`](docs/design/0002-app-behavior.md)

## Current version
v0.4.2 — 10-second test option removed. Next: step 2 (release build), group B.

## v0.4 plan of action

Versions follow the global versioning rules (patch +1 per completed-work commit, `Plan-Step: v0.4/N` trailer). The final step bumps to v0.5.0. The main session coordinates subagents in worktrees off a `v0.4` integration branch; `main` gets it only after the user's end-of-version review. Human gates: blocking questions, anything outward-facing (the F-Droid submission), and the end-of-version review (store text and screenshots, a11y and security reports, plus any UI/UX changes the user notes). Security findings Low+ are fixed in the same version.

1. ✅ (v0.4.2) **Remove the 10-second test option** (v0.4/1) — from Session length and Marks.
   - Source: roadmap v0.4 item 2; `0002` § Session length and marks
   - Files: `js/constants.js`, `docs/design/0002-app-behavior.md`
   - Verify: neither picker offers 10 s; a saved 10 s setting falls back to the default
   - Deps: none
2. **Reproducible release build** (v0.4/2) — release build with no debug flags, deterministic output (two clean builds give identical unsigned APKs), versionName/versionCode from `package.json`; F-Droid build recipe drafted.
   - Source: roadmap v0.4 item 1
   - Files: `android/`, `scripts/`
   - Verify: two clean builds match byte-for-byte; no permissions; recipe builds from a clean checkout
   - Deps: 1
3. **Fastlane metadata** (v0.4/3) — title, short and full description, changelog, phone screenshots.
   - Source: roadmap v0.4 item 1
   - Files: `fastlane/metadata/android/en-US/`
   - Verify: F-Droid metadata layout; reading level grade 10 or lower; user reviews at version end
   - Deps: 1
4. **Submit to F-Droid** (v0.4/4) — outward-facing: prepared by the agent, submitted only after the user's go-ahead.
   - Source: roadmap v0.4 item 2
   - Deps: 2, 3, reviews
5. **Accessibility audit** (v0.4/5) — agent drafts; user reviews.
   - Report: `docs/audits/accessibility/accessibility-v0.4.md`
6. **Security review** (v0.4/6) — agent drafts; user reviews; bumps to v0.5.0 and `v0.4` merges to `main`.
   - Report: `docs/audits/security/security-v0.4.md`

### Execution
- Group A: steps 1, 2 (sequential)
- Group B: step 3 (after 1, so screenshots show the final pickers; parallel with 2)
- Reviews: steps 5, 6 drafted by agent; **pause for user review**; step 4 after approval
- Run mode: **grouped subagents**.
- Status: ⏳ A (1 ✅) · ☐ B · ☐ reviews · ☐ submit
