export type RightSwipeReconciliation =
  | { kind: "committed"; remaining: number }
  | { kind: "rolled_back"; creditsRestored: number }

export type RightSwipeHooks = {
  /** Credits the user had before this swipe (last server-acknowledged value). */
  creditsBeforeSwipe: number
  /** Server credit consumption. Resolves with the new remaining count, or null on rejection/network failure. */
  consumeCredit: () => Promise<number | null>
  /** Purely visual, runs immediately: tick the counter, advance the deck. */
  onOptimistic: (creditsShown: number) => void
  /** Server said no: restore the counter, put the card back. Nothing else was touched. */
  onRollback: (creditsRestored: number) => void
  /** Server said yes: now — and only now — mutate the cart, stats and history. */
  onCommitted: (remaining: number) => void
}

/**
 * Ordering contract for a paid right-swipe.
 *
 * The visual reaction is optimistic, but the cart is a *consequence* (it ends
 * up in checkout), so it waits for the credit to be accepted. That removes the
 * class of bug where a late server rejection restored a stale cart snapshot
 * over state that had legitimately changed in the meantime.
 */
export async function reconcileRightSwipe(hooks: RightSwipeHooks): Promise<RightSwipeReconciliation> {
  hooks.onOptimistic(hooks.creditsBeforeSwipe - 1)

  const remaining = await hooks.consumeCredit()

  if (remaining === null) {
    hooks.onRollback(hooks.creditsBeforeSwipe)
    return { kind: "rolled_back", creditsRestored: hooks.creditsBeforeSwipe }
  }

  hooks.onCommitted(remaining)
  return { kind: "committed", remaining }
}

// ---------------------------------------------------------------------------
// Undo: reverse the deltas one swipe produced, never restore a snapshot.
//
// A snapshot ("cart before the swipe") is only valid while nothing else has
// touched the same state. Checkout empties the cart, so restoring a snapshot
// after checkout re-populates items that were already donated. Every undo
// record below therefore describes *what the swipe changed*, and undoing it
// subtracts exactly that from whatever the state is now.
// ---------------------------------------------------------------------------

export type UndoStats = {
  totalDonations: number
  categoriesSupported: Set<string>
  streak: number
  lastDonation: Date | null
}

export type UndoProfile = { totalSwipes: number; totalDonated: number }

export type SwipeUndoRecord<TCartEntry = unknown> = {
  /** Local credits the swipe deducted (0 for free mode and left swipes). */
  creditsSpent: number
  /** The exact cart entry the swipe appended, if any. Matched by identity. */
  cartEntry: TCartEntry | null
  /** Stats the swipe advanced. `streak`/`lastDonation` are restored because only swipes move them. */
  stats: { totalDonations: number; categoryAdded: string | null; prevStreak: number; prevLastDonation: Date | null } | null
  /** Profile counters the swipe incremented. */
  profile: UndoProfile | null
}

export function cartAfterUndo<T>(cart: readonly T[], record: SwipeUndoRecord<T>): T[] {
  if (record.cartEntry === null) return [...cart]
  // Identity, not equality: two swipes on the same project are two entries,
  // and an entry that left the cart via checkout is simply not found.
  return cart.filter((entry) => entry !== record.cartEntry)
}

export function creditsAfterUndo(credits: number, record: SwipeUndoRecord): number {
  return credits + record.creditsSpent
}

export function statsAfterUndo<S extends UndoStats>(stats: S, record: SwipeUndoRecord): S {
  if (!record.stats) return stats
  const categoriesSupported = new Set(stats.categoriesSupported)
  if (record.stats.categoryAdded !== null) categoriesSupported.delete(record.stats.categoryAdded)
  return {
    ...stats,
    totalDonations: Math.max(0, stats.totalDonations - record.stats.totalDonations),
    categoriesSupported,
    streak: record.stats.prevStreak,
    lastDonation: record.stats.prevLastDonation,
  }
}

export function profileAfterUndo<P extends UndoProfile>(profile: P, record: SwipeUndoRecord): P {
  if (!record.profile) return profile
  return {
    ...profile,
    totalSwipes: Math.max(0, profile.totalSwipes - record.profile.totalSwipes),
    totalDonated: Math.max(0, profile.totalDonated - record.profile.totalDonated),
  }
}
