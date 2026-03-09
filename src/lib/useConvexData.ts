"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { fetchConvexQuery } from "@/lib/convex-client";
import { getProjectImageSrc, normalizeProjectCategory } from "@/lib/project-taxonomy";

const PROJECTS_CACHE_KEY = "swipepad:projects:v2";
const PROJECTS_CACHE_TTL_MS = 5 * 60_000;
const DEV_PROJECTS_CACHE_TTL_MS = 30 * 60_000;
const DEV_CACHE_ONLY = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_CONVEX_CACHE_ONLY_DEV === "1";
const PROJECTS_CATALOG_PAGE_SIZE = 120;
const PROJECTS_CATALOG_MAX_ITEMS = 240;

// Re-export the Project type from Convex for frontend compatibility
// This type mirrors the static data.ts Project interface but comes from Convex
export interface Project {
  _id: string;
  projectId: string;
  routeId: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  recipientWallet: string;
  chain: string;
  source: string;
  verifiedLevel?: number;
  featured?: boolean;
  active?: boolean;
  website?: string;
  twitter?: string;
  github?: string;
  farcaster?: string;
  linkedin?: string;
  discord?: string;
  // Legacy compatibility fields (required for old components)
  id: string;
  name: string;
  walletAddress?: string;
  // UI interaction fields (optional, for local state)
  likes?: number;
  comments?: number;
  boostAmount?: number;
  userHasLiked?: boolean;
  userHasCommented?: boolean;
  isBookmarked?: boolean;
  reportCount?: number;
  fundingGoal?: number;
  fundingCurrent?: number;
}

// Adapter to transform Convex project to legacy Project interface
type ConvexProjectShape = Omit<Project, "id" | "name" | "walletAddress">;

export function adaptConvexProject(p: ConvexProjectShape): Project {
  return {
    ...p,
    category: normalizeProjectCategory({ category: p.category, source: p.source }),
    imageUrl: getProjectImageSrc(p.imageUrl, { category: p.category, source: p.source }),
    id: p.routeId,
    name: p.title,
    walletAddress: p.recipientWallet,
  };
}

type FeedProjectsPageResponse = {
  page: ConvexProjectShape[];
  continueCursor: string | null;
  isDone: boolean;
};

function isMissingFeedPageFunctionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.includes("Could not find public function for 'projects:getFeedProjectsPage'");
}

async function fetchProjectCatalogSnapshot(cacheTtlMs: number): Promise<ConvexProjectShape[]> {
  const rows: ConvexProjectShape[] = [];
  let cursor: string | null = null;
  let guard = 0;

  try {
    while (rows.length < PROJECTS_CATALOG_MAX_ITEMS && guard < 4) {
      const result: FeedProjectsPageResponse = await fetchConvexQuery<
        { paginationOpts: { numItems: number; cursor: string | null } },
        FeedProjectsPageResponse
      >(
        "projects:getFeedProjectsPage",
        {
          paginationOpts: {
            numItems: PROJECTS_CATALOG_PAGE_SIZE,
            cursor,
          },
        },
        {
          cacheTtlMs,
          cacheKey: `projects:getFeedProjectsPage:${cursor ?? "root"}:${PROJECTS_CATALOG_PAGE_SIZE}`,
        }
      );

      rows.push(...result.page);
      if (result.isDone || !result.continueCursor) break;

      cursor = result.continueCursor;
      guard += 1;
    }
  } catch (error) {
    if (!isMissingFeedPageFunctionError(error)) throw error;

    console.warn("[projects] fallback to projects:getAllProjects because getFeedProjectsPage is missing");
    const allProjects = await fetchConvexQuery<{}, ConvexProjectShape[]>(
      "projects:getAllProjects",
      {},
      {
        cacheTtlMs,
        cacheKey: "projects:getAllProjects",
      }
    );
    return allProjects.slice(0, PROJECTS_CATALOG_MAX_ITEMS);
  }

  return rows.slice(0, PROJECTS_CATALOG_MAX_ITEMS);
}

type ProjectsContextValue = {
  projects: Project[];
  isLoading: boolean;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const effectiveProjectsCacheTtlMs = process.env.NODE_ENV !== "production"
    ? DEV_PROJECTS_CACHE_TTL_MS
    : PROJECTS_CACHE_TTL_MS;
  const shouldLoadProjects = ![
    "/admin",
    "/dev",
    "/ui",
    "/minipay",
    "/dashboard",
    "/observability",
  ].some((prefix) => pathname.startsWith(prefix));
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(shouldLoadProjects);

  const loadProjects = useCallback(async () => {
    if (!shouldLoadProjects) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    const fromCache = (() => {
      if (typeof window === "undefined") return null;
      try {
        const raw = window.localStorage.getItem(PROJECTS_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { ts: number; rows: ConvexProjectShape[] };
        if (!parsed?.ts || !Array.isArray(parsed.rows)) return null;
        if (Date.now() - parsed.ts > effectiveProjectsCacheTtlMs) return null;
        return parsed.rows;
      } catch {
        return null;
      }
    })();

    if (fromCache) {
      setProjects(fromCache.map(adaptConvexProject));
      setIsLoading(false);
      return;
    }

    if (DEV_CACHE_ONLY) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const rows = await fetchProjectCatalogSnapshot(effectiveProjectsCacheTtlMs);
      setProjects(rows.map(adaptConvexProject));
      if (typeof window !== "undefined") {
        window.localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify({ ts: Date.now(), rows }));
      }
    } catch (error) {
      console.error("[projects] failed loading projects", error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveProjectsCacheTtlMs, shouldLoadProjects]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const value = useMemo(
    () => ({ projects, isLoading }),
    [projects, isLoading]
  );

  return createElement(ProjectsContext.Provider, { value }, children);
}

/** Hook to get all projects from Convex */
export function useProjects() {
  return useProjectsWithStatus().projects;
}

/** Hook to get all projects from Convex with loading state */
export function useProjectsWithStatus() {
  const context = useContext(ProjectsContext);
  if (context) return context;
  return {
    projects: [],
    isLoading: false,
  };
}

/** Hook to get categories from Convex */
export function useCategories() {
  const { projects } = useProjectsWithStatus();
  return useMemo(() => {
    const categoriesSet = new Set(projects.map((project) => project.category).filter(Boolean));
    return Array.from(categoriesSet).sort();
  }, [projects]);
}

/** Hook to get featured projects */
export function useFeaturedProjects() {
  const { projects } = useProjectsWithStatus();
  return useMemo(() => projects.filter((project) => project.featured), [projects]);
}

/** Hook to get projects by source (karma, hypercerts, talent) */
export function useProjectsBySource(source: string) {
  const { projects } = useProjectsWithStatus();
  return useMemo(() => {
    const normalizedSource = source.toLowerCase();
    return projects.filter((project) => project.source.toLowerCase() === normalizedSource);
  }, [projects, source]);
}
