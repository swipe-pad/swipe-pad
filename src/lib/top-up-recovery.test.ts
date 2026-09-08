import { describe, expect, test } from "bun:test"

import {
  PENDING_TOP_UP_STORAGE_KEY,
  clearPendingTopUp,
  extractTxHashForChain,
  getUsableReceiverAddress,
  missingTxHashStatus,
  readPendingTopUp,
  topUpOutcomeToStatus,
  topUpRecordToStatus,
  verificationErrorToStatus,
  writePendingTopUp,
} from "@/lib/top-up-recovery"

const HASH = `0x${"ab".repeat(32)}`
const PAYER = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    dump: () => Object.fromEntries(map),
  }
}

describe("pending top-up persistence", () => {
  test("round-trips a pending payment reference", () => {
    const storage = memoryStorage()
    writePendingTopUp(storage, { txHash: HASH, planId: "session", chain: "celo", userId: "u1", createdAt: 123 })

    expect(readPendingTopUp(storage)).toEqual({ txHash: HASH, planId: "session", chain: "celo", userId: "u1", createdAt: 123 })

    clearPendingTopUp(storage)
    expect(readPendingTopUp(storage)).toBeNull()
  })

  test("canonicalizes the stored hash and tolerates partial records", () => {
    const storage = memoryStorage()
    storage.setItem(PENDING_TOP_UP_STORAGE_KEY, JSON.stringify({ txHash: HASH.toUpperCase().replace("0X", "0x") }))

    const pending = readPendingTopUp(storage)
    expect(pending?.txHash).toBe(HASH)
    expect(pending?.planId).toBe("unknown")
    expect(pending?.userId).toBeNull()
  })

  test("drops corrupt or placeholder entries instead of throwing", () => {
    const storage = memoryStorage()
    storage.setItem(PENDING_TOP_UP_STORAGE_KEY, "{not json")
    expect(readPendingTopUp(storage)).toBeNull()

    storage.setItem(PENDING_TOP_UP_STORAGE_KEY, JSON.stringify({ txHash: "0x..." }))
    expect(readPendingTopUp(storage)).toBeNull()

    expect(readPendingTopUp(null)).toBeNull()
  })
})

describe("getUsableReceiverAddress", () => {
  test("rejects the .env.example placeholder and the zero address", () => {
    expect(getUsableReceiverAddress("0x...")).toBeNull()
    expect(getUsableReceiverAddress("0x0000000000000000000000000000000000000000")).toBeNull()
    expect(getUsableReceiverAddress(undefined, "")).toBeNull()
  })

  test("falls through to the first real address", () => {
    expect(getUsableReceiverAddress("0x...", PAYER.toUpperCase().replace("0X", "0x"))).toBe(PAYER)
  })
})

describe("extractTxHashForChain", () => {
  test("returns the last transaction on the requested chain, canonicalized", () => {
    const other = `0x${"cd".repeat(32)}`
    const statuses = [
      { transactions: [{ chainId: 1, transactionHash: other }] },
      { transactions: [{ chainId: 42220, transactionHash: other }, { chainId: 42220, transactionHash: HASH.toUpperCase().replace("0X", "0x") }] },
    ]
    expect(extractTxHashForChain(statuses, 42220)).toBe(HASH)
  })

  test("returns null when the chain has no transaction", () => {
    expect(extractTxHashForChain([{ transactions: [{ chainId: 1, transactionHash: HASH }] }], 42220)).toBeNull()
    expect(extractTxHashForChain([], 42220)).toBeNull()
  })
})

