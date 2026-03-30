import { describe, expect, test } from "bun:test"

import type { ServerProject } from "@/lib/convex-server"
import {
  getActiveBoostExtraWeight,
  getProjectWeight,
  groupProjectsByCategory,
  pickCategoryUniformly,
} from "@/lib/feed-shuffle"

function makeProject(overrides: Partial<ServerProject> = {}): ServerProject {
  return {
    _id: "p1",
    projectId: "p1",
    routeId: "route-p1",
    title: "Project",
    description: "Desc",
    category: "Builders",
    imageUrl: "/placeholder.svg",
    recipientWallet: "0x1",
    chain: "celo",
    source: "json",
    createdAt: 1,
    id: "route-p1",
    name: "Project",
    ...overrides,
  }
}

describe("feed shuffle weighting", () => {
  test("returns no extra weight when boost is inactive or expired", () => {
    const now = 1_000_000
    const expired = makeProject({ boostAmount: 2, boostStartsAt: 1000, boostExpiresAt: now - 1 })
    const unboosted = makeProject({ boostAmount: 0 })

    expect(getActiveBoostExtraWeight(expired, now)).toBe(0)
    expect(getActiveBoostExtraWeight(unboosted, now)).toBe(0)
  })

  test("decays boost exponentially over time", () => {
    const now = 1_000_000
    const project = makeProject({ boostAmount: 3, boostStartsAt: now - 1000 })

    const weight1 = getActiveBoostExtraWeight(project, now)
    const weight2 = getActiveBoostExtraWeight(project, now + 86400000) // +1 day

    expect(weight1).toBeGreaterThan(weight2)
    expect(weight1).toBeGreaterThan(0)
    expect(weight2).toBeGreaterThan(0)
  })

  test("caps boost extra weight at max", () => {
    const now = 1_000_000
    const project = makeProject({ boostAmount: 100, boostStartsAt: now })

    expect(getActiveBoostExtraWeight(project, now)).toBe(3)
  })

  test("project weight includes featured, verified, curated and boost", () => {
    const now = 1_000_000
    const base = makeProject()
    const featured = makeProject({ featured: true })
    const verified = makeProject({ verifiedLevel: 5 })
    const curated = makeProject({ source: "curated" })
    const boosted = makeProject({ boostAmount: 2, boostStartsAt: now })

    expect(getProjectWeight(base, now)).toBe(1)
    expect(getProjectWeight(featured, now)).toBe(3)
    expect(getProjectWeight(verified, now)).toBe(2.25)
    expect(getProjectWeight(curated, now)).toBe(1.5)
    expect(getProjectWeight(boosted, now)).toBeGreaterThan(1)
  })

  test("groups projects by top-level category", () => {
    const builders = makeProject({ category: "DeFi", source: "json" })
    const climate = makeProject({ category: "ReFi", source: "json" })
    const anotherBuilders = makeProject({ category: "Infrastructure", source: "json" })

    const groups = groupProjectsByCategory([builders, climate, anotherBuilders])

    expect(groups.has("Builders")).toBe(true)
    expect(groups.has("Climate")).toBe(true)
    expect(groups.get("Builders")?.length).toBe(2)
    expect(groups.get("Climate")?.length).toBe(1)
  })

  test("picks category uniformly with random", () => {
    const random = () => 0.5
    const categories = ["A", "B", "C"]

    expect(pickCategoryUniformly(categories, random)).toBe("B")
  })

  test("picks first category when random is near zero", () => {
    const random = () => 0.01
    const categories = ["A", "B", "C"]

    expect(pickCategoryUniformly(categories, random)).toBe("A")
  })
})
