import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { requireAdmin } from "./admin";
import { internal } from "./_generated/api";
import { generateUniqueRouteId } from "./routeId";

// ============================================
// Talent Protocol Sync Action
// ============================================

/**
 * Sync builder profiles from Talent Protocol API V3.
 * Fetches Builder Score and credentials for specified wallets.
 *
 * Requires TALENT_PROTOCOL_API_KEY environment variable.
 *
 * @see https://docs.talentprotocol.com/
 */
// Shared logic for syncing a single builder
export const syncBuilderByWalletLogic = async (ctx: any, walletAddress: string) => {
  const apiKey = process.env.TALENT_PROTOCOL_API_KEY;

  if (!apiKey) {
    throw new Error("TALENT_PROTOCOL_API_KEY environment variable not set");
  }

  const baseUrl = "https://api.talentprotocol.com";
  
  // 1. Search profile by wallet
  const params = new URLSearchParams();
  params.append("query[identity]", walletAddress);
  params.append("query[identity_type]", "wallet");

  const searchUrl = `${baseUrl}/search/advanced/profiles?${params.toString()}`;

  const searchResponse = await fetch(searchUrl, {
    headers: {
      "X-API-KEY": apiKey,
      "Accept": "application/json",
    },
  });

  if (!searchResponse.ok) {
      if (searchResponse.status === 404) {
           console.log(`No Talent profile found for ${walletAddress}`);
           return null;
      }
      throw new Error(`Failed to search Talent Protocol: ${searchResponse.statusText}`);
  }

  const searchData = await searchResponse.json();
  const profile = searchData.profiles?.[0];

  if (!profile) {
    console.log(`No profile data returned for ${walletAddress}`);
    return null;
  }

  // 2. Fetch social accounts
  let socials: any = { github: undefined, twitter: undefined, farcaster: undefined };
  try {
      const accountsResponse = await fetch(`${baseUrl}/accounts?id=${profile.id}`, {
           headers: { "X-API-KEY": apiKey }
      });
      if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          const accounts = accountsData.accounts || [];
          
          const gh = accounts.find((a: any) => a.source === "github");
          if (gh) socials.github = `https://github.com/${gh.username}`;
          
          const tw = accounts.find((a: any) => a.source === "twitter" || a.source === "x_twitter");
          if (tw) socials.twitter = `https://twitter.com/${tw.username}`;
          
          const fc = accounts.find((a: any) => a.source === "farcaster");
          if (fc) socials.farcaster = `https://warpcast.com/${fc.username}`;
      }
  } catch (e) {
      console.error("Failed to fetch socials", e);
  }

  // Extract score
  const builderScoreObj = profile.scores?.find((s: any) => s.slug === "builder_score_2025" || s.slug === "builder_score");
  const builderScore = builderScoreObj?.points ?? 0;

  // Upsert builder in Convex
  await ctx.runMutation(internal.syncTalentProtocol.upsertBuilder, {
    projectId: `talent-${profile.id}`,
    walletAddress: walletAddress.toLowerCase(),
    displayName: profile.display_name || profile.name,
    bio: profile.bio ?? "",
    imageUrl: profile.profile_picture_url ?? profile.image_url ?? "",
    builderScore: builderScore,
    builderLevel: getBuilderLevel(builderScore),
    credentialsCount: 0,
    verifiedCredentialsCount: profile.human_checkmark ? 1 : 0,
    talentPassportId: profile.id,
    github: socials.github,
    twitter: socials.twitter,
    farcaster: socials.farcaster,
  });

  return {
    walletAddress: walletAddress,
    builderScore: builderScore,
    passportId: profile.id,
  };
};

export const syncBuilderByWallet: ReturnType<typeof action> = action({
  args: {
    adminKey: v.string(),
    callerWallet: v.optional(v.string()),
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);
    return await syncBuilderByWalletLogic(ctx, args.walletAddress);
  },
});

/**
 * Sync top builders from Talent Protocol leaderboard
 * Fetches profiles with highest builder scores
 */
