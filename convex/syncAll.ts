import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { requireAdmin } from "./admin";

// ============================================
// Master Sync Action
// ============================================

/**
 * Sync all data sources: Karma GAP, Talent Protocol, and Hypercerts.
 * This is the main entry point for refreshing project data.
 */
export const syncAllSources: ReturnType<typeof action> = action({
  args: {
    adminKey: v.string(),
    callerWallet: v.optional(v.string()),
    sources: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);
    const sources = args.sources ?? ["karma", "hypercerts"];
    const results: Record<string, unknown> = {};

    // Karma GAP sync
    if (sources.includes("karma")) {
      try {
        const karmaResult = await ctx.runAction(
          api.syncKarmaGap.syncFromKarmaGap,
          {
            communitySlug: "celo",
            adminKey: args.adminKey,
            callerWallet: args.callerWallet,
          }
        );
        results.karma = { success: true, ...karmaResult };
      } catch (error) {
        results.karma = { success: false, error: String(error) };
      }
    }

    // Hypercerts sync
    if (sources.includes("hypercerts")) {
      try {
        const hcResult = await ctx.runAction(
          api.syncHypercerts.syncFromHypercerts,
          {
            limit: 50,
            adminKey: args.adminKey,
            callerWallet: args.callerWallet,
          }
        );
        results.hypercerts = { success: true, ...hcResult };
      } catch (error) {
        results.hypercerts = { success: false, error: String(error) };
      }
    }

    // Talent Protocol requires specific wallet addresses
    // Should be called separately with wallets to sync
    if (sources.includes("talent")) {
      results.talent = {
        success: false,
        message: "Use syncTalentProtocol.syncBuilderByWallet with specific wallets",
      };
    }

    return results;
  },
});

/**
 * Sync builders from a predefined list (e.g., from waitlist or known builders)
 */
export const syncKnownBuilders: ReturnType<typeof action> = action({
  args: { adminKey: v.string(), callerWallet: v.optional(v.string()) },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);
    // Fetch all waitlist users with wallet addresses
    const waitlistUsers: Array<{ wallet?: string }> = await ctx.runQuery(
      api.waitlist.getAllApproved
    );

    const wallets: string[] = waitlistUsers.flatMap((u) =>
      u.wallet ? [u.wallet] : []
    );

    if (wallets.length === 0) {
      return { syncedCount: 0, message: "No wallets to sync" };
    }

    // Sync each wallet's Talent profile
    let successCount = 0;
    for (const wallet of wallets) {
      try {
        await ctx.runAction(api.syncTalentProtocol.syncBuilderByWallet, {
          adminKey: args.adminKey,
          callerWallet: args.callerWallet,
          walletAddress: wallet,
        });
        successCount++;
      } catch {
        // Skip wallets without Talent profiles
      }
    }

    return { syncedCount: successCount, totalWallets: wallets.length };
  },
});
