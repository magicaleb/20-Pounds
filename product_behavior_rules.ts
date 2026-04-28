/**
 * Product interaction rules for v1 quick-entry calorie logging.
 *
 * This file is intentionally framework-agnostic so UI layers can import the
 * same behavior constants. Keep v1 minimal and fast.
 */

/**
 * Preset calorie quick-entry values (default ordering should be maintained in UI).
 *
 * Product rule: most entries should be completed with one tap by selecting one of
 * these values.
 */
export const DEFAULT_CALORIE_PRESETS = [50, 150, 300, 500, 800] as const;

/**
 * Fallback default when a custom calorie input is empty/invalid.
 *
 * Product rule: empty quick-custom value should not crash or block users;
 * fallback to a neutral midpoint estimate.
 */
export const DEFAULT_CUSTOM_CALORIES = 300;

/**
 * Undo behavior for destructive or state-changing actions.
 *
 * Product rule: save/edit/delete should provide a brief opportunity to undo.
 */
export const UNDO_TIMEOUT_MS = 5000;

/**
 * Quick custom-entry keyboard/auto-focus rules.
 *
 * - Auto-focus custom calorie input when custom mode opens.
 * - Enter submits when value is valid.
 * - Escape closes custom mode without saving.
 * - Mobile numeric keypad should be requested (inputMode="numeric").
 */
export const QUICK_CUSTOM_ENTRY_BEHAVIOR = {
  autoFocus: true,
  submitOnEnter: true,
  cancelOnEscape: true,
  numericInputMode: true,
} as const;

/**
 * Validation constraints for calorie values.
 *
 * Non-negative values prevent impossible logs.
 * Upper bound protects against accidental extra zeros.
 */
export const CALORIE_VALIDATION = {
  min: 0,
  max: 5000,
} as const;

/**
 * Fallback text for optional metadata fields.
 *
 * Product rule: empty note/type should degrade gracefully without blocking save.
 */
export const FALLBACK_TEXT = {
  note: "Quick log",
  type: "Meal",
} as const;

/**
 * UI copy guidance values for consistent, non-judgmental microcopy.
 */
export const UI_COPY = {
  saved: "Saved",
  updated: "Updated",
  deleted: "Deleted",
  restored: "Restored",
} as const;

/**
 * Extension points (do not implement in v1):
 *
 * - tags: string[] for flexible grouping/filtering
 * - weeklySummary: aggregate views and trend deltas
 * - confidence: optional certainty score for heuristic entries
 *
 * Keep these as comments/types until validated by real usage.
 */
export type FutureEntryExtensions = {
  // tags?: string[];
  // confidence?: 1 | 2 | 3;
};
