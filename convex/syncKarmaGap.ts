import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { requireAdmin } from "./admin";
import { internal } from "./_generated/api";

// ============================================
// Karma GAP Sync Action
// ============================================

/**
 * Sync projects from Karma GAP for a specific community.
 * Uses the GAP indexer API to fetch project attestations.
 *
 * @see https://gap.karmahq.xyz/
 * @see https://github.com/karmahq/gap-sdk
 */
export const syncFromKarmaGap = action({
  args: {
    adminKey: v.string(),
    callerWallet: v.optional(v.string()),
    communitySlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);
    const communitySlug = args.communitySlug ?? "celo";

    // GAP Indexer API endpoint
    const baseUrl = "https://gapapi.karmahq.xyz";

    // Fetch grants for the community (containing project info)
    const response = await fetch(
      `${baseUrl}/communities/${communitySlug}/grants?limit=100`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch grants from GAP: ${response.statusText}`
      );
    }

    const data = await response.json();
    const grants = data.data ?? data;

    console.log(`Fetched ${grants.length} grants from Karma GAP`);

    // Process each grant
    let syncedCount = 0;
    
    // We only process recent 50 grants to avoid rate limits/timeouts in this dev iteration
    const recentGrants = grants.slice(0, 50);

    for (const grant of recentGrants) {
      // Logic: Grant -> refUID -> Project Metadata
      const projectUid = grant.refUID;
      if (!projectUid || projectUid === "0x0000000000000000000000000000000000000000000000000000000000000000") continue;

      try {
        const projectResponse = await fetch(`${baseUrl}/projects/${projectUid}`);
        if (!projectResponse.ok) continue;

        const projectData = await projectResponse.json();
        // projectData structure: { uid: ..., data: { title: ..., description: ... } } (from our curl debug)
        // OR sometimes details.data. check structure carefully. 
        // Based on curl: { ... details: { data: { title: ... } } }
        
        // Let's safe navigation
        const pDetails = projectData.details?.data || projectData.data;
        if (!pDetails || !pDetails.title) continue;

        const title = pDetails.title;

        // Upsert project in Convex
        await ctx.runMutation(internal.syncKarmaGap.upsertGapProject, {
          projectId: `gap-${projectUid}`,
          title: title,
          description: pDetails.description ?? "",
          imageUrl: pDetails.imageURL ?? pDetails.logoUrl ?? "",
          category: "Regeneration", 
          recipientWallet: grant.recipient ?? "",
          chain: "celo",
          source: "karma",
          gapProjectUid: projectUid,
          gapCommunityId: communitySlug,
          grantId: grant.uid,
          totalMilestones: grant.milestones?.length ?? 0,
          completedMilestones: grant.milestones?.filter((m: any) => m.completed).length ?? 0,
          website: pDetails.links?.find((l: any) => l.type === "website")?.url || pDetails.website, 
          twitter: pDetails.links?.find((l: any) => l.type === "twitter")?.url || pDetails.twitter,
          github: pDetails.links?.find((l: any) => l.type === "github")?.url,
          farcaster: pDetails.links?.find((l: any) => l.type === "farcaster")?.url,
        });

        syncedCount++;
      } catch (e) {
        console.error(`Failed to sync project ${projectUid}:`, e);
      }
    }

    return { syncedCount, communitySlug };
  },
});

// ============================================
// Internal Mutations
// ============================================

export const upsertGapProject = internalMutation({
  args: {
    projectId: v.string(),
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    category: v.string(),
    recipientWallet: v.string(),
    chain: v.string(),
    source: v.string(),
    gapProjectUid: v.optional(v.string()),
    gapCommunityId: v.optional(v.string()),
    grantId: v.optional(v.string()),
    totalMilestones: v.optional(v.number()),
    completedMilestones: v.optional(v.number()),
    website: v.optional(v.string()),
    twitter: v.optional(v.string()),
    github: v.optional(v.string()),
    farcaster: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        description: args.description,
        imageUrl: args.imageUrl || existing.imageUrl,
        category: args.category,
        recipientWallet: args.recipientWallet || existing.recipientWallet,
        gapProjectUid: args.gapProjectUid,
        gapCommunityId: args.gapCommunityId,
        grantId: args.grantId,
        totalMilestones: args.totalMilestones,
        completedMilestones: args.completedMilestones,
        website: args.website,
        twitter: args.twitter,
        github: args.github,
        farcaster: args.farcaster,
        lastGapUpdate: now,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("projects", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl || "/placeholder.svg",
      category: args.category,
      recipientWallet: args.recipientWallet,
      chain: args.chain,
      source: args.source,
      verifiedLevel: 1, // GAP projects get basic verification
      featured: false,
      active: true,
      createdAt: now,
      gapProjectUid: args.gapProjectUid,
      gapCommunityId: args.gapCommunityId,
      grantId: args.grantId,
      totalMilestones: args.totalMilestones,
      completedMilestones: args.completedMilestones,
      lastGapUpdate: now,
      website: args.website,
      twitter: args.twitter,
      github: args.github,
      farcaster: args.farcaster,
    });
  },
});
