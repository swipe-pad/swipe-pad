import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { requireAdmin } from "./admin";
import { internal } from "./_generated/api";

// ============================================
// Hypercerts Sync Action
// ============================================

/**
 * Sync impact certificates from Hypercerts Protocol on Celo.
 * Uses the Hypercerts Graph API to fetch ERC-1155 tokens.
 *
 * @see https://hypercerts.org/docs/developer/api/
 */
export const syncFromHypercerts = action({
  args: {
    adminKey: v.string(),
    callerWallet: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);
    const limit = args.limit ?? 50;

    // Hypercerts Graph endpoint for Celo (chain ID: 42220)
    const graphUrl = "https://api.hypercerts.org/v1/graphql";

    // GraphQL query for hypercerts on Celo
    const query = `
      query GetHypercerts($limit: Int!) {
        hypercerts(
          first: $limit
        ) {
          data {
            hypercert_id
            uri
            units
            creator_address
            creation_block_timestamp
            contract {
              contract_address
              chain_id
            }
            metadata {
              name
              description
              image
              external_url
              work_scope
              impact_scope
              work_timeframe_from
              work_timeframe_to
              contributors
            }
          }
        }
      }
    `;

    const response = await fetch(graphUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { limit },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Hypercerts: ${response.statusText}`);
    }

    const result = await response.json();
    const hypercerts = result.data?.hypercerts?.data ?? [];

    console.log(`Fetched ${hypercerts.length} hypercerts from Celo`);

    let syncedCount = 0;
    for (const cert of hypercerts) {
      // Check if on Celo (42220)
      const chainId = cert.contract?.chain_id;
      const isOnCelo = String(chainId) === "42220";
      if (!isOnCelo) continue;

      // Skip if missing essential data
      if (!cert.hypercert_id || !cert.metadata?.name) continue;

      await ctx.runMutation(internal.syncHypercerts.upsertHypercert, {
        projectId: `hc-${cert.hypercert_id}`,
        hypercertId: cert.hypercert_id,
        title: cert.metadata.name,
        description: cert.metadata.description ?? "",
        imageUrl: cert.metadata.image ?? "",
        impactUnits: parseInt(cert.units ?? "0", 10),
        creatorAddress: cert.creator_address ?? "",
        workScope: cert.metadata.work_scope ?? [],
        impactScope: cert.metadata.impact_scope ?? [],
        contributors: cert.metadata.contributors ?? [],
        externalUrl: cert.metadata.external_url || undefined,
        workTimeframeFrom: cert.metadata.work_timeframe_from || undefined,
        workTimeframeTo: cert.metadata.work_timeframe_to || undefined,
      });

      syncedCount++;
    }

    return { syncedCount };
  },
});

// ============================================
// Internal Mutations
// ============================================

export const upsertHypercert = internalMutation({
  args: {
    projectId: v.string(),
    hypercertId: v.string(),
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    impactUnits: v.number(),
    creatorAddress: v.string(),
    workScope: v.array(v.string()),
    impactScope: v.array(v.string()),
    contributors: v.array(v.string()),
    externalUrl: v.optional(v.string()),
    workTimeframeFrom: v.optional(v.string()),
    workTimeframeTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    const now = Date.now();

    // Determine category from work_scope
    const category = determineCategory(args.workScope, args.impactScope);

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        description: args.description,
        imageUrl: args.imageUrl || existing.imageUrl,
        category,
        recipientWallet: args.creatorAddress || existing.recipientWallet,
        website: args.externalUrl,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("projects", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl || "/placeholder.svg",
      category,
      recipientWallet: args.creatorAddress,
      chain: "celo",
      source: "hypercerts",
      verifiedLevel: 2, // Hypercerts are verified by nature
      featured: false,
      active: true,
      createdAt: now,
      website: args.externalUrl,
    });
  },
});

// ============================================
// Helpers
// ============================================

function determineCategory(
  workScope: string[],
  impactScope: string[]
): string {
  const allScopes = [...workScope, ...impactScope].map((s) =>
    s.toLowerCase()
  );

  if (allScopes.some((s) => s.includes("climate") || s.includes("carbon"))) {
    return "Climate Action";
  }
  if (allScopes.some((s) => s.includes("forest") || s.includes("biodiversity"))) {
    return "Nature";
  }
  if (allScopes.some((s) => s.includes("community") || s.includes("social"))) {
    return "Social Impact";
  }
  if (allScopes.some((s) => s.includes("open source") || s.includes("software"))) {
    return "Open Source";
  }
  if (allScopes.some((s) => s.includes("regen"))) {
    return "Regeneration";
  }

  return "Eco Projects";
}
