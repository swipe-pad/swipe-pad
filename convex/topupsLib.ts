// Pure helpers for swipe top-up verification. No Convex runtime imports so the
// attribution rules can be unit-tested with `bun test` (see topups.test.ts).

export type TopUpPlanDef = { id: string; swipes: number; amountUsd: string };

// Server-side source of truth for purchasable plans. Must stay in sync with
// src/lib/top-up-plans.ts — the client copy only drives the UI; crediting is
// decided here so a tampered client cannot buy cheap and credit big.
export const TOP_UP_PLANS: Record<string, TopUpPlanDef> = {
  starter: { id: "starter", swipes: 20, amountUsd: "1.00" },
  session: { id: "session", swipes: 50, amountUsd: "2.50" },
  power: { id: "power", swipes: 120, amountUsd: "5.00" },
};

export const CUSD_CELO = "0x765de816845861e75a25fca122bb6898b8b1282a";
export const ERC20_TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/** Max server-side re-verification attempts before we stop scheduling retries. */
export const MAX_VERIFY_ATTEMPTS = 10;

export type TopUpRecordStatus = "pending" | "credited" | "rejected" | "held";

/**
 * Final rejections. `no_matching_payment` is only used when the transaction
 * moved *no cUSD at all* — there is provably nothing to credit or refund.
 */
export type TopUpRejectReason = "reverted" | "no_matching_payment";

/**
 * Non-final holds: real cUSD moved, but it cannot be credited as-is.
 * - payer_mismatch: paid to us from a wallet no account has connected.
 * - receiver_mismatch: cUSD went to an address that is not the configured
 *   receiver (typically NEXT_PUBLIC_TOP_UP_RECEIVER_ADDRESS drifting from the
 *   Convex TOP_UP_RECEIVER_ADDRESS). Re-verifying after the config is fixed credits it.
 * - amount_too_low: reached the receiver but covers no plan.
 * The client keeps the reference and may retry; none of these drop the payment.
 */
export type TopUpHoldReason = "payer_mismatch" | "receiver_mismatch" | "amount_too_low";

export function toHoldReason(errorCode: string | null | undefined): TopUpHoldReason {
  return errorCode === "receiver_mismatch" || errorCode === "amount_too_low" ? errorCode : "payer_mismatch";
}

/** Outcome of a verification pass. Returned to the client verbatim. */
export type TopUpVerifyOutcome =
  | {
      outcome: "credited";
      txHash: string;
      planId: string;
      swipesCredited: number;
      remaining: number;
      max: number;
    }
  | {
      outcome: "already_credited";
      txHash: string;
      planId: string;
      swipesCredited: number;
      remaining: number;
      max: number;
    }
  | { outcome: "pending"; txHash: string; attempts: number; willRetry: boolean }
  | { outcome: "rejected"; txHash: string; reason: TopUpRejectReason }
  | { outcome: "held"; txHash: string; reason: TopUpHoldReason; payer: string | null }
  | { outcome: "claimed_by_other"; txHash: string };

/**
 * Canonical form for an EVM tx hash: lowercase, 0x-prefixed, 32 bytes.
 * Returns null for anything else (placeholders like "0x..." included) so the
 * same payment can never be credited twice under different casings.
 */
export function canonicalizeTxHash(input: string | null | undefined): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim().toLowerCase();
  return /^0x[0-9a-f]{64}$/.test(trimmed) ? trimmed : null;
}

/**
 * Canonical (lowercase) EVM address, or null when the value is not a real
 * address. Rejects the zero address and doc placeholders such as "0x...".
 */
export function canonicalizeAddress(input: string | null | undefined): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim().toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(trimmed)) return null;
  if (trimmed === ZERO_ADDRESS) return null;
  return trimmed;
}

export function usdToWei(amountUsd: string): bigint {
  const cents = Math.round(Number(amountUsd) * 100);
  return BigInt(cents) * 10n ** 16n;
}

export function topicToAddress(topic: string): string {
  return `0x${topic.slice(-40)}`.toLowerCase();
}

/**
 * Pick the plan a payment actually pays for: the most expensive plan whose
 * price is covered by `paidWei`. The client-supplied plan is only a hint —
 * if it disagrees with the money that moved on-chain, the money wins.
 */
export function resolvePlanForPayment(
  paidWei: bigint,
  plans: Record<string, TopUpPlanDef> = TOP_UP_PLANS
): TopUpPlanDef | null {
  let best: TopUpPlanDef | null = null;
  for (const plan of Object.values(plans)) {
    const required = usdToWei(plan.amountUsd);
    if (paidWei < required) continue;
    if (!best || required > usdToWei(best.amountUsd)) best = plan;
  }
  return best;
}

