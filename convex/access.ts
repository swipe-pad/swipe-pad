import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { isAllowlistedWallet, normalizeWallet, sha256 } from "./accesslib"
import { getFeatureFlags } from "../src/features/shared/feature-flags"
import { requireAdmin } from "./admin"

export type AccessState = "checking" | "denied" | "allowed" | "invite_required"

export type AccessResult = {
  userId: string | null
  wallet: string | null
  betaStatus: "pending" | "approved" | "active" | "guest" | "rejected" | null
  accessState: AccessState
  accessReason: string | null
  accessSource: "open" | "invite_code" | "allowlist" | null
}

function createAccessResult(input: {
  wallet: string | null
  accessState: AccessState
  accessReason?: string | null
  userId?: string | null
  betaStatus?: "pending" | "approved" | "active" | "guest" | "rejected" | null
  accessSource?: "open" | "invite_code" | "allowlist" | null
}): AccessResult {
  return {
    userId: input.userId ?? null,
    wallet: input.wallet,
    betaStatus: input.betaStatus ?? null,
    accessState: input.accessState,
    accessReason: input.accessReason ?? null,
    accessSource: input.accessSource ?? null,
  }
}

export const resolveAccess = mutation({
  args: {
    wallet: v.string(),
    smartWalletAddress: v.optional(v.string()),
    email: v.optional(v.string()),
    farcasterFid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedWallet = normalizeWallet(args.wallet)
    const normalizedSmartWallet = normalizeWallet(args.smartWalletAddress) ?? normalizedWallet

    if (!normalizedWallet) {
      return createAccessResult({
        wallet: null,
        accessState: "denied",
        accessReason: "wallet_required",
      })
    }

    const flags = getFeatureFlags()
    
    // If gated access is disabled, allow through (existing behavior)
    if (!flags.gatedAccess.enabled) {
      return createAccessResult({
        wallet: normalizedWallet,
        accessState: "allowed",
      })
    }

    const existing = await ctx.db
      .query("waitlistUsers")
      .withIndex("by_wallet", (q) => q.eq("wallet", normalizedWallet))
      .first()

    // If user already has access via invite code or previous allowlist
    if (existing?.accessSource === "invite_code" || existing?.accessSource === "allowlist") {
      return createAccessResult({
        userId: existing._id,
        wallet: normalizedWallet,
        betaStatus: existing.status,
        accessState: "allowed",
        accessSource: existing.accessSource,
      })
    }

    // Check allowlist
    if (isAllowlistedWallet(normalizedWallet)) {
      const now = Date.now()
      const patch = {
        wallet: normalizedWallet,
        email: args.email,
        farcasterFid: args.farcasterFid,
        status: "active" as const,
        accessSource: "allowlist" as const,
        accessGrantedAt: now,
      }

      const userId = existing
        ? (await ctx.db.patch(existing._id, patch), existing._id)
        : await ctx.db.insert("waitlistUsers", {
            ...patch,
            createdAt: now,
            inviteCode: undefined,
            referredBy: undefined,
          })

      const user = await ctx.db.get(userId)
      return createAccessResult({
        userId,
        wallet: normalizedWallet,
        betaStatus: user?.status ?? "active",
        accessState: "allowed",
        accessSource: "allowlist",
      })
    }

    // In invite_only mode, require invite code
    if (flags.gatedAccess.mode === "invite_only") {
      return createAccessResult({
        wallet: normalizedWallet,
        accessState: "invite_required",
        accessReason: "invite_code_required",
      })
    }

    // In closed mode, deny all
    if (flags.gatedAccess.mode === "closed") {
      return createAccessResult({
        wallet: normalizedWallet,
        accessState: "denied",
        accessReason: "access_closed",
      })
    }

    // Open mode (gated access enabled but mode=open)
    return createAccessResult({
      wallet: normalizedWallet,
      accessState: "allowed",
    })
  },
})

