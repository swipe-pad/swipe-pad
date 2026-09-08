import { describe, expect, test } from "bun:test"

import {
  cartAfterUndo,
  creditsAfterUndo,
  profileAfterUndo,
  reconcileRightSwipe,
  statsAfterUndo,
  type SwipeUndoRecord,
} from "@/components/swipe/right-swipe-reconciliation"

type Deferred<T> = { promise: Promise<T>; resolve: (value: T) => void }

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe("reconcileRightSwipe", () => {
  test("ticks the counter immediately but only mutates the cart after the server accepts", async () => {
    const log: string[] = []
    const credit = deferred<number | null>()

    const run = reconcileRightSwipe({
      creditsBeforeSwipe: 10,
      consumeCredit: () => {
        log.push("consume:start")
        return credit.promise
      },
      onOptimistic: (shown) => log.push(`optimistic:${shown}`),
      onRollback: (restored) => log.push(`rollback:${restored}`),
      onCommitted: (remaining) => log.push(`commit:${remaining}`),
    })

    // Nothing consequential has happened while the request is in flight.
    await Promise.resolve()
    expect(log).toEqual(["optimistic:9", "consume:start"])

    credit.resolve(9)
    const result = await run

    expect(result).toEqual({ kind: "committed", remaining: 9 })
    expect(log).toEqual(["optimistic:9", "consume:start", "commit:9"])
  })

  test("uses the server's remaining count, not the optimistic guess", async () => {
    const committed: number[] = []

    await reconcileRightSwipe({
      creditsBeforeSwipe: 10,
      consumeCredit: async () => 4, // e.g. another device spent credits meanwhile
      onOptimistic: () => {},
      onRollback: () => {},
      onCommitted: (remaining) => committed.push(remaining),
    })

    expect(committed).toEqual([4])
  })

  test("a rejected credit restores the pre-swipe counter and never touches the cart", async () => {
    const log: string[] = []

    const result = await reconcileRightSwipe({
      creditsBeforeSwipe: 1,
      consumeCredit: async () => null,
      onOptimistic: (shown) => log.push(`optimistic:${shown}`),
      onRollback: (restored) => log.push(`rollback:${restored}`),
      onCommitted: () => log.push("commit"),
    })

    expect(result).toEqual({ kind: "rolled_back", creditsRestored: 1 })
    expect(log).toEqual(["optimistic:0", "rollback:1"])
    expect(log).not.toContain("commit")
  })

  test("a rejection never touches the cart, even if it changed while in flight", async () => {
    const onCommitted = () => {
      throw new Error("must not commit a rejected credit")
    }
    const credit = deferred<number | null>()

    const run = reconcileRightSwipe({
      creditsBeforeSwipe: 5,
      consumeCredit: () => credit.promise,
      onOptimistic: () => {},
      onRollback: () => {},
      onCommitted,
    })

    credit.resolve(null)
    await expect(run).resolves.toEqual({ kind: "rolled_back", creditsRestored: 5 })
  })

  test("a late acceptance appends to the current cart instead of a snapshot", async () => {
    let cart: string[] = ["a"]
    const credit = deferred<number | null>()

    const run = reconcileRightSwipe({
      creditsBeforeSwipe: 5,
      consumeCredit: () => credit.promise,
      onOptimistic: () => {},
      onRollback: () => {},
      onCommitted: () => {
        cart = [...cart, "new"]
      },
    })

    cart = [] // cleared by checkout mid-flight
    credit.resolve(4)
    await run

    expect(cart).toEqual(["new"])
  })
})

type Entry = { project: { projectId: string }; amount: number; currency: string }

function entry(projectId: string, amount = 0.01): Entry {
  return { project: { projectId }, amount, currency: "cUSD" }
}

function paidSwipe(cartEntry: Entry, opts: { categoryAdded?: string | null; prevStreak?: number } = {}): SwipeUndoRecord<Entry> {
  return {
    creditsSpent: 1,
    cartEntry,
    stats: {
      totalDonations: 1,
      categoryAdded: opts.categoryAdded ?? null,
      prevStreak: opts.prevStreak ?? 0,
      prevLastDonation: null,
    },
    profile: { totalSwipes: 1, totalDonated: cartEntry.amount },
  }
}

