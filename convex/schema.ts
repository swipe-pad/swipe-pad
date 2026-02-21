import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // Core User Tables (existing)
  // ============================================
  users: defineTable({
    walletAddress: v.string(),
    username: v.optional(v.string()),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    reputation: v.number(),
    streak: v.number(),
    level: v.string(),
    points: v.number(),
    donations: v.number(),
    isFollowing: v.boolean(),
    lastActive: v.number(),
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_username", ["username"]),

  userSettings: defineTable({
    userId: v.id("users"),
    currency: v.string(),
    language: v.string(),
    region: v.string(),
    defaultDonationAmount: v.number(),
    autoBatch: v.boolean(),
  }).index("by_user", ["userId"]),

  campaigns: defineTable({
    title: v.string(),
    category: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    fundingGoal: v.number(),
    currentFunding: v.number(),
    websiteUrl: v.optional(v.string()),
    sponsorBoosted: v.boolean(),
    creatorAddress: v.string(),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_category", ["category"]),

  donations: defineTable({
    txHash: v.string(),
    donorAddress: v.string(),
    campaignId: v.id("campaigns"),
    amount: v.number(),
    tokenAddress: v.optional(v.string()),
    donatedAt: v.number(),
  }).index("by_campaign", ["campaignId"]),

  achievements: defineTable({
    icon: v.string(),
    title: v.string(),
    description: v.string(),
  }),

  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    unlocked: v.boolean(),
    unlockedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // ============================================
  // Beta Program Tables
  // ============================================

  /** Beta waitlist users with approval status */
  waitlistUsers: defineTable({
    wallet: v.optional(v.string()),
    farcasterFid: v.optional(v.string()),
    email: v.optional(v.string()),
    inviteCode: v.optional(v.string()),
    referredBy: v.optional(v.id("waitlistUsers")),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("active"),
      v.literal("guest"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    approvedAt: v.optional(v.number()),
  })
    .index("by_wallet", ["wallet"])
    .index("by_fid", ["farcasterFid"])
    .index("by_status", ["status"]),

  /** Swipe credits per user per chain */
  credits: defineTable({
    userId: v.id("waitlistUsers"),
    chain: v.string(), // "celo" | "base"
    remaining: v.number(),
    max: v.number(),
    lastClaimAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_chain", ["userId", "chain"]),

  /** Swipe events for analytics */
  swipeEvents: defineTable({
    userId: v.id("waitlistUsers"),
    projectId: v.string(),
    direction: v.union(v.literal("left"), v.literal("right")),
    amount: v.optional(v.number()), // Amount if swiped right
    ts: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"]),

  /** Curated projects for beta feed */
  projects: defineTable({
    projectId: v.string(), // External ID (e.g., from Karma GAP)
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    category: v.string(),
    recipientWallet: v.string(),
    chain: v.string(), // "celo" | "base"
    source: v.string(), // "karma" | "manual" | "gitcoin" | "hypercerts" | "talent"
    verifiedLevel: v.number(), // 0=unverified, 1=basic, 2=full
    featured: v.boolean(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),

    // === Karma GAP Integration ===
    gapProjectUid: v.optional(v.string()), // EAS attestation UID
    gapCommunityId: v.optional(v.string()), // Community slug (e.g., "celo")
    grantId: v.optional(v.string()), // Grant attestation UID
    totalMilestones: v.optional(v.number()),
    completedMilestones: v.optional(v.number()),
    lastGapUpdate: v.optional(v.number()), // Timestamp of last sync

    // === Social Links ===
    website: v.optional(v.string()),
    twitter: v.optional(v.string()),
    github: v.optional(v.string()),
    farcaster: v.optional(v.string()),
    linkedin: v.optional(v.string()),
  })
    .index("by_chain", ["chain", "active"])
    .index("by_projectId", ["projectId"])
    .index("by_featured", ["featured", "active"])
    .index("by_source", ["source", "active"]),

  /** Beta donations (relayer-executed) */
  betaDonations: defineTable({
    userId: v.id("waitlistUsers"),
    txHash: v.optional(v.string()), // Set after broadcast
    chain: v.string(),
    token: v.string(),
    recipients: v.array(v.string()),
    amounts: v.array(v.number()),
    totalAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("submitted"),
      v.literal("confirmed"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    confirmedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_tx", ["txHash"])
    .index("by_status", ["status"]),

  /** User feedback for beta */
  feedback: defineTable({
    userId: v.id("waitlistUsers"),
    rating: v.number(), // 1-5
    text: v.string(),
    context: v.string(), // "post_donation" | "general" | "bug"
    ts: v.number(),
  }).index("by_user", ["userId"]),
});