export const redeemInviteCode = mutation({
  args: {
    wallet: v.string(),
    code: v.string(),
    smartWalletAddress: v.optional(v.string()),
    email: v.optional(v.string()),
    farcasterFid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedWallet = normalizeWallet(args.wallet)
    const normalizedSmartWallet = normalizeWallet(args.smartWalletAddress) ?? normalizedWallet
    const normalizedCode = args.code.trim().toUpperCase().replace(/\s+/g, "")

    if (!normalizedWallet || !normalizedCode) {
      return createAccessResult({
        wallet: normalizedWallet,
        accessState: "denied",
        accessReason: "invalid_invite_code",
      })
    }

    const codeHash = await sha256(normalizedCode)
    const inviteCode = await ctx.db
      .query("inviteCodes")
      .withIndex("by_codeHash", (q) => q.eq("codeHash", codeHash))
      .first()

    if (!inviteCode || !inviteCode.active) {
      return createAccessResult({
        wallet: normalizedWallet,
        accessState: "denied",
        accessReason: "invite_code_invalid",
      })
    }

    const now = Date.now()
    if (inviteCode.expiresAt && inviteCode.expiresAt < now) {
      return createAccessResult({
        wallet: normalizedWallet,
        accessState: "denied",
        accessReason: "invite_code_expired",
      })
    }

    const existing = await ctx.db
      .query("waitlistUsers")
      .withIndex("by_wallet", (q) => q.eq("wallet", normalizedWallet))
      .first()

    // Already redeemed this code
    if (existing?.inviteCodeId === inviteCode._id) {
      return createAccessResult({
        userId: existing._id,
        wallet: normalizedWallet,
        betaStatus: existing.status,
        accessState: "allowed",
        accessSource: "invite_code",
      })
    }

    if (inviteCode.uses >= inviteCode.maxUses) {
      return createAccessResult({
        wallet: normalizedWallet,
        accessState: "denied",
        accessReason: "invite_code_exhausted",
      })
    }

    const userPatch = {
      wallet: normalizedWallet,
      email: args.email,
      farcasterFid: args.farcasterFid,
      inviteCode: normalizedCode,
      status: "guest" as const,
      accessSource: "invite_code" as const,
      accessGrantedAt: now,
      inviteCodeId: inviteCode._id,
    }

    const userId = existing
      ? (await ctx.db.patch(existing._id, userPatch), existing._id)
      : await ctx.db.insert("waitlistUsers", {
          ...userPatch,
          createdAt: now,
          referredBy: undefined,
        })

    await ctx.db.patch(inviteCode._id, {
      uses: inviteCode.uses + 1,
    })

    await ctx.db.insert("inviteCodeRedemptions", {
      inviteCodeId: inviteCode._id,
      userId,
      wallet: normalizedWallet,
      redeemedAt: now,
      status: "accepted",
    })

    return createAccessResult({
      userId,
      wallet: normalizedWallet,
      betaStatus: "guest",
      accessState: "allowed",
      accessSource: "invite_code",
    })
  },
})

export const getAccessState = query({
  args: {
    wallet: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedWallet = normalizeWallet(args.wallet)
    if (!normalizedWallet) {
      return createAccessResult({
        wallet: null,
        accessState: "denied",
        accessReason: "wallet_required",
      })
    }

    const flags = getFeatureFlags()
    if (!flags.gatedAccess.enabled) {
      return createAccessResult({
        wallet: normalizedWallet,
        accessState: "allowed",
      })
    }

    const user = await ctx.db
      .query("waitlistUsers")
      .withIndex("by_wallet", (q) => q.eq("wallet", normalizedWallet))
      .first()

    if (!user) {
      return createAccessResult({
        wallet: normalizedWallet,
        accessState: flags.gatedAccess.mode === "invite_only" ? "invite_required" : "denied",
        accessReason: flags.gatedAccess.mode === "invite_only" ? "invite_code_required" : "access_unresolved",
      })
    }

    if (user.accessSource === "invite_code" || user.accessSource === "allowlist") {
      return createAccessResult({
        userId: user._id,
        wallet: normalizedWallet,
        betaStatus: user.status,
        accessState: "allowed",
        accessSource: user.accessSource,
      })
    }

    return createAccessResult({
      userId: user._id,
      wallet: normalizedWallet,
      betaStatus: user.status,
      accessState: "allowed",
    })
  },
})
