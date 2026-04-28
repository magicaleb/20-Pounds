# 20 Pounds

Mobile-first personal calorie tracker built with plain HTML/CSS/JS and Firebase Firestore.

## Core behavior

- Fast heuristic logging optimized for consistency over precision.
- Smart presets for common real-life scenarios (takeout, fast combo, lean meal, etc.).
- Structured estimate model: meal moment + portion + calorie density + optional add-ons.
- No required text fields for add/edit flows.
- Auto-loads today’s entries, shows progress, supports edit/delete/undo.
- PWA-ready for iPhone home-screen style use.

## Firebase setup

1. Copy `firebase-config.example.js` to `firebase-config.js` and add your Firebase web config.
2. Ensure Firestore is enabled.
3. Deploy with Firebase Hosting.

## Run locally

Use a static server and ensure `firebase-config.js` exists in project root.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
