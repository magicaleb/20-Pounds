# 20-Pounds

Web app to count calories heuristically.

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
3. Ensure your app signs in before making Firestore requests.

### 4) Register a web app and add client config

1. In Project settings, create/register a Web app.
2. Copy the Firebase SDK config object into a local `firebase-config.js` file used by your frontend.
3. If you do not want to commit credentials-like metadata, add `firebase-config.js` to `.gitignore`.

Example `firebase-config.js`:

```js
// Example only. Replace with your real project values.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

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
