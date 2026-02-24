import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./admin";

const DEFAULT_CREDITS = 25;
const GUEST_DEFAULT_CREDITS = 15;

// ============================================
// Queries
// ============================================

/** Get waitlist user by wallet address */
export const getByWallet = query({
  args: { wallet: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.wallet.toLowerCase();
    return await ctx.db
      .query("waitlistUsers")
      .withIndex("by_wallet", (q) => q.eq("wallet", normalized))
      .first();
  },
});

/** Get waitlist user by Farcaster FID */
export const getByFid = query({
  args: { fid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("waitlistUsers")
      .withIndex("by_fid", (q) => q.eq("farcasterFid", args.fid))
      .first();
  },
});

/** Get user's credits for a chain */
export const getCredits = query({
  args: { userId: v.id("waitlistUsers"), chain: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("credits")
      .withIndex("by_user_chain", (q) =>
        q.eq("userId", args.userId).eq("chain", args.chain)
      )
      .first();
  },
});

/** Get all approved waitlist users */
export const getAllApproved = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("waitlistUsers")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
  },
});

// ============================================
// Mutations
// ============================================

/** Join the waitlist */
export const joinWaitlist = mutation({
  args: {
    wallet: v.optional(v.string()),
    farcasterFid: v.optional(v.string()),
    email: v.optional(v.string()),
    inviteCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already registered
    if (args.wallet) {
      const normalizedWallet = args.wallet.toLowerCase();
      const existing = await ctx.db
        .query("waitlistUsers")
        .withIndex("by_wallet", (q) => q.eq("wallet", normalizedWallet))
        .first();
      if (existing) return { userId: existing._id, status: existing.status };
    }

    if (args.farcasterFid) {
      const existing = await ctx.db
        .query("waitlistUsers")
        .withIndex("by_fid", (q) => q.eq("farcasterFid", args.farcasterFid))
        .first();
      if (existing) return { userId: existing._id, status: existing.status };
    }

    // Create new waitlist entry
    const userId = await ctx.db.insert("waitlistUsers", {
      wallet: args.wallet ? args.wallet.toLowerCase() : undefined,
      farcasterFid: args.farcasterFid,
      email: args.email,
      inviteCode: args.inviteCode,
      status: "pending",
      createdAt: Date.now(),
    });

    return { userId, status: "pending" as const };
  },
});

/** Approve a waitlist user (admin only) */
export const approveUser = mutation({
  args: {
    adminKey: v.string(),
    callerWallet: v.optional(v.string()),
    userId: v.id("waitlistUsers"),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Update status
    await ctx.db.patch(args.userId, {
      status: "approved",
      approvedAt: Date.now(),
    });

    // Initialize credits for both chains
    for (const chain of ["celo", "base"]) {
      await ctx.db.insert("credits", {
        userId: args.userId,
        chain,
        remaining: DEFAULT_CREDITS,
        max: DEFAULT_CREDITS,
      });
    }

    return { success: true };
  },
});

/** Activate user (first login after approval) */
export const activateUser = mutation({
  args: { userId: v.id("waitlistUsers"), wallet: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (!user.wallet || user.wallet.toLowerCase() !== args.wallet.toLowerCase()) {
      throw new Error("Wallet does not match");
    }
    if (user.status !== "approved") {
      throw new Error("User not approved yet");
    }

    await ctx.db.patch(args.userId, { status: "active" });
    return { success: true };
  },
});

