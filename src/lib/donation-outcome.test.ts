import { describe, expect, test } from "bun:test"

import {
  PENDING_DONATION_TX_MAX_AGE_MS,
  PENDING_DONATION_TX_STORAGE_KEY,
  clearPendingDonationTx,
  describeDonationFailure,
  outcomeFromReceipt,
  pendingDonationBelongsTo,
  readPendingDonationTx,
  splitSettledCartItems,
  toError,
  writePendingDonationTx,
  type PendingDonationTx,
} from "@/lib/donation-outcome"

const HASH = `0x${"ab".repeat(32)}`
const LEGACY_KEY = "swipepad:pending-donation-tx:v1"

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    has: (key: string) => map.has(key),
  }
}

function pending(overrides: Partial<PendingDonationTx> = {}): PendingDonationTx {
  return {
    txHash: HASH,
    userId: "u1",
    items: [
      { projectId: "p1", amount: 0.01, currency: "cUSD" },
      { projectId: "p2", amount: 0.01, currency: "cUSD" },
    ],
    createdAt: 1_000_000,
    ...overrides,
  }
}

describe("pending donation tx persistence", () => {
  test("remembers the broadcast batch and account until it is settled", () => {
    const storage = memoryStorage()
    writePendingDonationTx(storage, pending())
    expect(readPendingDonationTx(storage, 1_000_000)).toEqual(pending())
    clearPendingDonationTx(storage)
    expect(readPendingDonationTx(storage, 1_000_000)).toBeNull()
  })

  test("expires references older than the age bound and removes them", () => {
    const storage = memoryStorage()
    writePendingDonationTx(storage, pending({ createdAt: 0 }))

    expect(readPendingDonationTx(storage, PENDING_DONATION_TX_MAX_AGE_MS)).not.toBeNull()
    expect(readPendingDonationTx(storage, PENDING_DONATION_TX_MAX_AGE_MS + 1)).toBeNull()
    expect(storage.has(PENDING_DONATION_TX_STORAGE_KEY)).toBe(false)
  })

  test("drops the v1 bare-hash record instead of letting it drive a checkout", () => {
    const storage = memoryStorage()
    storage.setItem(LEGACY_KEY, HASH)

    expect(readPendingDonationTx(storage)).toBeNull()
    expect(storage.has(LEGACY_KEY)).toBe(false)
  })

  test("ignores garbage, partial records and missing storage", () => {
    const storage = memoryStorage()
    storage.setItem(PENDING_DONATION_TX_STORAGE_KEY, "0x...")
    expect(readPendingDonationTx(storage)).toBeNull()

    storage.setItem(PENDING_DONATION_TX_STORAGE_KEY, JSON.stringify({ txHash: HASH }))
    expect(readPendingDonationTx(storage)).toBeNull()

    storage.setItem(PENDING_DONATION_TX_STORAGE_KEY, JSON.stringify({ ...pending(), items: [{ projectId: 1 }] }))
    expect(readPendingDonationTx(storage)).toBeNull()

    expect(readPendingDonationTx(null)).toBeNull()
  })

  test("a reference only drives the checkout of the account that broadcast it", () => {
    expect(pendingDonationBelongsTo(pending({ userId: "u1" }), "u1")).toBe(true)
    expect(pendingDonationBelongsTo(pending({ userId: "u1" }), "u2")).toBe(false)
    expect(pendingDonationBelongsTo(pending({ userId: "u1" }), null)).toBe(false)
    expect(pendingDonationBelongsTo(pending({ userId: null }), null)).toBe(true)
  })
})

describe("splitSettledCartItems", () => {
  const p = (projectId: string, amount = 0.01) => ({ project: { projectId }, amount, currency: "cUSD" })

  test("a recovered transaction settles only the batch it was broadcast for", () => {
    // After a reload the cart holds new items; the old hash confirms its own batch.
    const fresh1 = p("fresh-1")
    const fresh2 = p("fresh-2")
    const cart = [fresh1, fresh2]

    const result = splitSettledCartItems(cart, pending().items)

    expect(result.settled).toEqual([])
    expect(result.remaining).toEqual([fresh1, fresh2])
  })

  test("a same-session confirmation removes the batch and keeps later additions", () => {
    const p1 = p("p1")
    const p2 = p("p2")
    const later = p("later")

    const result = splitSettledCartItems([p1, p2, later], pending().items)

    expect(result.settled).toEqual([p1, p2])
    expect(result.remaining).toEqual([later])
  })

  test("each settled line consumes at most one matching entry", () => {
    const first = p("p1")
    const second = p("p1")

    const result = splitSettledCartItems([first, second], [{ projectId: "p1", amount: 0.01, currency: "cUSD" }])

    expect(result.settled).toEqual([first])
    expect(result.remaining).toEqual([second])
  })

  test("amount and currency must match too", () => {
    const cart = [p("p1", 0.05), { project: { projectId: "p1" }, amount: 0.01, currency: "USDC" }]

    const result = splitSettledCartItems(cart, [{ projectId: "p1", amount: 0.01, currency: "cUSD" }])

    expect(result.settled).toEqual([])
    expect(result.remaining).toEqual(cart)
  })
})

describe("outcomeFromReceipt", () => {
  test("a successful receipt confirms the donation", () => {
    expect(outcomeFromReceipt(HASH, { status: "success" })).toEqual({ status: "confirmed", txHash: HASH })
  })

  test("a reverted receipt is not a success", () => {
    expect(outcomeFromReceipt(HASH, { status: "reverted" })).toEqual({ status: "reverted", txHash: HASH })
  })
})

describe("describeDonationFailure", () => {
  test("only a never-broadcast attempt may claim that no funds moved", () => {
    const copy = describeDonationFailure({ status: "not_submitted", error: new Error("User rejected") })
    expect(copy.fundsMoved).toBe("no")
    expect(copy.detail).toContain("No funds moved")
    expect(copy.canResend).toBe(true)
    expect(copy.canRecheck).toBe(false)
  })

  test("a revert explains no donation happened and allows a retry", () => {
    const copy = describeDonationFailure({ status: "reverted", txHash: HASH })
    expect(copy.fundsMoved).toBe("no-donation")
    expect(copy.canResend).toBe(true)
    expect(copy.detail).not.toContain("No funds moved")
  })

  test("an unknown outcome never claims funds are safe and blocks re-sending", () => {
    const copy = describeDonationFailure({ status: "unknown", txHash: HASH, error: new Error("timeout") })
    expect(copy.fundsMoved).toBe("unknown")
    expect(copy.canResend).toBe(false)
    expect(copy.canRecheck).toBe(true)
    expect(copy.detail).not.toContain("No funds moved")
    expect(copy.detail).toContain("Don't send it again")
  })
})

describe("toError", () => {
  test("wraps non-Error throwables", () => {
    expect(toError("boom").message).toBe("boom")
    const error = new Error("real")
    expect(toError(error)).toBe(error)
  })
})
