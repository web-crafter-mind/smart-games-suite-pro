# Smart Games Suite Pro

<<<<<<< HEAD
Responsive offline-first game suite with Tic-Tac-Toe and Word Guess modes, stronger hard-mode AI, daily challenges, achievements, XP/streak tracking, two-player play, timer mode, tournament mode, audio controls, session stats, and local leaderboards.

## Current Workspace Status

The playable game is restored in `index.html` from the backup at `E:\Downloads\smart-games-suite-pro\index.html`.

The original backup README is preserved as `README.original.md`.

## Run Locally

Open `index.html` directly in a browser for a quick test.

For service-worker and manifest testing, serve the folder from localhost:

```powershell
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Project Files

- `index.html` - restored playable game page with inline CSS and JavaScript
- `power-pack.js` - Power Hub, achievements, daily challenge, XP/streak tracking, and stronger hard-mode Tic-Tac-Toe AI
- `sw.js` - offline cache for the app shell and icon files
- `manifest.webmanifest` / `manifest.json` - installable PWA metadata
- `assets/icons/` - PNG launcher icons, including a maskable 512px icon
- `privacy-policy.html` - starter privacy page for publishing
- `PLAY_STORE_CHECKLIST.md` - packaging and Play Console checklist
- `play-store/` - Play Store listing, Data Safety, and TWA wrapping drafts
- `scripts/` - dependency-free local server and validation scripts

## Validate

```powershell
npm run validate
```

## Play Store Notes

Google Play does not upload this web folder directly. Package it as an Android App Bundle using Trusted Web Activity/Bubblewrap or Capacitor, then upload the `.aab` in Play Console.

Before publishing, make sure the developer contact in your Play Console account is real and visible on the public store listing.
=======
A single-file browser game suite with Tic-Tac-Toe and Word Guess modes, including AI play, two-player play, timer mode, tournament mode, audio controls, session stats, and leaderboards.

## Play

Open `index.html` in a browser, or deploy the folder to any static hosting service.

Good free hosting options:

- GitHub Pages
- Netlify
- Vercel

## Publish Checklist

- Test the game in Chrome, Edge, and one mobile browser.
- Use `Ctrl + F5` after uploading if the browser shows an old cached version.
- Keep `index.html`, `favicon.svg`, and this `README.md` together in the same folder.

## Controls

- Menus: arrow keys, Enter, mouse, or touch
- Tic-Tac-Toe: click cells, number keys 1-9, or arrow keys plus Enter
- Word Guess: keyboard A-Z or the on-screen letter buttons
- Hint: press `0` or use the hint button
- Help: press `F1`
- Menu/Pause: press `Esc`
>>>>>>> 46901752ed94fab7431df2f825c91e3494fedb58