/** Ensure guest user and credits for a wallet */
export const ensureGuestUser = mutation({
  args: { wallet: v.string(), chain: v.string() },
  handler: async (ctx, args) => {
    const normalizedWallet = args.wallet.toLowerCase();
    let user = await ctx.db
      .query("waitlistUsers")
      .withIndex("by_wallet", (q) => q.eq("wallet", normalizedWallet))
      .first();

    if (!user) {
      const userId = await ctx.db.insert("waitlistUsers", {
        wallet: normalizedWallet,
        status: "guest",
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }

    if (!user) {
      throw new Error("Unable to create guest user");
    }

    let userRecord = user;

    if (userRecord.status === "approved") {
      await ctx.db.patch(userRecord._id, { status: "active" });
      const refreshed = await ctx.db.get(userRecord._id);
      if (refreshed) {
        userRecord = refreshed;
      }
    }

    let credits = await ctx.db
      .query("credits")
      .withIndex("by_user_chain", (q) =>
        q.eq("userId", userRecord._id).eq("chain", args.chain)
      )
      .first();

    if (!credits) {
      const defaultCredits = userRecord.status === "guest" ? GUEST_DEFAULT_CREDITS : DEFAULT_CREDITS;
      const creditsId = await ctx.db.insert("credits", {
        userId: userRecord._id,
        chain: args.chain,
        remaining: defaultCredits,
        max: defaultCredits,
      });
      credits = await ctx.db.get(creditsId);
    }

    return {
      userId: userRecord._id,
      status: userRecord.status,
      remaining: credits?.remaining ?? 0,
      max: credits?.max ?? 0,
    };
  },
});

/** Consume swipe credits for guest/active users */
export const consumeCredits = mutation({
  args: {
    userId: v.id("waitlistUsers"),
    chain: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) throw new Error("Invalid amount");

    const user = await ctx.db.get(args.userId);
    if (!user || (user.status !== "active" && user.status !== "guest")) {
      throw new Error("User not authorized");
    }

    const credits = await ctx.db
      .query("credits")
      .withIndex("by_user_chain", (q) =>
        q.eq("userId", args.userId).eq("chain", args.chain)
      )
      .first();

    if (!credits || credits.remaining < args.amount) {
      throw new Error("Insufficient credits");
    }

    const newRemaining = credits.remaining - args.amount;
    await ctx.db.patch(credits._id, { remaining: newRemaining });

    return { remaining: newRemaining, max: credits.max };
  },
});

/** Record a swipe event */
export const recordSwipe = mutation({
  args: {
    userId: v.id("waitlistUsers"),
    projectId: v.string(),
    direction: v.union(v.literal("left"), v.literal("right")),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("swipeEvents", {
      userId: args.userId,
      projectId: args.projectId,
      direction: args.direction,
      amount: args.amount,
      ts: Date.now(),
    });
  },
});

/** Submit feedback */
export const submitFeedback = mutation({
  args: {
    userId: v.id("waitlistUsers"),
    rating: v.number(),
    text: v.string(),
    context: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("feedback", {
      userId: args.userId,
      rating: args.rating,
      text: args.text,
      context: args.context,
      ts: Date.now(),
    });
    return { success: true };
  },
});

/** Admin dashboard overview (no auth guard yet) */
export const getAdminDashboard = query({
  args: {
    recentProjectsLimit: v.optional(v.number()),
    recentUsersLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const recentProjectsLimit = Math.min(Math.max(args.recentProjectsLimit ?? 100, 1), 500);
    const recentUsersLimit = Math.min(Math.max(args.recentUsersLimit ?? 25, 1), 200);

    const users = await ctx.db.query("waitlistUsers").collect();
    const projects = await ctx.db.query("projects").collect();
    const donations = await ctx.db.query("betaDonations").collect();
    const credits = await ctx.db.query("credits").collect();
    const swipes = await ctx.db.query("swipeEvents").order("desc").take(200);

    const userStatusCounts = {
      pending: 0,
      approved: 0,
      active: 0,
      guest: 0,
      rejected: 0,
    } as Record<"pending" | "approved" | "active" | "guest" | "rejected", number>;

    let thirdwebLikeAccounts = 0;
    let guestUsers = 0;

    for (const user of users) {
      userStatusCounts[user.status] += 1;

      const wallet = user.wallet ?? "";
      const isGuestWallet = wallet.startsWith("guest-");

      if (user.status === "guest" || isGuestWallet) {
        guestUsers += 1;
      } else if (wallet.startsWith("0x")) {
        thirdwebLikeAccounts += 1;
      }
    }

    const projectSourceCounts: Record<string, number> = {};
    const projectChainCounts: Record<string, number> = {};
    let activeProjects = 0;
    let featuredProjects = 0;

    for (const project of projects) {
      if (project.active) activeProjects += 1;
      if (project.featured) featuredProjects += 1;

      projectSourceCounts[project.source] = (projectSourceCounts[project.source] ?? 0) + 1;
      projectChainCounts[project.chain] = (projectChainCounts[project.chain] ?? 0) + 1;
    }

    const donationStatusCounts: Record<string, number> = {};
    let totalDonationsAmount = 0;

    for (const donation of donations) {
      donationStatusCounts[donation.status] = (donationStatusCounts[donation.status] ?? 0) + 1;
      totalDonationsAmount += donation.totalAmount;
    }

    const totalCreditsRemaining = credits.reduce((acc, item) => acc + item.remaining, 0);
    const totalCreditsMax = credits.reduce((acc, item) => acc + item.max, 0);

    const recentUsers = users
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, recentUsersLimit)
      .map((user) => ({
        id: user._id,
        wallet: user.wallet ?? null,
        status: user.status,
        createdAt: user.createdAt,
      }));

    const recentProjects = projects
      .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
      .slice(0, recentProjectsLimit)
      .map((project) => ({
        id: project._id,
        projectId: project.projectId,
        title: project.title,
        source: project.source,
        chain: project.chain,
        active: project.active,
        featured: project.featured,
        updatedAt: project.updatedAt ?? project.createdAt,
      }));

    return {
      users: {
        total: users.length,
        guestUsers,
        thirdwebLikeAccounts,
        byStatus: userStatusCounts,
      },
      projects: {
        total: projects.length,
        active: activeProjects,
        featured: featuredProjects,
        bySource: projectSourceCounts,
        byChain: projectChainCounts,
      },
      donations: {
        total: donations.length,
        totalAmount: totalDonationsAmount,
        byStatus: donationStatusCounts,
      },
      credits: {
        totalRows: credits.length,
        remaining: totalCreditsRemaining,
        max: totalCreditsMax,
      },
      swipes: {
        recentCount: swipes.length,
      },
      recentUsers,
      recentProjects,
      generatedAt: Date.now(),
    };
  },
});
