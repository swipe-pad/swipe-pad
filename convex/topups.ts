import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
  type ActionCtx,
  type MutationCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { markDashboardStatsDirty } from "./waitlist";
import {
  TOP_UP_PLANS,
  canonicalizeAddress,
  canonicalizeTxHash,
  evaluateReceipt,
  getRetryDelayMs,
  shouldScheduleRetry,
  toHoldReason,
  walletOwnsPayment,
  type ReceiptLike,
  type TopUpRejectReason,
  type TopUpVerifyOutcome,
} from "./topupsLib";

// Short in-request poll so the happy path (receipt already indexed) resolves
// in one call. Anything slower is handed to the scheduler — see reverifyPending.
const INLINE_RECEIPT_ATTEMPTS = 3;
const INLINE_RECEIPT_RETRY_MS = 1500;

async function rpcCall(method: string, params: unknown[]): Promise<unknown> {
  const url = process.env.CELO_RPC ?? "https://forno.celo.org";
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`RPC ${method} failed: HTTP ${res.status}`);
  const json = (await res.json()) as { result?: unknown; error?: { message?: string } };
  if (json.error) throw new Error(`RPC ${method} failed: ${json.error.message}`);
  return json.result;
}

function getReceiverAddress(): string {
  const receiver = canonicalizeAddress(process.env.TOP_UP_RECEIVER_ADDRESS);
  if (!receiver) {
    // Also rejects the "0x..." placeholder shipped in .env.example.
    throw new Error("TOP_UP_RECEIVER_ADDRESS is missing or not a valid address in the Convex env");
  }
  return receiver;
}

function recordStatus(record: Doc<"topUps">) {
  return record.status ?? "credited";
}

async function getCreditsFor(ctx: MutationCtx, userId: Id<"waitlistUsers">, chain: string) {
  return await ctx.db
    .query("credits")
    .withIndex("by_user_chain", (q) => q.eq("userId", userId).eq("chain", chain))
    .first();
}

/**
 * Shared verification pass used by both the client-triggered action and the
 * scheduled retry. Never throws for on-chain outcomes; only for config/RPC.
 */
async function verifyTopUpRecord(
  ctx: ActionCtx,
  input: { topUpId: Id<"topUps">; callerUserId: Id<"waitlistUsers">; txHash: string; chain: string }
): Promise<TopUpVerifyOutcome> {
  const receiver = getReceiverAddress();

  let receipt: ReceiptLike | null = null;
  let rpcError: string | undefined;
  try {
    for (let i = 0; i < INLINE_RECEIPT_ATTEMPTS; i++) {
      receipt = (await rpcCall("eth_getTransactionReceipt", [input.txHash])) as ReceiptLike | null;
      if (receipt) break;
      if (i < INLINE_RECEIPT_ATTEMPTS - 1) {
        await new Promise((resolve) => setTimeout(resolve, INLINE_RECEIPT_RETRY_MS));
      }
    }
  } catch (error) {
    // Transient RPC failure: treated like a missing receipt so the scheduler
    // retries instead of the client being told to give up.
    rpcError = error instanceof Error ? error.message : String(error);
    console.error("[topups] receipt lookup failed", { txHash: input.txHash, error });
  }

  if (!receipt) {
    return await ctx.runMutation(internal.topups.markReceiptMissing, {
      topUpId: input.topUpId,
      errorMessage: rpcError,
    });
  }

  const evaluation = evaluateReceipt(receipt, receiver, TOP_UP_PLANS);

  if (evaluation.kind === "reverted" || evaluation.kind === "no_matching_payment") {
    return await ctx.runMutation(internal.topups.rejectTopUp, {
      topUpId: input.topUpId,
      reason: evaluation.kind,
    });
  }

  if (evaluation.kind === "unmatched_transfer") {
    // Real cUSD moved (to the wrong address, or too little). Not final: hold
    // it with the evidence so a config fix + retry can still credit it.
    return await ctx.runMutation(internal.topups.holdTopUp, {
      topUpId: input.topUpId,
      reason: evaluation.reason,
      payer: evaluation.payer,
      txFrom: evaluation.txFrom,
      paidWei: evaluation.paidWei.toString(),
      errorMessage:
        evaluation.reason === "receiver_mismatch"
          ? `cUSD transfer went to ${evaluation.to}, expected receiver ${receiver}`
          : `cUSD transfer of ${evaluation.paidWei.toString()} wei covers no plan`,
    });
  }

  return await ctx.runMutation(internal.topups.creditVerifiedTopUp, {
    topUpId: input.topUpId,
    callerUserId: input.callerUserId,
    chain: input.chain,
    planId: evaluation.plan.id,
    swipes: evaluation.plan.swipes,
    amountUsd: evaluation.plan.amountUsd,
    payer: evaluation.payer,
    txFrom: evaluation.txFrom,
    paidWei: evaluation.paidWei.toString(),
  });
}

