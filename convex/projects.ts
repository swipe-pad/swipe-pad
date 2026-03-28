import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./admin";
import { generateUniqueRouteId } from "./routeId";
import { markDashboardStatsDirty } from "./waitlist";

const ADMIN_LIST_SCAN_PAGES = 3;
const ADMIN_LIST_SCAN_BATCH = 25;

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

/**
 * Feed-focused active projects page.
 * Returns only the fields needed to render swipe cards.
 */
export const getFeedProjectsPage = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const numItems = Math.min(Math.max(args.paginationOpts.numItems ?? 30, 1), 120);
    const page = await ctx.db
      .query("projects")
      .withIndex("by_active_createdAt", (q) => q.eq("active", true))
      .order("desc")
      .paginate({
        cursor: args.paginationOpts.cursor,
        numItems,
      });

    return {
      page: page.page.map((project) => ({
        _id: project._id,
        projectId: project.projectId,
        routeId: project.routeId,
        title: project.title,
        description: project.description,
        category: project.category,
        imageUrl: project.imageUrl,
        recipientWallet: project.recipientWallet,
        chain: project.chain,
        source: project.source,
        verifiedLevel: project.verifiedLevel,
        featured: project.featured,
        active: project.active,
        website: project.website,
        twitter: project.twitter,
        github: project.github,
        farcaster: project.farcaster,
        linkedin: project.linkedin,
        discord: project.discord,
        boostAmount: project.boostAmount,
        boostStartsAt: project.boostStartsAt,
        boostExpiresAt: project.boostExpiresAt,
      })),
      isDone: page.isDone,
      continueCursor: page.continueCursor,
      pageStatus: page.pageStatus,
      splitCursor: page.splitCursor,
    };
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

/** Get project by short routeId */
export const getProjectByRouteId = query({
  args: { routeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_routeId", (q) => q.eq("routeId", args.routeId))
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
    website: v.optional(v.string()),
    twitter: v.optional(v.string()),
    github: v.optional(v.string()),
    farcaster: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    discord: v.optional(v.string()),
    boostAmount: v.optional(v.number()),
    boostStartsAt: v.optional(v.number()),
    boostExpiresAt: v.optional(v.number()),
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
        website: args.website,
        twitter: args.twitter,
        github: args.github,
        farcaster: args.farcaster,
        linkedin: args.linkedin,
        discord: args.discord,
        boostAmount: args.boostAmount,
        boostStartsAt: args.boostStartsAt,
        boostExpiresAt: args.boostExpiresAt,
      });
      await markDashboardStatsDirty(ctx);
      return existing._id;
    }

    const routeId = await generateUniqueRouteId(ctx.db, args.projectId);

    const inserted = await ctx.db.insert("projects", {
      projectId: args.projectId,
      routeId,
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
      website: args.website,
      twitter: args.twitter,
      github: args.github,
      farcaster: args.farcaster,
      linkedin: args.linkedin,
      discord: args.discord,
    });
    await markDashboardStatsDirty(ctx);
    return inserted;
  },
});

/** Import-safe upsert for normalized JSON datasets (admin) */
export const upsertImportedProject = mutation({
  args: {
    adminKey: v.string(),
    callerWallet: v.optional(v.string()),
    projectId: v.string(),
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    category: v.string(),
    rawCategory: v.optional(v.string()),
    recipientWallet: v.string(),
    chain: v.string(),
    source: v.string(),
    sourceDataset: v.optional(v.string()),
    rawSourceId: v.optional(v.string()),
    profileUrl: v.optional(v.string()),
    network: v.optional(v.string()),
    website: v.optional(v.string()),
    twitter: v.optional(v.string()),
    github: v.optional(v.string()),
    farcaster: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    discord: v.optional(v.string()),
    verifiedLevel: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    active: v.optional(v.boolean()),
    boostAmount: v.optional(v.number()),
    boostStartsAt: v.optional(v.number()),
    boostExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);

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
        rawCategory: args.rawCategory,
        recipientWallet: args.recipientWallet || existing.recipientWallet,
        chain: args.chain,
        source: args.source,
        sourceDataset: args.sourceDataset,
        rawSourceId: args.rawSourceId,
        profileUrl: args.profileUrl,
        network: args.network,
        website: args.website,
        twitter: args.twitter,
        github: args.github,
        farcaster: args.farcaster,
        linkedin: args.linkedin,
        discord: args.discord,
        verifiedLevel: args.verifiedLevel ?? existing.verifiedLevel,
        featured: args.featured ?? existing.featured,
        active: args.active ?? existing.active,
        boostAmount: args.boostAmount ?? existing.boostAmount,
        boostStartsAt: args.boostStartsAt ?? existing.boostStartsAt,
        boostExpiresAt: args.boostExpiresAt ?? existing.boostExpiresAt,
        importedAt: now,
        updatedAt: now,
      });
      await markDashboardStatsDirty(ctx);
      return { id: existing._id, created: false };
    }

    const routeId = await generateUniqueRouteId(ctx.db, args.projectId);

    const inserted = await ctx.db.insert("projects", {
      projectId: args.projectId,
      routeId,
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl || "/placeholder.svg",
      category: args.category,
      rawCategory: args.rawCategory,
      recipientWallet: args.recipientWallet,
      chain: args.chain,
      source: args.source,
      sourceDataset: args.sourceDataset,
      rawSourceId: args.rawSourceId,
      profileUrl: args.profileUrl,
      network: args.network,
      verifiedLevel: args.verifiedLevel ?? 0,
      featured: args.featured ?? false,
      active: args.active ?? true,
      createdAt: now,
      updatedAt: now,
      importedAt: now,
      website: args.website,
      twitter: args.twitter,
      github: args.github,
      farcaster: args.farcaster,
      linkedin: args.linkedin,
      discord: args.discord,
      boostAmount: args.boostAmount,
      boostStartsAt: args.boostStartsAt,
      boostExpiresAt: args.boostExpiresAt,
    });
    await markDashboardStatsDirty(ctx);
    return { id: inserted, created: true };
  },
});

