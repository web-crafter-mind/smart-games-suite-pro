# Smart Games Suite Pro Architecture

## Current Canonical Entry Points

- `index.html` is the live app entry point.
- `power-pack.js` owns achievements, XP, daily challenge, and hard-mode AI enhancements.
- `production-shell.js` owns Android-style profile, settings, theme, haptics, offline status, bottom navigation, and local data tools.
- `manifest.webmanifest` is the canonical web manifest. `manifest.json` is kept only as a compatibility copy for tools that expect that filename.
- `src/` is the modular target architecture. New game rules and services should be added there first and covered by tests before being wired into the UI.

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
