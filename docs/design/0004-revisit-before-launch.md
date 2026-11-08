# 0004 — Revisit Before Launch

App behavior that works but is questionable. Each item is reviewed before the v1.0 launch (roadmap § v1.0) and either fixed, accepted, or moved to the roadmap.

| # | Item | Current behavior | Source | Added |
|---|---|---|---|---|
| 1 | Mid-session settings lag | A settings change made during a session can take up to 1.5 s to apply, because beats are queued ahead. If Session length is shortened to a time already passed, the session ends on the next beat. | `0002` § Session length and marks; v0.2.11 | v0.2 |
| 2 | Chime volume | Mark and end chimes play at the metronome volume, even when the metronome is off. At metronome volume 0 the chimes are silent. | `0002` § Session length and marks; v0.2.2 | v0.2 |
| 3 | Start track vs. Persistent track | On load the start track is random. If the user picks a track and presses Persistent, should future sessions start with that track instead of a random one? | moved from `0002` § Open questions | v0.2 |
| 4 | versionCode overflow | versionCode is major*10000 + minor*100 + patch. It breaks (collides or goes out of order) if a patch number exceeds 99. | `android/app/build.gradle` | v0.4 |
| 5 | Background playback on GrapheneOS | On GrapheneOS (v0.3 device test) switching apps or turning the screen off stops the session. Testers report it works on other Android; no foreground service was built (v0.5, user decision). | `0002` § Screen; roadmap v0.5 | v0.5 |
