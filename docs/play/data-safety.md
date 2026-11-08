# Play Data safety form (draft)

Draft answers for the Play Console Data safety form. The app is local-only: no INTERNET permission, no permissions at all, no SDKs. Saved settings stay on the device (WebView localStorage). Check each question against the live form when filling it in; wording in the Console may differ.

Privacy policy URL (once GitHub Pages is on): `https://skelebat-203.github.io/meditation_metronome/privacy/` (source: `docs/privacy/index.html`; assumes Pages serves from the `docs/` folder on `main`).

## Data collection and security

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | No |
| Is all of the user data collected by your app encrypted in transit? | Not shown when the answer above is No (no data leaves the device) |
| Do you provide a way for users to request that their data is deleted? | Not shown when the answer above is No. Settings can be removed by clearing app storage or uninstalling. |

Why "No": Google's definition of "collect" is data sent off the device. Data that stays on the device only is not collected. The app has no network access, so nothing can leave the device.

## Data types

None collected, none shared. Every category (location, personal info, financial info, health and fitness, messages, photos and videos, audio, files and docs, calendar, contacts, app activity, web browsing, app info and performance, device or other IDs) is: not collected, not shared.

## Security practices

| Item | Answer |
|---|---|
| Data encrypted in transit | Not applicable (no data sent) |
| Data deletion request | Not applicable (no data collected) |
| Independent security review | No |
| Committed to Play Families Policy | Only if the app is put in the Families program (not planned) |

## Related Console forms (not Data safety, but asked nearby)

| Form | Draft answer |
|---|---|
| Ads | No ads |
| App access | All features available without login |
| Content rating | Fill in the questionnaire; expect the lowest rating (no violence, no user content, no sharing) |
| Target audience | User decision (suggest 13+ to stay out of the Families rules) |
| Government app / financial / health | No |
