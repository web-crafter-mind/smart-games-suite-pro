# Play Store Checklist

Use this project as the web/PWA source, then package it into an Android app before uploading to Google Play.

## Already Prepared

- Polished responsive app shell for phones, tablets, desktop, and landscape screens.
- Offline-ready game bundle with restored `index.html` plus `power-pack.js`.
- Power Hub with achievements, XP, streak tracking, daily challenge, and stronger hard-mode Tic-Tac-Toe AI.
- Web app manifest with PNG and maskable launcher icons.
- Offline service worker cache.
- Starter privacy policy page.
- Local-only score/name storage with sanitized leaderboard output.
- Dependency-free validation script: `npm run validate`.
- Persisted music and sound-effect preferences.

## Before Upload

1. Confirm the developer contact in Play Console is real and visible on the store listing.
2. Run `npm run validate`.
3. Host the app on HTTPS if using Trusted Web Activity.
4. Package the project as an Android App Bundle (`.aab`) with Bubblewrap/TWA or Capacitor.
5. Configure the Android package name, version code, app signing, and target SDK in the generated Android project.
6. Add Digital Asset Links (`.well-known/assetlinks.json`) if using Trusted Web Activity.
7. Test on at least one phone, one tablet-sized viewport/device, and landscape mode.
8. Upload screenshots, 512x512 high-res icon, feature graphic, short description, full description, content rating, privacy policy URL, and Data safety answers in Play Console.

## Current Policy Links

- Target API requirement: https://developer.android.com/google/play/requirements/target-sdk
- Trusted Web Activity overview: https://developer.chrome.com/docs/android/trusted-web-activity/
- Bubblewrap quick start: https://developer.chrome.com/docs/android/trusted-web-activity/quick-start/
- Data safety form: https://support.google.com/googleplay/android-developer/answer/10787469
- Privacy policy policy: https://support.google.com/googleplay/android-developer/answer/16329168
