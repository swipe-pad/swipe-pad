import { beforeEach, describe, expect, it, mock } from "bun:test"
import { NextRequest } from "next/server"

const getFeedProject = mock(async () => {
  return {
    project: { projectId: "p1", routeId: "slug-1", name: "Project 1" },
    nextCursor: "cursor-1",
  }
})

const getProjectById = mock(async () => null)

mock.module("@/lib/feed-server", () => ({
  getFeedProject,
  getProjectById,
}))

const { GET } = await import("./route")

describe("GET /api/feed", () => {
  beforeEach(() => {
    getFeedProject.mockReset()
  })

  it("passes optional query params to feed service", async () => {
    getFeedProject.mockResolvedValueOnce({
      project: { projectId: "p2", routeId: "slug-2", name: "Project 2" },
      nextCursor: "cursor-2",
    })

    const request = new NextRequest("http://localhost/api/feed?exclude=p1&seed=session-1")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(getFeedProject).toHaveBeenCalledWith({ exclude: "p1", seed: "session-1" })
    expect(body).toEqual({
      project: { projectId: "p2", routeId: "slug-2", name: "Project 2" },
      nextCursor: "cursor-2",
    })
  })

  it("handles missing query params", async () => {
    getFeedProject.mockResolvedValueOnce({
      project: { projectId: "p3", routeId: "slug-3", name: "Project 3" },
      nextCursor: "cursor-3",
    })

    const request = new NextRequest("http://localhost/api/feed")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(getFeedProject).toHaveBeenCalledWith({ exclude: undefined, seed: undefined })
    expect(body.nextCursor).toBe("cursor-3")
  })
})
