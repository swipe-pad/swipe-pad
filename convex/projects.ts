import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./admin";

// ============================================
// Queries
// ============================================

/** Get all active projects */
export const getAllProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

/** Get unique categories from projects */
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    
    const categoriesSet = new Set(projects.map((p) => p.category).filter(Boolean));
    return Array.from(categoriesSet).sort();
  },
});

/** Get active projects for a chain */
export const getActiveProjects = query({
  args: { chain: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_chain", (q) =>
        q.eq("chain", args.chain).eq("active", true)
      )
      .collect();
  },
});

/** Get featured projects */
export const getFeaturedProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_featured", (q) =>
        q.eq("featured", true).eq("active", true)
      )
      .collect();
  },
});

/** Get project by projectId */
export const getProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();
  },
});

/** Get projects by data source */
export const getProjectsBySource = query({
  args: { source: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_source", (q) =>
        q.eq("source", args.source).eq("active", true)
      )
      .collect();
  },
});

// ============================================
// Admin Mutations
// ============================================

/** Add or update a project (admin) */
export const upsertProject = mutation({
  args: {
    adminKey: v.string(),
    callerWallet: v.optional(v.string()),
    projectId: v.string(),
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    category: v.string(),
    recipientWallet: v.string(),
    chain: v.string(),
    source: v.string(),
    verifiedLevel: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        description: args.description,
        imageUrl: args.imageUrl,
        category: args.category,
        recipientWallet: args.recipientWallet,
        chain: args.chain,
        source: args.source,
        verifiedLevel: args.verifiedLevel ?? existing.verifiedLevel,
        featured: args.featured ?? existing.featured,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("projects", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl,
      category: args.category,
      recipientWallet: args.recipientWallet,
      chain: args.chain,
      source: args.source,
      verifiedLevel: args.verifiedLevel ?? 0,
      featured: args.featured ?? false,
      active: true,
      createdAt: Date.now(),
    });
  },
});

/** Toggle project active status */
export const setProjectActive = mutation({
  args: {
    adminKey: v.string(),
    callerWallet: v.optional(v.string()),
    projectId: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);
    const project = await ctx.db
      .query("projects")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    if (!project) throw new Error("Project not found");

    await ctx.db.patch(project._id, {
      active: args.active,
      updatedAt: Date.now(),
    });
  },
});

/** Set project featured status */
export const setProjectFeatured = mutation({
  args: {
    adminKey: v.string(),
    callerWallet: v.optional(v.string()),
    projectId: v.string(),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);
    const project = await ctx.db
      .query("projects")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    if (!project) throw new Error("Project not found");

    await ctx.db.patch(project._id, {
      featured: args.featured,
      updatedAt: Date.now(),
    });
  },
});
