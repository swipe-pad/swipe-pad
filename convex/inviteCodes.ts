import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { createInviteCodePlaintext, sha256 } from "./accesslib"
import { requireAdmin } from "./admin"

export const create = mutation({
  args: {
    adminKey: v.optional(v.string()),
    callerWallet: v.optional(v.string()),
    label: v.string(),
    maxUses: v.number(),
    expiresAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet)

    const plaintext = (args.code?.trim().toUpperCase() || createInviteCodePlaintext()).replace(/\s+/g, "")
    const codeHash = await sha256(plaintext)
    const existing = await ctx.db
      .query("inviteCodes")
      .withIndex("by_codeHash", (q) => q.eq("codeHash", codeHash))
      .first()

    if (existing) {
      throw new Error("Invite code already exists")
    }

    const now = Date.now()
    const inviteCodeId = await ctx.db.insert("inviteCodes", {
      codeHash,
      label: args.label.trim(),
      active: true,
      maxUses: Math.max(1, Math.floor(args.maxUses)),
      uses: 0,
      expiresAt: args.expiresAt,
      createdAt: now,
      createdBy: args.callerWallet?.toLowerCase(),
      notes: args.notes?.trim(),
    })

    return {
      inviteCodeId,
      code: plaintext,
    }
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("inviteCodes").withIndex("by_createdAt").order("desc").collect()
    return rows.map((row) => ({
      id: row._id,
      label: row.label,
      active: row.active,
      maxUses: row.maxUses,
      uses: row.uses,
      expiresAt: row.expiresAt ?? null,
      createdAt: row.createdAt,
      createdBy: row.createdBy ?? null,
      notes: row.notes ?? "",
    }))
  },
})

export const update = mutation({
  args: {
    adminKey: v.optional(v.string()),
    callerWallet: v.optional(v.string()),
    inviteCodeId: v.id("inviteCodes"),
    label: v.optional(v.string()),
    maxUses: v.optional(v.number()),
    expiresAt: v.optional(v.union(v.number(), v.null())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet)
    const inviteCode = await ctx.db.get(args.inviteCodeId)
    if (!inviteCode) {
      throw new Error("Invite code not found")
    }

    await ctx.db.patch(args.inviteCodeId, {
      ...(args.label !== undefined ? { label: args.label.trim() } : {}),
      ...(args.maxUses !== undefined ? { maxUses: Math.max(inviteCode.uses, Math.floor(args.maxUses)) } : {}),
      ...(args.expiresAt !== undefined ? { expiresAt: args.expiresAt ?? undefined } : {}),
      ...(args.notes !== undefined ? { notes: args.notes.trim() } : {}),
    })

    return { ok: true }
  },
})

export const toggleActive = mutation({
  args: {
    adminKey: v.optional(v.string()),
    callerWallet: v.optional(v.string()),
    inviteCodeId: v.id("inviteCodes"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet)
    await ctx.db.patch(args.inviteCodeId, {
      active: args.active,
    })
    return { ok: true }
  },
})

export const deleteInviteCode = mutation({
  args: {
    adminKey: v.optional(v.string()),
    callerWallet: v.optional(v.string()),
    inviteCodeId: v.id("inviteCodes"),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet)
    const redemptions = await ctx.db
      .query("inviteCodeRedemptions")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCodeId", args.inviteCodeId))
      .collect()

    if (redemptions.length > 0) {
      throw new Error("Cannot delete invite code with redemptions")
    }

    await ctx.db.delete(args.inviteCodeId)
    return { ok: true }
  },
})

export { deleteInviteCode as delete }
