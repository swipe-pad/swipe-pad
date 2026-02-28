import "server-only"

import { ConvexHttpClient } from "convex/browser"

import { api } from "../../convex/_generated/api"

const CONVEX_QUERY_TIMEOUT_MS = 8000
const PROJECTS_CACHE_TTL_MS = 300_000

let projectsCache: {
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
  website?: string
  twitter?: string
  github?: string
  farcaster?: string
  linkedin?: string
  discord?: string
}

function toProject(project: ConvexProject): ServerProject {
  const categoryKey = project.category.toLowerCase()
  const fallbackImage = categoryKey.includes("eco") || categoryKey.includes("climate") || categoryKey.includes("regen")
    ? "/assets/eco-projects-placeholder.png"
    : categoryKey.includes("dapp")
      ? "/assets/dapps-placeholder.png"
      : "/assets/builders-placeholder.png"

  const imageUrl = project.imageUrl?.startsWith("data:") ? fallbackImage : project.imageUrl

  return {
    ...project,
    imageUrl,
    id: project.routeId,
    name: project.title,
    walletAddress: project.recipientWallet,
  }
}

async function fetchAllProjects(): Promise<ConvexProject[]> {
  const now = Date.now()
  if (projectsCache.expiresAt > now && projectsCache.data.length > 0) {
    return projectsCache.data
  }

  if (projectsCache.inFlight) {
    return projectsCache.inFlight
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) return []

  const task = (async () => {
    const client = new ConvexHttpClient(convexUrl)
    const projects = await withTimeout(client.query(api.projects.getAllProjects, {}), CONVEX_QUERY_TIMEOUT_MS, "project feed")
    const normalized = (projects ?? []) as ConvexProject[]
    projectsCache = {
      expiresAt: Date.now() + PROJECTS_CACHE_TTL_MS,
      data: normalized,
      inFlight: null,
    }
    return normalized
  })()

  projectsCache.inFlight = task

  try {
    return await task
  } catch (error) {
    projectsCache.inFlight = null
    console.error("[feed] failed to query all projects", error)
    return projectsCache.data
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
      `project ${routeId}`,
    )
    if (!project) return null

    return toProject(project as ConvexProject)
  } catch (error) {
    console.error("[feed] failed to resolve project by route", { routeId, error })
    return null
  }
}

export async function getAllProjectsServer(): Promise<ServerProject[]> {
  const projects = await fetchAllProjects()
  return projects.map(toProject)
}

export async function getProjectByProjectIdServer(projectId: string): Promise<ServerProject | null> {
  const projects = await fetchAllProjects()
  const project = projects.find((candidate) => candidate.projectId === projectId)
  return project ? toProject(project) : null
}
