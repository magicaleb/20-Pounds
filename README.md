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
