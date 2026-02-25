import { afterAll, beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test"

const PORT = 3111
const BASE_URL = `http://127.0.0.1:${PORT}`
const STARTUP_TIMEOUT_MS = 90_000

setDefaultTimeout(120_000)

let devServer: Bun.Subprocess | null = null

async function waitForServerReady() {
  const startedAt = Date.now()

  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    try {
      const response = await fetch(`${BASE_URL}/project/e2e-ready-check`, {
        redirect: "manual",
      })

      if (response.status >= 200) {
        return
      }
    } catch {
      // Keep retrying until timeout.
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 750))
  }

  throw new Error("Next dev server did not start in time")
}

beforeAll(async () => {
  devServer = Bun.spawn(["bunx", "next", "dev", "--port", String(PORT)], {
    cwd: process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
    },
  })

  await waitForServerReady()
})

afterAll(() => {
  if (!devServer) return
  devServer.kill()
  devServer = null
})

describe("Routing e2e", () => {
  it("redirects legacy /project/:id to /p/:slug", async () => {
    const response = await fetch(`${BASE_URL}/project/solar-dao`, {
      redirect: "manual",
    })

    if (response.status === 307 || response.status === 308) {
      expect(response.headers.get("location")).toBe("/p/solar-dao")
      return
    }

    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html.includes("/p/solar-dao")).toBe(true)
  })

  it("returns 404 for missing shared slug", async () => {
    const response = await fetch(`${BASE_URL}/p/__e2e_missing_slug__`, {
      redirect: "manual",
    })
    const html = await response.text()

    expect([200, 404]).toContain(response.status)
    expect(html.toLowerCase().includes("not found") || html.includes("404")).toBe(true)
  })

  it("returns 404 JSON for missing /api/project/:id", async () => {
    const response = await fetch(`${BASE_URL}/api/project/__e2e_missing_id__`)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toEqual({ error: "Project not found" })
  })

  const hasConvexDataSource = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)

  ;(hasConvexDataSource ? it : it.skip)(
    "executes discover contract for shared-entry first-swipe fetch",
    async () => {
      const firstFeed = await fetch(`${BASE_URL}/api/feed?seed=e2e-seed`)
      expect(firstFeed.status).toBe(200)

      const firstBody = (await firstFeed.json()) as {
        project: { projectId: string; routeId: string }
      }

      expect(firstBody.project.projectId.length).toBeGreaterThan(0)
      expect(firstBody.project.routeId.length).toBeGreaterThan(0)

      const sharedEntry = await fetch(`${BASE_URL}/p/${encodeURIComponent(firstBody.project.routeId)}`)
      expect(sharedEntry.status).toBe(200)

      const afterSwipeFeed = await fetch(
        `${BASE_URL}/api/feed?exclude=${encodeURIComponent(firstBody.project.projectId)}&seed=e2e-seed-next`,
      )
      expect(afterSwipeFeed.status).toBe(200)

      const afterBody = (await afterSwipeFeed.json()) as {
        project: { projectId: string; routeId: string }
        nextCursor: string
      }

      expect(afterBody.project.projectId.length).toBeGreaterThan(0)
      expect(afterBody.project.routeId.length).toBeGreaterThan(0)
      expect(afterBody.nextCursor.length).toBeGreaterThan(0)
    },
  )
})