describe("undo reverses its own deltas (never a snapshot)", () => {
  test("undo after checkout does not re-populate donated items", () => {
    // The regression: swipe a → b → c, check out, Cmd+Z. A snapshot-based undo
    // put ["a", "b"] back into an empty cart. A delta-based undo removes *c*,
    // which is no longer there, and leaves the cart empty.
    const a = entry("a")
    const b = entry("b")
    const c = entry("c")
    const swipes = [paidSwipe(a), paidSwipe(b), paidSwipe(c)]

    let cart: Entry[] = [a, b, c]
    cart = [] // checkout

    const last = swipes.at(-1)!
    cart = cartAfterUndo(cart, last)

    expect(cart).toEqual([])
  })

  test("undo removes exactly the entry the swipe added, keeping later additions", () => {
    const a = entry("a")
    const b = entry("b")
    const later = entry("later")
    const undoB = paidSwipe(b)

    // Cart moved on since b was added.
    const cart = [a, b, later]

    expect(cartAfterUndo(cart, undoB)).toEqual([a, later])
  })

  test("two swipes on the same project are two entries; undo takes back one", () => {
    const first = entry("same")
    const second = entry("same") // equal by value, distinct by identity
    const cart = [first, second]

    expect(cartAfterUndo(cart, paidSwipe(second))).toEqual([first])
    expect(cartAfterUndo(cart, paidSwipe(second))[0]).toBe(first)
  })

  test("an undo record whose entry left the cart via checkout is a no-op for the cart", () => {
    const donated = entry("donated")
    const fresh = entry("fresh")

    // Checkout removed `donated`; the user then swiped `fresh`.
    const cart = [fresh]

    expect(cartAfterUndo(cart, paidSwipe(donated))).toEqual([fresh])
  })

  test("credits, stats and profile subtract the swipe's own contribution from the live values", () => {
    const record = paidSwipe(entry("x", 0.25), { categoryAdded: "Climate", prevStreak: 3 })

    // Credits were topped up between the swipe and the undo (12 → 40): undo
    // must give back the 1 that was spent, not reset to the pre-swipe 12.
    expect(creditsAfterUndo(39, record)).toBe(40)

    const stats = statsAfterUndo(
      { totalDonations: 7, categoriesSupported: new Set(["Climate", "Health"]), streak: 4, lastDonation: new Date(1) },
      record,
    )
    expect(stats.totalDonations).toBe(6)
    expect([...stats.categoriesSupported]).toEqual(["Health"])
    expect(stats.streak).toBe(3)
    expect(stats.lastDonation).toBeNull()

    // A category that was already supported before the swipe stays supported.
    const kept = statsAfterUndo(
      { totalDonations: 7, categoriesSupported: new Set(["Climate"]), streak: 4, lastDonation: null },
      paidSwipe(entry("y"), { categoryAdded: null }),
    )
    expect([...kept.categoriesSupported]).toEqual(["Climate"])

    const profile = profileAfterUndo({ totalSwipes: 10, totalDonated: 1.0, name: "ot" }, record)
    expect(profile).toEqual({ totalSwipes: 9, totalDonated: 0.75, name: "ot" })
  })

  test("free-mode and left swipes carry no consequences to reverse", () => {
    const record: SwipeUndoRecord<Entry> = { creditsSpent: 0, cartEntry: null, stats: null, profile: null }
    const cart = [entry("a")]
    const stats = { totalDonations: 1, categoriesSupported: new Set(["A"]), streak: 1, lastDonation: null }
    const profile = { totalSwipes: 1, totalDonated: 0.01 }

    expect(cartAfterUndo(cart, record)).toEqual(cart)
    expect(creditsAfterUndo(5, record)).toBe(5)
    expect(statsAfterUndo(stats, record)).toBe(stats)
    expect(profileAfterUndo(profile, record)).toBe(profile)
  })
})
