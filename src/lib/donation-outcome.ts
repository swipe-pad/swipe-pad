/**
 * Truthful states for an on-chain donation attempt. The cart only advances to
 * the success screen on `confirmed`; every other state says exactly what is
 * known about the user's funds.
 */
export type DonationOutcome =
  /** Wallet rejected / build failed before broadcast — nothing left the wallet. */
  | { status: "not_submitted"; error: Error }
  /** Receipt found with status success. */
  | { status: "confirmed"; txHash: string }
  /** Receipt found with status reverted — no donation, only gas (if any) spent. */
  | { status: "reverted"; txHash: string }
  /** Broadcast succeeded but we could not obtain a receipt in time. Funds may have moved. */
  | { status: "unknown"; txHash: string; error: Error }

export type DonationPhase = "idle" | "submitting" | "confirming"

export function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

export function outcomeFromReceipt(txHash: string, receipt: { status: "success" | "reverted" }): DonationOutcome {
  return receipt.status === "success" ? { status: "confirmed", txHash } : { status: "reverted", txHash }
}

/** One line of a donation batch, as sent on-chain / to the ledger. */
export type DonationBatchItem = { projectId: string; amount: number; currency: string }

/**
 * A broadcast whose receipt we could not obtain is remembered locally so that
 * closing and re-opening the cart offers "check status" instead of a second
 * send that could double-donate.
 *
 * The reference carries the batch it was broadcast for and the account that
 * sent it: a later confirmation is recorded against *those* items, never
 * against whatever happens to be in the cart at recheck time.
 */
export type PendingDonationTx = {
  txHash: string
  /** Convex identity that broadcast the batch (null if none was active). */
  userId: string | null
  items: DonationBatchItem[]
  createdAt: number
}

// v2: structured record. v1 stored the bare hash and is dropped on read — it
// cannot be attributed to a batch or an account, so it must not drive a checkout.
export const PENDING_DONATION_TX_STORAGE_KEY = "swipepad:pending-donation-tx:v2"
const LEGACY_PENDING_DONATION_TX_STORAGE_KEY = "swipepad:pending-donation-tx:v1"

/**
 * A Celo transaction still unconfirmed after this long is either dropped or
 * confirmed; offering "check status" for it forever would only block checkout.
 */
export const PENDING_DONATION_TX_MAX_AGE_MS = 24 * 60 * 60 * 1000

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">

const TX_HASH_PATTERN = /^0x[0-9a-fA-F]{64}$/

function isBatchItem(value: unknown): value is DonationBatchItem {
  if (typeof value !== "object" || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.projectId === "string" &&
    typeof item.amount === "number" &&
    Number.isFinite(item.amount) &&
    typeof item.currency === "string"
  )
}

export function readPendingDonationTx(
  storage: StorageLike | null | undefined,
  now: number = Date.now(),
): PendingDonationTx | null {
  if (!storage) return null
  try {
    // Never let a v1 bare hash resurface as a checkout.
    if (storage.getItem(LEGACY_PENDING_DONATION_TX_STORAGE_KEY) !== null) {
      storage.removeItem(LEGACY_PENDING_DONATION_TX_STORAGE_KEY)
    }

    const raw = storage.getItem(PENDING_DONATION_TX_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PendingDonationTx> | null
    if (!parsed || typeof parsed !== "object") return null
    if (typeof parsed.txHash !== "string" || !TX_HASH_PATTERN.test(parsed.txHash)) return null
    if (typeof parsed.createdAt !== "number" || !Number.isFinite(parsed.createdAt)) return null
    if (!Array.isArray(parsed.items) || !parsed.items.every(isBatchItem)) return null

    if (now - parsed.createdAt > PENDING_DONATION_TX_MAX_AGE_MS) {
      storage.removeItem(PENDING_DONATION_TX_STORAGE_KEY)
      return null
    }

    return {
      txHash: parsed.txHash,
      userId: typeof parsed.userId === "string" ? parsed.userId : null,
      items: parsed.items,
      createdAt: parsed.createdAt,
    }
  } catch {
    return null
  }
}

export function writePendingDonationTx(storage: StorageLike | null | undefined, pending: PendingDonationTx): void {
  try {
    storage?.setItem(PENDING_DONATION_TX_STORAGE_KEY, JSON.stringify(pending))
  } catch {
    // best effort
  }
}

export function clearPendingDonationTx(storage: StorageLike | null | undefined): void {
  try {
    storage?.removeItem(PENDING_DONATION_TX_STORAGE_KEY)
  } catch {
    // best effort
  }
}

/**
 * Whether a saved reference may drive the checkout UI for the active account.
 * A reference left by a different account on the same device stays stored for
 * that account, but must not be rechecked or recorded under this one.
 */
export function pendingDonationBelongsTo(pending: PendingDonationTx, userId: string | null): boolean {
  return pending.userId === userId
}

/**
 * Split the cart into the entries a checkout actually settled and the rest.
 * Each settled line consumes at most one matching cart entry (same project,
 * amount and currency), so items added after a broadcast are left alone.
 */
export function splitSettledCartItems<T extends { project: unknown; amount: number; currency: string }>(
  cart: readonly T[],
  settled: readonly DonationBatchItem[],
): { settled: T[]; remaining: T[] } {
  const pool = [...settled]
  const settledEntries: T[] = []
  const remaining: T[] = []

  for (const entry of cart) {
    const projectId = (entry.project as { projectId?: unknown } | null)?.projectId
    const index = pool.findIndex(
      (line) => line.projectId === projectId && line.amount === entry.amount && line.currency === entry.currency,
    )
    if (index === -1) {
      remaining.push(entry)
    } else {
      pool.splice(index, 1)
      settledEntries.push(entry)
    }
  }

  return { settled: settledEntries, remaining }
}

export type DonationOutcomeCopy = {
  title: string
  detail: string
  /** Whether it is honest to tell the user their funds did not move. */
  fundsMoved: "no" | "no-donation" | "unknown"
  /** Re-sending is only safe when nothing was broadcast or the broadcast reverted. */
  canResend: boolean
  /** Offer a status re-check instead of a re-send when the outcome is unknown. */
  canRecheck: boolean
}

export function describeDonationFailure(outcome: Exclude<DonationOutcome, { status: "confirmed" }>): DonationOutcomeCopy {
  switch (outcome.status) {
    case "not_submitted":
      return {
        title: outcome.error.message || "The donation was not sent.",
        detail: "No funds moved. Your selection is safe — you can retry now or later.",
        fundsMoved: "no",
        canResend: true,
        canRecheck: false,
      }
    case "reverted":
      return {
        title: "The donation transaction reverted on-chain.",
        detail: "No donation was made (only network gas, if any, was spent). Your selection is safe — you can retry.",
        fundsMoved: "no-donation",
        canResend: true,
        canRecheck: false,
      }
    case "unknown":
      return {
        title: "Your transaction was sent, but we couldn't confirm it yet.",
        detail:
          "Funds may already have moved. Don't send it again — check the transaction status first. Your selection stays here until it's confirmed.",
        fundsMoved: "unknown",
        canResend: false,
        canRecheck: true,
      }
  }
}