/**
 * A verification pass threw (missing receiver config, RPC outage, a failed
 * internal mutation). The pending row must still count the attempt and get a
 * scheduled re-check, otherwise it would sit at attempts=0 forever with the
 * client believing the server is still on it.
 */
async function recordVerificationFailure(ctx: ActionCtx, topUpId: Id<"topUps">, error: unknown): Promise<void> {
  try {
    await ctx.runMutation(internal.topups.markReceiptMissing, {
      topUpId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  } catch (markError) {
    // Do not mask the original failure; the row keeps its previous state.
    console.error("[topups] could not record verification failure", { topUpId, markError });
  }
}

// ============================================
// Public API
// ============================================

/**
 * Verify a BuyWidget payment on-chain and credit the purchased swipes.
 *
 * - Idempotent per canonical txHash — safe to retry from the client without a
 *   second payment.
 * - Owner-bound: swipes go to the Convex identity whose wallet actually paid
 *   (cUSD Transfer.from or tx.from), not to whoever submits the hash first.
 * - Durable: a pending row is written before the RPC lookup, and receipts that
 *   are not indexed yet are re-checked by the scheduler with backoff.
 * - Authoritative amounts: the plan is derived from the cUSD that reached the
 *   receiver; `planId` from the client is only a hint for the pending row.
 */
export const verifyAndCredit = action({
  args: {
    userId: v.id("waitlistUsers"),
    chain: v.string(),
    planId: v.string(),
    txHash: v.string(),
  },
  handler: async (ctx, args): Promise<TopUpVerifyOutcome> => {
    if (args.chain !== "celo") throw new Error("Unsupported chain");

    const txHash = canonicalizeTxHash(args.txHash);
    if (!txHash) throw new Error("Invalid transaction hash");

    const planHint = TOP_UP_PLANS[args.planId] ? args.planId : "unknown";

    const claim = await ctx.runMutation(internal.topups.ensurePendingTopUp, {
      userId: args.userId,
      chain: args.chain,
      planId: planHint,
      txHash,
    });

    if (claim.kind !== "proceed") return claim.outcome;

    try {
      return await verifyTopUpRecord(ctx, {
        topUpId: claim.topUpId,
        callerUserId: args.userId,
        txHash,
        chain: args.chain,
      });
    } catch (error) {
      // Config/RPC failure after the pending row exists: count the attempt and
      // schedule a retry, then surface the real error to the client (it keeps
      // the reference and can retry without paying again).
      console.error("[topups] verification failed", { txHash, error });
      await recordVerificationFailure(ctx, claim.topUpId, error);
      throw error;
    }
  },
});

/**
 * Status of one tracked payment for the account that owns it. Returns null
 * when the hash is unknown or belongs to a different account, so the client
 * cannot use it to probe other people's payments.
 */
export const getTopUpStatus = query({
  args: { userId: v.id("waitlistUsers"), txHash: v.string() },
  handler: async (ctx, args) => {
    const txHash = canonicalizeTxHash(args.txHash);
    if (!txHash) return null;

    const record = await ctx.db
      .query("topUps")
      .withIndex("by_txHash", (q) => q.eq("txHash", txHash))
      .first();
    if (!record || record.userId !== args.userId) return null;

    const credits = await ctx.db
      .query("credits")
      .withIndex("by_user_chain", (q) => q.eq("userId", args.userId).eq("chain", record.chain))
      .first();

    return {
      txHash: record.txHash,
      status: recordStatus(record),
      planId: record.planId,
      swipes: record.swipes,
      attempts: record.attempts ?? 0,
      willRetry: recordStatus(record) === "pending" && shouldScheduleRetry(record.attempts ?? 0),
      errorCode: record.errorCode ?? null,
      payer: record.payer ?? null,
      creditedAt: record.creditedAt ?? null,
      credits: { remaining: credits?.remaining ?? 0, max: credits?.max ?? 0 },
    };
  },
});

/** Payments for this account that still need attention (pending or held). */
export const listUnresolvedTopUps = query({
  args: { userId: v.id("waitlistUsers") },
  handler: async (ctx, args) => {
    const [pending, held] = await Promise.all([
      ctx.db
        .query("topUps")
        .withIndex("by_user_status", (q) => q.eq("userId", args.userId).eq("status", "pending"))
        .collect(),
      ctx.db
        .query("topUps")
        .withIndex("by_user_status", (q) => q.eq("userId", args.userId).eq("status", "held"))
        .collect(),
    ]);

    return [...pending, ...held]
      .sort((a, b) => b.ts - a.ts)
      .map((record) => ({
        txHash: record.txHash,
        status: recordStatus(record),
        planId: record.planId,
        attempts: record.attempts ?? 0,
        errorCode: record.errorCode ?? null,
        payer: record.payer ?? null,
        ts: record.ts,
      }));
  },
});

// ============================================
// Internal: durable retry
// ============================================

export const getTopUpById = internalQuery({
  args: { topUpId: v.id("topUps") },
  handler: async (ctx, args): Promise<Doc<"topUps"> | null> => await ctx.db.get(args.topUpId),
});

/** Scheduled re-check for a payment whose receipt was not indexed yet. */
export const reverifyPending = internalAction({
  args: { topUpId: v.id("topUps") },
  handler: async (ctx, args) => {
    const record = await ctx.runQuery(internal.topups.getTopUpById, { topUpId: args.topUpId });
    if (!record || recordStatus(record) !== "pending") return;

    try {
      await verifyTopUpRecord(ctx, {
        topUpId: record._id,
        callerUserId: record.userId,
        txHash: record.txHash,
        chain: record.chain,
      });
    } catch (error) {
      // RPC/config failure: count the attempt and keep the row pending so a
      // later scheduled or manual retry can still credit it.
      console.error("[topups] scheduled re-verification failed", { topUpId: args.topUpId, error });
      await recordVerificationFailure(ctx, args.topUpId, error);
    }
  },
});

// ============================================
// Internal mutations (the only writers of topUps/credits)
// ============================================

/**
 * Create the pending row for a hash, or short-circuit when it is already
 * settled. A pending/held row owned by another account is *not* a conflict —
 * ownership is decided by the on-chain payer at credit time.
 */
export const ensurePendingTopUp = internalMutation({
  args: {
    userId: v.id("waitlistUsers"),
    chain: v.string(),
    planId: v.string(),
    txHash: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ kind: "proceed"; topUpId: Id<"topUps"> } | { kind: "settled"; outcome: TopUpVerifyOutcome }> => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("Unknown account");

    const existing = await ctx.db
      .query("topUps")
      .withIndex("by_txHash", (q) => q.eq("txHash", args.txHash))
      .first();

    if (!existing) {
      const topUpId = await ctx.db.insert("topUps", {
        userId: args.userId,
        chain: args.chain,
        planId: args.planId,
        swipes: 0,
        amountUsd: "0.00",
        txHash: args.txHash,
        ts: Date.now(),
        status: "pending",
        attempts: 0,
      });
      return { kind: "proceed", topUpId };
    }

    const status = recordStatus(existing);

    if (status === "credited") {
      if (existing.userId !== args.userId) {
        return { kind: "settled", outcome: { outcome: "claimed_by_other", txHash: args.txHash } };
      }
      const credits = await getCreditsFor(ctx, args.userId, existing.chain);
      return {
        kind: "settled",
        outcome: {
          outcome: "already_credited",
          txHash: args.txHash,
          planId: existing.planId,
          swipesCredited: existing.swipes,
          remaining: credits?.remaining ?? 0,
          max: credits?.max ?? 0,
        },
      };
    }

    if (status === "rejected") {
      return {
        kind: "settled",
        outcome: {
          outcome: "rejected",
          txHash: args.txHash,
          reason: (existing.errorCode as TopUpRejectReason | undefined) ?? "no_matching_payment",
        },
      };
    }

    // pending / held: re-run verification. If a held payment's payer matches
    // this caller's wallet, hand the row over so the rightful owner is credited.
    if (
      existing.userId !== args.userId &&
      walletOwnsPayment(user.wallet, [existing.payer, existing.txFrom])
    ) {
      await ctx.db.patch(existing._id, { userId: args.userId });
    }

    return { kind: "proceed", topUpId: existing._id };
  },
});

/** Receipt not indexed yet (or RPC failed): count the attempt, schedule a retry. */
export const markReceiptMissing = internalMutation({
  args: { topUpId: v.id("topUps"), errorMessage: v.optional(v.string()) },
  handler: async (ctx, args): Promise<TopUpVerifyOutcome> => {
    const record = await ctx.db.get(args.topUpId);
    if (!record) throw new Error("Top-up record not found");

    const status = recordStatus(record);
    const attempts = (record.attempts ?? 0) + 1;
    const now = Date.now();

    if (status !== "pending") {
      // A settled/held row re-checked during an RPC hiccup keeps its verdict.
      await ctx.db.patch(record._id, { attempts, lastCheckedAt: now, errorMessage: args.errorMessage });
      if (status === "held") {
        return { outcome: "held", txHash: record.txHash, reason: toHoldReason(record.errorCode), payer: record.payer ?? null };
      }
      if (status === "rejected") {
        return {
          outcome: "rejected",
          txHash: record.txHash,
          reason: (record.errorCode as TopUpRejectReason | undefined) ?? "no_matching_payment",
        };
      }
      const credits = await getCreditsFor(ctx, record.userId, record.chain);
      return {
        outcome: "already_credited",
        txHash: record.txHash,
        planId: record.planId,
        swipesCredited: record.swipes,
        remaining: credits?.remaining ?? 0,
        max: credits?.max ?? 0,
      };
    }

    // A client "check now" while a scheduled re-check is still queued must not
    // start a second retry chain: one future job per row, tracked by nextRetryAt.
    // (2s tolerance so the scheduled job itself, which runs at ≈ nextRetryAt, always re-arms.)
    const alreadyScheduled = typeof record.nextRetryAt === "number" && record.nextRetryAt > now + 2_000;
    const willRetry = alreadyScheduled || shouldScheduleRetry(attempts);
    const delay = getRetryDelayMs(attempts);

    await ctx.db.patch(record._id, {
      attempts,
      lastCheckedAt: now,
      nextRetryAt: alreadyScheduled ? record.nextRetryAt : willRetry ? now + delay : undefined,
      errorCode: "receipt_not_found",
      errorMessage: args.errorMessage,
    });

    if (willRetry && !alreadyScheduled) {
      await ctx.scheduler.runAfter(delay, internal.topups.reverifyPending, { topUpId: record._id });
    }

    return { outcome: "pending", txHash: record.txHash, attempts, willRetry };
  },
});

export const rejectTopUp = internalMutation({
  args: {
    topUpId: v.id("topUps"),
    reason: v.union(v.literal("reverted"), v.literal("no_matching_payment")),
  },
  handler: async (ctx, args): Promise<TopUpVerifyOutcome> => {
    const record = await ctx.db.get(args.topUpId);
    if (!record) throw new Error("Top-up record not found");

    // Never downgrade a credited row.
    if (recordStatus(record) === "credited") {
      const credits = await getCreditsFor(ctx, record.userId, record.chain);
      return {
        outcome: "already_credited",
        txHash: record.txHash,
        planId: record.planId,
        swipesCredited: record.swipes,
        remaining: credits?.remaining ?? 0,
        max: credits?.max ?? 0,
      };
    }

    await ctx.db.patch(record._id, {
      status: "rejected",
      attempts: (record.attempts ?? 0) + 1,
      lastCheckedAt: Date.now(),
      nextRetryAt: undefined,
      errorCode: args.reason,
      errorMessage: undefined,
    });

    return { outcome: "rejected", txHash: record.txHash, reason: args.reason };
  },
});

/**
 * Real cUSD moved but cannot be credited as-is (wrong receiver — usually
 * client/server receiver config drift — or below the cheapest plan). Keeps
 * the evidence on the row and leaves it re-verifiable; never final.
 */
export const holdTopUp = internalMutation({
  args: {
    topUpId: v.id("topUps"),
    reason: v.union(v.literal("receiver_mismatch"), v.literal("amount_too_low")),
    payer: v.string(),
    txFrom: v.union(v.string(), v.null()),
    paidWei: v.string(),
    errorMessage: v.string(),
  },
  handler: async (ctx, args): Promise<TopUpVerifyOutcome> => {
    const record = await ctx.db.get(args.topUpId);
    if (!record) throw new Error("Top-up record not found");

    // Never downgrade a credited row.
    if (recordStatus(record) === "credited") {
      const credits = await getCreditsFor(ctx, record.userId, record.chain);
      return {
        outcome: "already_credited",
        txHash: record.txHash,
        planId: record.planId,
        swipesCredited: record.swipes,
        remaining: credits?.remaining ?? 0,
        max: credits?.max ?? 0,
      };
    }

    await ctx.db.patch(record._id, {
      status: "held",
      payer: args.payer,
      txFrom: args.txFrom ?? undefined,
      paidWei: args.paidWei,
      attempts: (record.attempts ?? 0) + 1,
      lastCheckedAt: Date.now(),
      nextRetryAt: undefined,
      errorCode: args.reason,
      errorMessage: args.errorMessage,
    });

    return { outcome: "held", txHash: record.txHash, reason: args.reason, payer: args.payer };
  },
});

/**
 * Credit a verified payment exactly once, to the account whose wallet paid.
 * Runs as a single Convex transaction, so concurrent retries cannot double-credit.
 */
export const creditVerifiedTopUp = internalMutation({
  args: {
    topUpId: v.id("topUps"),
    callerUserId: v.id("waitlistUsers"),
    chain: v.string(),
    planId: v.string(),
    swipes: v.number(),
    amountUsd: v.string(),
    payer: v.string(),
    txFrom: v.union(v.string(), v.null()),
    paidWei: v.string(),
  },
  handler: async (ctx, args): Promise<TopUpVerifyOutcome> => {
    const record = await ctx.db.get(args.topUpId);
    if (!record) throw new Error("Top-up record not found");

    if (recordStatus(record) === "credited") {
      if (record.userId !== args.callerUserId) {
        return { outcome: "claimed_by_other", txHash: record.txHash };
      }
      const credits = await getCreditsFor(ctx, record.userId, record.chain);
      return {
        outcome: "already_credited",
        txHash: record.txHash,
        planId: record.planId,
        swipesCredited: record.swipes,
        remaining: credits?.remaining ?? 0,
        max: credits?.max ?? 0,
      };
    }

    // Resolve the owner from the chain, not from the caller.
    const candidates = [args.payer, args.txFrom];
    const caller = await ctx.db.get(args.callerUserId);
    let owner: Doc<"waitlistUsers"> | null =
      caller && walletOwnsPayment(caller.wallet, candidates) ? caller : null;

    if (!owner) {
      for (const candidate of candidates) {
        const wallet = canonicalizeAddress(candidate);
        if (!wallet) continue;
        const match = await ctx.db
          .query("waitlistUsers")
          .withIndex("by_wallet", (q) => q.eq("wallet", wallet))
          .first();
        if (match) {
          owner = match;
          break;
        }
      }
    }

    const now = Date.now();

    if (!owner) {
      // Real payment, but from a wallet no account has connected (e.g. a fiat
      // on-ramp hot wallet). Keep the evidence; do not credit the claimer.
      await ctx.db.patch(record._id, {
        status: "held",
        payer: args.payer,
        txFrom: args.txFrom ?? undefined,
        paidWei: args.paidWei,
        planId: args.planId,
        attempts: (record.attempts ?? 0) + 1,
        lastCheckedAt: now,
        nextRetryAt: undefined,
        errorCode: "payer_mismatch",
        errorMessage: undefined,
      });
      return { outcome: "held", txHash: record.txHash, reason: "payer_mismatch", payer: args.payer };
    }

    const credits = await getCreditsFor(ctx, owner._id, args.chain);
    let remaining: number;
    let max: number;
    if (credits) {
      remaining = credits.remaining + args.swipes;
      max = Math.max(credits.max, remaining);
      await ctx.db.patch(credits._id, { remaining, max });
    } else {
      remaining = args.swipes;
      max = args.swipes;
      await ctx.db.insert("credits", { userId: owner._id, chain: args.chain, remaining, max });
    }

    await ctx.db.patch(record._id, {
      userId: owner._id,
      status: "credited",
      planId: args.planId,
      swipes: args.swipes,
      amountUsd: args.amountUsd,
      payer: args.payer,
      txFrom: args.txFrom ?? undefined,
      paidWei: args.paidWei,
      attempts: (record.attempts ?? 0) + 1,
      lastCheckedAt: now,
      nextRetryAt: undefined,
      creditedAt: now,
      errorCode: undefined,
      errorMessage: undefined,
    });

    await markDashboardStatsDirty(ctx);

    if (owner._id !== args.callerUserId) {
      // The payer's account got the swipes; the caller was not the payer.
      return { outcome: "claimed_by_other", txHash: record.txHash };
    }

    return {
      outcome: "credited",
      txHash: record.txHash,
      planId: args.planId,
      swipesCredited: args.swipes,
      remaining,
      max,
    };
  },
});
