# Calorie Flow (Firebase + Firestore)

Mobile-first personal calorie tracker optimized for **very fast heuristic logging**.

## Logging model in this version

- Built-in food database of 20 common food groups
- One-question-at-a-time flow:
  1. Pick food group
  2. Pick serving size reference
- Saves immediately after size selection
- No custom text entry required for normal logging

## Features

- Firestore cloud save/load (auto-load on open)
- Today total + daily target progress
- Edit entry
- Delete + undo last delete
- Entry timestamps
- Light/dark mode
- PWA manifest + service worker

## Firebase setup

```bash
cp firebase-config.example.js firebase-config.js
```

Then fill values in `firebase-config.js` from Firebase console and deploy:

```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes
```
