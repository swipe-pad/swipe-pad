import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { markDashboardStatsDirty } from "./waitlist";

// Server-side source of truth for purchasable plans. Must stay in sync with
// src/lib/top-up-plans.ts — the client copy only drives the UI; crediting is
// decided here so a tampered client cannot buy cheap and credit big.
const PLANS: Record<string, { swipes: number; amountUsd: string }> = {
  starter: { swipes: 20, amountUsd: "1.00" },
  session: { swipes: 50, amountUsd: "2.50" },
  power: { swipes: 120, amountUsd: "5.00" },
};

const CUSD_CELO = "0x765de816845861e75a25fca122bb6898b8b1282a";
const ERC20_TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const RECEIPT_RETRIES = 5;
const RECEIPT_RETRY_MS = 2000;

function usdToWei(amountUsd: string): bigint {
  const cents = Math.round(Number(amountUsd) * 100);
  return BigInt(cents) * 10n ** 16n;
}

function topicToAddress(topic: string): string {
  return `0x${topic.slice(-40)}`.toLowerCase();
}

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

type TransactionReceipt = {
  status: string;
  logs: Array<{ address: string; topics: string[]; data: string }>;
};

/**
 * Verify a BuyWidget payment on-chain and credit the purchased swipes.
 * Idempotent per txHash — safe to retry from the client.
 */
export const verifyAndCredit = action({
  args: {
    userId: v.id("waitlistUsers"),
    chain: v.string(),
    planId: v.string(),
    txHash: v.string(),
  },
  handler: async (ctx, args): Promise<{ credited: boolean; alreadyCredited: boolean; remaining: number; max: number }> => {
    if (args.chain !== "celo") throw new Error("Unsupported chain");

    const plan = PLANS[args.planId];
    if (!plan) throw new Error("Unknown top-up plan");

    const receiver = process.env.TOP_UP_RECEIVER_ADDRESS?.toLowerCase();
    if (!receiver?.startsWith("0x")) {
      throw new Error("TOP_UP_RECEIVER_ADDRESS not configured in Convex env");
    }

    let receipt: TransactionReceipt | null = null;
    for (let i = 0; i < RECEIPT_RETRIES; i++) {
      receipt = (await rpcCall("eth_getTransactionReceipt", [args.txHash])) as TransactionReceipt | null;
      if (receipt) break;
      await new Promise((resolve) => setTimeout(resolve, RECEIPT_RETRY_MS));
    }
    if (!receipt) throw new Error("Transaction not found on Celo yet — retry in a moment");
    if (receipt.status !== "0x1") throw new Error("Payment transaction reverted");

    const requiredWei = usdToWei(plan.amountUsd);
    const paid = receipt.logs.some(
      (log) =>
        log.address.toLowerCase() === CUSD_CELO &&
        log.topics[0] === ERC20_TRANSFER_TOPIC &&
        log.topics.length >= 3 &&
        topicToAddress(log.topics[2]) === receiver &&
        BigInt(log.data) >= requiredWei
    );
    if (!paid) throw new Error("No matching cUSD payment to the top-up receiver in this transaction");

    return await ctx.runMutation(internal.topups.creditVerifiedTopUp, {
      userId: args.userId,
      chain: args.chain,
      planId: args.planId,
      swipes: plan.swipes,
      amountUsd: plan.amountUsd,
      txHash: args.txHash,
    });
  },
});

export const creditVerifiedTopUp = internalMutation({
  args: {
    userId: v.id("waitlistUsers"),
    chain: v.string(),
    planId: v.string(),
    swipes: v.number(),
    amountUsd: v.string(),
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("topUps")
      .withIndex("by_txHash", (q) => q.eq("txHash", args.txHash))
      .first();

    const credits = await ctx.db
      .query("credits")
      .withIndex("by_user_chain", (q) => q.eq("userId", args.userId).eq("chain", args.chain))
      .first();

    if (existing) {
      return {
        credited: false,
        alreadyCredited: true,
        remaining: credits?.remaining ?? 0,
        max: credits?.max ?? 0,
      };
    }

    await ctx.db.insert("topUps", {
      userId: args.userId,
      chain: args.chain,
      planId: args.planId,
      swipes: args.swipes,
      amountUsd: args.amountUsd,
      txHash: args.txHash,
      ts: Date.now(),
    });

    let remaining: number;
    let max: number;
    if (credits) {
      remaining = credits.remaining + args.swipes;
      max = Math.max(credits.max, remaining);
      await ctx.db.patch(credits._id, { remaining, max });
    } else {
      remaining = args.swipes;
      max = args.swipes;
      await ctx.db.insert("credits", { userId: args.userId, chain: args.chain, remaining, max });
    }

    await markDashboardStatsDirty(ctx);

    return { credited: true, alreadyCredited: false, remaining, max };
  },
});
