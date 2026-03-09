import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireAdmin } from "./admin";

const DEFAULT_CREDITS = 25;
const GUEST_DEFAULT_CREDITS = 15;
const ADMIN_DASHBOARD_MATERIALIZED_TTL_MS = 5 * 60_000;
const ADMIN_LIST_SCAN_PAGES = 3;
const ADMIN_LIST_SCAN_BATCH = 25;

type AdminDashboardSnapshot = {
  users: {
    total: number;
    guestUsers: number;
    thirdwebLikeAccounts: number;
    byStatus: Record<string, number>;
  };
  projects: {
    total: number;
    active: number;
    featured: number;
    bySource: Record<string, number>;
    byChain: Record<string, number>;
  };
  donations: {
    total: number;
    totalAmount: number;
    byStatus: Record<string, number>;
  };
  credits: {
    totalRows: number;
    remaining: number;
    max: number;
  };
  swipes: {
    recentCount: number;
  };
  generatedAt: number;
};

async function buildAdminDashboardSnapshot(ctx: any): Promise<AdminDashboardSnapshot> {
  const users = await ctx.db.query("waitlistUsers").collect();
  const projects = await ctx.db.query("projects").collect();
  const donations = await ctx.db.query("betaDonations").collect();
  const credits = await ctx.db.query("credits").collect();
  const swipes = await ctx.db.query("swipeEvents").order("desc").take(10);

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
    userStatusCounts[user.status as "pending" | "approved" | "active" | "guest" | "rejected"] += 1;

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

  const totalCreditsRemaining = credits.reduce((acc: number, item: { remaining: number }) => acc + item.remaining, 0);
  const totalCreditsMax = credits.reduce((acc: number, item: { max: number }) => acc + item.max, 0);

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
    generatedAt: Date.now(),
  };
}

export async function markDashboardStatsDirty(ctx: MutationCtx) {
  const row = await ctx.db
    .query("dashboardStats")
    .withIndex("by_name", (q) => q.eq("name", "admin"))
    .first();

  if (!row || row.generatedAt === 0) return;

  await ctx.db.patch(row._id, {
    generatedAt: 0,
  });
}

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

    await markDashboardStatsDirty(ctx);

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

    await markDashboardStatsDirty(ctx);

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
    await markDashboardStatsDirty(ctx);
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

    await markDashboardStatsDirty(ctx);

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
    await markDashboardStatsDirty(ctx);

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
    await markDashboardStatsDirty(ctx);
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
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("dashboardStats")
      .withIndex("by_name", (q) => q.eq("name", "admin"))
      .first();

    if (!row) {
      return {
        users: { total: 0, guestUsers: 0, thirdwebLikeAccounts: 0, byStatus: {} },
        projects: { total: 0, active: 0, featured: 0, bySource: {}, byChain: {} },
        donations: { total: 0, totalAmount: 0, byStatus: {} },
        credits: { totalRows: 0, remaining: 0, max: 0 },
        swipes: { recentCount: 0 },
        generatedAt: 0,
      } satisfies AdminDashboardSnapshot;
    }

    return JSON.parse(row.payloadJson) as AdminDashboardSnapshot;
  },
});

/** Recompute and materialize dashboard stats snapshot */
export const refreshAdminDashboardStats = mutation({
  args: {
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const row = await ctx.db
      .query("dashboardStats")
      .withIndex("by_name", (q) => q.eq("name", "admin"))
      .first();

    if (row && !args.force && now - row.generatedAt < ADMIN_DASHBOARD_MATERIALIZED_TTL_MS) {
      return JSON.parse(row.payloadJson) as AdminDashboardSnapshot;
    }

    const snapshot = await buildAdminDashboardSnapshot(ctx);
    const payloadJson = JSON.stringify(snapshot);

    if (row) {
      await ctx.db.patch(row._id, {
        generatedAt: snapshot.generatedAt,
        payloadJson,
      });
    } else {
      await ctx.db.insert("dashboardStats", {
        name: "admin",
        generatedAt: snapshot.generatedAt,
        payloadJson,
      });
    }

    return snapshot;
  },
});

