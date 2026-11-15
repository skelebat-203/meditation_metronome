# 0005 — Own Media

Design for roadmap v1.2 item 4: the user adds their own music and images. Status: **approved by the user 2026-11-15** (option A; third expander for tick sounds; image long side max 4096 px only; WebViewAssetLoader origin; chime and overlap behavior for custom ticks; short-sound text under Metronome sounds). Behavior baseline: [`0002`](0002-app-behavior.md). Layout style: [`0003`](0003-ui-design.md).

## Chosen design (option A)

### Entry point and screens
- Settings has a button **"Add media >"** at the bottom right, in line with **"Credits"**. It opens the **My media** screen (a new `<main id="screen-media">`, like the Credits screen; Android back works as for Credits).
- Uploaded media is added to the existing music **Track** dropdown and to the image choices on the main Settings screen. **No Source dropdown.**
- In the Track dropdown (and the image choice list), built-ins come first, then uploaded items under a non-selectable group heading **"Uploaded"** (`<optgroup label="Uploaded">` or equivalent; must stay accessible, check with a screen reader on both test devices).
- All lists are sorted alphabetically: the Uploaded group in the dropdown and the expander lists on My media.
- **Decided (user, 2026-11-15): custom metronome (tick) sounds live inside Add media**, same UI as Music and Images: a third expander **"Metronome sounds"**, an **"Add metronome sounds"** button, an alphabetical list, per-item Remove. The category is the user's choice by which Add button they use, so **no content detection** (no duration heuristic). Own store `kind: "tick"`, own `<input type="file" accept="audio/*" multiple>`, same decode check and failure handling as Music.
- **Tick sound control on Settings** (today radio buttons, each with a preview ▶ button). Uploaded tick sounds appear below a non-selectable **"Uploaded"** heading, after the built-ins. Options for the control:

  | Option | Notes |
  |---|---|
  | A. Keep the radio list; add an "Uploaded" `<fieldset>`/group heading with its own radios, each with a ▶ preview | Same pattern as today, keeps one-tap preview per item. The list grows with uploads (long for many). |
  | B. Replace with a dropdown with an "Uploaded" `<optgroup>` | Compact at any count, matches Track. Loses the inline ▶ preview per choice; needs one separate Preview button for the selected sound. |

  **Decided: A** while uploads are few (keeps the approved preview behavior and no control type change); switch to B only if on-device testing shows the list is too long. Heading must be a real group label for screen readers (check TalkBack).
- Images have no choice control today (Images is an on/off toggle); uploaded images join the slideshow pool, so the Settings screen gets no image list.
- Settings gets no other new controls. Settings keeps its Persistent / This session model; add/remove on My media is immediate and says so.

### My media screen
```
┌──────────────────────────────────────┐
│ [← Back]                  My media   │
│                                      │
│  Stays on this device.               │
│  Used 48 MB                          │
│                                      │
│  [ Music  v ]   (expander, aria-expanded, aria-controls)
│    • Bowl.mp3        4.1 MB [Remove] │
│    • Rain.ogg        9.8 MB [Remove] │
│    [ + Add music ]                   │
│                                      │
│  [ Images v ]   (expander)           │
│    • lake.jpg        3.2 MB [Remove] │
│  Images where the long side is less  │
│  than 1280px may not fill the screen │
│    [ + Add images ]                  │
│                                      │
│  [ Metronome sounds v ]  (expander)  │
│    • Click.wav       0.1 MB [Remove] │
│  Sounds longer than the metronome    │
│  will be shortened.                  │
│    [ + Add metronome sounds ]        │
└──────────────────────────────────────┘
```
- The headings **"Music"**, **"Images"** and **"Metronome sounds"** are expander buttons with `aria-expanded` and `aria-controls` pointing at their lists. Each list is a real `<ul>`.
- Between the Images expander and the **Add images** button: the text "Images where the long side is less than `{MIN_IMAGE_LONG_SIDE}`px may not fill the screen" (`MIN_IMAGE_LONG_SIDE` = 1280, named constant; the text is built from it). It is tied to the Add images button with `aria-describedby`. Images under 1280 px are accepted with no other comment.
- Between the Metronome sounds expander (its list) and the **Add metronome sounds** button: the text "Sounds longer than the metronome will be shortened." It is tied to the Add metronome sounds button with `aria-describedby` (same pattern as the image hint).
- No "see Credits" text. Users add no credits. Own files are never listed in `ATTRIBUTION.md` or `CREDITS` (`npm run check-credits` unchanged), and the Credits screen gets no "Your own files" block.
- Uploaded items keep their uploaded file name minus the extension. **No renaming.**
- Per-item **Remove** with a two-step inline confirm ("Remove {name}? [Remove] [Keep]"; focus moves to Keep), no dialogs. **Remove all** per kind, same two-step confirm. Remove buttons carry the item name in their accessible label.
- If a saved track/image choice pointed at a removed item, it reverts to Random / default.
- Removal during a session (via Session settings): the item is dropped from the next pass; the current one finishes, then it is revoked.

