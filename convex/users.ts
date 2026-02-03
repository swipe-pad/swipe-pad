import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";

// Placeholder until `npx convex dev` is run to generate server types.
/*
export const getUser = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();
  },
});

export const createUser = mutation({
  args: {
    walletAddress: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      walletAddress: args.walletAddress,
      name: args.name,
      reputation: 0,
      streak: 0,
      level: "Beginner",
      points: 0,
      donations: 0,
      isFollowing: false,
      lastActive: Date.now(),
    });
  },
});
*/
