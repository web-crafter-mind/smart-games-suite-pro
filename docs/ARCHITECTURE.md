# Smart Games Suite Pro Architecture

## Current Canonical Entry Points

- `index.html` is the live app entry point.
- `power-pack.js` owns achievements, XP, daily challenge, and hard-mode AI enhancements.
- `production-shell.js` owns Android-style profile, settings, theme, haptics, offline status, bottom navigation, and local data tools.
- `manifest.webmanifest` is the canonical web manifest. `manifest.json` is kept only as a compatibility copy for tools that expect that filename.
- `src/` is the modular target architecture. New game rules and services should be added there first and covered by tests before being wired into the UI.
- `src/app-modules.mjs` exposes tested modules to the current inline UI shell through `window.SGSEngines` during the migration.

## Target Boundaries

```text
src/
  games/
    tic-tac-toe/
      engine.mjs  -> pure board rules
      ai.mjs      -> pure computer move selection
    word-guess/
      engine.mjs  -> pure word state transitions
  services/
    storage.mjs   -> defensive JSON storage helpers
  app-modules.mjs -> migration bridge for the current UI shell
tests/
  engine.test.mjs -> dependency-free self-checks for core rules
```

## Rules

- Game engines must not read or write the DOM.
- Game engines must not read or write `localStorage`.
- Services handle browser APIs and trust-boundary validation.
- UI files may call engines and services, but engines must stay portable and testable.
- Preserve current gameplay behavior while migrating one responsibility at a time.

## Migration Order

1. Keep the current UI working from `index.html`.
2. Extract pure logic into `src/`.
3. Add a small test before wiring extracted logic into the live UI.
4. Replace duplicated inline logic only after the equivalent module behavior is tested.
5. Remove old inline logic after the live UI uses the module.

## Current Migration Status

- Tic-Tac-Toe UI now delegates move validation, immutable board updates, winner detection, winning cells, and hard AI selection to the modular domain layer when `window.SGSEngines` is available.
- Word Guess user letter guesses now delegate word-state transitions to the modular domain layer when `window.SGSEngines` is available.
- The inline UI shell remains the renderer/controller during this transition.
- `npm run validate` and the GitHub Actions workflow run the release checks and engine self-checks.
