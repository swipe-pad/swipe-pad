import "server-only"

import {
  getAllProjectsServer,
  getProjectByProjectIdServer,
  resolveProjectByRouteIdServer,
  type ServerProject,
} from "@/lib/convex-server"

type FeedOptions = {
  exclude?: string
  seed?: string
}

function hashSeed(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRandom(seed: string) {
  let state = hashSeed(seed) || 1

  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return ((state >>> 0) % 10000) / 10000
  }
}

function getWeight(project: ServerProject): number {
  const featuredWeight = project.featured ? 2 : 0
  const verifiedWeight = Math.min(project.verifiedLevel ?? 0, 5) * 0.25
  const curatedBoost = project.source === "curated" ? 0.5 : 0
  return 1 + featuredWeight + verifiedWeight + curatedBoost
}

function pickWeightedProject(projects: ServerProject[], seed: string): ServerProject {
  const random = createRandom(seed)
  const totalWeight = projects.reduce((sum, project) => sum + getWeight(project), 0)

  if (totalWeight <= 0) {
    return projects[Math.floor(random() * projects.length)]
  }

  let threshold = random() * totalWeight
  for (const project of projects) {
    threshold -= getWeight(project)
    if (threshold <= 0) {
      return project
    }
  }

  return projects[projects.length - 1]
}

export async function getFeedProject(options: FeedOptions = {}) {
  const allProjects = await getAllProjectsServer()
  if (allProjects.length === 0) {
    throw new Error("Feed is empty")
  }

  const nextSeed = options.seed ?? crypto.randomUUID()
  const excluded = options.exclude

  const eligibleProjects = excluded
    ? allProjects.filter((project) => {
        return project.projectId !== excluded && project.routeId !== excluded
      })
    : allProjects

  const pool = eligibleProjects.length > 0 ? eligibleProjects : allProjects
  const project = pickWeightedProject(pool, `${nextSeed}:${excluded ?? "none"}`)

  return {
    project,
    nextCursor: `${project.projectId}:${hashSeed(nextSeed).toString(16)}`,
  }
}

export async function getProjectBySlug(slug: string) {
  return resolveProjectByRouteIdServer(slug)
}

export async function getProjectById(id: string) {
  const byProjectId = await getProjectByProjectIdServer(id)
  if (byProjectId) return byProjectId
  return resolveProjectByRouteIdServer(id)
}