### Picking files
- Standard `<input type="file" multiple accept="...">`, one for music (`audio/*`), one for images (`image/*`), triggered by the Add buttons. Works unchanged on desktop file:// and in browsers.
- **File chooser on Android** (from the user's research pass; items marked [verify] need on-device testing). `MainActivity` has no `WebChromeClient` today, so a file input does nothing in the WebView.
  - **Picking** (`MainActivity.java`, `WebChromeClient.onShowFileChooser`): hand-built `Intent.ACTION_OPEN_DOCUMENT` + `CATEGORY_OPENABLE`, not `FileChooserParams.createIntent()` (that uses `ACTION_GET_CONTENT`). No storage permission, no INTERNET, no `READ_MEDIA_*`, no photo picker. No `addJavascriptInterface`, no new exported components, no FileProvider.
  - **Copy once** into IndexedDB; never reference the original again. Do not call `takePersistableUriPermission` or set `FLAG_GRANT_PERSISTABLE_URI_PERMISSION`. Keep `setAllowFileAccess(false)` and `setAllowContentAccess(false)`; the page only receives `File` objects, never paths.
  - **Callback rules:** call the `ValueCallback` exactly once (`null` on cancel or error). Cancel any pending callback (`null`) before starting a new picker and on activity destroy. Return `true` when handling.
  - **Intent from `fileChooserParams`:** `MODE_OPEN_MULTIPLE` -> `EXTRA_ALLOW_MULTIPLE`. Map `getAcceptTypes()` to MIME types (may be empty, partial like `audio/*`, or extensions like `.mp3`): a single type -> `setType`; several or none -> `setType("*/*")` + `EXTRA_MIME_TYPES`. Set `EXTRA_LOCAL_ONLY=true` so cloud providers are not offered (a recommendation, not documented guidance) [verify].
  - **Errors:** catch `ActivityNotFoundException` -> callback `null`; the web layer shows a notice (see Failure handling).
  - **Result is untrusted:** parse with `FileChooserParams.parseResult`, keep only `content://` URIs, drop `file://` and others, pass `null` if empty. Do not log URIs or names.
  - **API:** `startActivityForResult` (deprecated but works in a plain Activity; `registerForActivityResult` would need AndroidX Activity) with a named request-code constant.
  - **Docs:** document the native code in `0002` § Platform as planned (it is not a JavaScript-to-Android bridge, so the lockdown holds).
  - **Web side:** file names and MIME types can lie. The name is a display title only, set via `textContent`; ids are `own:{uuid}`; never build paths from names. Do not trust provider size: use `File.size` and the decode check. Keep the decode timeout, image dimension checks and `QuotaExceededError` handling. `CATEGORY_OPENABLE` keeps virtual files unselectable (intended).
  - **Decided (user, 2026-11-15): WebView origin.** The WebView switches from `file:///android_asset/` to `androidx.webkit` `WebViewAssetLoader` (`https://appassets.androidplatform.net/`), as part of v1.2 step 4. Desktop browsers still open `index.html` via `file://` and must keep working.
    - **Reasons:** no users yet, so the settings loss from the origin change is moot (only the few v1.0.0 GitHub-release testers may lose saved settings once); a proper origin for IndexedDB; CSP `'self'` becomes meaningful; Android-recommended; the file-access settings stay off (`setAllowFileAccess(false)`, `setAllowContentAccess(false)`).
    - **Costs and tasks:**
      - One new AndroidX dependency: `androidx.webkit` from `google()` Maven only. Pin an exact version published at least 14 days ago (check dates). Check it adds no permissions or Play services.
      - Re-verify two clean `assembleRelease` builds are byte-identical, and that there is still no INTERNET permission.
      - The interceptor serves only the bundled assets (no real network).
      - CSP review.
      - When implemented, update the `0002` Platform section and the roadmap/F-Droid notes.
      - On-device checks: app loads, settings persist across restarts, IndexedDB persists.
  - **Sources:** developer.android.com (WebView unsafe file inclusion, `WebChromeClient.FileChooserParams`, documents-files, content-resolver risks); Microsoft Dirty Stream (2024-05-01); CERT DRD08-J.

### Storage
| Option | Verdict |
|---|---|
| **IndexedDB** (Blob values) | **Chosen.** Holds binary Blobs, large quota, same storage area as localStorage that the app already uses (`setDomStorageEnabled(true)`), no new permission. |
| localStorage | No. ~5 MB limit, strings only. |
| Cache API / OPFS | No. Weaker WebView support on Android 5-9. |
| Android app files dir via native code | No. Needs a bridge or a request interceptor; more code, more attack surface. |

- Database `meditation-metronome-media`, object store `media` with `{id, kind: "music"|"image", name, type, size, added, blob}`. `id` is a generated string like `own:{uuid}`; it is the stable saved id (like a track path today). `name` is the file name minus extension.
- Playback: `URL.createObjectURL(blob)` for `<audio>` and `<img>`; revoke when no longer used. **CSP must change** to add `blob:` to `img-src` and `media-src` only (still no network). Audit at the security review.
- Caveats: IndexedDB works from `file://` in Chrome and Firefox desktop; Firefox keys file:// storage per file path, so moving the app folder loses the library. In the WebView the origin becomes `https://appassets.androidplatform.net/` (see Picking files, WebView origin); verify on device that IndexedDB persists across restarts. Data is cleared by "Clear storage"/uninstall; expected.
- Request `navigator.storage.persist()` once after the first add (ignore refusal). Use `navigator.storage.estimate()` where present to show used space and to refuse an add that clearly would not fit. Android 5-7 WebViews may lack these: feature-detect, and always catch `QuotaExceededError`.

### Formats
- **Music:** whatever the browser/WebView decodes (MP3, M4A/AAC, OGG, Opus, WAV, FLAC). Validation is a real decode check: load into an `Audio` element, wait for `loadedmetadata` (10 s timeout); reject on `error`.
- **Images:** whatever decodes (JPEG, PNG, WebP; AVIF/GIF if supported). Validation: `Image.decode()` succeeds. No minimum size (see hint text above). Maximum: long side over `OWN_MEDIA.MAX_IMAGE_LONG_SIDE_PX` (4096) is rejected (see § Limits). Images are not re-encoded in v1.2; drawn with `object-fit: cover` as today.
- No tag reading.

### Limits
Facts table (rationale for the decision below). Limits are **not a security control**: the app is local-only and the files are the user's own. They only guard real device constraints. Confidence: H = well established, M = depends on device/WebView version, L = unverified guess. [verify] = test on device before relying on it.
| # | Constraint | Without a limit | Rough numbers | Confidence | Verify |
|---|---|---|---|---|---|
| a | IndexedDB quota in Android WebView | Adds fail with `QuotaExceededError`; under storage pressure the browser may evict the whole origin's data unless `navigator.storage.persist()` is granted | Quota is a fraction of free disk (Chromium: order of tens of percent of free space); exact WebView figure unverified. Android 5-7 WebViews may lack `estimate()`/`persist()` | M (fraction), L (exact numbers) | [verify] quota via `estimate()`, whether `persist()` is granted, eviction behavior |
| b | Image decode memory | An image decodes to about width x height x 4 bytes: 4000x3000 (12 MP) = 48 MB; 8000x6000 (48 MP) = about 190 MB. The slideshow holds two decoded images during the cross-fade, so about 380 MB at 48 MP. Can crash or stall a WebView on low-memory phones | Phone cameras commonly give 12-50 MP | H (formula), M (crash threshold) | [verify] a 48 MP photo on a low-memory phone |
| c | Music size | Audio from a blob streams, so file size barely affects memory. Import time grows with size | A 100 MB file copies in seconds to tens of seconds on flash storage | M | [verify] import time of a large file |
| d | List usability | Hundreds of items are slow to scan with a screen reader or small screen (alphabetical sort and expanders help) | Practical comfort roughly under 100 per list | L | [verify] with TalkBack |
| e | Copy time and temporary memory | Reading a whole file into a JS array (`arrayBuffer()`) needs memory equal to the file size and can fail on large files | Avoid: store the `File` itself. A `File` from the chooser is already a Blob; `store.put({..., blob: file})` lets the browser copy it without a JS array. Never call `arrayBuffer()` or `FileReader` on it | M | [verify] a large file imports without out-of-memory |

**Decided (user, 2026-11-15): an image size limit only.**
- **Image limit:** reject an image whose long side exceeds `OWN_MEDIA.MAX_IMAGE_LONG_SIDE_PX` = **4096** (named constant; value lives only there). Reject, not downscale: the original stays untouched and there is no re-encode code. Checked after `Image.decode()`, using the decoded width and height. The rejection notice is shown inside `<main>`, names the file and states the limit, e.g. "{name} is too large: the long side is over 4096px." It is listed in the add summary (see Failure handling).
- The **hint** "Images where the long side is less than 1280px may not fill the screen" (`MIN_IMAGE_LONG_SIDE`) is separate and stays unchanged.
- **No other caps:** no item-count cap, no per-file size cap, no music cap.
- **Storage full** (`QuotaExceededError`) and **decode failures** are handled with notices (see Failure handling).
- **Used line:** the My media screen shows an informational "Used {X} MB" line, from `navigator.storage.estimate()` or the sum of stored `size` values when `estimate()` is absent. It is not a limit.
- Rejected alternatives: no caps at all (a huge photo can stall or crash the slideshow, row b); downscaling (quality loss, extra code and memory); count and total-size caps (guessed numbers, do not address row b, can block a user with plenty of space).
- Still to do on device: test a 4096 px image on a low-memory phone against row b [verify].

### Playlist and slideshow
- Uploaded items join the same shuffled pass as built-ins (`shuffledIndices` over built-ins + uploaded), reshuffled after each full pass. A specific Track chosen in the dropdown plays as it does today. Nothing else about the cycle changes.
- Saved track id for an uploaded track is its `own:` id; a missing id is ignored (random start), as for unknown paths today.
- Per-item on/off is not in v1.2 (remove instead).
- Music and image code today read frozen `APP.MUSIC.TRACKS` / `APP.IMAGES.SOURCES`. Build the active list from built-ins + loaded uploaded items (`{title, src}`, `src` a blob URL); changes take effect at the next session start (or immediately when idle on the launch screen).
- Playback failure of an uploaded track reuses the existing skip + notice logic.

### Failure handling
All messages use the existing notice (`role="alert"`, inside the visible `<main>`, 30 s, close button). Adding several files: process each; one summary notice, e.g. "Added 3. Could not add 2: {name} (unsupported format), {name} (already added)."
| Case | Behavior |
|---|---|
| Unsupported / not decodable / corrupt | Reject that file, name it in the summary. |
| Image long side over `OWN_MEDIA.MAX_IMAGE_LONG_SIDE_PX` (4096) | Reject that file; notice names the file and the limit (e.g. "{name} (over 4096px)"). |
| Duplicate (same name+size) | Skip, name it. |
| Storage full (`QuotaExceededError`) | Stop, keep what already fit, "Not enough storage. Remove some of your files and try again." |
| IndexedDB unavailable (private mode, blocked) | Hide the add controls and show "Your own files cannot be saved on this device." in `<main>`; app works with built-ins. |
| Record unreadable at load | Skip it; remove it from the library; one notice. |
| File picker cancelled | No message. |
| No picker app available (`ActivityNotFoundException`) | Callback `null`; notice "No file picker is available on this device." |
Adding shows "Adding {n} files..." in the polite `#status` region.

### Privacy
Files are copied into the app's own browser storage; never uploaded (no network, no INTERNET permission); not readable by other apps. `android:allowBackup="false"` keeps them out of cloud backup. The My media screen says "Stays on this device." The user is responsible for rights to their own files; no extra text needed since the user adds no credits.

### Accessibility
- Add controls are `<button>`s triggering the file input; Images' button has `aria-describedby` for the size hint. Focus returns to the Add button after the picker closes.
- Expanders: `aria-expanded` + `aria-controls`. Lists are `<ul>`. Results via the alert notice. Buttons at least as large as `.btn`; works with text zoom; no drag-and-drop; no color-only state; all UI inside `<main>`.
- Uploaded images have `alt=""` (decorative), as built-ins.
- `<optgroup>` support with TalkBack to be checked on device.

### Android manifest
No permission change (no `READ_MEDIA_*`, `READ_EXTERNAL_STORAGE`, INTERNET). Only `MainActivity.java` changes if the WebChromeClient route is chosen. Verify with `aapt dump permissions` (no new permissions) [verify]. No new data-safety item.

### Testing
User-run on a standard Android device and on a GrapheneOS device. All [verify]:
- `setAllowContentAccess(false)` does not break file-input results.
- IndexedDB persists across restarts in the `file:///android_asset` WebView.
- The picker opens with no permission; multi-select works; cancel leaves later picks working; cloud providers are absent.
- `aapt dump permissions` shows no new permissions.
- CSP change is limited to `blob:` in `img-src`/`media-src`, audited at the security review.
- `<optgroup>` and expanders with TalkBack; storage-full and decode-failure notices.

## Alternatives considered
- **Option B — inline in Settings** inside the Music and Display groups. Rejected: Settings gets long, landscape two-column layout crowds, and immediate add/remove clashes with the Persistent / This session / Back-discards model.
- **Option C — add from the launch screen, manage in Settings.** Rejected: clutters the approved calm launch screen, two entry points, no room for results.
- **Source dropdown** (Built-in and mine / Mine only / Built-in only) per kind. Dropped in favor of the Uploaded group in the existing dropdowns.

## Open questions
1. **Limits:** **decided** (image long side max 4096 px, no other caps; see § Limits).
2. **File chooser:** research folded in (see § Picking files). WebView origin decided (`WebViewAssetLoader`, see Picking files).
3. **Custom metronome (tick) sounds:** placement **decided** (third expander in Add media, no content detection; see § Entry point and screens). Chime and overlap behavior **decided (user, 2026-11-15):**
   - **Chime (a):** a mark or end chime for a custom sample is the whole sample played with `AudioBufferSourceNode.playbackRate` lowered (`OWN_MEDIA.CHIME_RATE` 0.8 for a mark; times the end chime's 0.75 pitch for the end chime), so it is lower and rings longer. Not cut at 1 s; short fade at the end.
   - **Overlap (i):** the sample is decoded to an `AudioBuffer` once; a tick plays at most `MAX_TICK_SECONDS` = 1 s, with a short fade-out. Chimes are not cut at 1 s.
   - The short-sound text on My media (above) tells the user.
4. Extra native code (`WebChromeClient`) and the CSP addition of `blob:` for `img-src`/`media-src`: **accepted (user, 2026-11-15).**
