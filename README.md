# Calorie Flow

Mobile-first personal calorie tracker optimized for **very fast heuristic logging**.

## Logging model

- Built-in food database of 20 common foods organized into 6 categories
- Three-question flow:
  1. Pick meal category (Breakfast / Light meal / Rice & pasta / Mains / Drinks / Dessert)
  2. Pick food item (≤ 6 choices — no scrolling required)
  3. Pick serving size
- Saves immediately after size selection — no extra taps
- Data stored in browser localStorage (no account required)

## Features

- Thin progress bar showing calories consumed vs. daily target
- Adjustable daily calorie target (−/+ buttons)
- Today's log visible at a glance below the wizard
- Edit or delete any entry with undo support
- Entry timestamps
- Light/dark mode
- PWA manifest + service worker for offline use