export type ReceiptLog = { address: string; topics: string[]; data: string };

export type ReceiptLike = {
  status: string;
  from?: string;
  logs: ReceiptLog[];
};

export type ReceiptEvaluation =
  | { kind: "reverted" }
  /** The transaction moved no cUSD whatsoever. Final. */
  | { kind: "no_matching_payment" }
  /**
   * cUSD did move, but not as a creditable payment. Never final: the
   * evidence is kept on the row and the client keeps its reference.
   */
  | {
      kind: "unmatched_transfer";
      reason: Exclude<TopUpHoldReason, "payer_mismatch">;
      payer: string;
      txFrom: string | null;
      /** Where the largest cUSD transfer went. */
      to: string;
      paidWei: bigint;
    }
  | {
      kind: "paid";
      /** `from` of the cUSD Transfer that paid the receiver (the wallet that held the funds). */
      payer: string;
      /** `from` of the transaction itself (EOA or bundler). */
      txFrom: string | null;
      paidWei: bigint;
      plan: TopUpPlanDef;
    };

type Transfer = { payer: string; to: string; paidWei: bigint };

/**
 * Decide what a receipt proves. Finds the largest cUSD Transfer into the
 * configured receiver and maps it onto a plan. Pure so it can be tested
 * against synthetic receipts.
 *
 * Only "no cUSD transfer at all" is a final rejection. A transfer to an
 * unexpected address (receiver config drift) or one below the cheapest plan
 * is real money and is reported as `unmatched_transfer` so it is held, not dropped.
 */
export function evaluateReceipt(
  receipt: ReceiptLike,
  receiver: string,
  plans: Record<string, TopUpPlanDef> = TOP_UP_PLANS
): ReceiptEvaluation {
  if (receipt.status !== "0x1") return { kind: "reverted" };

  const receiverLc = receiver.toLowerCase();
  let toReceiver: Transfer | null = null;
  let elsewhere: Transfer | null = null;

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== CUSD_CELO) continue;
    if (log.topics[0] !== ERC20_TRANSFER_TOPIC || log.topics.length < 3) continue;

    let paidWei: bigint;
    try {
      paidWei = BigInt(log.data);
    } catch {
      continue;
    }

    const transfer: Transfer = { payer: topicToAddress(log.topics[1]), to: topicToAddress(log.topics[2]), paidWei };
    if (transfer.to === receiverLc) {
      if (!toReceiver || paidWei > toReceiver.paidWei) toReceiver = transfer;
    } else if (!elsewhere || paidWei > elsewhere.paidWei) {
      elsewhere = transfer;
    }
  }

  const txFrom = canonicalizeAddress(receipt.from);

  if (toReceiver) {
    const plan = resolvePlanForPayment(toReceiver.paidWei, plans);
    if (plan) {
      return { kind: "paid", payer: toReceiver.payer, txFrom, paidWei: toReceiver.paidWei, plan };
    }
    return {
      kind: "unmatched_transfer",
      reason: "amount_too_low",
      payer: toReceiver.payer,
      txFrom,
      to: toReceiver.to,
      paidWei: toReceiver.paidWei,
    };
  }

  if (elsewhere) {
    return {
      kind: "unmatched_transfer",
      reason: "receiver_mismatch",
      payer: elsewhere.payer,
      txFrom,
      to: elsewhere.to,
      paidWei: elsewhere.paidWei,
    };
  }

  return { kind: "no_matching_payment" };
}

/**
 * Owner bind: a Convex identity owns a payment when its wallet is either the
 * token sender (EOA / smart account that held the cUSD) or the transaction
 * sender. Guest pseudo-wallets ("guest-…") can never own an on-chain payment.
 */
export function walletOwnsPayment(
  wallet: string | null | undefined,
  candidates: Array<string | null | undefined>
): boolean {
  const normalized = canonicalizeAddress(wallet);
  if (!normalized) return false;
  return candidates.some((candidate) => canonicalizeAddress(candidate) === normalized);
}

/** Backoff for server-side re-verification (attempt is 1-based). */
export function getRetryDelayMs(attempt: number): number {
  const schedule = [5_000, 10_000, 20_000, 40_000, 80_000, 160_000, 300_000, 300_000, 600_000];
  const index = Math.max(0, Math.min(attempt, schedule.length) - 1);
  return schedule[index] ?? schedule[schedule.length - 1]!;
}

export function shouldScheduleRetry(attempts: number): boolean {
  return attempts < MAX_VERIFY_ATTEMPTS;
}