/** Dev-friendly import upsert without admin guard */
export const upsertImportedProjectDev = mutation({
  args: {
    projectId: v.string(),
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    category: v.string(),
    rawCategory: v.optional(v.string()),
    recipientWallet: v.string(),
    chain: v.string(),
    source: v.string(),
    sourceDataset: v.optional(v.string()),
    rawSourceId: v.optional(v.string()),
    profileUrl: v.optional(v.string()),
    network: v.optional(v.string()),
    website: v.optional(v.string()),
    twitter: v.optional(v.string()),
    github: v.optional(v.string()),
    farcaster: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    discord: v.optional(v.string()),
    verifiedLevel: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    active: v.optional(v.boolean()),
    boostAmount: v.optional(v.number()),
    boostStartsAt: v.optional(v.number()),
    boostExpiresAt: v.optional(v.number()),
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
        rawCategory: args.rawCategory,
        recipientWallet: args.recipientWallet || existing.recipientWallet,
        chain: args.chain,
        source: args.source,
        sourceDataset: args.sourceDataset,
        rawSourceId: args.rawSourceId,
        profileUrl: args.profileUrl,
        network: args.network,
        website: args.website,
        twitter: args.twitter,
        github: args.github,
        farcaster: args.farcaster,
        linkedin: args.linkedin,
        discord: args.discord,
        verifiedLevel: args.verifiedLevel ?? existing.verifiedLevel,
        featured: args.featured ?? existing.featured,
        active: args.active ?? existing.active,
        boostAmount: args.boostAmount ?? existing.boostAmount,
        boostStartsAt: args.boostStartsAt ?? existing.boostStartsAt,
        boostExpiresAt: args.boostExpiresAt ?? existing.boostExpiresAt,
        importedAt: now,
        updatedAt: now,
      });
      await markDashboardStatsDirty(ctx);
      return { id: existing._id, created: false };
    }

    const routeId = await generateUniqueRouteId(ctx.db, args.projectId);

    const inserted = await ctx.db.insert("projects", {
      projectId: args.projectId,
      routeId,
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl || "/placeholder.svg",
      category: args.category,
      rawCategory: args.rawCategory,
      recipientWallet: args.recipientWallet,
      chain: args.chain,
      source: args.source,
      sourceDataset: args.sourceDataset,
      rawSourceId: args.rawSourceId,
      profileUrl: args.profileUrl,
      network: args.network,
      verifiedLevel: args.verifiedLevel ?? 0,
      featured: args.featured ?? false,
      active: args.active ?? true,
      createdAt: now,
      updatedAt: now,
      importedAt: now,
      website: args.website,
      twitter: args.twitter,
      github: args.github,
      farcaster: args.farcaster,
      linkedin: args.linkedin,
      discord: args.discord,
      boostAmount: args.boostAmount,
      boostStartsAt: args.boostStartsAt,
      boostExpiresAt: args.boostExpiresAt,
    });
    await markDashboardStatsDirty(ctx);
    return { id: inserted, created: true };
  },
});

