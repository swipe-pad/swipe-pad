import {
  canonicalizeAddress,
  canonicalizeTxHash,
  toHoldReason,
  type TopUpHoldReason,
  type TopUpVerifyOutcome,
} from "../../convex/topupsLib"

/** What the recharge status toast can show. Every state names the payment it refers to. */
export type TopUpStatus =
  | { state: "verifying"; txHash: string }
  | { state: "pending"; txHash: string; attempts: number; willRetry: boolean }
  | { state: "credited"; txHash: string; swipes: number }
  | { state: "already-credited"; txHash: string; swipes: number }
  | {
      state: "failed"
      txHash: string | null
      message: string
      /** Retry re-runs verification for the saved hash — never a second payment. */
      retryable: boolean
      /** Final outcomes drop the saved reference when dismissed. */
      final: boolean
    }

/** Payment reference persisted locally until the server has settled it. */
export type PendingTopUp = {
  txHash: string
  planId: string
  chain: "celo"
  /** Convex identity that reported the payment; may be null if the wallet was still connecting. */
  userId: string | null
  createdAt: number
}

export const PENDING_TOP_UP_STORAGE_KEY = "swipepad:pending-top-up:v1"

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">

export function readPendingTopUp(storage: StorageLike | null | undefined): PendingTopUp | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(PENDING_TOP_UP_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PendingTopUp>
    const txHash = canonicalizeTxHash(parsed.txHash)
    if (!txHash) return null
    return {
      txHash,
      planId: typeof parsed.planId === "string" ? parsed.planId : "unknown",
      chain: "celo",
      userId: typeof parsed.userId === "string" ? parsed.userId : null,
      createdAt: typeof parsed.createdAt === "number" ? parsed.createdAt : Date.now(),
    }
  } catch {
    return null
  }
}

export function writePendingTopUp(storage: StorageLike | null | undefined, pending: PendingTopUp): void {
  if (!storage) return
  try {
    storage.setItem(PENDING_TOP_UP_STORAGE_KEY, JSON.stringify(pending))
  } catch {
    // Storage full/blocked: the server-side pending row is the durable copy.
  }
}

export function clearPendingTopUp(storage: StorageLike | null | undefined): void {
  if (!storage) return
  try {
    storage.removeItem(PENDING_TOP_UP_STORAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * First candidate that is a real, non-zero EVM address. Placeholders such as
 * the `0x...` shipped in .env.example are rejected so the BuyWidget is never
 * rendered against a receiver that cannot receive funds.
 */
export function getUsableReceiverAddress(...candidates: Array<string | undefined | null>): `0x${string}` | null {
  for (const candidate of candidates) {
    const normalized = canonicalizeAddress(candidate)
    if (normalized) return normalized as `0x${string}`
  }
  return null
}

type StatusWithTransactions = {
  transactions: ReadonlyArray<{ chainId: number; transactionHash: string }>
}

/** Last transaction the widget reported on the given chain, canonicalized. */
export function extractTxHashForChain(statuses: ReadonlyArray<StatusWithTransactions>, chainId: number): string | null {
  const hash = statuses
    .flatMap((status) => status.transactions)
    .filter((tx) => tx.chainId === chainId)
    .at(-1)?.transactionHash
  return canonicalizeTxHash(hash)
}

export function shortenAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}

/**
 * Held payments are real cUSD that could not be credited yet. None of these
 * are final: the reference stays saved and "retry" re-verifies the same hash.
 */
function heldMessage(reason: TopUpHoldReason, payer: string | null): string {
  switch (reason) {
    case "receiver_mismatch":
      return "Payment found on Celo, but the cUSD went to an address SwipePad isn't currently configured to accept, so nothing was credited yet. The reference is saved — retry in a while, or contact support with the transaction hash."
    case "amount_too_low":
      return "Payment found on Celo, but the amount is below the smallest swipe pack, so nothing was credited. The reference is saved — contact support with the transaction hash."
    case "payer_mismatch":
      return `Payment found on Celo, but it was sent from ${payer ? shortenAddress(payer) : "a wallet"} that isn't linked to this account. Connect that wallet and retry, or contact support with the transaction hash. The reference is saved.`
  }
}

export function topUpOutcomeToStatus(outcome: TopUpVerifyOutcome): TopUpStatus {
  switch (outcome.outcome) {
    case "credited":
      return { state: "credited", txHash: outcome.txHash, swipes: outcome.swipesCredited }
    case "already_credited":
      return { state: "already-credited", txHash: outcome.txHash, swipes: outcome.swipesCredited }
    case "pending":
      return { state: "pending", txHash: outcome.txHash, attempts: outcome.attempts, willRetry: outcome.willRetry }
    case "rejected":
      return {
        state: "failed",
        txHash: outcome.txHash,
        retryable: false,
        final: true,
        message:
          outcome.reason === "reverted"
            ? "Your payment transaction reverted on Celo. No cUSD reached SwipePad and no swipes were credited."
            : "This transaction moved no cUSD at all, so nothing was credited. If you were charged, contact support with the transaction hash.",
      }
    case "held":
      return {
        state: "failed",
        txHash: outcome.txHash,
        retryable: true,
        final: false,
        message: heldMessage(outcome.reason, outcome.payer),
      }
    case "claimed_by_other":
      return {
        state: "failed",
        txHash: outcome.txHash,
        retryable: true,
        final: false,
        message: "This payment was credited to the account of the wallet that paid. Connect that wallet to use its swipes.",
      }
  }
}

export function verificationErrorToStatus(txHash: string, error: unknown): TopUpStatus {
  const detail = error instanceof Error ? error.message : String(error)
  return {
    state: "failed",
    txHash,
    retryable: true,
    final: false,
    message: `We couldn't verify the payment yet (${detail}). Nothing was credited. The reference is saved — retry without paying again.`,
  }
}

export function missingTxHashStatus(): TopUpStatus {
  return {
    state: "failed",
    txHash: null,
    retryable: false,
    final: true,
    message:
      "The payment provider reported success but returned no Celo transaction, so nothing was credited. Keep your payment receipt and contact support.",
  }
}

export type TopUpStatusRecord = {
  txHash: string
  status: "pending" | "credited" | "rejected" | "held"
  swipes: number
  attempts: number
  willRetry: boolean
  errorCode: string | null
  payer: string | null
}

/** Mirror of a server-side row for the reactive path (scheduler credited it while we waited). */
export function topUpRecordToStatus(record: TopUpStatusRecord): TopUpStatus {
  switch (record.status) {
    case "credited":
      return { state: "credited", txHash: record.txHash, swipes: record.swipes }
    case "pending":
      return { state: "pending", txHash: record.txHash, attempts: record.attempts, willRetry: record.willRetry }
    case "rejected":
      return topUpOutcomeToStatus({
        outcome: "rejected",
        txHash: record.txHash,
        reason: record.errorCode === "reverted" ? "reverted" : "no_matching_payment",
      })
    case "held":
      return topUpOutcomeToStatus({
        outcome: "held",
        txHash: record.txHash,
        reason: toHoldReason(record.errorCode),
        payer: record.payer,
      })
  }
}
