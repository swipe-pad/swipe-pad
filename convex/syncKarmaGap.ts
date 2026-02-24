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
    adminKey: v.optional(v.string()),
    callerWallet: v.optional(v.string()),
    communitySlug: v.optional(v.string()),
    perPage: v.optional(v.number()),
    maxPages: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);
    const communitySlug = args.communitySlug ?? "celo";
    const perPage = Math.min(Math.max(args.perPage ?? 50, 1), 100);
    const maxPages = Math.min(Math.max(args.maxPages ?? 5, 1), 20);

    // GAP Indexer API endpoint
    const baseUrl = "https://gapapi.karmahq.xyz";

    // Fetch paginated projects from GAP v2 API
    const allProjects: any[] = [];

    for (let page = 1; page <= maxPages; page++) {
      const response = await fetch(
        `${baseUrl}/v2/communities/${communitySlug}/projects?limit=${perPage}&page=${page}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch projects from GAP: ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();
      const pageProjects = payload.payload ?? [];
      const pagination = payload.pagination;

      if (!Array.isArray(pageProjects) || pageProjects.length === 0) {
        break;
      }

      allProjects.push(...pageProjects);

      if (!pagination?.hasNextPage) {
        break;
      }
    }

    // Process projects and dedupe by UID
    let syncedCount = 0;
    let skippedDuplicateUid = 0;
    const seenProjectUids = new Set<string>();

    for (const project of allProjects) {
      const projectUid = project.uid;
      if (!projectUid) continue;

      if (seenProjectUids.has(projectUid)) {
        skippedDuplicateUid++;
        continue;
      }
      seenProjectUids.add(projectUid);

      try {
        const details = project.details || {};
        if (!details.title) continue;

        const links = Array.isArray(project.links) ? project.links : [];
        const byType = (type: string) => links.find((l: any) => l?.type === type && l?.url)?.url;
        const normalizeUrl = (url?: string) => {
          if (!url) return undefined;
          if (url.startsWith("http://") || url.startsWith("https://")) return url;
          if (url.startsWith("@")) return url.slice(1);
          return url;
        };

        const recipientWallet =
          project.chainPayoutAddress?.address ||
          "";

        const chain = project.chainPayoutAddress?.chain === "base" ? "base" : "celo";

        // Upsert project in Convex
        await ctx.runMutation(internal.syncKarmaGap.upsertGapProject, {
          projectId: `gap-${projectUid}`,
          title: details.title,
          description: details.description ?? "",
          imageUrl: details.imageURL ?? details.logoUrl ?? "",
          category: "Regeneration", 
          recipientWallet,
          chain,
          source: "karma",
          gapProjectUid: projectUid,
          gapCommunityId: communitySlug,
          grantId: undefined,
          totalMilestones: project.numMilestones ?? 0,
          completedMilestones:
            typeof project.percentCompleted === "number" && project.percentCompleted > 0
              ? Math.round((project.numMilestones ?? 0) * (project.percentCompleted / 100))
              : 0,
          website: normalizeUrl(byType("website")) || normalizeUrl(details.website),
          twitter: normalizeUrl(byType("twitter")) || normalizeUrl(details.twitter),
          github: normalizeUrl(byType("github")),
          farcaster: normalizeUrl(byType("farcaster")),
        });

        syncedCount++;
      } catch (e) {
        console.error(`Failed to sync project ${projectUid}:`, e);
      }
    }

    return {
      syncedCount,
      communitySlug,
      projectsFetched: allProjects.length,
      uniqueProjectUids: seenProjectUids.size,
      skippedDuplicateUid,
      perPage,
      maxPages,
    };
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