describe("outcome → toast status", () => {
  test("newly credited and already credited are distinct states with server amounts", () => {
    expect(
      topUpOutcomeToStatus({ outcome: "credited", txHash: HASH, planId: "power", swipesCredited: 120, remaining: 130, max: 130 }),
    ).toEqual({ state: "credited", txHash: HASH, swipes: 120 })

    expect(
      topUpOutcomeToStatus({ outcome: "already_credited", txHash: HASH, planId: "power", swipesCredited: 120, remaining: 130, max: 130 }),
    ).toEqual({ state: "already-credited", txHash: HASH, swipes: 120 })
  })

  test("pending keeps the hash and whether the server is still retrying", () => {
    expect(topUpOutcomeToStatus({ outcome: "pending", txHash: HASH, attempts: 2, willRetry: true })).toEqual({
      state: "pending",
      txHash: HASH,
      attempts: 2,
      willRetry: true,
    })
  })

  test("reverted and unmatched payments are final and not retryable", () => {
    const reverted = topUpOutcomeToStatus({ outcome: "rejected", txHash: HASH, reason: "reverted" })
    expect(reverted.state).toBe("failed")
    if (reverted.state !== "failed") return
    expect(reverted.retryable).toBe(false)
    expect(reverted.final).toBe(true)
    expect(reverted.message).toContain("reverted")
    expect(reverted.message).not.toContain("shortly")

    const unmatched = topUpOutcomeToStatus({ outcome: "rejected", txHash: HASH, reason: "no_matching_payment" })
    expect(unmatched.state).toBe("failed")
    if (unmatched.state !== "failed") return
    expect(unmatched.retryable).toBe(false)
    expect(unmatched.message).toContain("nothing was credited")
  })

  test("held and claimed-by-other keep the reference and stay retryable", () => {
    const held = topUpOutcomeToStatus({ outcome: "held", txHash: HASH, reason: "payer_mismatch", payer: PAYER })
    expect(held.state).toBe("failed")
    if (held.state !== "failed") return
    expect(held.retryable).toBe(true)
    expect(held.final).toBe(false)
    expect(held.message).toContain("0xbbbb…bbbb")

    const other = topUpOutcomeToStatus({ outcome: "claimed_by_other", txHash: HASH })
    expect(other.state).toBe("failed")
    if (other.state !== "failed") return
    expect(other.retryable).toBe(true)
  })

  test("a cUSD transfer to an unexpected receiver is held, never final, and keeps retry", () => {
    const held = topUpOutcomeToStatus({ outcome: "held", txHash: HASH, reason: "receiver_mismatch", payer: PAYER })
    expect(held.state).toBe("failed")
    if (held.state !== "failed") return
    expect(held.retryable).toBe(true)
    expect(held.final).toBe(false)
    expect(held.message).toContain("Payment found on Celo")
    expect(held.message).toContain("reference is saved")
    expect(held.message).not.toContain("no cUSD")

    const low = topUpOutcomeToStatus({ outcome: "held", txHash: HASH, reason: "amount_too_low", payer: PAYER })
    expect(low.state).toBe("failed")
    if (low.state !== "failed") return
    expect(low.final).toBe(false)
    expect(low.message).toContain("below the smallest")
  })

  test("verification errors never promise a future credit", () => {
    const status = verificationErrorToStatus(HASH, new Error("RPC down"))
    expect(status.state).toBe("failed")
    if (status.state !== "failed") return
    expect(status.retryable).toBe(true)
    expect(status.message).toContain("RPC down")
    expect(status.message).toContain("Nothing was credited")
    expect(status.message).not.toMatch(/credited shortly/i)
  })

  test("missing hash is a final failure that credits nothing", () => {
    const status = missingTxHashStatus()
    expect(status.state).toBe("failed")
    if (status.state !== "failed") return
    expect(status.txHash).toBeNull()
    expect(status.retryable).toBe(false)
    expect(status.message).toContain("nothing was credited")
  })
})

describe("server record → toast status", () => {
  const base = { txHash: HASH, swipes: 0, attempts: 1, willRetry: false, errorCode: null, payer: null }

  test("credited rows surface as newly credited with the server amount", () => {
    expect(topUpRecordToStatus({ ...base, status: "credited", swipes: 50 })).toEqual({ state: "credited", txHash: HASH, swipes: 50 })
  })

  test("pending, rejected and held map to their toast states", () => {
    expect(topUpRecordToStatus({ ...base, status: "pending", willRetry: true })).toEqual({
      state: "pending",
      txHash: HASH,
      attempts: 1,
      willRetry: true,
    })

    const rejected = topUpRecordToStatus({ ...base, status: "rejected", errorCode: "reverted" })
    expect(rejected.state).toBe("failed")
    if (rejected.state === "failed") expect(rejected.message).toContain("reverted")

    const held = topUpRecordToStatus({ ...base, status: "held", errorCode: "payer_mismatch", payer: PAYER })
    expect(held.state).toBe("failed")
    if (held.state === "failed") expect(held.retryable).toBe(true)
  })

  test("held rows surface the stored hold reason, not a hardcoded payer mismatch", () => {
    const drift = topUpRecordToStatus({ ...base, status: "held", errorCode: "receiver_mismatch", payer: PAYER })
    expect(drift.state).toBe("failed")
    if (drift.state !== "failed") return
    expect(drift.final).toBe(false)
    expect(drift.message).toContain("isn't currently configured")
    expect(drift.message).not.toContain("0xbbbb…bbbb")
  })
})
