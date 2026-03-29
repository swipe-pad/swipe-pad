import "server-only"

import {
  getFeedCandidatesServer,
  getProjectByProjectIdServer,
  resolveProjectByRouteIdServer,
  type ServerProject,
} from "@/lib/convex-server"
import { getTopLevelCategory, type FeedCategory } from "@/lib/project-taxonomy"
import {
  createRandom,
  hashSeed,
  pickWeightedProject,
} from "@/lib/feed-shuffle"

type FeedOptions = {
  exclude?: string
  seed?: string
  category?: FeedCategory
}

export async function getFeedProject(options: FeedOptions = {}) {
  const allProjects = await getFeedCandidatesServer()
  if (allProjects.length === 0) {
    return {
      project: null,
      nextCursor: "",
    }
  }

  const nextSeed = options.seed ?? crypto.randomUUID()
  const excluded = options.exclude
  const category = options.category && options.category !== "See All" ? options.category : null
  const now = Date.now()

  const eligibleProjects = allProjects.filter((project) => {
    if (excluded && project.projectId === excluded) return false
    if (excluded && project.routeId === excluded) return false
    if (category && getTopLevelCategory({ category: project.category, source: project.source }) !== category) return false
    return true
  })

  const pool = eligibleProjects.length > 0 ? eligibleProjects : allProjects
  const random = createRandom(`${nextSeed}:${excluded ?? "none"}`)
  const project = pickWeightedProject(pool, random, now)

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
