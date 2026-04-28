# 20-Pounds

Web app to count calories heuristically.

## Product behavior

### Heuristic quick-entry philosophy

This product is intentionally designed for **rough estimates** rather than exact calorie accounting. The goal is to make logging frictionless so users can build a consistent habit over time.

- Prefer fast, imperfect logging over delayed, perfect logging.
- Encourage consistency and trend awareness, not precision anxiety.
- Keep common logging flows at or below two taps whenever possible.

### Preset calorie bands and intended usage

Preset bands are optimized for common portions and snack/meal sizes:

- **50 kcal**: tiny additions (condiments, small bites, drinks without additives)
- **150 kcal**: light snack or small portion
- **300 kcal**: medium snack / small meal component
- **500 kcal**: standard meal estimate
- **800 kcal**: large meal / takeout / dessert-heavy entry

Intended usage:

- Use presets for most entries.
- Use custom entry only when a preset is clearly too far off.
- Favor nearest-band selection when unsure.

### Tap-count targets for primary actions

Primary interactions should be optimized around speed:

- Log with preset: **1 tap** (tap preset saves immediately)
- Log with quick custom calories: **<= 2 taps** (focus + submit)
- Undo a save/delete: **1 tap** from transient confirmation
- Edit recent entry: **<= 2 taps** from list item action

If a flow exceeds these targets, treat it as a v1 UX regression.

## UI copy guidelines

Use language that is neutral, supportive, and action-oriented.

- **Non-judgmental wording**: avoid terms like "bad," "cheat," or moral framing.
- **Fast confirmation feedback**: show immediate success toasts/snackbars after save, edit, delete, and undo.
- Keep confirmations short and clear (e.g., "Saved", "Deleted", "Restored", "Updated").

## v1 scope and extension intent

v1 should stay intentionally lean and focused on fast logging. Future features (tags, weekly summaries, richer analytics) should be enabled through extension points without complicating default flows.

See `product_behavior_rules.ts` for implementation constants, validation constraints, and forward-compatible comments.

## Firebase setup

### 1) Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. In this repo, set your project ID in `.firebaserc`:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 2) Enable Firestore

1. In Firebase Console, open **Build → Firestore Database**.
2. Click **Create database**.
3. Choose production mode (recommended), then deploy the included rules from this repo.

### 3) (Optional but recommended) Enable Authentication

For a personal app, Authentication is strongly recommended so Firestore rules can safely identify your user.

1. Open **Build → Authentication**.
2. Enable at least one sign-in provider (for personal use, Email/Password or Google are common).
3. Ensure your app initializes auth before making Firestore requests.

### 4) Register a web app and add client config

1. In Project settings, create/register a Web app.
2. Copy the Firebase SDK config object into a local `firebase-config.js` file used by your frontend.
3. If you do not want to commit credentials-like metadata, add `firebase-config.js` to `.gitignore`.

See `firebase-config.example.js` for the expected config shape — copy it to `firebase-config.js` and fill in your project values.

## Firestore security model

This repo uses authenticated per-user paths:

- Data lives under `/users/{uid}/...`
- Rules allow reads/writes only when `request.auth.uid == {uid}`
- Everything outside `/users/{uid}` is denied

### If you run without Authentication

Running Firestore without auth is risky: anyone who discovers your project can potentially read/write data if rules are broad.

Minimum safer strategy if no auth is used:

- Keep a narrow, non-obvious single-user path (for example `/privateAppData/<hard-to-guess-id>`)
- Deny all other paths
- Understand this is **not strong security** (path secrecy can leak)

Use Authentication whenever possible.

## Firestore data model

Recommended structure for this app:

- `users/{uid}` (document)
  - profile/basic metadata (optional)
- `users/{uid}/entries/{entryId}` (subcollection)
  - calorie and meal entries
- `users/{uid}/settings/app` (document)
  - user-specific app preferences

### Field types

`entries` document fields:

- `entryDate`: string (`YYYY-MM-DD`) or Firestore `Timestamp` (pick one convention)
- `createdAt`: Firestore `Timestamp` (server timestamp recommended)
- `mealType`: string (e.g. `breakfast`, `lunch`, `dinner`, `snack`)
- `description`: string
- `estimatedCalories`: number
- `notes`: string (optional)

`settings/app` document fields:

- `dailyCalorieGoal`: number
- `weightUnit`: string (`lb` or `kg`)
- `timezone`: string (IANA timezone, e.g. `America/New_York`)
- `updatedAt`: Firestore `Timestamp`

### Example JSON documents

Example entry (`users/UID/entries/ENTRY_ID`):

```json
{
  "entryDate": "2026-04-27",
  "createdAt": "<Firestore Timestamp>",
  "mealType": "lunch",
  "description": "Chicken salad bowl",
  "estimatedCalories": 540,
  "notes": "Dressing on side"
}
```

Example settings (`users/UID/settings/app`):

```json
{
  "dailyCalorieGoal": 1800,
  "weightUnit": "lb",
  "timezone": "America/New_York",
  "updatedAt": "<Firestore Timestamp>"
}
```

## Deployment

### Install and authenticate Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Initialize Firebase in this repo

```bash
firebase init hosting firestore
```

When prompted:

- Use existing project and select your Firebase project
- Hosting public directory: `public`
- Configure as single-page app: `Yes`
- Use existing `firestore.rules` and `firestore.indexes.json`

### Deploy Hosting + Firestore rules/indexes

```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

## Local development

### Option A: Firebase emulators (recommended)

```bash
firebase emulators:start
```

This runs local emulators for configured products. Add Firestore and Hosting emulators during `firebase init emulators` if needed.

### Option B: Static preview only

If your app is static and does not require Firestore locally, you can serve `/public` with any static server.

Example:

```bash
npx serve public
```

## Troubleshooting

- **`Missing or insufficient permissions`**
  - Usually means auth is not initialized, user is signed out, or writes are outside `/users/{uid}`.
- **`Firebase: No Firebase App '[DEFAULT]' has been created`**
  - Ensure your app initializes Firebase exactly once and imports `firebase-config.js` correctly.
- **Deploy fails due to project mismatch**
  - Check `.firebaserc` default project ID and verify with `firebase use`.
- **Query requires an index**
  - Deploy `firestore.indexes.json` and verify your query matches indexed fields/order.
- **Blank page on deep links after deploy**
  - Confirm `firebase.json` Hosting rewrite sends `**` to `/index.html` for SPA routing.
