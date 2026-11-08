# RESUME HERE

Roadmap: [`docs/design/0001-roadmap.md`](docs/design/0001-roadmap.md) · Behavior spec: [`docs/design/0002-app-behavior.md`](docs/design/0002-app-behavior.md)

## Current version
v0.5.1 — background playback marked complete by user decision (testers: works on Android; GrapheneOS stops, tracked in 0004). Next: audit drafts.

## v0.5 plan of action

Versions follow the global versioning rules (patch +1 per completed-work commit, `Plan-Step: v0.5/N` trailer). The final step bumps to v0.6.0. The main session coordinates subagents in worktrees off a `v0.5` integration branch; `main` gets it only after the user's end-of-version review. Human gates: blocking questions and the end-of-version review. Security findings Low+ are fixed in the same version.

1. **Background playback** (v0.5/1) ✅ (v0.5.1, user decision) — keep the session playing with the screen off or the app in the background. Open: the user's testers report it already works on Android; the v0.3 GrapheneOS test recorded that it stops (`0002` § Screen). Confirm before marking complete or building a foreground service (which would need a JS-to-Android link the lockdown forbids, plus foreground-service and notification permissions).
2. **GrapheneOS test** (v0.5/2) ✅ (v0.5.1) — v0.3 device result stands: GrapheneOS stops the session (0004).
3. **Accessibility audit** (v0.5/3) — agent drafts; user reviews.
   - Report: `docs/audits/accessibility/accessibility-v0.5.md`
4. **Security review** (v0.5/4) — agent drafts; run `npm audit`; user reviews; bumps to v0.6.0 and `v0.5` merges to `main`.
   - Report: `docs/audits/security/security-v0.5.md`

### Execution
- Steps 1–2 depend on the user's answer; steps 3–4 drafted by agent, then **pause for user review**.
- Run mode: **grouped subagents**.
- Status: ✅ 1 · ✅ 2 · ☐ reviews
