# Calorie Flow (Firebase + Firestore)

Mobile-first personal calorie tracker focused on **low-friction heuristic logging**.

## What this version includes

- One-tap quick calorie estimates
- Smart heuristic estimator (type + portion + density)
- Daily total and target progress bar
- Firestore cloud save/load
- Entry history with timestamps
- Edit and delete entry flows
- Undo last delete
- Light/dark mode toggle
- PWA install support for iPhone/web

## Firebase setup

1. Copy config template:

```bash
cp firebase-config.example.js firebase-config.js
```

2. Fill in values inside `firebase-config.js` from Firebase console.
3. Ensure Firestore is enabled.
4. Deploy:

```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

## Local preview

You can use any static server (for UI only):

```bash
python -m http.server 8080
```

Then open <http://localhost:8080>.
