import "server-only"

import { ConvexHttpClient } from "convex/browser"

import { api } from "../../convex/_generated/api"
import { getProjectImageSrc, normalizeProjectCategory } from "@/lib/project-taxonomy"

const CONVEX_QUERY_TIMEOUT_MS = 8000
const FEED_CANDIDATES_CACHE_TTL_MS = 5 * 60_000
const FEED_ALLOW_LEGACY_FALLBACK = process.env.CONVEX_FEED_ALLOW_LEGACY_FALLBACK !== "0"

let feedCandidatesCache: {
  expiresAt: number
  data: ConvexProject[]
  inFlight: Promise<ConvexProject[]> | null
} = {
  expiresAt: 0,
  data: [],
  inFlight: null,
}

function withTimeout<T>(task: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null

  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout while loading ${label}`))
    }, timeoutMs)
  })

  return Promise.race([task, timeout]).finally(() => {
    if (timer) clearTimeout(timer)
  })
}

export type ServerProject = {
  _id: string
  projectId: string
  routeId: string
  title: string
  description: string
  category: string
  imageUrl: string
  recipientWallet: string
  chain: string
  source: string
  verifiedLevel?: number
  featured?: boolean
  active?: boolean
  createdAt: number
  website?: string
  twitter?: string
  github?: string
  farcaster?: string
  linkedin?: string
  discord?: string
  id: string
  name: string
  walletAddress?: string
  likes?: number
  comments?: number
  boostAmount?: number
  boostStartsAt?: number
  boostExpiresAt?: number
  userHasLiked?: boolean
  userHasCommented?: boolean
  isBookmarked?: boolean
  reportCount?: number
  fundingGoal?: number
  fundingCurrent?: number
}

type ConvexProject = {
  _id: string
  projectId: string
  routeId: string
  title: string
  description: string
  category: string
  imageUrl: string
  recipientWallet: string
  chain: string
  source: string
  verifiedLevel?: number
  featured?: boolean
  active?: boolean
  createdAt: number
  website?: string
  twitter?: string
  github?: string
  farcaster?: string
  linkedin?: string
  discord?: string
  boostAmount?: number
  boostStartsAt?: number
  boostExpiresAt?: number
}

function toProject(project: ConvexProject): ServerProject {
  const category = normalizeProjectCategory({ category: project.category, source: project.source })
  const imageUrl = getProjectImageSrc(project.imageUrl, { category, source: project.source })

  return {
    ...project,
    category,
    imageUrl,
    id: project.routeId,
    name: project.title,
    walletAddress: project.recipientWallet,
  }
}

async function fetchFeedCandidates(): Promise<ConvexProject[]> {
  const now = Date.now()
  if (feedCandidatesCache.expiresAt > now && feedCandidatesCache.data.length > 0) {
    return feedCandidatesCache.data
  }

  if (feedCandidatesCache.inFlight) {
    return feedCandidatesCache.inFlight
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) return []

  const task = (async () => {
    const client = new ConvexHttpClient(convexUrl)
    let normalized: ConvexProject[] = []

    try {
      const projects = await withTimeout(
        client.query(api.projects.getAllProjects, {}),
        CONVEX_QUERY_TIMEOUT_MS,
        "feed candidates"
      )
      normalized = ((projects ?? []) as ConvexProject[]).filter((project) => project.active !== false)
    } catch (feedLightError) {
      if (!FEED_ALLOW_LEGACY_FALLBACK) {
        throw feedLightError
      }

      const projects = await withTimeout(
        client.query(api.projects.getAllProjects, {}),
        CONVEX_QUERY_TIMEOUT_MS,
        "project feed fallback"
      )
      normalized = ((projects ?? []) as ConvexProject[]).filter((project) => project.active !== false)
    }

    feedCandidatesCache = {
      expiresAt: Date.now() + FEED_CANDIDATES_CACHE_TTL_MS,
      data: normalized,
      inFlight: null,
    }
    return normalized
  })()

  feedCandidatesCache.inFlight = task

  try {
    return await task
  } catch (error) {
    feedCandidatesCache.inFlight = null
    console.error("[feed] failed to query feed candidates", error)
    return feedCandidatesCache.data
  }
}

export async function resolveProjectByRouteIdServer(routeId: string): Promise<ServerProject | null> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) return null

  try {
    const client = new ConvexHttpClient(convexUrl)
    const project = await withTimeout(
      client.query(api.projects.getProjectByRouteId, { routeId }),
      CONVEX_QUERY_TIMEOUT_MS,
      `project route ${routeId}`
    ) as ConvexProject | null
    if (!project) return null

    return toProject(project)
  } catch (error) {
    console.error("[feed] failed to resolve project by route", { routeId, error })
    return null
  }
}

export async function getFeedCandidatesServer(): Promise<ServerProject[]> {
  const projects = await fetchFeedCandidates()
  return projects.map(toProject)
}

export async function getProjectByProjectIdServer(projectId: string): Promise<ServerProject | null> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) return null

  try {
    const client = new ConvexHttpClient(convexUrl)
    const project = await withTimeout(
      client.query(api.projects.getProject, { projectId }),
      CONVEX_QUERY_TIMEOUT_MS,
      `project id ${projectId}`
    ) as ConvexProject | null
    return project ? toProject(project) : null
  } catch (error) {
    console.error("[feed] failed to resolve project by id", { projectId, error })
    return null
  }
}