export const syncTopBuilders = action({
  args: {
    limit: v.optional(v.number()),
    page: v.optional(v.number()),
    minScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.TALENT_PROTOCOL_API_KEY;
    
    if (!apiKey) {
      throw new Error("TALENT_PROTOCOL_API_KEY environment variable not set");
    }
    
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 500);
    const startPage = Math.max(args.page ?? 1, 1);
    const minScore = Math.max(args.minScore ?? 0, 0);
    const perPage = 25; // Talent API max page size
    const baseUrl = "https://api.talentprotocol.com";

    let currentPage = startPage;
    let fetchedProfiles: any[] = [];

    while (fetchedProfiles.length < limit) {
      const params = new URLSearchParams();
      params.append("sort[score][order]", "desc");
      params.append("sort[score][scorer]", "Builder Score");
      params.append("page", String(currentPage));
      params.append("per_page", String(perPage));

      const searchUrl = `${baseUrl}/search/advanced/profiles?${params.toString()}`;
      const response = await fetch(searchUrl, {
        headers: {
          "X-API-KEY": apiKey,
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch top builders: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const pageProfiles = data.profiles ?? [];

      if (pageProfiles.length === 0) break;

      fetchedProfiles = fetchedProfiles.concat(pageProfiles);

      if (pageProfiles.length < perPage) break;
      currentPage += 1;
    }

    const profiles = fetchedProfiles.slice(0, limit);

    console.log(`Fetched ${profiles.length} profiles from Talent Protocol across pages`);
    
    let syncedCount = 0;
    let skipped = 0;
    
    for (const profile of profiles) {
      // Skip profiles without essential data
      if (!profile.id || !profile.display_name && !profile.name) continue;
      
      // Get builder score
      const builderScoreObj = profile.builder_score ?? profile.scores?.find(
        (s: any) => s.slug === "builder_score_2025" || s.slug === "builder_score"
      );
      const builderScore = builderScoreObj?.points ?? 0;
      
      // Skip low-score builders
      if (builderScore < minScore) {
        skipped++;
        continue;
      }
      
      // Fetch accounts once: socials + wallet address
      let socials: any = { github: undefined, twitter: undefined, farcaster: undefined };
      let walletAddress = "";
      try {
        const accountsResponse = await fetch(`${baseUrl}/accounts?id=${profile.id}`, {
          headers: { "X-API-KEY": apiKey }
        });
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          const accounts = accountsData.accounts || [];
          
          const gh = accounts.find((a: any) => a.source === "github");
          if (gh) socials.github = `https://github.com/${gh.username}`;
          
          const tw = accounts.find((a: any) => a.source === "twitter" || a.source === "x_twitter");
          if (tw) socials.twitter = `https://twitter.com/${tw.username}`;
          
          const fc = accounts.find((a: any) => a.source === "farcaster");
          if (fc) socials.farcaster = `https://warpcast.com/${fc.username}`;

          const walletAccount = accounts.find((a: any) => {
            const identity = (a?.identity ?? "").toLowerCase();
            return identity.startsWith("0x") || a.source === "wallet";
          });
          if (walletAccount?.identity) {
            walletAddress = walletAccount.identity.toLowerCase();
          }
        }
      } catch (e) {
        console.error("Failed to fetch accounts for", profile.id, e);
      }
      
      await ctx.runMutation(internal.syncTalentProtocol.upsertBuilder, {
        projectId: `talent-${profile.id}`,
        walletAddress: walletAddress,
        displayName: profile.display_name || profile.name || "Anonymous Builder",
        bio: profile.bio ?? "",
        imageUrl: profile.profile_picture_url ?? profile.image_url ?? "",
        builderScore: builderScore,
        builderLevel: getBuilderLevel(builderScore),
        credentialsCount: 0,
        verifiedCredentialsCount: profile.human_checkmark ? 1 : 0,
        talentPassportId: profile.id,
        github: socials.github,
        twitter: socials.twitter,
        farcaster: socials.farcaster,
      });
      
      syncedCount++;
      
      // Rate limit: small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return {
      syncedCount,
      skipped,
      totalFetched: profiles.length,
      pageStart: startPage,
      pageEnd: currentPage,
      perPage,
      minScore,
    };
  },
});

/**
 * Sync multiple builders by their wallet addresses
 */
export const syncMultipleBuilders: ReturnType<typeof action> = action({
  args: {
    adminKey: v.string(),
    callerWallet: v.optional(v.string()),
    walletAddresses: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);
    const results: Array<{
      wallet: string;
      success: boolean;
      result?: unknown;
      error?: string;
    }> = [];

    for (const wallet of args.walletAddresses) {
      try {
        const result = await syncBuilderByWalletLogic(ctx, wallet);
        results.push({ wallet, success: true, result });
      } catch (error) {
        results.push({ wallet, success: false, error: String(error) });
      }
    }

    return results;
  },
});

// Internal action for batch processing
// ============================================
// Internal Mutations
// ============================================

export const upsertBuilder = internalMutation({
  args: {
    projectId: v.string(),
    walletAddress: v.string(),
    displayName: v.string(),
    bio: v.string(),
    imageUrl: v.string(),
    builderScore: v.number(),
    builderLevel: v.number(),
    credentialsCount: v.number(),
    verifiedCredentialsCount: v.number(),
    activityScore: v.optional(v.number()),
    identityScore: v.optional(v.number()),
    skillsScore: v.optional(v.number()),
    talentPassportId: v.optional(v.string()),
    github: v.optional(v.string()),
    twitter: v.optional(v.string()),
    farcaster: v.optional(v.string()),
    linkedin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.displayName,
        description: args.bio,
        imageUrl: args.imageUrl || existing.imageUrl,
        recipientWallet: args.walletAddress,
        github: args.github,
        twitter: args.twitter,
        farcaster: args.farcaster,
        linkedin: args.linkedin,
        updatedAt: now,
      });
      return existing._id;
    }

    const routeId = await generateUniqueRouteId(ctx.db, args.projectId);

    return await ctx.db.insert("projects", {
      projectId: args.projectId,
      routeId,
      title: args.displayName,
      description: args.bio || "Builder on Talent Protocol",
      imageUrl: args.imageUrl || "/placeholder.svg",
      category: "Builders",
      recipientWallet: args.walletAddress,
      chain: "celo",
      source: "talent",
      verifiedLevel: args.builderLevel >= 3 ? 2 : 1,
      featured: args.builderScore >= 100,
      active: true,
      createdAt: now,
      github: args.github,
      twitter: args.twitter,
      farcaster: args.farcaster,
      linkedin: args.linkedin,
    });
  },
});

// ============================================
// Helpers
// ============================================

function getBuilderLevel(score: number): number {
  if (score >= 200) return 6; // God-tier
  if (score >= 150) return 5; // Expert
  if (score >= 100) return 4; // Advanced
  if (score >= 50) return 3; // Intermediate
  if (score >= 25) return 2; // Beginner
  return 1; // Newcomer
}
