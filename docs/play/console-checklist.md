# Play Console checklist: Meditation Metronome

Follow in order once Play Console access works. Text to paste is in [`console-text.md`](console-text.md). Ask Claude at any step.

## 1. Sign up

- [ ] Go to play.google.com/console/signup on the computer, signed in with the new Google account. No VPN, home Wi-Fi.
- [ ] Account type: **Yourself**.
- [ ] Fill in developer name, payments profile (legal name and address), contact details.
- [ ] Pay the $25 fee.
- [ ] Verify your identity (ID upload) and your Android phone (Play Console app).

## 2. Create the app

- [ ] **Create app**: name "Meditation Metronome", App, Free.
- [ ] Signing: choose **Use existing app signing key** (the F-Droid key). Claude helps with the PEPK export; save the encrypted file in LastPass.
- [ ] Upload key: register `upload.p12` (in LastPass and `.tools/signing/`).

## 3. Store listing and app content

- [ ] Store listing: paste the text, then upload the icon, feature graphic and 6 screenshots from `fastlane/metadata/android/en-US/images/`.
- [ ] Category: Health and Fitness. Tags: pick up to 5 under Store settings → Manage tags.
- [ ] App content: privacy policy, ads, app access, content rating, target audience (all ages), Data safety, and the rest. Answers are in `console-text.md` and `data-safety.md`.

## 4. Testers

- [ ] Create a tester **email list** called "Friends & family testers" (reuse it for future apps).
- [ ] Create a separate list for the paid testers.
- [ ] Recruit 15–20 testers, not just 12, since some drop out.

## 5. Closed test

- [ ] Create a closed testing track and add both tester lists.
- [ ] Upload the signed AAB (Claude rebuilds it if the versionCode needs to go up).
- [ ] Send for review. Once approved, send testers the opt-in link.
- [ ] Wait 14 days with at least 12 testers opted in the whole time. Write down the start date.

## 6. Production

- [ ] Apply for production access (answer the questions about the test).
- [ ] Once approved, create a production release and send it for review.
- [ ] Then: Claude runs the v1.1 security review.
