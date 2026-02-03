import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    walletAddress: v.string(), // Keeping string for address
    username: v.optional(v.string()),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    reputation: v.number(),
    streak: v.number(),
    level: v.string(), // Enum 'Beginner', etc.
    points: v.number(),
    donations: v.number(), // Storing as basic number for now, maybe string if large
    isFollowing: v.boolean(),
    lastActive: v.number(), // Timestamp
    // Timestamps are handled by system ts usually, but good to have dedicated if logic needs it
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
    creatorAddress: v.string(), // from cachedCampaigns logic
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
});
