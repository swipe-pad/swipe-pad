import { type ServerProject } from "@/lib/convex-server"
import { getTopLevelCategory } from "@/lib/project-taxonomy"

export type ShuffleProject = {
  projectId: string
  routeId: string
  category: string
  source: string
  createdAt: number
  boostAmount?: number
  boostStartsAt?: number
  boostExpiresAt?: number
}

const BOOST_MAX_EXTRA_WEIGHT = 3
const BOOST_HALF_LIFE_MS = 3 * 24 * 60 * 60 * 1000

export function hashSeed(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function createRandom(seed: string) {
  let state = hashSeed(seed) || 1

  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return ((state >>> 0) % 10000) / 10000
  }
}

export function getActiveBoostExtraWeight(project: ShuffleProject, now = Date.now()): number {
  const amount = Math.max(project.boostAmount ?? 0, 0)
  const startsAt = project.boostStartsAt ?? project.createdAt ?? now
  const expiresAt = project.boostExpiresAt

  if (amount <= 0) return 0
  if (now < startsAt) return 0
  if (expiresAt !== undefined && now >= expiresAt) return 0

  const elapsed = now - startsAt
  const decay = Math.exp(-elapsed / BOOST_HALF_LIFE_MS)
  const extra = Math.min(amount * decay, BOOST_MAX_EXTRA_WEIGHT)

  return extra
}

export function getProjectWeight(project: ShuffleProject, now = Date.now()): number {
  const featuredWeight = "featured" in project && (project as Record<string, unknown>).featured ? 2 : 0
  const verifiedWeight =
    "verifiedLevel" in project && typeof (project as Record<string, unknown>).verifiedLevel === "number"
      ? Math.min((project as Record<string, unknown>).verifiedLevel as number, 5) * 0.25
      : 0
  const curatedBoost = project.source === "curated" ? 0.5 : 0
  const boostExtra = getActiveBoostExtraWeight(project, now)
  return 1 + featuredWeight + verifiedWeight + curatedBoost + boostExtra
}

export function pickWeightedProject(
  projects: ServerProject[],
  random: () => number,
  now = Date.now(),
): ServerProject {
  const totalWeight = projects.reduce((sum, project) => sum + getProjectWeight(project, now), 0)

  if (totalWeight <= 0) {
    return projects[Math.floor(random() * projects.length)]
  }

  let threshold = random() * totalWeight
  for (const project of projects) {
    threshold -= getProjectWeight(project, now)
    if (threshold <= 0) {
      return project
    }
  }

  return projects[projects.length - 1]
}

export function groupProjectsByCategory(
  projects: ServerProject[],
): Map<string, ServerProject[]> {
  const groups = new Map<string, ServerProject[]>()
  for (const project of projects) {
    const topLevel = getTopLevelCategory({ category: project.category, source: project.source })
    const existing = groups.get(topLevel) ?? []
    existing.push(project)
    groups.set(topLevel, existing)
  }
  return groups
}

export function pickCategoryUniformly(
  categories: string[],
  random: () => number,
): string {
  return categories[Math.floor(random() * categories.length)] ?? categories[0] ?? "See All"
}
