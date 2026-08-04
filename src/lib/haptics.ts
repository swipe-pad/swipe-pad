// Subtle haptic vocabulary for the swipe loop. No-op where the Vibration API
// is unavailable (iOS Safari) — feedback stays visual there.
export type HapticName = "tap" | "undo" | "block" | "credit"

const PATTERNS: Record<HapticName, number | number[]> = {
  tap: 10, // right-swipe commit
  undo: 5,
  block: [20, 60, 20], // zero-swipes / rollback
  credit: [10, 50, 10], // top-up verified
}

export function haptic(name: HapticName) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(PATTERNS[name])
    }
  } catch {
    // vibration is best-effort by design
  }
}
