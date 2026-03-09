import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { markDashboardStatsDirty } from "./waitlist";

// ============================================
// Queries
// ============================================

/** Get user's pending donations */
export const getPendingDonations = query({
  args: { userId: v.id("waitlistUsers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("betaDonations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

/** Get donation by ID */
export const getDonation = query({
  args: { donationId: v.id("betaDonations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.donationId);
  },
});

/** Get user's donation history */
export const getDonationHistory = query({
  args: { userId: v.id("waitlistUsers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("betaDonations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

// ============================================
// Mutations
// ============================================

/** Prepare a donation batch (validates and reserves credits) */
export const prepareDonation = mutation({
  args: {
    userId: v.id("waitlistUsers"),
    chain: v.string(),
    cart: v.array(
      v.object({
        projectId: v.string(),
        amount: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // 1. Validate user is active
    const user = await ctx.db.get(args.userId);
    if (!user || user.status !== "active") {
      throw new Error("User not authorized for donations");
    }

    // 2. Check credits
    const credits = await ctx.db
      .query("credits")
      .withIndex("by_user_chain", (q) =>
        q.eq("userId", args.userId).eq("chain", args.chain)
      )
      .first();

    const totalSwipes = args.cart.length;
    if (!credits || credits.remaining < totalSwipes) {
      throw new Error(
        `Insufficient credits. Need ${totalSwipes}, have ${credits?.remaining ?? 0}`
      );
    }

    // 3. Resolve recipients from projects
    const recipients: string[] = [];
    const amounts: number[] = [];

    for (const item of args.cart) {
      const project = await ctx.db
        .query("projects")
        .withIndex("by_projectId", (q) => q.eq("projectId", item.projectId))
        .first();

      if (!project) {
        throw new Error(`Project not found: ${item.projectId}`);
      }
      if (!project.active) {
        throw new Error(`Project inactive: ${item.projectId}`);
      }
      if (project.chain !== args.chain) {
        throw new Error(`Project ${item.projectId} not on ${args.chain}`);
      }

      recipients.push(project.recipientWallet);
      amounts.push(item.amount);
    }

    // 4. Decrement credits
    await ctx.db.patch(credits._id, {
      remaining: credits.remaining - totalSwipes,
    });

    // 5. Create pending donation record
    const donationId = await ctx.db.insert("betaDonations", {
      userId: args.userId,
      chain: args.chain,
      token: args.chain === "celo" ? "cUSD" : "USDC",
      recipients,
      amounts,
      totalAmount: amounts.reduce((a, b) => a + b, 0),
      status: "pending",
      createdAt: Date.now(),
    });

    await markDashboardStatsDirty(ctx);

    return {
      donationId,
      recipients,
      amounts,
      totalAmount: amounts.reduce((a, b) => a + b, 0),
      token: args.chain === "celo" ? "cUSD" : "USDC",
    };
  },
});

/** Mark donation as submitted (tx broadcasted) */
export const markSubmitted = mutation({
  args: {
    donationId: v.id("betaDonations"),
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.donationId, {
      status: "submitted",
      txHash: args.txHash,
    });
    await markDashboardStatsDirty(ctx);
  },
});

/** Mark donation as confirmed */
export const markConfirmed = mutation({
  args: { donationId: v.id("betaDonations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.donationId, {
      status: "confirmed",
      confirmedAt: Date.now(),
    });
    await markDashboardStatsDirty(ctx);
  },
});

/** Mark donation as failed */
export const markFailed = mutation({
  args: {
    donationId: v.id("betaDonations"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const donation = await ctx.db.get(args.donationId);
    if (!donation) return;

    // Refund credits
    const credits = await ctx.db
      .query("credits")
      .withIndex("by_user_chain", (q) =>
        q.eq("userId", donation.userId).eq("chain", donation.chain)
      )
      .first();

    if (credits) {
      await ctx.db.patch(credits._id, {
        remaining: credits.remaining + donation.recipients.length,
      });
    }

    await ctx.db.patch(args.donationId, {
      status: "failed",
      errorMessage: args.errorMessage,
    });
    await markDashboardStatsDirty(ctx);
  },
});