/** Backfill missing route IDs for existing projects */
export const backfillRouteIds = mutation({
  args: {
    adminKey: v.string(),
    callerWallet: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey, args.callerWallet);

    const max = Math.max(1, Math.min(args.limit ?? 500, 5000));
    const projects = await ctx.db.query("projects").collect();
    const missing = projects.filter((project) => !project.routeId).slice(0, max);

    for (const project of missing) {
      const routeId = await generateUniqueRouteId(ctx.db, project.projectId);
      await ctx.db.patch(project._id, {
        routeId,
        updatedAt: Date.now(),
      });
    }

    if (missing.length > 0) {
      await markDashboardStatsDirty(ctx);
    }

    return {
      scanned: projects.length,
      updated: missing.length,
      remaining: Math.max(0, projects.filter((project) => !project.routeId).length - missing.length),
    };
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
    await markDashboardStatsDirty(ctx);
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
    await markDashboardStatsDirty(ctx);
  },
});

/** Admin projects explorer with search (intended for local/dev tooling) */
export const listProjectsForAdmin = query({
  args: {
    search: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
    quickFilter: v.optional(v.union(v.literal("all"), v.literal("active"), v.literal("inactive"), v.literal("featured"))),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const normalizedSearch = (args.search ?? "").trim().toLowerCase();
    const includeInactive = args.includeInactive ?? true;
    const quickFilter = args.quickFilter ?? "all";
    const limit = Math.min(Math.max(args.paginationOpts.numItems ?? 10, 1), 10);

    const rows: Array<{
      id: string;
      projectId: string;
      routeId: string;
      title: string;
      category: string;
      source: string;
      chain: string;
      active: boolean;
      featured: boolean;
      updatedAt: number;
    }> = [];

    let cursor: string | null = args.paginationOpts.cursor;
    let scannedPages = 0;
    let isDone = false;

    const paginateProjectsPage = async (pageCursor: string | null) => {
      if (quickFilter === "active") {
        return await ctx.db
          .query("projects")
          .withIndex("by_active_createdAt", (q) => q.eq("active", true))
          .order("desc")
          .paginate({ cursor: pageCursor, numItems: ADMIN_LIST_SCAN_BATCH });
      }

      if (quickFilter === "inactive") {
        return await ctx.db
          .query("projects")
          .withIndex("by_active_createdAt", (q) => q.eq("active", false))
          .order("desc")
          .paginate({ cursor: pageCursor, numItems: ADMIN_LIST_SCAN_BATCH });
      }

      if (quickFilter === "featured") {
        return await ctx.db
          .query("projects")
          .withIndex("by_featured_createdAt", (q) => q.eq("featured", true))
          .order("desc")
          .paginate({ cursor: pageCursor, numItems: ADMIN_LIST_SCAN_BATCH });
      }

      if (!includeInactive) {
        return await ctx.db
          .query("projects")
          .withIndex("by_active_createdAt", (q) => q.eq("active", true))
          .order("desc")
          .paginate({ cursor: pageCursor, numItems: ADMIN_LIST_SCAN_BATCH });
      }

      return await ctx.db
        .query("projects")
        .withIndex("by_createdAt")
        .order("desc")
        .paginate({ cursor: pageCursor, numItems: ADMIN_LIST_SCAN_BATCH });
    };

    while (rows.length < limit && scannedPages < ADMIN_LIST_SCAN_PAGES) {
      const page = await paginateProjectsPage(cursor);

      for (const project of page.page) {
        if (!includeInactive && !project.active) continue;
        if (quickFilter === "active" && !project.active) continue;
        if (quickFilter === "inactive" && project.active) continue;
        if (quickFilter === "featured" && !project.featured) continue;
        if (normalizedSearch) {
          const haystack = [
            project.projectId,
            project.routeId,
            project.title,
            project.category,
            project.source,
            project.chain,
          ]
            .join(" ")
            .toLowerCase();

          if (!haystack.includes(normalizedSearch)) continue;
        }

        rows.push({
          id: project._id,
          projectId: project.projectId,
          routeId: project.routeId,
          title: project.title,
          category: project.category,
          source: project.source,
          chain: project.chain,
          active: project.active,
          featured: project.featured,
          updatedAt: project.updatedAt ?? project.createdAt,
        });

        if (rows.length >= limit) break;
      }

      cursor = page.continueCursor;
      isDone = page.isDone;
      scannedPages += 1;
      if (page.isDone) break;
    }

    return {
      rows,
      continueCursor: cursor,
      isDone,
    };
  },
});

/** Dev-friendly active toggle for project curation */
export const setProjectActiveDev = mutation({
  args: {
    projectId: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    if (!project) throw new Error("Project not found");

    await ctx.db.patch(project._id, {
      active: args.active,
      updatedAt: Date.now(),
    });

    await markDashboardStatsDirty(ctx);

    return { ok: true };
  },
});