/** Admin users explorer with search (intended for local/dev tooling) */
export const listUsersForAdmin = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const normalizedSearch = (args.search ?? "").trim().toLowerCase();
    const statusFilter = (args.status ?? "all").toLowerCase();
    const allowedStatuses = new Set(["all", "pending", "approved", "active", "guest", "rejected"]);
    if (!allowedStatuses.has(statusFilter)) {
      return { rows: [], continueCursor: args.paginationOpts.cursor, isDone: true };
    }
    const limit = Math.min(Math.max(args.paginationOpts.numItems ?? 10, 1), 10);

    const rows: Array<{
      id: string;
      wallet: string | null;
      status: string;
      farcasterFid: string | null;
      email: string | null;
      createdAt: number;
      approvedAt: number | null;
      isGuestLike: boolean;
      usage: null;
    }> = [];

    let cursor: string | null = args.paginationOpts.cursor;
    let scannedPages = 0;
    let isDone = false;

    const paginateUsersPage = async (pageCursor: string | null) => {
      if (statusFilter !== "all") {
        return await ctx.db
          .query("waitlistUsers")
          .withIndex("by_status_createdAt", (q) =>
            q.eq("status", statusFilter as "pending" | "approved" | "active" | "guest" | "rejected")
          )
          .order("desc")
          .paginate({
            cursor: pageCursor,
            numItems: ADMIN_LIST_SCAN_BATCH,
          });
      }

      return await ctx.db
        .query("waitlistUsers")
        .withIndex("by_createdAt")
        .order("desc")
        .paginate({
          cursor: pageCursor,
          numItems: ADMIN_LIST_SCAN_BATCH,
        });
    };

    while (rows.length < limit && scannedPages < ADMIN_LIST_SCAN_PAGES) {
      const page = await paginateUsersPage(cursor);

      for (const user of page.page) {
        if (statusFilter !== "all" && user.status !== statusFilter) continue;
        if (normalizedSearch) {
          const haystack = [
            user.wallet ?? "",
            user.farcasterFid ?? "",
            user.email ?? "",
            user.status,
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(normalizedSearch)) continue;
        }

        const wallet = user.wallet ?? null;
        const isGuestLike = user.status === "guest" || (wallet?.startsWith("guest-") ?? false);

        rows.push({
          id: user._id,
          wallet,
          status: user.status,
          farcasterFid: user.farcasterFid ?? null,
          email: user.email ?? null,
          createdAt: user.createdAt,
          approvedAt: user.approvedAt ?? null,
          isGuestLike,
          usage: null,
        });

        if (rows.length >= limit) break;
      }

      cursor = page.continueCursor;
      isDone = page.isDone;
      scannedPages += 1;
      if (page.isDone) break;
    }

    return {
      rows,
      continueCursor: cursor,
      isDone,
    };
  },
});

/** Archive or delete guest users for cleaner local/dev metrics */
export const cleanupGuestUserDev = mutation({
  args: {
    userId: v.id("waitlistUsers"),
    mode: v.union(v.literal("archive"), v.literal("delete")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const wallet = user.wallet ?? "";
    const isGuestLike = user.status === "guest" || wallet.startsWith("guest-");
    if (!isGuestLike) {
      throw new Error("Only guest-like accounts can be cleaned");
    }

    const [credits, swipes, donations, feedback] = await Promise.all([
      ctx.db.query("credits").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("swipeEvents").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("betaDonations").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("feedback").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
    ]);

    const hasUsage = swipes.length > 0 || donations.length > 0 || feedback.length > 0;

    if (args.mode === "delete") {
      if (hasUsage) {
        throw new Error("Cannot delete guest with activity; archive instead");
      }

      for (const row of credits) {
        await ctx.db.delete(row._id);
      }

      await ctx.db.delete(user._id);
      await markDashboardStatsDirty(ctx);
      return { ok: true, action: "deleted" as const };
    }

    const archivedWallet = user.wallet
      ? `archived-${Date.now()}-${user._id}-${user.wallet}`.slice(0, 240)
      : undefined;

    await ctx.db.patch(user._id, {
      status: "rejected",
      wallet: archivedWallet,
    });

    for (const row of credits) {
      await ctx.db.patch(row._id, { remaining: 0, max: 0 });
    }

    await markDashboardStatsDirty(ctx);

    return { ok: true, action: "archived" as const };
  },
});
